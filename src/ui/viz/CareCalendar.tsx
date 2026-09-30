import type { MonthPlan } from '../../data/types'

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
const MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

/** Year strip: fertilising season, repotting window and the current month. */
export function CareCalendar({ plan }: { plan: MonthPlan }) {
  const now = new Date().getMonth() + 1
  const describe = (m: number) =>
    [MONTH_NAMES[m - 1], plan.fertilize.includes(m) && 'düngen', plan.repot.includes(m) && 'umtopfen'].filter(Boolean).join(', ')
  return (
    <div className="calendar">
      <ol className="calendar__months">
        {MONTHS.map((label, i) => {
          const m = i + 1
          const fert = plan.fertilize.includes(m)
          const repot = plan.repot.includes(m)
          return (
            <li key={m} className={`${fert ? 'is-fert' : ''} ${m === now ? 'is-now' : ''}`} title={describe(m)} aria-label={describe(m)}>
              <span className="calendar__bar" />
              <span className="calendar__repot">{repot ? '◆' : ''}</span>
              <span className="calendar__label">{label}</span>
            </li>
          )
        })}
      </ol>
      <div className="calendar__legend">
        <span><i className="swatch swatch--fert" /> Düngen</span>
        <span><i className="swatch swatch--repot">◆</i> Umtopfen</span>
        <span><i className="swatch swatch--now" /> Aktueller Monat</span>
      </div>
    </div>
  )
}
