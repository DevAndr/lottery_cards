export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`

/** Подбирает размер шрифта под длину текста, чтобы вопрос влезал в рамку */
export const sizeClass = (text: string) =>
  text.length > 110 ? 'is-xlong' : text.length > 75 ? 'is-long' : text.length > 45 ? 'is-mid' : ''
