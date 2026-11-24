export type ClickTone = 'wood' | 'soft' | 'bright'

export class MetronomeAudio {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private mediaOutput: MediaStreamAudioDestinationNode | null = null
  private mediaElement: HTMLAudioElement | null = null
  private directOutputConnected = false
  private timer: number | null = null
  private onBeat: ((beat: number) => void) | null = null
  private onPlaybackChange: ((playing: boolean) => void) | null = null
  private pendingClicks: Array<{ oscillator: OscillatorNode; envelope: GainNode; at: number; beat: number }> = []
  private nextBeatAt = 0
  private beatIndex = 0
  private bpm = 165
  private currentVolume = 0.45
  private tone: ClickTone = 'wood'

  async start(
    bpm: number,
    volume: number,
    tone: ClickTone,
    onBeat: (beat: number) => void,
    onPlaybackChange: (playing: boolean) => void,
  ) {
    this.stop()
    this.bpm = bpm
    this.currentVolume = volume
    this.tone = tone
    this.beatIndex = 0
    this.onBeat = onBeat
    this.onPlaybackChange = onPlaybackChange
    this.context ??= new AudioContext()

    if (!this.masterGain) {
      this.masterGain = this.context.createGain()
      this.mediaOutput = this.context.createMediaStreamDestination()
      this.masterGain.connect(this.mediaOutput)
    }
    this.setVolume(volume)
    if (this.context.state === 'suspended') await this.context.resume()

    // Route the generated clicks through a real audio element so Chrome can
    // expose media controls and keep a playback session while the screen is locked.
    if (this.mediaOutput) {
      this.mediaElement ??= new Audio()
      this.mediaElement.srcObject = this.mediaOutput.stream
      this.mediaElement.preload = 'none'
      this.mediaElement.onpause = () => {
        if (this.timer !== null) this.stop()
      }
      try {
        await this.mediaElement.play()
      } catch {
        // Fall back to regular Web Audio output if stream playback is blocked.
        if (!this.directOutputConnected && this.masterGain) {
          this.masterGain.connect(this.context.destination)
          this.directOutputConnected = true
        }
      }
    }

    this.nextBeatAt = this.context.currentTime + 0.08
    this.timer = window.setInterval(() => this.schedule(onBeat), 250)
    this.schedule(onBeat)
    this.configureMediaSession()
    onPlaybackChange(true)
  }

  update(bpm: number, volume: number, tone: ClickTone) {
    const bpmChanged = bpm !== this.bpm
    const toneChanged = tone !== this.tone
    this.bpm = bpm
    this.currentVolume = volume
    this.tone = tone

    // The master gain immediately changes current and queued clicks.
    this.setVolume(volume)

    if (!this.context || !this.masterGain) return
    const now = this.context.currentTime
    if (bpmChanged) this.updateMediaMetadata()

    // Replace the timbre on every future click already in the audio queue.
    if (toneChanged) {
      this.pendingClicks.filter((click) => click.at > now + 0.01).forEach((click) => {
        this.applyTone(click.oscillator, click.envelope, click.at, click.beat % 4 === 0)
      })
    }

    // Apply a new BPM from the next queued beat instead of waiting for the old queue.
    if (bpmChanged && this.timer !== null && this.onBeat) {
      const future = this.pendingClicks.filter((click) => click.at > now + 0.025).sort((a, b) => a.at - b.at)
      future.forEach(({ oscillator }) => { try { oscillator.stop(now) } catch { /* already ended */ } })
      if (future.length > 0) {
        this.nextBeatAt = future[0].at
        this.beatIndex = future[0].beat % 4
      } else {
        this.nextBeatAt = now + 0.03
      }
      this.schedule(this.onBeat)
    }
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer)
    this.timer = null
    const now = this.context?.currentTime ?? 0
    this.pendingClicks.forEach(({ oscillator }) => { try { oscillator.stop(now) } catch { /* already ended */ } })
    this.pendingClicks = []
    this.mediaElement?.pause()
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
    this.onPlaybackChange?.(false)
  }

  private setVolume(volume: number) {
    if (!this.context || !this.masterGain) return
    const now = this.context.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setTargetAtTime(volume, now, 0.004)
  }

  private configureMediaSession() {
    if (!('mediaSession' in navigator)) return
    this.updateMediaMetadata()
    navigator.mediaSession.playbackState = 'playing'
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (this.onBeat && this.onPlaybackChange) {
          void this.start(this.bpm, this.currentVolume, this.tone, this.onBeat, this.onPlaybackChange)
        }
      })
      navigator.mediaSession.setActionHandler('pause', () => this.stop())
      navigator.mediaSession.setActionHandler('stop', () => this.stop())
    } catch {
      // Some browsers expose MediaSession but do not implement every action.
    }
  }

  private updateMediaMetadata() {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'เมโทรนอมวิ่ง',
      artist: 'RUN TEMPO',
      album: `${this.bpm} BPM`,
      artwork: [{ src: `${import.meta.env.BASE_URL}icons/shoe.svg`, sizes: 'any', type: 'image/svg+xml' }],
    })
  }

  private schedule(onBeat: (beat: number) => void) {
    if (!this.context || this.context.state !== 'running') return
    // Buffer ahead to help when Android Chrome throttles background timers.
    // The browser or power-management policy can still suspend page audio.
    const horizon = this.context.currentTime + 2.5
    while (this.nextBeatAt < horizon) {
      const beat = this.beatIndex
      const scheduledAt = this.nextBeatAt
      this.playClick(scheduledAt, beat)
      window.setTimeout(() => onBeat(beat), Math.max(0, (scheduledAt - this.context!.currentTime) * 1000))
      this.beatIndex = (this.beatIndex + 1) % 4
      this.nextBeatAt += 60 / this.bpm
    }
  }

  private playClick(at: number, beat: number) {
    if (!this.context || !this.masterGain) return
    const oscillator = this.context.createOscillator()
    const envelope = this.context.createGain()
    const click = { oscillator, envelope, at, beat }
    this.applyTone(oscillator, envelope, at, beat % 4 === 0)
    oscillator.connect(envelope)
    envelope.connect(this.masterGain)
    this.pendingClicks.push(click)
    oscillator.onended = () => { this.pendingClicks = this.pendingClicks.filter((item) => item !== click) }
    oscillator.start(at)
    oscillator.stop(at + 0.05)
  }

  private applyTone(oscillator: OscillatorNode, envelope: GainNode, at: number, accent: boolean) {
    if (!this.context) return
    const frequency = this.tone === 'bright' ? 1500 : this.tone === 'soft' ? 850 : 1150
    const now = this.context.currentTime
    oscillator.type = this.tone === 'wood' ? 'triangle' : 'sine'
    oscillator.frequency.cancelScheduledValues(Math.max(now, at))
    oscillator.frequency.setValueAtTime(accent ? frequency * 1.22 : frequency, Math.max(now, at))
    envelope.gain.cancelScheduledValues(Math.max(now, at))
    envelope.gain.setValueAtTime(accent ? 1 : 0.78, at)
    envelope.gain.exponentialRampToValueAtTime(0.001, at + (this.tone === 'soft' ? 0.045 : 0.028))
  }
}
