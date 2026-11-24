type Props = { bpm: number; onBpmChange: (bpm: number) => void; suggestion: { minBpm: number; maxBpm: number }; onUseSuggestion: () => void }

export default function BpmControl({ bpm, onBpmChange, suggestion, onUseSuggestion }: Props) {
  return (
    <section className="bpm-card" aria-label="ตั้งค่าจังหวะเมโทรนอม">
      <div className="suggestion-row">
        <div><p className="eyebrow">BPM แนะนำสำหรับเพซนี้</p><strong>{suggestion.minBpm}–{suggestion.maxBpm}</strong></div>
        <button className="text-button" onClick={onUseSuggestion}>ใช้ค่าแนะนำ</button>
      </div>
      <div className="bpm-adjuster">
        <div><p className="eyebrow">จังหวะเสียง</p><strong className="bpm-value">{bpm}<small> BPM</small></strong></div>
        <div className="bpm-buttons">
          <button className="round-button" onClick={() => onBpmChange(Math.max(40, bpm - 1))} aria-label="ลด BPM">−</button>
          <button className="round-button" onClick={() => onBpmChange(Math.min(240, bpm + 1))} aria-label="เพิ่ม BPM">＋</button>
        </div>
      </div>
      <p className="hint">หนึ่งเสียงติ๊กต่อหนึ่งก้าว</p>
    </section>
  )
}
