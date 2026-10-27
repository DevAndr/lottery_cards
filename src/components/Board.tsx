import { useCallback, useState, type CSSProperties } from 'react'
import { asset, sizeClass } from '../asset'
import { useCards, useOpened, useSettings } from '../storage'
import { CardDialog } from './CardDialog'
import { Sparkles } from './Sparkles'

export function Board() {
  const [cards] = useCards()
  const [settings] = useSettings()
  const [opened, setOpened] = useOpened()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)

  const activeIndex = cards.findIndex((c) => c.id === activeId)
  const openedSet = new Set(opened)
  const openedCount = cards.filter((c) => openedSet.has(c.id)).length
  const left = cards.filter((c) => !openedSet.has(c.id))

  const open = (id: string) => {
    setClosing(false)
    setActiveId(id)
    setOpened((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const openRandom = () => {
    const pool = left.length ? left : cards
    if (pool.length) open(pool[Math.floor(Math.random() * pool.length)].id)
  }

  const close = useCallback(() => setClosing(true), [])
  const closed = useCallback(() => {
    setActiveId(null)
    setClosing(false)
  }, [])

  return (
    <div className="page">
      <div className="page-bg" style={{ backgroundImage: `url(${asset('background.png')})` }} />
      <Sparkles />

      <header className="hero">
        <h1 className="title">
          <span className="title-word">{settings.titleLeft}</span>
          {settings.titleMid && (
            <span className="title-heart">
              <span>{settings.titleMid}</span>
            </span>
          )}
          <span className="title-word">{settings.titleRight}</span>
        </h1>
        {settings.subtitle && <p className="subtitle">{settings.subtitle}</p>}
      </header>

      <main className="board">
        {cards.map((card, i) => {
          const isOpened = openedSet.has(card.id)
          const hidden = settings.hideUntilOpened && !isOpened
          return (
            <button
              key={card.id}
              className={`card${isOpened ? ' is-opened' : ''}`}
              style={{ '--i': i } as CSSProperties}
              onClick={() => open(card.id)}
              aria-label={hidden ? `Карточка ${i + 1}` : `Карточка ${i + 1}: ${card.question}`}
            >
              <img className="card-frame" src={asset('template_cards.png')} alt="" draggable={false} />
              <span className="card-num">{i + 1}</span>
              <span className="card-body">
                {hidden ? (
                  <span className="card-mystery">?</span>
                ) : (
                  <>
                    <span className={`card-q ${sizeClass(card.question)}`}>{card.question}</span>
                    {card.note && <span className="card-note">({card.note})</span>}
                  </>
                )}
              </span>
            </button>
          )
        })}

        {cards.length === 0 && (
          <p className="board-empty">
            Карточек пока нет — добавь их в <a href="#/admin">админке</a>.
          </p>
        )}
      </main>

      {cards.length > 0 && (
        <footer className="controls">
          <button className="btn btn-glow" onClick={openRandom}>
            ♥ Случайная карточка
          </button>
          <span className="counter">
            Открыто {openedCount} из {cards.length}
          </span>
          {openedCount > 0 && (
            <button className="btn btn-ghost" onClick={() => setOpened([])}>
              Сбросить
            </button>
          )}
        </footer>
      )}

      <a className="admin-link" href="#/admin" aria-label="Админка" title="Админка">
        ⚙
      </a>

      {activeIndex >= 0 && (
        <CardDialog
          card={cards[activeIndex]}
          number={activeIndex + 1}
          closing={closing}
          onClose={close}
          onClosed={closed}
        />
      )}
    </div>
  )
}
