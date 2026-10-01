import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Locale } from '../data/types'
import { I18nContext, STORAGE_KEY, createI18n, storedLocale } from './context'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(storedLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The choice then lasts for this visit only.
    }
  }, [])

  const value = useMemo(() => createI18n(locale, setLocale), [locale, setLocale])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = value.t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', value.t.meta.description)
  }, [locale, value])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
