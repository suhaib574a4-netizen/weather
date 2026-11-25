import { useCallback, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : JSON.parse(stored)
    } catch {
      return initialValue
    }
  })

  const update = useCallback(
    (nextValue) => {
      setValue((current) => {
        const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // Storage may be unavailable (private mode / quota) — state still works.
        }
        return resolved
      })
    },
    [key],
  )

  return [value, update]
}
