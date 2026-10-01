import { getPlant, plants } from './data/plants'

export interface Route {
  page: 'explore' | 'compare'
  plantId: string
}

export function parseRoute(hash: string): Route {
  const [page, rawId] = hash.replace(/^#/, '').split('/')
  let id = rawId ?? plants[0].id
  try { id = decodeURIComponent(id) } catch { id = plants[0].id }
  return { page: page === 'vergleich' ? 'compare' : 'explore', plantId: getPlant(id).id }
}

export function routeHash(route: Route) {
  return `#${route.page === 'compare' ? 'vergleich' : 'pflanze'}/${getPlant(route.plantId).id}`
}
