import { useCallback, useMemo, useSyncExternalStore } from 'react'

export type Card = {
  id: string
  question: string
  /** Короткая приписка под вопросом, например «можно 18+» */
  note: string
}

export type Settings = {
  titleLeft: string
  titleMid: string
  titleRight: string
  subtitle: string
  /** Прятать текст вопроса на карточке, пока её не открыли */
  hideUntilOpened: boolean
}

const PREFIX = 'lottery-cards:'
export const KEYS = {
  cards: `${PREFIX}cards`,
  settings: `${PREFIX}settings`,
  opened: `${PREFIX}opened`,
}

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const DEFAULT_QUESTIONS: [string, string?][] = [
  ['Какой твой самый стыдный краш?'],
  ['Был(а) ли у тебя секс на первом свидании?'],
  ['Что ты сейчас хочешь сделать больше всего?', 'можно 18+'],
  ['Сколько у тебя было отношений? И сколько партнёров?'],
  ['Отправлял(а) ли ты когда-нибудь нюдсы?'],
  ['Кто из известных людей кажется тебе сексуальным?'],
  ['Какая твоя самая безумная фантазия?', 'можно 18+'],
  ['Что ты больше всего боишься в отношениях?'],
  ['Был(а) ли у тебя друзья с привилегиями?'],
  ['Что тебе нравится в себе больше всего внешне?'],
  ['Признавался(ась) ли ты в чувствах, зная, что это безответно?'],
  ['Какой самый странный или необычный опыт у тебя был?', 'можно 18+'],
  ['Что тебя заводит сильнее всего?', 'можно 18+'],
  ['Есть ли у тебя тайные желания, о которых ты никому не говорила?', 'можно 18+'],
  ['С кем из тех, кто сейчас смотрит стрим, ты бы хотела провести ночь?', 'или выпей!'],
]

export const DEFAULT_CARDS: Card[] = DEFAULT_QUESTIONS.map(([question, note = ''], i) => ({
  id: `default-${i + 1}`,
  question,
  note,
}))

export const DEFAULT_SETTINGS: Settings = {
  titleLeft: 'Правда',
  titleMid: 'или',
  titleRight: 'Тьма',
  subtitle: 'Отвечаешь на вопрос честно… или выпиваешь глоток!',
  hideUntilOpened: false,
}

const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  // Изменения из другой вкладки (например, админка открыта отдельно)
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(PREFIX)) cb()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function parse<T>(raw: string | null, fallback: T, normalize: (v: unknown) => T): T {
  if (raw == null) return fallback
  try {
    return normalize(JSON.parse(raw))
  } catch {
    return fallback
  }
}

export function writeStored(key: string, value: unknown) {
  try {
    if (value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage недоступен (приватный режим и т.п.) — просто не сохраняем
  }
  listeners.forEach((l) => l())
}

function useStored<T>(key: string, fallback: T, normalize: (v: unknown) => T) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key))
  const value = useMemo(() => parse(raw, fallback, normalize), [raw, fallback, normalize])
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = parse(readRaw(key), fallback, normalize)
      writeStored(key, typeof next === 'function' ? (next as (p: T) => T)(prev) : next)
    },
    [key, fallback, normalize],
  )
  return [value, set] as const
}

const normalizeCards = (v: unknown): Card[] =>
  Array.isArray(v)
    ? v
        .filter((c): c is Partial<Card> => !!c && typeof c === 'object')
        .map((c) => ({
          id: typeof c.id === 'string' && c.id ? c.id : newId(),
          question: typeof c.question === 'string' ? c.question : '',
          note: typeof c.note === 'string' ? c.note : '',
        }))
    : DEFAULT_CARDS

const normalizeSettings = (v: unknown): Settings => ({
  ...DEFAULT_SETTINGS,
  ...(v && typeof v === 'object' ? (v as Partial<Settings>) : {}),
})

const NO_OPENED: string[] = []
const normalizeOpened = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : NO_OPENED

export const useCards = () => useStored(KEYS.cards, DEFAULT_CARDS, normalizeCards)
export const useSettings = () => useStored(KEYS.settings, DEFAULT_SETTINGS, normalizeSettings)
export const useOpened = () => useStored(KEYS.opened, NO_OPENED, normalizeOpened)

export { normalizeCards, normalizeSettings }
