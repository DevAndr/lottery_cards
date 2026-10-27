import { useSyncExternalStore } from 'react'
import { Admin } from './components/Admin'
import { Board } from './components/Board'

const subscribeHash = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

function App() {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash)
  return hash.startsWith('#/admin') ? <Admin /> : <Board />
}

export default App
