const base = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Login failed");
  }
  return res.json();
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  guests: number,
) {
  const res = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, guests }),
  });
  if (!res.ok) {
    throw new Error("Registration failed");
  }
  return res.json();
}

export async function priceMatch(
  file: File,
  keys: { openaiKey?: string; cohereKey?: string; geminiKey?: string },
  token: string,
  version: 'v0' | 'v1' | 'v2',
  asyncMode = false,
) {
  const form = new FormData();
  form.append("file", file);
  if (keys.openaiKey) form.append("openaiKey", keys.openaiKey);
  if (keys.cohereKey) form.append("cohereKey", keys.cohereKey);
  if (keys.geminiKey) form.append("geminiKey", keys.geminiKey);
  form.append('version', version);
  const url = asyncMode ? `${base}/api/match?async=1` : `${base}/api/match`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    let message = "Price match failed";
    try {
      const data = await res.json();
      if (data && data.message) message = data.message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function pollMatch(jobId: string, token: string) {
  const res = await fetch(`${base}/api/match/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Polling failed");
  return res.json();
}

export async function updateProfile(name: string, token: string) {
  const res = await fetch(`${base}/api/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  token: string,
) {
  const res = await fetch(`${base}/api/auth/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error("Password update failed");
  return res.json();
}

export interface PriceItem {
  _id?: string;
  code?: string;
  ref?: string;
  description: string;
  category?: string;
  subCategory?: string;
  unit?: string;
  rate?: number;
  keywords?: string[];
  phrases?: string[];
  searchText?: string;
}

export async function searchPriceItems(
  query: string,
  token: string,
): Promise<PriceItem[]> {
  const url = `${base}/api/prices/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export async function getPriceItems(
  token: string,
  opts: { page?: number; limit?: number; sort?: string; q?: string; categories?: string[] } = {},
): Promise<PaginatedResult<PriceItem>> {
  const params = new URLSearchParams();
  if (opts.page) params.append("page", String(opts.page));
  if (opts.limit) params.append("limit", String(opts.limit));
  if (opts.sort) params.append("sort", opts.sort);
  if (opts.q) params.append("q", opts.q);
  if (opts.categories && opts.categories.length) {
    params.append('categories', opts.categories.join(','));
  }
  const res = await fetch(`${base}/api/prices?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch prices");
  return res.json();
}

export async function updatePriceItem(
  id: string,
  updates: Partial<PriceItem>,
  token: string,
): Promise<PriceItem> {
  const res = await fetch(`${base}/api/prices/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function createPriceItem(
  item: PriceItem,
  token: string,
): Promise<PriceItem> {
  const res = await fetch(`${base}/api/prices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

export async function deletePriceItem(
  id: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${base}/api/prices/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Delete failed");
}

export async function getCategories(token: string): Promise<string[]> {
  const res = await fetch(`${base}/api/prices/categories/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
