import type { CSSProperties } from 'react'

// Генерируем один раз при загрузке модуля, чтобы искры не прыгали при ререндере
const SPARKS = Array.from({ length: 28 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 4 + Math.random() * 8,
  delay: Math.random() * 6,
  duration: 3 + Math.random() * 4,
}))

export function Sparkles() {
  return (
    <div className="sparkles" aria-hidden="true">
      {SPARKS.map((s, i) => (
        <span
          key={i}
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              '--size': `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
