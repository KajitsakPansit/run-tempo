import { paceSuggestions } from '../data/paceBpm'

type Props = { open: boolean; pace: number; onClose: () => void; onSelect: (bpm: number) => void }

export default function PaceBpmDialog({ open, pace, onClose, onSelect }: Props) {
  if (!open) return null
  const active = paceSuggestions.find((row) => pace >= row.minPace && pace <= row.maxPace)

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading"><div><p className="eyebrow">ตารางอ้างอิง</p><h2 id="dialog-title">เทียบเพซ / BPM</h2></div><button className="close-button" onClick={onClose} aria-label="ปิด">×</button></div>
        <p className="dialog-description">แตะแถวเพื่อเลือก BPM กลางของช่วงแนะนำ</p>
        <div className="table-wrap"><table><thead><tr><th>เพซ (นาที/กม.)</th><th>BPM แนะนำ</th></tr></thead><tbody>
          {paceSuggestions.map((row) => {
            const selected = row === active
            const paceLabel = row.maxPace >= 20 ? '9.00 ขึ้นไป' : `${row.maxPace.toFixed(2)} – ${row.minPace.toFixed(2)}`
            const middle = Math.round((row.minBpm + row.maxBpm) / 2)
            return <tr key={row.minPace} className={selected ? 'active-row' : ''}><td>{paceLabel}{selected && <span className="current-label">เพซนี้</span>}</td><td><button className="table-choice" onClick={() => onSelect(middle)}>{row.minBpm}–{row.maxBpm}<span> ใช้ {middle}</span></button></td></tr>
          })}
        </tbody></table></div>
        <p className="table-note">เป็นค่าเริ่มต้นสำหรับลองปรับ รอบขาที่เหมาะสมแตกต่างกันในแต่ละคน</p>
        <button className="dialog-done" onClick={onClose}>ปิดตาราง</button>
      </section>
    </div>
  )
}
