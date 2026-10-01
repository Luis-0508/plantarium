import { useCallback, useEffect, useState } from 'react'
import { parseRoute, routeHash, type Route } from './navigation'

export function useHashNavigation() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const sync = () => {
      const next = parseRoute(window.location.hash)
      const canonical = routeHash(next)
      if (window.location.hash !== canonical) history.replaceState(null, '', canonical)
      setRoute((previous) => previous.page === next.page && previous.plantId === next.plantId ? previous : next)
    }
    sync()
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  const navigate = useCallback((next: Route) => {
    const hash = routeHash(next)
    if (window.location.hash !== hash) history.pushState(null, '', hash)
    setRoute(parseRoute(hash))
  }, [])
  return { route, navigate }
}
