import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { plants } from '../../src/data/plants'
import { createI18n, I18nContext } from '../../src/i18n/context'
import { Comparison } from '../../src/ui/Comparison'

// Reviewed status exists only in these synthetic fixtures, never in production data.
const reviewed = { ...plants[0], dataQuality: 'reviewed' as const }
const placeholder = plants[1]

for (const locale of ['en', 'de'] as const) {
  describe(`comparison provenance (${locale})`, () => {
    const i18n = createI18n(locale, () => {})
    const render = (entries: typeof plants) => renderToStaticMarkup(createElement(I18nContext.Provider,
      { value: i18n }, createElement(Comparison, { plants: entries, onOpen: () => {} })))

    it('does not label a fully reviewed comparison as unverified', () => {
      expect(render([reviewed])).not.toContain(i18n.t.panel.placeholder)
      expect(render([])).not.toContain(i18n.t.panel.placeholder)
    })

    it('preserves the existing placeholder notice when every entry is unverified', () => {
      expect(render([placeholder])).toContain(i18n.t.panel.placeholder)
    })

    it('identifies only the unverified entries in a mixed comparison', () => {
      const html = render([reviewed, placeholder])
      expect(html).toContain(i18n.t.panel.placeholder)
      expect(html).toContain(i18n.t.compare.unverifiedPlants(i18n.l(placeholder.commonName)))
      expect(html).not.toContain(i18n.t.compare.unverifiedPlants(i18n.l(reviewed.commonName)))
    })
  })
}
