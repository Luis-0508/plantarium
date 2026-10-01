import { useState } from 'react'
import type { MonthPlan } from '../../data/types'
import { useI18n } from '../../i18n/context'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
// Fixed day and UTC keep the month name independent of the viewer's time zone.
const monthName = (m: number, locale: string, month: 'long' | 'narrow') =>
  new Date(Date.UTC(2000, m - 1, 15)).toLocaleString(locale, { month, timeZone: 'UTC' })

/** Year strip: fertilising season, repotting window and the current month. */
export function CareCalendar({ plan }: { plan: MonthPlan }) {
  const [now] = useState(() => new Date().getMonth() + 1)
  const { locale, t } = useI18n()
  const describe = (m: number) =>
    [monthName(m, locale, 'long'), plan.fertilize.includes(m) && t.viz.fertilize, plan.repot.includes(m) && t.viz.repot].filter(Boolean).join(', ')
  return (
    <div className="calendar">
      <ol className="calendar__months">
        {MONTHS.map((m) => {
          const fert = plan.fertilize.includes(m)
          const repot = plan.repot.includes(m)
          return (
            <li key={m} className={`${fert ? 'is-fert' : ''} ${m === now ? 'is-now' : ''}`} title={describe(m)} aria-label={describe(m)}>
              <span className="calendar__bar" />
              <span className="calendar__repot">{repot ? '◆' : ''}</span>
              <span className="calendar__label">{monthName(m, locale, 'narrow')}</span>
            </li>
          )
        })}
      </ol>
      <div className="calendar__legend">
        <span><i className="swatch swatch--fert" /> {t.viz.legendFertilize}</span>
        <span><i className="swatch swatch--repot">◆</i> {t.viz.legendRepot}</span>
        <span><i className="swatch swatch--now" /> {t.viz.legendNow}</span>
      </div>
    </div>
  )
}
