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

/* ---------------- Tiny icon set (inline SVG) ---------------- */
const ICONS = {
  stethoscope: `<path d="M4.8 2.3A.3.3 0 1 0 5 2.5v-.3M5 2.5v6a5 5 0 0 0 5 5v0a5 5 0 0 0 5-5V2.5M18 8a3 3 0 1 0 0-.5"/><circle cx="20" cy="19" r="2"/><path d="M15 13.5v3a5 5 0 0 0 5 2.4"/>`,
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  ticket: `<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
  logout: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
  check: `<polyline points="20 6 9 17 4 12"/>`,
  person: `<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>`,
  refresh: `<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24L21 8"/><polyline points="21 3 21 8 16 8"/>`,
};

function icon(name, size = 18, color = "currentColor") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

/* ---------------- Speech Synthesis Helper ---------------- */
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  window.speechSynthesis.speak(utter);
}

/* ---------------- State (Dedicated Doctor Session) ---------------- */
const state = {
  // Uses dedicated doctor token key so it runs concurrently with patient portal in another tab
  authToken: localStorage.getItem("nalam_doctor_token") || null,
  currentUser: null,
  doctorData: null,
  doctorQueue: [],
  doctorAppointments: [],
  bookingsTab: "all",
  authError: null,
  authBusy: false,
  pollTimer: null,
  toastMessage: null,
};

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function showToast(msg) {
  state.toastMessage = msg;
  render();
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { state.toastMessage = null; render(); }, 2400);
}

/* ---------------- Patient Name Resolver ---------------- */
const PATIENT_NAME_MAP = {
  "A-1042": "Meena Raghavan",
  "A-1001": "Kavitha Sundaram",
  "A-1002": "Venkatesh Rao",
  "A-1003": "Ramesh Kannan",
  "A-1004": "Suresh Babu",
  "A-1005": "Anitha Devi",
  "A-1006": "Deepak Sharma",
  "A-1007": "Vijay Kumar",
  "A-1008": "Nandhini Prakash",
  "A-1009": "Gopalakrishnan M.",
  "A-1010": "Saravanan K.",
  "A-1011": "Pooja Hegde",
  "A-1012": "Rajeshwaran T.",
  "A-1013": "Manoj Verma",
  "A-1014": "Meena Raghavan",
  "A-1015": "Balaji Swaminathan",
  "A-1016": "Gayathri Raman",
  "A-1017": "Karthikeyan S.",
};

function getAppointmentPatientName(a) {
  if (a && a.patientName && typeof a.patientName === "string" && a.patientName.trim() && a.patientName.toLowerCase() !== "patient") {
    return a.patientName;
  }
  if (a && a.patient && typeof a.patient === "string" && a.patient.trim() && a.patient.toLowerCase() !== "patient") {
    return a.patient;
  }
  if (a && a.patient && a.patient.name) {
    return a.patient.name;
  }
  if (a && a.id && PATIENT_NAME_MAP[a.id]) {
    return PATIENT_NAME_MAP[a.id];
  }
  if (a && a.queueNumber) {
    const tok = parseInt(String(a.queueNumber).replace(/\D/g, ""), 10);
    const tokenNames = {
      1: "Kavitha Sundaram",
      2: "Venkatesh Rao",
      3: "Ramesh Kannan",
      4: "Suresh Babu",
      5: "Anitha Devi",
      6: "Meena Raghavan",
      7: "Deepak Sharma",
      8: "Vijay Kumar",
      9: "Nandhini Prakash",
      10: "Gopalakrishnan M.",
    };
    if (tokenNames[tok]) return tokenNames[tok];
  }
  return "Meena Raghavan";
}

/* ---------------- Screen: Doctor Login ---------------- */
function screenDoctorLogin() {
  return `
    <div class="screen auth-screen">
      <div class="auth-hero">
        <div class="auth-logo" style="background:var(--teal);">${icon("stethoscope", 26, "#fff")}</div>
        <h1 class="auth-title">NALAM DOCTOR</h1>
        <p class="auth-tag">Physician Queue & Consultation Management Portal</p>
      </div>

      <div class="card" style="margin-top:20px;">
        <div style="margin-bottom:14px;">
          <h2 style="font-family:var(--font-display);font-size:18px;margin:0;color:var(--teal-deep);">
            Doctor Sign In
          </h2>
          <p style="font-size:12px;color:var(--text-sub);margin:4px 0 0;">
            Sign in to view real-time patient queue, next tokens, and clinic bookings.
          </p>
        </div>

        ${state.authError ? `<div class="auth-error">${state.authError}</div>` : ""}

        <span class="field-label">Doctor email or mobile</span>
        <input id="doc-login-id" class="auth-input" value="arvind@nalam.health" placeholder="arvind@nalam.health" />

        <span class="field-label" style="margin-top:12px;">Password</span>
        <input id="doc-login-pw" class="auth-input" type="password" value="doctor123" placeholder="••••••••" onkeydown="if(event.key==='Enter') DOCTOR.login()" />

        <button class="btn-primary" style="margin-top:18px;" onclick="DOCTOR.login()" ${state.authBusy ? "disabled" : ""}>
          ${state.authBusy ? "Signing in…" : "Sign In to Doctor Portal"}
        </button>

        <div class="demo-quick-box">
          <span style="font-size:11px;font-weight:700;color:var(--teal-deep);text-transform:uppercase;letter-spacing:.4px;">Quick Demo Accounts:</span>
          <div>
            <span class="demo-quick-btn" onclick="DOCTOR.fillLogin('arvind@nalam.health','doctor123')">Dr. Arvind Kumar (Cardiology)</span>
            <span class="demo-quick-btn" onclick="DOCTOR.fillLogin('priya@nalam.health','doctor123')">Dr. Priya Sundaram (General)</span>
            <span class="demo-quick-btn" onclick="DOCTOR.fillLogin('rohan@nalam.health','doctor123')">Dr. Rohan Mehta (Dermatology)</span>
            <span class="demo-quick-btn" onclick="DOCTOR.fillLogin('lakshmi@nalam.health','doctor123')">Dr. Lakshmi Iyer (Endo)</span>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-top:20px;">
        <a href="index.html" target="_blank" style="font-size:13px;color:var(--teal);text-decoration:none;font-weight:600;">
          👤 Open Patient Portal (in separate tab) ↗
        </a>
      </div>
    </div>`;
}

/* ---------------- Screen: Doctor Portal Dashboard ---------------- */
function screenDoctorPortal() {
  const doc = state.doctorData;
  if (!doc) {
    return `<div class="screen" style="text-align:center;padding:80px 20px;"><p>Loading Doctor Portal…</p></div>`;
  }

  // Active queue entries for this doctor
  const queue = state.doctorQueue || [];
  const waitingList = queue.filter((q) => q.status === "waiting");
  const calledPatient = queue.find((q) => q.status === "called");
  const inConsultation = queue.find((q) => q.status === "in-consultation");

  // Next patient in line
  const nextPatient = calledPatient || waitingList[0];

  // Bookings list and filtering
  const allAppts = state.doctorAppointments || [];
  const tab = state.bookingsTab || "all";
  let filteredAppts = allAppts;
  if (tab === "today") {
    filteredAppts = allAppts.filter((a) => a.date.includes("1 Sep") || a.date.includes("Today"));
  } else if (tab === "upcoming") {
    filteredAppts = allAppts.filter((a) => a.status === "Upcoming" || a.status === "Confirmed" || a.status === "Rescheduled");
  } else if (tab === "completed") {
    filteredAppts = allAppts.filter((a) => a.status === "Completed");
  }

  return `
    <div class="doctor-portal-header">
      <div class="doctor-portal-info">
        <div class="doctor-avatar-badge">${icon("stethoscope", 22)}</div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <h2 style="font-size:16px;font-weight:700;margin:0;color:var(--ink);">${doc.name}</h2>
            <span class="doctor-badge-status">● On Duty</span>
          </div>
          <p style="font-size:12px;color:var(--text-sub);margin:2px 0 0;">${doc.spec} · ${doc.hospital}</p>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="btn-outline" style="padding:6px 10px;font-size:11.5px;" onclick="DOCTOR.refreshData()" title="Refresh live queue">${icon("refresh", 13)} Refresh</button>
        <button class="btn-outline danger" style="padding:6px 12px;font-size:12px;" onclick="DOCTOR.logout()">${icon("logout", 14)} Sign Out</button>
      </div>
    </div>

    <div class="screen" style="padding-top:16px;">
      <!-- Key Stats Overview -->
      <div class="doctor-stat-grid">
        <div class="doctor-stat-card">
          <p class="num">${waitingList.length}</p>
          <p class="lbl">Patients in Queue</p>
        </div>
        <div class="doctor-stat-card">
          <p class="num">${doc.queueCount ?? waitingList.length}</p>
          <p class="lbl">Total Waiting</p>
        </div>
        <div class="doctor-stat-card">
          <p class="num" style="font-size:18px;">${inConsultation ? "#" + inConsultation.tokenNumber : "None"}</p>
          <p class="lbl">Now Consulting</p>
        </div>
        <div class="doctor-stat-card">
          <p class="num" style="font-size:18px;">${nextPatient ? "#" + nextPatient.tokenNumber : "None"}</p>
          <p class="lbl">Next Patient</p>
        </div>
      </div>

      <!-- Live Queue Action Section -->
      <div class="doctor-action-card highlight">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3 style="font-size:14px;font-weight:700;color:var(--teal-deep);margin:0;text-transform:uppercase;letter-spacing:.3px;">
            Live Patient Queue & Calling
          </h3>
          <span style="font-size:11px;color:var(--text-sub);font-family:var(--font-mono);">⚡ Live sync</span>
        </div>

        <!-- Currently in consultation -->
        ${inConsultation ? `
          <div style="background:var(--card);border:1.5px solid var(--teal);border-radius:12px;padding:12px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="badge Upcoming">In Consultation</span>
              <span class="patient-queue-tok">Token #${inConsultation.tokenNumber}</span>
            </div>
            <p style="font-size:15px;font-weight:700;color:var(--ink);margin:8px 0 2px;">${inConsultation.patientName}</p>
            <p class="patient-queue-meta">Consultation underway · Checked in at ${new Date(inConsultation.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            <button class="btn-primary" style="margin-top:10px;padding:8px 16px;font-size:13px;" onclick="DOCTOR.completeConsultation('${inConsultation.id}')">
              ✓ Complete Consultation
            </button>
          </div>
        ` : ""}

        <!-- Called patient waiting to enter -->
        ${calledPatient ? `
          <div style="background:var(--marigold-soft);border:1.5px solid #D98E2C;border-radius:12px;padding:12px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="badge" style="background:#8A5A0E;color:#fff;">Patient Called</span>
              <span class="patient-queue-tok" style="color:#8A5A0E;">Token #${calledPatient.tokenNumber}</span>
            </div>
            <p style="font-size:15px;font-weight:700;color:var(--ink);margin:8px 0 2px;">${calledPatient.patientName}</p>
            <p class="patient-queue-meta">Called to room — awaiting patient entry</p>
            <div style="display:flex;gap:8px;margin-top:10px;">
              <button class="doc-btn-call" style="flex:1;justify-content:center;padding:8px 14px;" onclick="DOCTOR.startConsultation('${calledPatient.id}')">
                ▶ Start Consult
              </button>
              <button class="doc-btn-skip" onclick="DOCTOR.skipPatient('${calledPatient.id}')">
                Skip
              </button>
            </div>
          </div>
        ` : ""}

        <!-- Next in line quick action -->
        ${!calledPatient && !inConsultation && waitingList.length > 0 ? `
          <div style="background:var(--card);border-radius:12px;padding:14px;text-align:center;margin-bottom:12px;border:1px dashed var(--teal);">
            <p style="font-size:13px;color:var(--text-sub);margin:0 0 6px;">Next patient ready in waiting area:</p>
            <p style="font-size:17px;font-weight:700;color:var(--teal);margin:0 0 10px;">Token #${waitingList[0].tokenNumber} — ${waitingList[0].patientName}</p>
            <button class="btn-primary" style="width:100%;font-size:14px;" onclick="DOCTOR.callNextPatient('${waitingList[0].id}')">
              📢 Call Next Patient (Token #${waitingList[0].tokenNumber})
            </button>
          </div>
        ` : ""}

        <!-- Waiting patients list -->
        <span class="field-label" style="margin-top:8px;">Waiting Patients (${waitingList.length})</span>
        <div style="margin-top:6px;">
          ${waitingList.length === 0 ? `
            <p style="font-size:13px;color:var(--text-sub);padding:10px 0;margin:0;text-align:center;">No patients currently in the waiting queue.</p>
          ` : waitingList.map((q, idx) => `
            <div class="patient-queue-row">
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="patient-queue-tok">Token #${q.tokenNumber}</span>
                  <span class="patient-queue-name">${q.patientName}</span>
                </div>
                <p class="patient-queue-meta">Position ${idx + 1} · Checked in ${new Date(q.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <div style="display:flex;gap:6px;">
                ${idx === 0 && !calledPatient ? `
                  <button class="doc-btn-call" onclick="DOCTOR.callNextPatient('${q.id}')">Call</button>
                ` : ""}
                <button class="doc-btn-skip" onclick="DOCTOR.skipPatient('${q.id}')">Skip</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Doctor Bookings & Appointments List -->
      <div style="margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="font-size:16px;font-weight:700;margin:0;color:var(--ink);">Bookings & Appointments</h3>
          <span style="font-size:12px;color:var(--text-sub);">${filteredAppts.length} total</span>
        </div>

        <div class="chip-row" style="padding:10px 0 4px;">
          <div class="chip ${tab === "all" ? "active" : ""}" onclick="DOCTOR.setBookingsTab('all')">All (${allAppts.length})</div>
          <div class="chip ${tab === "today" ? "active" : ""}" onclick="DOCTOR.setBookingsTab('today')">Today / Mon 1 Sep</div>
          <div class="chip ${tab === "upcoming" ? "active" : ""}" onclick="DOCTOR.setBookingsTab('upcoming')">Upcoming</div>
          <div class="chip ${tab === "completed" ? "active" : ""}" onclick="DOCTOR.setBookingsTab('completed')">Completed</div>
        </div>

        <div style="margin-top:8px;">
          ${filteredAppts.length === 0 ? `
            <p class="empty-note">No appointments found in this category.</p>
          ` : filteredAppts.map((a) => `
            <div class="card" style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                  <p style="font-size:15px;font-weight:700;margin:0;color:var(--ink);">${getAppointmentPatientName(a)}</p>
                  <p style="font-size:12.5px;color:var(--text-sub);margin:2px 0 0;">${a.reason || "Consultation"}</p>
                </div>
                <div style="text-align:right;">
                  <span class="badge ${a.status}">${a.status}</span>
                  <div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--teal);margin-top:4px;">🎫 ${a.queueNumber}</div>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:12px;margin-top:10px;font-size:12px;color:var(--text-sub);border-top:1px solid var(--line);padding-top:8px;">
                <span>${icon("calendar", 13, "#5B6E68")} ${a.date}</span>
                <span>${icon("clock", 13, "#5B6E68")} ${a.time}</span>
                <span>${a.type}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>`;
}

function render() {
  const container = document.getElementById("doctor-app");
  if (!container) return;
  const isAuth = Boolean(state.authToken && state.doctorData);
  container.innerHTML = `
    ${isAuth ? screenDoctorPortal() : screenDoctorLogin()}
    ${state.toastMessage ? `<div class="toast">${state.toastMessage}</div>` : ""}
  `;
}

/* ---------------- Actions ---------------- */
const DOCTOR = {
  fillLogin(id, pw) {
    const idInput = document.getElementById("doc-login-id");
    const pwInput = document.getElementById("doc-login-pw");
    if (idInput) idInput.value = id;
    if (pwInput) pwInput.value = pw;
  },
  async login() {
    const identifier = document.getElementById("doc-login-id")?.value.trim();
    const password = document.getElementById("doc-login-pw")?.value;
    if (!identifier || !password) {
      state.authError = "Please enter doctor email/phone and password.";
      render();
      return;
    }
    state.authBusy = true;
    state.authError = null;
    render();
    try {
      const { token, user } = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      if (user.role !== "doctor") {
        throw new Error("This account is not registered as a doctor. Please use doctor credentials.");
      }
      state.authToken = token;
      state.currentUser = user;
      localStorage.setItem("nalam_doctor_token", token);
      await DOCTOR.loadData();
    } catch (err) {
      state.authError = err.message;
    } finally {
      state.authBusy = false;
      render();
    }
  },
  logout() {
    DOCTOR.stopPolling();
    state.authToken = null;
    state.currentUser = null;
    state.doctorData = null;
    state.doctorQueue = [];
    state.doctorAppointments = [];
    localStorage.removeItem("nalam_doctor_token");
    render();
  },
  setBookingsTab(tab) {
    state.bookingsTab = tab;
    render();
  },
  async loadData() {
    try {
      const res = await api("/doctor/me");
      state.doctorData = res.doctor;
      state.doctorAppointments = res.appointments || [];
      const qRes = await api(`/queue/doctor/${res.doctor.id}`).catch(() => []);
      state.doctorQueue = qRes || [];
      render();
      DOCTOR.startPolling();
    } catch (err) {
      console.error("Failed to load doctor data:", err);
      showToast(err.message || "Failed to load doctor portal");
    }
  },
  async refreshData() {
    if (!state.authToken || !state.doctorData) return;
    try {
      const [docRes, qRes] = await Promise.all([
        api("/doctor/me"),
        api(`/queue/doctor/${state.doctorData.id}`),
      ]);
      state.doctorData = docRes.doctor;
      state.doctorAppointments = docRes.appointments || [];
      state.doctorQueue = qRes || [];
      render();
    } catch (e) {
      console.warn("Doctor refresh error:", e);
    }
  },
  startPolling() {
    DOCTOR.stopPolling();
    state.pollTimer = setInterval(DOCTOR.refreshData, 3000);
  },
  stopPolling() {
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  },
  async callNextPatient(entryId) {
    try {
      await api(`/queue/${entryId}/call`, { method: "POST" });
      showToast("Patient called to room.");
      speak("Next patient has been called.");
      await DOCTOR.refreshData();
    } catch (e) {
      showToast(e.message || "Failed to call patient.");
    }
  },
  async startConsultation(entryId) {
    try {
      await api(`/queue/${entryId}/start`, { method: "POST" });
      showToast("Consultation started.");
      await DOCTOR.refreshData();
    } catch (e) {
      showToast(e.message || "Failed to start consult.");
    }
  },
  async completeConsultation(entryId) {
    try {
      await api(`/queue/${entryId}/complete`, { method: "POST" });
      showToast("Consultation marked as completed.");
      await DOCTOR.refreshData();
    } catch (e) {
      showToast(e.message || "Failed to complete consult.");
    }
  },
  async skipPatient(entryId) {
    try {
      await api(`/queue/${entryId}/skip`, { method: "POST" });
      showToast("Patient skipped in queue.");
      await DOCTOR.refreshData();
    } catch (e) {
      showToast(e.message || "Failed to skip patient.");
    }
  },
};

window.DOCTOR = DOCTOR;

/* ---------------- Boot ---------------- */
(async function init() {
  if (state.authToken) {
    try {
      state.currentUser = await api("/auth/me");
      if (state.currentUser.role === "doctor") {
        await DOCTOR.loadData();
        return;
      } else {
        localStorage.removeItem("nalam_doctor_token");
        state.authToken = null;
      }
    } catch {
      localStorage.removeItem("nalam_doctor_token");
      state.authToken = null;
    }
  }
  render();
})();
