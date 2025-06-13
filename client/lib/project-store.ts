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

export async function loadProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${base}/api/projects`, { cache: 'no-store' })
    if (res.ok) {
      const data = (await res.json()) as Project[]
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(KEY, JSON.stringify(data))
      }
      return data
    }
  } catch {
    // ignore network errors
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
    await fetch(`${base}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    })
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
    const res = await fetch(`${base}/api/projects/${id}`, { cache: 'no-store' })
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
    }
  } catch {
    // ignore
  }
  const all = await loadProjects()
  return all.find(q => q.id === id)
}

export async function deleteProject(id: string) {
  try {
    await fetch(`${base}/api/projects/${id}`, { method: 'DELETE' })
  } catch {
    // ignore
  }
  if (typeof localStorage === 'undefined') return
  const all = await loadProjects()
  const updated = all.filter(q => q.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

