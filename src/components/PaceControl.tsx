import { formatPace } from '../utils/pace'

type Props = { pace: number; onPaceChange: (pace: number) => void }

export default function PaceControl({ pace, onPaceChange }: Props) {
  const change = (amount: number) => onPaceChange(Math.min(20, Math.max(3, Number((pace + amount).toFixed(2)))))

  return (
    <section className="pace-card" aria-label="ตั้งค่าเพซ">
      <p className="eyebrow">เพซเป้าหมาย</p>
      <div className="pace-number"><span>{formatPace(pace)}</span><small>นาที / กม.</small></div>
      <div className="pace-buttons">
        <button className="step-button" onClick={() => change(-0.01)} aria-label="เร็วขึ้น 0.01 นาทีต่อกิโลเมตร">
          <span>↑</span><small>เร็วขึ้น</small>
        </button>
        <button className="step-button" onClick={() => change(0.01)} aria-label="ช้าลง 0.01 นาทีต่อกิโลเมตร">
          <span>↓</span><small>ช้าลง</small>
        </button>
      </div>
      <div className="range-labels"><span>เร็ว</span><span>รูดเพื่อปรับเพซ</span><span>ช้า</span></div>
      <input
        className="range pace-range"
        type="range"
        min="300"
        max="2000"
        step="1"
        value={Math.round(pace * 100)}
        onChange={(event) => onPaceChange(Number(event.target.value) / 100)}
        aria-label="รูดเพื่อปรับเพซตั้งแต่ 3 ถึง 20 นาทีต่อกิโลเมตร"
      />
    </section>
  )
}
