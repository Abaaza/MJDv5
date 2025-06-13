export interface ProjectItem {
  id: number
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface Project {
  id: string
  client: string
  project: string
  value: number
  status: string
  date: string
  items: ProjectItem[]
}

const KEY = 'projects'
const base = process.env.NEXT_PUBLIC_API_URL ?? ''

function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed.token ?? null
  } catch {
    return null
  }
}

export async function loadProjects(): Promise<Project[]> {
  try {
    const headers: Record<string, string> = {}
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${base}/api/projects`, { cache: 'no-store', headers })
    if (res.ok) {
      const data = (await res.json()) as Project[]
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(KEY, JSON.stringify(data))
      }
      return data
    } else {
      console.warn('loadProjects failed', res.status)
    }
  } catch (err) {
    console.error('loadProjects error', err)
  }
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Project[]) : []
  } catch {
    return []
  }
}

export async function saveProject(q: Project) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${base}/api/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(q),
    })
    console.log('saveProject status', res.status)
  } catch {
    // ignore network errors
  }
  if (typeof localStorage === 'undefined') return
  const all = await loadProjects()
  const idx = all.findIndex(i => i.id === q.id)
  if (idx >= 0) all[idx] = q
  else all.push(q)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export async function getProject(id: string): Promise<Project | undefined> {
  try {
    const headers: Record<string, string> = {}
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${base}/api/projects/${id}`, { cache: 'no-store', headers })
    if (res.ok) {
      const q = (await res.json()) as Project
      if (typeof localStorage !== 'undefined') {
        const all = await loadProjects()
        const idx = all.findIndex(i => i.id === q.id)
        if (idx >= 0) all[idx] = q
        else all.push(q)
        localStorage.setItem(KEY, JSON.stringify(all))
      }
      return q
    } else {
      console.warn('getProject failed', res.status)
    }
  } catch (err) {
    console.error('getProject error', err)
  }
  const all = await loadProjects()
  return all.find(q => q.id === id)
}

export async function deleteProject(id: string) {
  try {
    const headers: Record<string, string> = {}
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${base}/api/projects/${id}`, { method: 'DELETE', headers })
    console.log('deleteProject status', res.status)
  } catch {
    // ignore
  }
  if (typeof localStorage === 'undefined') return
  const all = await loadProjects()
  const updated = all.filter(q => q.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

