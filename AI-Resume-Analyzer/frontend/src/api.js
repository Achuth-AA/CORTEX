// Thin API client. All requests are relative so the Vite proxy (dev) or
// Flask (prod) can serve them from the same origin.

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  config: () => fetch("/api/config").then(handle),

  analyze: (formData) =>
    fetch("/api/analyze", { method: "POST", body: formData }).then(handle),

  history: () => fetch("/api/history").then(handle),

  historyItem: (id) => fetch(`/api/history/${id}`).then(handle),

  deleteItem: (id) =>
    fetch(`/api/history/${id}`, { method: "DELETE" }).then(handle),

  stats: () => fetch("/api/stats").then(handle),
};
