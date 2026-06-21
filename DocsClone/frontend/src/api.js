// Thin REST client. Requests are relative so the Vite proxy (dev) or Flask
// (prod) serves them from the same origin.

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  health: () => fetch("/api/health").then(handle),
  list: () => fetch("/api/documents").then(handle),
  create: (title, data) =>
    fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, data }),
    }).then(handle),
  get: (id) => fetch(`/api/documents/${id}`).then(handle),
  rename: (id, title) =>
    fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(handle),
  remove: (id) =>
    fetch(`/api/documents/${id}`, { method: "DELETE" }).then(handle),
  sendFeedback: (payload) =>
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),
  listFeedback: () => fetch("/api/feedback").then(handle),
};
