const API_BASE = (() => {
  if (typeof window !== "undefined" && window.location) {
    const { protocol, hostname, port, origin } = window.location;
    if (port === "4000" || (port === "" && hostname && hostname !== "localhost" && hostname !== "127.0.0.1")) {
      return `${origin}/api`;
    }
    const host = hostname || "localhost";
    const proto = protocol && protocol.startsWith("http") ? protocol : "http:";
    return `${proto}//${host}:4000/api`;
  }
  return "http://localhost:4000/api";
})();

const state = {
  doctors: [],
  selectedDoctorId: null,
  queue: [],
  loading: true,
  error: null,
};

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function iconClock() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
}

function ticketHtml(entry) {
  const time = new Date(entry.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const actions = [];
  if (entry.status === "waiting") {
    actions.push(`<button class="primary" onclick="STAFF.callNext('${entry.id}')">Call</button>`);
    actions.push(`<button class="danger" onclick="STAFF.skip('${entry.id}')">Skip</button>`);
  }
  if (entry.status === "called") {
    actions.push(`<button class="primary" onclick="STAFF.start('${entry.id}')">Start consult</button>`);
    actions.push(`<button class="danger" onclick="STAFF.skip('${entry.id}')">Skip</button>`);
  }
  if (entry.status === "in-consultation") {
    actions.push(`<button class="primary" onclick="STAFF.complete('${entry.id}')">Complete</button>`);
  }
  return `
    <div class="staff-ticket">
      <div class="tok">#${entry.tokenNumber} · ${entry.doctor}</div>
      <div class="name">${entry.patientName}</div>
      <div class="time">${iconClock()} Checked in ${time}</div>
      <div class="actions">${actions.join("")}</div>
    </div>`;
}

function render() {
  const el = document.getElementById("staff-app");
  if (state.loading) {
    el.innerHTML = `<div class="staff-header"><h1>NALAM Staff</h1></div><div class="staff-body-content"><p class="staff-empty">Loading…</p></div>`;
    return;
  }
  if (state.error) {
    el.innerHTML = `<div class="staff-header"><h1>NALAM Staff</h1></div><div class="staff-body-content"><p class="staff-empty">${state.error}</p></div>`;
    return;
  }

  const waiting = state.queue.filter((q) => q.status === "waiting");
  const called = state.queue.filter((q) => q.status === "called");
  const inConsult = state.queue.filter((q) => q.status === "in-consultation");

  el.innerHTML = `
    <div class="staff-header">
      <div><h1>NALAM Staff — Queue Dashboard</h1><p>Hospital-side view of doctor-wise patient queues</p></div>
    </div>
    <div class="staff-body-content">
      <div class="doctor-tabs">
        ${state.doctors.map((d) => `
          <div class="chip ${d.id === state.selectedDoctorId ? "active" : ""}" style="cursor:pointer;" onclick="STAFF.selectDoctor('${d.id}')">${d.name}</div>`).join("")}
      </div>
      <div class="staff-toolbar"><span class="staff-refresh-note">Auto-refreshing every 5s</span></div>
      <div class="queue-columns">
        <div class="queue-col">
          <h3>Waiting <span class="count">${waiting.length}</span></h3>
          ${waiting.length ? waiting.map(ticketHtml).join("") : `<p class="staff-empty">No one waiting.</p>`}
        </div>
        <div class="queue-col">
          <h3>Called <span class="count">${called.length}</span></h3>
          ${called.length ? called.map(ticketHtml).join("") : `<p class="staff-empty">No one called yet.</p>`}
        </div>
        <div class="queue-col">
          <h3>In Consultation <span class="count">${inConsult.length}</span></h3>
          ${inConsult.length ? inConsult.map(ticketHtml).join("") : `<p class="staff-empty">No active consultation.</p>`}
        </div>
      </div>
    </div>`;
}

async function refreshQueue() {
  if (!state.selectedDoctorId) return;
  try {
    state.queue = await api(`/queue/doctor/${state.selectedDoctorId}`);
    state.error = null;
  } catch (e) {
    state.error = e.message;
  }
  render();
}

const STAFF = {
  async selectDoctor(id) {
    state.selectedDoctorId = id;
    await refreshQueue();
  },
  async callNext(entryId) { await api(`/queue/${entryId}/call`, { method: "POST" }); refreshQueue(); },
  async start(entryId) { await api(`/queue/${entryId}/start`, { method: "POST" }); refreshQueue(); },
  async complete(entryId) { await api(`/queue/${entryId}/complete`, { method: "POST" }); refreshQueue(); },
  async skip(entryId) { await api(`/queue/${entryId}/skip`, { method: "POST" }); refreshQueue(); },
};
window.STAFF = STAFF;

(async function init() {
  try {
    state.doctors = await api("/doctors");
    state.selectedDoctorId = state.doctors[0]?.id || null;
    state.loading = false;
    await refreshQueue();
  } catch (e) {
    state.loading = false;
    state.error = `Couldn't reach the NALAM backend at ${API_BASE.replace("/api", "")}.`;
    render();
  }
  setInterval(refreshQueue, 5000);
})();
