import { createContext, useContext } from 'react'
import type { Locale, Localized } from '../data/types'
import { messages, type Messages } from './messages'

export const LOCALES: { id: Locale; label: string; name: string }[] = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'de', label: 'DE', name: 'Deutsch' },
]

export const DEFAULT_LOCALE: Locale = 'en'
export const STORAGE_KEY = 'plantarium-locale'

interface I18n {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** UI strings for the active locale. */
  t: Messages
  /** Picks the active locale's text from plant data. */
  l: (text: Localized) => string
  /** Decimal number in the active locale (e.g. 6,5 in German). */
  num: (value: number, digits?: number) => string
}

export function createI18n(locale: Locale, setLocale: (locale: Locale) => void): I18n {
  return {
    locale,
    setLocale,
    t: messages[locale],
    l: (text) => text[locale],
    num: (value, digits = 1) => value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }),
  }
}

// Components rendered without a provider (test fixtures) use the default locale.
export const I18nContext = createContext<I18n>(createI18n(DEFAULT_LOCALE, () => {}))

export function storedLocale(): Locale {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (LOCALES.some((l) => l.id === value)) return value as Locale
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
  return DEFAULT_LOCALE
}

export function useI18n() {
  return useContext(I18nContext)
}
