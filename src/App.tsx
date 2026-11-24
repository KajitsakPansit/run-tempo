import { useEffect, useMemo, useState } from 'react'
import BpmControl from './components/BpmControl'
import PaceBpmDialog from './components/PaceBpmDialog'
import PaceControl from './components/PaceControl'
import ShoeLogo from './components/ShoeLogo'
import VolumeControl from './components/VolumeControl'
import { getSuggestion } from './data/paceBpm'
import { useMetronome } from './hooks/useMetronome'
import type { ClickTone } from './lib/metronomeAudio'

type Preferences = { pace: number; bpm: number; volume: number; tone: ClickTone }
const storageKey = 'run-tempo-preferences'
const defaults: Preferences = { pace: 10, bpm: 165, volume: 0.45, tone: 'wood' }

function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return defaults
    const parsed = JSON.parse(stored) as Partial<Preferences>
    return {
      pace: typeof parsed.pace === 'number' ? Math.min(20, Math.max(3, parsed.pace)) : defaults.pace,
      bpm: typeof parsed.bpm === 'number' ? Math.min(240, Math.max(40, parsed.bpm)) : defaults.bpm,
      volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : defaults.volume,
      tone: parsed.tone === 'soft' || parsed.tone === 'bright' ? parsed.tone : defaults.tone,
    }
  } catch { return defaults }
}

export default function App() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences)
  const [tableOpen, setTableOpen] = useState(false)
  const [error, setError] = useState('')
  const { playing, beat, start, stop } = useMetronome(preferences.bpm, preferences.volume, preferences.tone)
  const suggestion = useMemo(() => getSuggestion(preferences.pace), [preferences.pace])

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(preferences)) }, [preferences])
  useEffect(() => { if (tableOpen) document.body.classList.add('dialog-open'); else document.body.classList.remove('dialog-open'); return () => document.body.classList.remove('dialog-open') }, [tableOpen])

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => setPreferences((current) => ({ ...current, [key]: value }))
  const onStart = async () => {
    setError('')
    try { await start() } catch { setError('เปิดเสียงไม่ได้ กรุณาลองแตะเริ่มอีกครั้งและตรวจสอบเสียงของอุปกรณ์') }
  }
  const useSuggestedBpm = (bpm: number) => { update('bpm', bpm); setTableOpen(false) }

  return (
    <main className="app-shell">
      <header className="brand"><ShoeLogo /><span>RUN TEMPO</span></header>
      <section className="intro"><p className="eyebrow">จังหวะที่พอดีกับการวิ่งของคุณ</p><h1>วิ่งไปตามจังหวะ</h1><p className="intro-copy">ตั้งเพซ เลือก BPM แล้วออกวิ่งได้เลย</p></section>
      <div className="control-grid">
        <PaceControl pace={preferences.pace} onPaceChange={(pace) => update('pace', pace)} />
        <div className="side-controls">
          <BpmControl bpm={preferences.bpm} onBpmChange={(bpm) => update('bpm', bpm)} suggestion={suggestion} onUseSuggestion={() => useSuggestedBpm(Math.round((suggestion.minBpm + suggestion.maxBpm) / 2))} />
          <VolumeControl volume={preferences.volume} tone={preferences.tone} onVolumeChange={(volume) => update('volume', volume)} onToneChange={(tone) => update('tone', tone)} />
        </div>
      </div>
      <section className="run-actions" aria-label="ควบคุมเมโทรนอม">
        <button className={`start-button ${playing ? 'is-playing' : ''}`} onClick={playing ? stop : onStart}>
          <span className="play-symbol">{playing ? '■' : '▶'}</span>{playing ? 'หยุดเมโทรนอม' : 'เริ่มเมโทรนอม'}
        </button>
        <button className="table-button" onClick={() => setTableOpen(true)}><span className="table-icon">▤</span>เทียบว่าเร็ว / BPM</button>
        {playing && <div className="playing-status" aria-live="polite"><span className={`beat-dot ${beat === 0 ? 'accent' : ''}`} />กำลังเล่น · {preferences.bpm} BPM</div>}
        {error && <p className="error-message" role="alert">{error}</p>}
        <p className="background-note">ติดตั้ง Run Tempo ไว้ที่หน้าจอหลักเพื่อให้ Chrome จัดการเสียงพื้นหลังได้ดีขึ้น<br/>การเล่นขณะล็อกหน้าจอยังขึ้นกับ Chrome และการตั้งค่าประหยัดแบตเตอรี่ของเครื่อง</p>
      </section>
      <footer>RUN TEMPO <span>•</span> หนึ่งเสียงต่อหนึ่งก้าว</footer>
      <PaceBpmDialog open={tableOpen} pace={preferences.pace} onClose={() => setTableOpen(false)} onSelect={useSuggestedBpm} />
    </main>
  )
}
