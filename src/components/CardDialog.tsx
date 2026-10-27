import { useEffect, useRef } from 'react'
import { asset, sizeClass } from '../asset'
import type { Card } from '../storage'

type Props = {
  card: Card
  number: number
  closing: boolean
  onClose: () => void
  onClosed: () => void
}

export function CardDialog({ card, number, closing, onClose, onClosed }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={`overlay${closing ? ' is-closing' : ''}`}
      onClick={onClose}
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget) onClosed()
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-question"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-stage">
          <img className="dialog-bg" src={asset('background_dialog.png')} alt="" draggable={false} />

          <div className="dialog-text">
            <p id="dialog-question" className={`dialog-q ${sizeClass(card.question)}`}>
              {card.question}
            </p>
            {card.note && <p className="dialog-note">({card.note})</p>}
          </div>

          <div className="dialog-plate">Карточка №{number}</div>

          <button ref={closeRef} className="dialog-close" aria-label="Закрыть" onClick={onClose} />
        </div>
      </div>
    </div>
  )
}
