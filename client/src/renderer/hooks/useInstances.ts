import { useEffect } from 'react'
import { useInstanceStore } from '../stores/instance-store'

export function useInstances() {
  const store = useInstanceStore()

  useEffect(() => {
    store.loadInstances()
  }, [])

  return store
}
