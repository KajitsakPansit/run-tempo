import { useCallback, useEffect, useRef, useState } from 'react'
import { MetronomeAudio, type ClickTone } from '../lib/metronomeAudio'

export function useMetronome(bpm: number, volume: number, tone: ClickTone) {
  const engine = useRef<MetronomeAudio | null>(null)
  const [playing, setPlaying] = useState(false)
  const [beat, setBeat] = useState(-1)

  useEffect(() => {
    engine.current = new MetronomeAudio()
    return () => engine.current?.stop()
  }, [])

  useEffect(() => engine.current?.update(bpm, volume, tone), [bpm, volume, tone])

  const start = useCallback(async () => {
    if (!engine.current) return
    await engine.current.start(bpm, volume, tone, setBeat, setPlaying)
  }, [bpm, volume, tone])

  const stop = useCallback(() => {
    engine.current?.stop()
    setPlaying(false)
    setBeat(-1)
  }, [])

  return { playing, beat, start, stop }
}
