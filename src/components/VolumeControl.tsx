import type { ClickTone } from '../lib/metronomeAudio'

type Props = { volume: number; tone: ClickTone; onVolumeChange: (volume: number) => void; onToneChange: (tone: ClickTone) => void }

export default function VolumeControl({ volume, tone, onVolumeChange, onToneChange }: Props) {
  return (
    <section className="sound-card" aria-label="ปรับเสียง">
      <div className="sound-heading"><span className="sound-icon">♫</span><div><strong>เสียงเมโทรนอม</strong><small>เลือกลักษณะเสียงและความดัง</small></div></div>
      <div className="tone-options" role="group" aria-label="เลือกลักษณะเสียง">
        {(['wood', 'soft', 'bright'] as const).map((item) => (
          <button key={item} className={`tone-chip ${tone === item ? 'selected' : ''}`} onClick={() => onToneChange(item)}>
            {item === 'wood' ? 'ไม้' : item === 'soft' ? 'นุ่ม' : 'ใส'}
          </button>
        ))}
      </div>
      <label className="volume-row"><span>ความดัง</span><input className="range" type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={(event) => onVolumeChange(Number(event.target.value) / 100)} aria-label="ปรับความดัง"/><span className="volume-value">{Math.round(volume * 100)}%</span></label>
    </section>
  )
}
