import { useRef, useState, type FormEvent } from 'react'
import { asset } from '../asset'
import {
  DEFAULT_CARDS,
  DEFAULT_SETTINGS,
  newId,
  normalizeCards,
  normalizeSettings,
  useCards,
  useOpened,
  useSettings,
  type Card,
  type Settings,
} from '../storage'

export function Admin() {
  const [cards, setCards] = useCards()
  const [settings, setSettings] = useSettings()
  const [opened, setOpened] = useOpened()
  const [question, setQuestion] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const flash = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage((m) => (m === text ? '' : m)), 2500)
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }))

  const updateCard = (id: string, patch: Partial<Card>) =>
    setCards((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const move = (index: number, dir: -1 | 1) =>
    setCards((list) => {
      const to = index + dir
      if (to < 0 || to >= list.length) return list
      const next = [...list]
      ;[next[index], next[to]] = [next[to], next[index]]
      return next
    })

  const remove = (card: Card, number: number) => {
    if (!confirm(`Удалить карточку №${number}?\n\n«${card.question}»`)) return
    setCards((list) => list.filter((c) => c.id !== card.id))
    setOpened((list) => list.filter((id) => id !== card.id))
  }

  const add = (e: FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    setCards((list) => [...list, { id: newId(), question: question.trim(), note: note.trim() }])
    setQuestion('')
    setNote('')
    flash('Карточка добавлена')
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ cards, settings }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lottery-cards.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text())
      const imported = normalizeCards(Array.isArray(data) ? data : data.cards)
      setCards(imported)
      if (data.settings) setSettings(normalizeSettings(data.settings))
      setOpened([])
      flash(`Импортировано карточек: ${imported.length}`)
    } catch {
      flash('Не удалось прочитать файл')
    }
  }

  const resetAll = () => {
    if (!confirm('Вернуть стандартные карточки и оформление? Текущие карточки будут удалены.')) return
    setCards(DEFAULT_CARDS)
    setSettings(DEFAULT_SETTINGS)
    setOpened([])
    flash('Восстановлены стандартные карточки')
  }

  return (
    <div className="admin">
      <div className="page-bg is-dim" style={{ backgroundImage: `url(${asset('background.png')})` }} />

      <header className="admin-head">
        <h1>Админка</h1>
        <a className="btn btn-glow" href="#/">
          ← К карточкам
        </a>
      </header>

      <section className="panel">
        <h2>Оформление</h2>
        <div className="grid-3">
          <label className="field">
            <span>Заголовок слева</span>
            <input value={settings.titleLeft} onChange={(e) => updateSetting('titleLeft', e.target.value)} />
          </label>
          <label className="field">
            <span>В сердечке</span>
            <input value={settings.titleMid} onChange={(e) => updateSetting('titleMid', e.target.value)} />
          </label>
          <label className="field">
            <span>Заголовок справа</span>
            <input value={settings.titleRight} onChange={(e) => updateSetting('titleRight', e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Подзаголовок</span>
          <input value={settings.subtitle} onChange={(e) => updateSetting('subtitle', e.target.value)} />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.hideUntilOpened}
            onChange={(e) => updateSetting('hideUntilOpened', e.target.checked)}
          />
          <span>Прятать текст вопроса на карточке, пока её не откроют (режим лотереи)</span>
        </label>
      </section>

      <section className="panel">
        <h2>Новая карточка</h2>
        <form className="add-form" onSubmit={add}>
          <label className="field">
            <span>Вопрос</span>
            <textarea
              rows={2}
              value={question}
              placeholder="Например: Какой твой самый стыдный краш?"
              onChange={(e) => setQuestion(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Приписка (необязательно)</span>
            <input value={note} placeholder="можно 18+" onChange={(e) => setNote(e.target.value)} />
          </label>
          <button className="btn btn-glow" type="submit" disabled={!question.trim()}>
            + Добавить
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>
          Карточки <small>({cards.length})</small>
        </h2>
        {cards.length === 0 && <p className="muted">Пока пусто.</p>}
        <ol className="card-list">
          {cards.map((card, i) => (
            <li key={card.id} className={`card-row${opened.includes(card.id) ? ' is-opened' : ''}`}>
              <span className="row-num">{i + 1}</span>
              <div className="row-fields">
                <textarea
                  rows={2}
                  aria-label={`Вопрос карточки ${i + 1}`}
                  value={card.question}
                  onChange={(e) => updateCard(card.id, { question: e.target.value })}
                />
                <input
                  aria-label={`Приписка карточки ${i + 1}`}
                  placeholder="приписка"
                  value={card.note}
                  onChange={(e) => updateCard(card.id, { note: e.target.value })}
                />
              </div>
              <div className="row-actions">
                <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} title="Выше">
                  ↑
                </button>
                <button
                  className="icon-btn"
                  onClick={() => move(i, 1)}
                  disabled={i === cards.length - 1}
                  title="Ниже"
                >
                  ↓
                </button>
                <button className="icon-btn is-danger" onClick={() => remove(card, i + 1)} title="Удалить">
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h2>Данные</h2>
        <p className="muted">
          Всё сохраняется автоматически в localStorage этого браузера. Чтобы перенести карточки на другой
          компьютер — экспортируй и импортируй JSON.
        </p>
        <div className="btn-row">
          <button className="btn" onClick={exportJson}>
            Экспорт JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Импорт JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importJson(file)
              e.target.value = ''
            }}
          />
          <button className="btn" onClick={() => setOpened([])} disabled={opened.length === 0}>
            Сбросить открытые
          </button>
          <button className="btn btn-danger" onClick={resetAll}>
            Стандартные карточки
          </button>
        </div>
      </section>

      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </div>
  )
}
