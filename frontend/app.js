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

/* ---------------- Tiny icon set (inline SVG, stroke style) ---------------- */
const ICONS = {
  search: `<path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="m21 21-4.35-4.35"/>`,
  bell: `<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`,
  sparkles: `<path d="M12 3v4M12 17v4M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M17.7 17.7l1.4 1.4M6.3 17.7l-1.4 1.4M17.7 6.3l1.4-1.4"/>`,
  calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
  pill: `<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>`,
  file: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>`,
  scan: `<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/>`,
  bot: `<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8V4M9 4h6"/><circle cx="8.5" cy="14" r="1"/><circle cx="15.5" cy="14" r="1"/>`,
  phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>`,
  star: `<polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9"/>`,
  location: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
  mic: `<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3"/>`,
  send: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
  close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  check: `<polyline points="20 6 9 17 4 12"/>`,
  warning: `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><polyline points="9 12 11 14 15 10"/>`,
  chevron: `<polyline points="9 18 15 12 9 6"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  back: `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`,
  heart: `<path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 3.5 4 7.5C19 16.65 12 21 12 21Z"/>`,
  person: `<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>`,
  clipboard: `<rect x="6" y="4" width="12" height="16" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/>`,
  stethoscope: `<path d="M4.8 2.3A.3.3 0 1 0 5 2.5v-.3M5 2.5v6a5 5 0 0 0 5 5v0a5 5 0 0 0 5-5V2.5M18 8a3 3 0 1 0 0-.5"/><circle cx="20" cy="19" r="2"/><path d="M15 13.5v3a5 5 0 0 0 5 2.4"/>`,
  key: `<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5 18 10M9.5 18.5v-3"/>`,
  lock: `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  logout: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  ticket: `<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>`,
};
function icon(name, size = 18, color = "currentColor") {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}
function pulseSvg(color = "#8FB6A4") {
  return `<svg viewBox="0 0 300 24" width="100%" height="20" preserveAspectRatio="none" class="pulse">
    <polyline points="0,12 100,12 112,4 122,20 134,2 144,12 300,12" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
  </svg>`;
}

/* ---------------- Voice & Language Utilities ---------------- */
function langToBCP47(lang) {
  const map = {
    English: "en-IN",
    Tamil: "ta-IN",
    Hindi: "hi-IN",
    Telugu: "te-IN",
    Malayalam: "ml-IN",
    Kannada: "kn-IN",
    Bengali: "bn-IN",
    Marathi: "mr-IN",
    Gujarati: "gu-IN",
    Punjabi: "pa-IN",
    Urdu: "ur-IN",
  };
  return map[lang] || "en-IN";
}

function startVoiceInput(onResult, onEnd, lang) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("Voice input is not supported in this browser.");
    if (onEnd) onEnd();
    return null;
  }
  try {
    const rec = new SpeechRecognition();
    rec.lang = lang || langToBCP47(state.patient?.language || "English");
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      if (onResult) onResult(text);
    };
    rec.onerror = (e) => {
      console.warn("Speech recognition error:", e);
      if (onEnd) onEnd();
    };
    rec.onend = () => {
      if (onEnd) onEnd();
    };
    rec.start();
    return rec;
  } catch (err) {
    console.error("Failed to start voice input:", err);
    if (onEnd) onEnd();
    return null;
  }
}

function speak(text, lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang || langToBCP47(state.patient?.language || "English");
  window.speechSynthesis.speak(utter);
}

/* ---------------- State ---------------- */
const state = {
  screen: "login",
  authToken: localStorage.getItem("nalam_token") || null,
  currentUser: null,
  authError: null,
  pendingUserId: null, // set after register, used by OTP screen
  pendingOtpHint: null, // demo-only: OTP shown directly instead of sent by SMS
  authBusy: false,

  patient: null,
  doctors: [],
  selectedDoctor: null,
  appointments: [],
  lastBooked: null,
  prescriptions: [],
  reports: [],
  doctorQuery: "",
  doctorSpec: "All",
  bookDraft: { date: "Mon, 1 Sep", time: "10:30 AM", type: "", reason: "" },
  rescheduleDraft: { id: null, date: "Mon, 1 Sep", time: "10:30 AM" },
  queueByAppointment: {},
  queuePollTimer: null,
  recordsTab: "prescriptions",
  medCheck: { prescribed: "", pharmacy: "", result: null, scanningField: null, scanTarget: null },

  assistantOpen: false,
  activeSheet: null, // 'language' | 'editProfile' | 'emergencyContact' | 'notificationPrefs' | 'privacy' | 'apiKey' | 'notifications' | 'hospitals' | 'reschedule'
  editDraft: {},
  apiKeyStatus: null, // { hasKey: bool }
  apiKeyInput: "",
  notifications: [],
  toastMessage: null,

  chatMessages: [
    { role: "assistant", text: "Hello, I'm NALAM AI. I can help with your appointments, prescriptions, and general health questions. How can I help today?" },
  ],
  chatLoading: false,

  /* Queue state */
  slotQueueData: [],
  loadingSlots: false,
  isListeningSearch: false,
  isListeningChat: false,

  /* Doctor Portal state */
  loginRole: "patient", // 'patient' | 'doctor'
  doctorData: null,
  doctorAppointments: [],
  doctorQueue: [],
  doctorBookingsTab: "all", // 'all' | 'today' | 'upcoming' | 'completed'
  doctorPollTimer: null,
};

const SPECIALTIES = ["All", "General Physician", "Cardiologist", "Dermatologist", "Endocrinologist"];
const BOOK_DATES = ["Today, 29 Aug", "Sun, 31 Aug", "Mon, 1 Sep", "Tue, 2 Sep"];
const BOOK_TIMES = ["9:00 AM", "10:30 AM", "2:00 PM", "4:30 PM"];
const LANGUAGES = ["English", "Tamil", "Hindi", "Telugu", "Malayalam", "Kannada", "Bengali", "Marathi", "Gujarati", "Punjabi", "Urdu"];

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function goto(screen) {
  state.screen = screen;
  render();
  window.scrollTo(0, 0);
  if (screen === "appointments") NALAM.startQueuePolling();
  else NALAM.stopQueuePolling();
}

function showToast(msg) {
  state.toastMessage = msg;
  render();
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { state.toastMessage = null; render(); }, 2400);
}

/* ---------------- Auth screens ---------------- */
function screenLogin() {
  const isDoctor = state.loginRole === "doctor";
  return `
    <div class="screen auth-screen">
      <div class="auth-hero">
        <div class="auth-logo">${icon("heart", 26, "#fff")}</div>
        <h1 class="auth-title">NALAM</h1>
        <p class="auth-tag">Your Health. Your Doctor. Your Medicine. All in One Place.</p>
      </div>

      <div class="login-role-tabs" style="margin-top:20px;">
        <div class="login-role-tab ${!isDoctor ? "active" : ""}" onclick="NALAM.setLoginRole('patient')">
          ${icon("person", 15)} Patient Login
        </div>
        <div class="login-role-tab ${isDoctor ? "active" : ""}" onclick="NALAM.setLoginRole('doctor')">
          ${icon("stethoscope", 15)} Doctor Login
        </div>
      </div>

      <div class="card" style="margin-top:10px;">
        <div style="margin-bottom:14px;">
          <h2 style="font-family:var(--font-display);font-size:18px;margin:0;color:var(--teal-deep);">
            ${isDoctor ? "Doctor Portal" : "Patient Portal"}
          </h2>
          <p style="font-size:12px;color:var(--text-sub);margin:4px 0 0;">
            ${isDoctor ? "View live queue, call next patient & manage bookings" : "Manage your appointments, prescriptions & health companion"}
          </p>
        </div>

        ${state.authError ? `<div class="auth-error">${state.authError}</div>` : ""}

        <span class="field-label">${isDoctor ? "Doctor email or mobile" : "Email or mobile"}</span>
        <input id="login-id" class="auth-input" value="${isDoctor ? "arvind@nalam.health" : "meena@example.com"}" placeholder="${isDoctor ? "doctor@nalam.health" : "meena@example.com"}" />

        <span class="field-label" style="margin-top:12px;">Password</span>
        <input id="login-pw" class="auth-input" type="password" value="${isDoctor ? "doctor123" : "password123"}" placeholder="••••••••" onkeydown="if(event.key==='Enter') NALAM.login()" />

        <button class="btn-primary" style="margin-top:18px;" onclick="NALAM.login()" ${state.authBusy ? "disabled" : ""}>
          ${state.authBusy ? "Signing in…" : (isDoctor ? "Sign In to Doctor Portal" : "Sign In to Patient Portal")}
        </button>

        <div class="demo-quick-box">
          <span style="font-size:11px;font-weight:700;color:var(--teal-deep);text-transform:uppercase;letter-spacing:.4px;">Quick Demo Accounts:</span>
          <div>
            ${isDoctor ? `
              <span class="demo-quick-btn" onclick="NALAM.fillLogin('arvind@nalam.health','doctor123')">Dr. Arvind Kumar (Cardiology)</span>
              <span class="demo-quick-btn" onclick="NALAM.fillLogin('priya@nalam.health','doctor123')">Dr. Priya Sundaram (General)</span>
              <span class="demo-quick-btn" onclick="NALAM.fillLogin('lakshmi@nalam.health','doctor123')">Dr. Lakshmi Iyer (Endo)</span>
            ` : `
              <span class="demo-quick-btn" onclick="NALAM.fillLogin('meena@example.com','password123')">Meena Raghavan (Patient)</span>
            `}
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-top:16px;">
        <a href="doctor.html" target="_blank" style="font-size:13px;color:var(--teal);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
          ${icon("stethoscope", 15)} Open Doctor Portal in New Tab (Simultaneous Run) ↗
        </a>
      </div>

      ${!isDoctor ? `<p class="auth-switch">New to NALAM? <span onclick="NALAM.goToSignup()">Create a patient account</span></p>` : ""}
    </div>`;
}

function screenSignup() {
  return `
    <div class="screen auth-screen">
      <div class="topbar" style="padding:0 0 8px;"><span class="back-btn" onclick="NALAM.goToLogin()">${icon("back", 20)}</span><h1>Create Account</h1></div>
      <div class="card">
        ${state.authError ? `<div class="auth-error">${state.authError}</div>` : ""}
        <span class="field-label">Full name</span>
        <input id="signup-name" class="auth-input" placeholder="Your name" />
        <span class="field-label" style="margin-top:12px;">Email</span>
        <input id="signup-email" class="auth-input" placeholder="you@example.com" />
        <span class="field-label" style="margin-top:12px;">Mobile number</span>
        <input id="signup-phone" class="auth-input" placeholder="9876543210" />
        <span class="field-label" style="margin-top:12px;">Password</span>
        <input id="signup-pw" class="auth-input" type="password" placeholder="At least 8 characters" />
        <button class="btn-primary" style="margin-top:18px;" onclick="NALAM.register()" ${state.authBusy ? "disabled" : ""}>${state.authBusy ? "Creating…" : "Register"}</button>
      </div>
      <p class="auth-switch">Already have an account? <span onclick="NALAM.goToLogin()">Sign in</span></p>
    </div>`;
}

function screenOtp() {
  return `
    <div class="screen auth-screen">
      <div class="topbar" style="padding:0 0 8px;"><span class="back-btn" onclick="NALAM.goToSignup()">${icon("back", 20)}</span><h1>Verify OTP</h1></div>
      <div class="card">
        ${state.authError ? `<div class="auth-error">${state.authError}</div>` : ""}
        <p style="font-size:13.5px;color:var(--text-sub);line-height:1.5;margin:0 0 14px;">
          Enter the 4-digit code to verify your account.
          ${state.pendingOtpHint ? `<br/><b>Demo mode</b> — since there's no SMS provider connected, your code is: <span style="font-family:var(--font-mono);color:var(--ink);">${state.pendingOtpHint}</span>` : ""}
        </p>
        <span class="field-label">OTP</span>
        <input id="otp-input" class="auth-input" placeholder="1234" maxlength="4" onkeydown="if(event.key==='Enter') NALAM.verifyOtp()" />
        <button class="btn-primary" style="margin-top:18px;" onclick="NALAM.verifyOtp()" ${state.authBusy ? "disabled" : ""}>${state.authBusy ? "Verifying…" : "Verify & Continue"}</button>
      </div>
    </div>`;
}

/* ---------------- Screens ---------------- */
function screenHome() {
  const upcoming = state.appointments.find((a) => a.status === "Upcoming" || a.status === "Confirmed");
  const nextMed = state.prescriptions[0]?.medicines?.[0];
  const actions = [
    ["search", "Find Doctor", "doctors"],
    ["calendar", "Appointments", "appointments"],
    ["file", "Records", "records"],
    ["scan", "Check Medicine", "medicines"],
    ["bot", "NALAM AI", "__assistant"],
    ["phone", "Emergency", "emergency"],
  ];

  return `
    <div class="screen">
      <div class="greeting-row">
        <div>
          <p class="greeting-sub">Good morning</p>
          <h1 class="greeting-name">${state.patient.name.split(" ")[0]}</h1>
        </div>
        <div class="icon-btn-circle" onclick="NALAM.openNotifications()" style="cursor:pointer;">${icon("bell", 18)}</div>
      </div>
      ${pulseSvg()}
      <div class="ai-summary">
        <div class="ai-icon">${icon("sparkles", 16, "#D98E2C")}</div>
        <p>You have <b>1 appointment</b> this week and <b>2 medicine doses</b> today. Your HbA1c report from 22 Aug is ready to view.</p>
      </div>
      ${upcoming ? `
        <div class="card" style="margin-top:14px; cursor:pointer" onclick="NALAM.goto('appointments')">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:var(--text-sub);text-transform:uppercase;letter-spacing:.4px;">Next appointment</span>
            <span class="badge ${upcoming.status}">${upcoming.status}</span>
          </div>
          <p class="doctor-name" style="margin-top:6px;">${upcoming.doctor}</p>
          <p class="doctor-hosp">${upcoming.spec} · ${upcoming.date}, ${upcoming.time}</p>
        </div>` : ""}
      ${nextMed ? `
        <div class="card" style="margin-top:10px; display:flex; align-items:center; gap:12px;">
          <div class="report-icon" style="background:var(--marigold-soft); color:var(--marigold);">${icon("pill", 17)}</div>
          <div>
            <p class="doctor-name" style="font-size:15.5px;">Next dose · ${nextMed.name}</p>
            <p class="doctor-hosp">${nextMed.strength} · Tonight, 8:00 PM</p>
          </div>
        </div>` : ""}
      <p class="section-label">Quick actions</p>
      <div class="quick-grid">
        ${actions.map(([ic, label, go]) => `
          <div class="quick-item" onclick="NALAM.${go === "__assistant" ? "openAssistant()" : `goto('${go}')`}">
            ${icon(ic, 19)}<span>${label}</span>
          </div>`).join("")}
      </div>
    </div>`;
}

function screenDoctors() {
  const filtered = state.doctors.filter((d) => {
    const matchesSpec = state.doctorSpec === "All" || d.spec === state.doctorSpec;
    const q = state.doctorQuery.toLowerCase();
    const matchesQuery = d.name.toLowerCase().includes(q) || d.spec.toLowerCase().includes(q);
    return matchesSpec && matchesQuery;
  });

  return `
    <div class="topbar"><h1>Find a Doctor</h1></div>
    <div class="screen" style="padding-top:0;">
      <div class="search-box">
        ${icon("search", 16, "#5B6E68")}
        <input placeholder="Search by name or specialty" value="${state.doctorQuery}" oninput="NALAM.setDoctorQuery(this.value)" />
        <div class="mic-icon-btn ${state.isListeningSearch ? "recording" : ""}" onclick="NALAM.voiceDoctorSearch()" title="Search with voice">${icon("mic", 16)}</div>
      </div>
      <div class="chip-row">
        ${SPECIALTIES.map((s) => `<div class="chip ${state.doctorSpec === s ? "active" : ""}" onclick="NALAM.setDoctorSpec('${s}')">${s}</div>`).join("")}
      </div>
      <div style="margin-top:12px;">
        ${filtered.length === 0 ? `<p class="empty-note">No doctors match that search.</p>` : filtered.map((d) => `
          <div class="doctor-card card" onclick="NALAM.selectDoctor('${d.id}')">
            <div class="doctor-avatar">${icon("stethoscope", 22)}</div>
            <div style="flex:1;min-width:0;">
              <div class="doctor-name-row">
                <p class="doctor-name">${d.name}</p>
                <div class="doctor-rating">${icon("star", 12, "#D98E2C")} ${d.rating}</div>
              </div>
              <p class="doctor-spec">${d.spec} · ${d.exp} yrs</p>
              <p class="doctor-hosp">${d.hospital}</p>
              <div class="queue-info">
                <div class="queue-info-row">
                  <span class="queue-count">${icon("users", 14, "#0E4749")} <b>${d.queueCount ?? 0}</b> patients waiting</span>
                  <span class="queue-number">${icon("ticket", 14, "#0E4749")} Next Queue: <b>${d.nextQueueNumber || "Q01"}</b></span>
                </div>
              </div>
              <div class="doctor-foot"><span>Next: ${d.next}</span><span class="fee">₹${d.fee}</span></div>
            </div>
          </div>`).join("")}
      </div>
    </div>`;
}

function screenDoctorProfile() {
  const d = state.selectedDoctor;
  if (!d) return "";
  const slots = ["9:00 AM", "10:30 AM", "11:15 AM", "2:00 PM", "4:30 PM"];
  return `
    <div class="topbar"><span class="back-btn" onclick="NALAM.goto('doctors')">${icon("back", 20)}</span><h1>Doctor Profile</h1></div>
    <div class="screen">
      <div class="card" style="padding:20px;">
        <div style="display:flex;gap:16px;">
          <div class="doctor-avatar" style="width:64px;height:64px;border-radius:18px;">${icon("stethoscope", 26)}</div>
          <div>
            <p class="doctor-name" style="font-size:19px;">${d.name}</p>
            <p class="doctor-spec">${d.spec} · ${d.exp} years experience</p>
            <div class="doctor-rating" style="margin-top:4px;">${icon("star", 13, "#D98E2C")} ${d.rating} rating</div>
          </div>
        </div>
        ${pulseSvg()}
        <div style="display:flex;gap:6px;align-items:flex-start;">${icon("location", 15, "#5B6E68")}<p style="font-size:13.5px;margin:0;">${d.hospital}</p></div>
        <div class="queue-info" style="margin-top:14px; padding:12px 14px;">
          <div class="queue-info-row">
            <span class="queue-count" style="font-size:13px;">${icon("users", 15, "#0E4749")} <b>${d.queueCount ?? 0}</b> patients waiting</span>
            <span class="queue-number" style="font-size:13px;">${icon("ticket", 15, "#0E4749")} Next Queue: <b class="queue-highlight">${d.nextQueueNumber || "Q01"}</b></span>
          </div>
        </div>
        <div style="margin-top:12px;">${d.langs.map((l) => `<span class="lang-pill">${l}</span>`).join("")}</div>
        <div class="fee-row"><span style="font-size:13px;color:var(--text-sub);">Consultation fee</span><span class="amount">₹${d.fee}</span></div>
      </div>
      <p class="section-label">Available today</p>
      <div>${slots.map((s) => `<span class="slot-pill">${s}</span>`).join("")}</div>
    </div>
    <div class="sticky-cta"><button class="btn-primary" onclick="NALAM.goto('book')">Book Appointment</button></div>`;
}

function screenBook() {
  const d = state.selectedDoctor;
  if (!d) return "";
  if (!state.bookDraft.type) state.bookDraft.type = d.types[0];
  const bd = state.bookDraft;

  // Fallback if slotQueueData not loaded yet
  const currentSlotInfo = state.slotQueueData.find((s) => s.time === bd.time) || {
    time: bd.time,
    bookedCount: 0,
    nextQueueNumber: "Q01",
  };
  const expectedWait = currentSlotInfo.bookedCount * 10;

  return `
    <div class="topbar"><span class="back-btn" onclick="NALAM.goto('doctorProfile')">${icon("back", 20)}</span><h1>Book Appointment</h1></div>
    <div class="screen">
      <div class="card" style="background:var(--sage-soft); border:none;">
        <p class="doctor-name" style="font-size:15.5px;">${d.name}</p>
        <p style="font-size:13px;color:var(--teal-deep);margin:2px 0 0;">${d.spec} · ${d.hospital}</p>
      </div>
      <span class="field-label" style="margin-top:18px;">Consultation type</span>
      <div class="chip-row" style="padding-top:0;">${d.types.map((t) => `<div class="chip ${bd.type === t ? "active" : ""}" onclick="NALAM.setBookField('type','${t}')">${t}</div>`).join("")}</div>
      <span class="field-label" style="margin-top:14px;">Date</span>
      <div class="chip-row" style="padding-top:0;">${BOOK_DATES.map((dt) => `<div class="chip ${bd.date === dt ? "active" : ""}" onclick="NALAM.setBookDate('${dt}')">${dt}</div>`).join("")}</div>
      <span class="field-label" style="margin-top:14px;">Time & Queue Slot</span>
      <div style="margin-top:4px;">
        ${BOOK_TIMES.map((t) => {
          const s = state.slotQueueData.find((item) => item.time === t) || { bookedCount: 0, nextQueueNumber: "Q01" };
          const isSel = bd.time === t;
          return `
            <div class="slot-card ${isSel ? "active" : ""}" onclick="NALAM.setBookField('time','${t}')">
              <div class="slot-header">
                <span class="slot-time">${t}</span>
                <span class="slot-badge">${icon("ticket", 12)} Your ${s.nextQueueNumber}</span>
              </div>
              <div class="slot-meta">
                <span>${icon("users", 13)} ${s.bookedCount} booked</span>
                <span>•</span>
                <span>Next queue: <b>${s.nextQueueNumber}</b></span>
              </div>
            </div>`;
        }).join("")}
      </div>

      <div class="queue-preview-card" style="background:var(--sage-soft); border:1px solid var(--sage);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <span style="font-size:11px;color:var(--teal-deep);text-transform:uppercase;letter-spacing:.4px;font-weight:700;">Your Queue Number</span>
            <p class="queue-num" style="font-size:24px;color:var(--teal);margin:2px 0 0;">${currentSlotInfo.nextQueueNumber}</p>
          </div>
          <div style="text-align:right;">
            <span class="badge" style="background:var(--teal);color:#fff;font-family:var(--font-mono);font-size:12px;">${currentSlotInfo.bookedCount} ahead</span>
          </div>
        </div>
        <div style="display:flex;gap:18px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(14,71,73,0.15);">
          <div>
            <p style="font-size:13px;font-weight:600;color:var(--ink);margin:0;">${currentSlotInfo.bookedCount} patients</p>
            <p style="font-size:11px;color:var(--text-sub);margin:2px 0 0;">are ahead of you</p>
          </div>
          <div>
            <p style="font-size:13px;font-weight:600;color:var(--ink);margin:0;">${expectedWait} minutes</p>
            <p style="font-size:11px;color:var(--text-sub);margin:2px 0 0;">Estimated waiting time</p>
          </div>
        </div>
      </div>

      <span class="field-label" style="margin-top:14px;">Reason for consultation (optional)</span>
      <textarea class="reason-box" rows="3" placeholder="e.g. Routine follow-up, chest discomfort..." oninput="NALAM.setBookField('reason', this.value)">${bd.reason}</textarea>
    </div>
    <div class="sticky-cta"><button class="btn-primary" onclick="NALAM.confirmBooking()">Confirm Appointment</button></div>`;
}

function screenConfirmed() {
  const a = state.lastBooked;
  if (!a) return "";
  return `
    <div class="topbar"><span class="back-btn" onclick="NALAM.goto('home')" style="cursor:pointer;">${icon("back", 20)}</span><h1>Appointment Confirmed</h1></div>
    <div class="screen" style="text-align:center;padding-top:20px;">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--sage-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:var(--teal);">${icon("check", 28)}</div>
      <h2 style="font-family:var(--font-display);font-weight:600;font-size:22px;margin:0;">Appointment confirmed</h2>
      <p style="font-size:13.5px;color:var(--text-sub);margin-top:6px;">${a.id} · A reminder will be sent before your visit</p>
      <div class="card" style="text-align:left;margin-top:24px;">
        <p class="doctor-name" style="font-size:16px;">${a.doctor}</p>
        <p style="font-size:13.5px;color:var(--text-sub);margin-top:4px;">${a.spec}</p>
        <div style="display:flex;gap:8px;align-items:center;margin-top:12px;">${icon("calendar", 15, "#0E4749")}<span style="font-size:13.5px;">${a.date}, ${a.time}</span></div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">${icon("location", 15, "#0E4749")}<span style="font-size:13.5px;">${a.hospital}</span></div>

        <div class="queue-tracker-card" style="margin-top:14px; background:var(--sage-soft); border-color:var(--sage);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12.5px; font-weight:600; color:var(--teal-deep);">${icon("ticket", 14, "#0E4749")} Queue Number</span>
            <span class="badge" style="background:var(--teal); color:#fff; font-family:var(--font-mono); font-size:14px; font-weight:700;">${a.queueNumber || "Q01"}</span>
          </div>
          <div style="display:flex; gap:16px; margin-top:10px;">
            <div><p class="queue-num" style="color:var(--teal-deep); font-size:18px;">${a.patientsAhead ?? 0}</p><p class="queue-label">Patients Ahead</p></div>
            <div><p class="queue-num" style="color:var(--teal-deep); font-size:18px;">${a.estimatedWaitingMinutes ?? 0} min</p><p class="queue-label">Estimated Waiting Time</p></div>
          </div>
        </div>
      </div>
      <button class="btn-primary" style="margin-top:24px;" onclick="NALAM.goto('home')">Back to Home</button>
    </div>`;
}

function screenAppointments() {
  return `
    <div class="topbar"><span class="back-btn" onclick="NALAM.goto('home')" style="cursor:pointer;" title="Back to Home">${icon("back", 20)}</span><h1>My Appointments</h1></div>
    <div class="screen" style="padding-top:16px;">
      ${state.appointments.map((a) => {
        const q = state.queueByAppointment[a.id];
        const isUpcoming = a.status === "Upcoming" || a.status === "Confirmed" || a.status === "Rescheduled";
        return `
        <div class="card" style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <p class="doctor-name">${a.doctor}</p>
              <p class="doctor-spec">${a.spec}</p>
            </div>
            <div style="text-align:right;">
              <span class="badge ${a.status}">${a.status}</span>
              ${a.queueNumber ? `<div style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--teal); margin-top:4px;">🎫 ${a.queueNumber}</div>` : ""}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:10px;">
            ${icon("clock", 14, "#5B6E68")}
            <span style="font-size:13px;color:var(--text-sub);">${a.date} · ${a.time} · ${a.type}</span>
          </div>
          <p style="font-family:var(--font-mono);font-size:11.5px;color:var(--text-sub);margin-top:6px;">${a.id}</p>

          ${isUpcoming ? `
            <div class="queue-tracker-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11px; font-weight:600; color:var(--text-sub); text-transform:uppercase; letter-spacing:.3px;">Patient Queue Status</span>
                <span class="badge ${a.patientsAhead === 0 ? "Upcoming" : "Confirmed"}">${a.patientsAhead === 0 ? "Your Turn" : (a.queueStatus || "Waiting")}</span>
              </div>
              <div class="queue-tracker-grid">
                <div class="queue-stat-box">
                  <p class="queue-stat-val">${a.queueNumber || "—"}</p>
                  <p class="queue-stat-lbl">Your Queue</p>
                </div>
                <div class="queue-stat-box">
                  <p class="queue-stat-val">${a.currentQueue || "—"}</p>
                  <p class="queue-stat-lbl">Current Queue</p>
                </div>
                <div class="queue-stat-box">
                  <p class="queue-stat-val">${a.patientsAhead ?? 0}</p>
                  <p class="queue-stat-lbl">Patients Ahead</p>
                </div>
                <div class="queue-stat-box">
                  <p class="queue-stat-val">${a.estimatedWaitingMinutes ?? 0}m</p>
                  <p class="queue-stat-lbl">Estimated Wait</p>
                </div>
              </div>
            </div>` : ""}

          ${q ? queueStatusBlock(q) : ""}

          ${isUpcoming ? `
            <div class="appointment-actions">
              <button class="btn-outline danger" onclick="NALAM.cancelAppointment('${a.id}')">Cancel</button>
              <button class="btn-outline" onclick="NALAM.openReschedule('${a.id}')">Reschedule</button>
              ${!q ? `<button class="btn-outline" style="border-color:var(--teal); color:var(--teal);" onclick="NALAM.checkIn('${a.id}')">Check In</button>` : ""}
            </div>` : ""}
        </div>`;
      }).join("")}
    </div>`;
}

function queueStatusBlock(q) {
  const statusLabel = { waiting: "Waiting", called: "You're being called", "in-consultation": "In consultation", completed: "Completed", skipped: "Skipped" }[q.status] || q.status;
  const isCalled = q.status === "called";
  return `
    <div class="queue-block ${isCalled ? "queue-called" : ""}">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-family:var(--font-mono);font-size:13px;">Token #${q.tokenNumber}</span>
        <span class="badge" style="background:${isCalled ? "var(--marigold-soft)" : "var(--sage-soft)"};color:${isCalled ? "#8A5A0E" : "var(--teal-deep)"};">${statusLabel}</span>
      </div>
      ${q.status === "waiting" || q.status === "called" ? `
        <div style="display:flex;gap:16px;margin-top:8px;">
          <div><p class="queue-num">${q.patientsAhead}</p><p class="queue-label">patients ahead</p></div>
          <div><p class="queue-num">${q.estimatedWaitMinutes}</p><p class="queue-label">min estimated wait</p></div>
        </div>` : ""}
      ${isCalled ? `<p style="font-size:12.5px;color:#8A5A0E;margin-top:6px;">Please head to the consultation room now.</p>` : ""}
    </div>`;
}

function screenRecords() {
  const tab = state.recordsTab;
  const timeline = [
    ["22 Aug", "Blood Report Uploaded — HbA1c"],
    ["20 Aug", "Prescription — Dr. Lakshmi Iyer"],
    ["20 Aug", "Doctor Consultation — Endocrinology"],
    ["12 Jun", "ECG Report Uploaded"],
  ];
  return `
    <div class="topbar"><h1>Health Records</h1></div>
    <div class="screen" style="padding-top:0;">
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <div class="chip ${tab === "prescriptions" ? "active" : ""}" onclick="NALAM.setRecordsTab('prescriptions')">Prescriptions</div>
        <div class="chip ${tab === "reports" ? "active" : ""}" onclick="NALAM.setRecordsTab('reports')">Reports</div>
        <div class="chip ${tab === "timeline" ? "active" : ""}" onclick="NALAM.setRecordsTab('timeline')">Timeline</div>
      </div>
      ${tab === "prescriptions" ? state.prescriptions.map((p) => `
        <div class="card" style="margin-bottom:12px;">
          <p class="doctor-name">${p.date}</p>
          <p class="doctor-hosp">${p.doctor} · ${p.diagnosis}</p>
          <div style="margin-top:10px;">
            ${p.medicines.map((m) => `
              <div class="rx-med-row">
                <div class="rx-med-name">${icon("pill", 14, "#0E4749")} ${m.name} — ${m.strength}</div>
                <span class="rx-med-freq">${m.freq}</span>
              </div>`).join("")}
          </div>
        </div>`).join("") : ""}
      ${tab === "reports" ? state.reports.map((r) => `
        <div class="card report-row">
          <div class="report-icon">${icon("file", 18)}</div>
          <div><p class="doctor-name" style="font-size:14.5px;">${r.type}</p><p class="doctor-hosp">${r.date} · ${r.lab}</p></div>
        </div>`).join("") : ""}
      ${tab === "timeline" ? timeline.map(([d, t], i) => `
        <div class="timeline-item">
          <div class="timeline-dot-col"><div class="timeline-dot"></div>${i < timeline.length - 1 ? `<div class="timeline-line"></div>` : ""}</div>
          <div><p class="timeline-date">${d}</p><p class="timeline-text">${t}</p></div>
        </div>`).join("") : ""}
    </div>`;
}

function screenMedicines() {
  const mc = state.medCheck;
  let verdictHtml = "";
  if (mc.result) {
    const r = mc.result;
    if (r.verdict === "unknown") {
      verdictHtml = `
        <div class="verdict-card" style="background:var(--marigold-soft);display:flex;gap:10px;">
          ${icon("warning", 18, "#8A5A0E")}<p style="margin:0;font-size:13.5px;color:#5B4308;line-height:1.4;">${r.message}</p>
        </div>`;
    } else {
      const styles = {
        equivalent: ["var(--sage-soft)", "var(--teal-deep)", "shield", "Equivalent"],
        different: ["var(--coral-soft)", "var(--coral)", "close", "Different"],
        check: ["var(--marigold-soft)", "#8A5A0E", "warning", "Needs Professional Verification"],
      };
      const [bg, fg, ic, title] = styles[r.verdict];
      verdictHtml = `
        <div class="verdict-card" style="background:${bg};color:${fg};">
          <p class="verdict-title" style="color:${fg};">${icon(ic, 18, fg)} ${title}</p>
          <p style="font-size:13.5px;line-height:1.5;margin:0;">${r.message}</p>
          <div class="verdict-grid">
            <div class="verdict-box"><p class="label">Prescribed</p><p>${r.prescribedInfo.generic}</p><p>${r.prescribedInfo.strength} · ${r.prescribedInfo.form}</p></div>
            <div class="verdict-box"><p class="label">Pharmacy</p><p>${r.pharmacyInfo.generic}</p><p>${r.pharmacyInfo.strength} · ${r.pharmacyInfo.form}</p></div>
          </div>
          ${r.verdict !== "equivalent" ? `<p class="verdict-note">NALAM does not substitute medicines automatically — always confirm with your prescribing doctor or a qualified pharmacist.</p>` : ""}
        </div>`;
    }
  }

  return `
    <div class="topbar"><h1>Check Medicine</h1></div>
    <div class="screen" style="padding-top:0;">
      <p style="font-size:13.5px;color:var(--text-sub);line-height:1.5;margin-bottom:16px;">Compare what your pharmacy gave you against what your doctor prescribed.</p>
      <span class="field-label">Prescribed medicine</span>
      <div class="med-input">${icon("pill", 15, "#0E4749")}<input id="med-input-prescribed" placeholder="e.g. Paracetamol 500" value="${mc.prescribed}" oninput="NALAM.setMedField('prescribed', this.value)" /><span class="scan-btn" onclick="NALAM.triggerScan('prescribed')" title="Scan medicine package">${mc.scanningField === "prescribed" ? icon("clock", 16, "#D98E2C") : icon("scan", 16, "#5B6E68")}</span></div>
      <span class="field-label">Pharmacy medicine</span>
      <div class="med-input">${icon("pill", 15, "#C85A42")}<input id="med-input-pharmacy" placeholder="e.g. Dolo 650" value="${mc.pharmacy}" oninput="NALAM.setMedField('pharmacy', this.value)" /><span class="scan-btn" onclick="NALAM.triggerScan('pharmacy')" title="Scan medicine package">${mc.scanningField === "pharmacy" ? icon("clock", 16, "#D98E2C") : icon("scan", 16, "#5B6E68")}</span></div>
      <input id="ocr-file-input" type="file" accept="image/*" capture="environment" style="display:none;" onchange="NALAM.handleScanFile(this.files[0])" />
      <button id="med-compare-btn" class="btn-primary" ${!mc.prescribed || !mc.pharmacy ? "disabled" : ""} onclick="NALAM.compareMedicines()">Compare Medicines</button>
      ${verdictHtml}
    </div>`;
}

function screenProfile() {
  const p = state.patient;
  const items = [
    ["Edit profile", "editProfile"],
    ["Language settings", "language"],
    ["Notification preferences", "notificationPrefs"],
    ["Privacy & security", "privacy"],
    ["Emergency contacts", "emergencyContact"],
    ["AI Assistant Settings", "apiKey"],
  ];
  return `
    <div class="topbar"><h1>Profile</h1></div>
    <div class="screen" style="padding-top:0;">
      <div class="card profile-hero">
        <div class="profile-avatar">${icon("person", 24)}</div>
        <div><p class="doctor-name" style="font-size:17px;">${p.name}</p><p class="doctor-hosp">${p.age} yrs · Blood group ${p.bloodGroup}</p></div>
      </div>
      <div class="card" style="margin-top:14px;">
        <p class="section-label" style="margin-top:0;">Health profile</p>
        <div class="profile-row"><span class="k">Allergies</span><span>${p.allergies.join(", ")}</span></div>
        <div class="profile-row"><span class="k">Conditions</span><span>${p.conditions.join(", ")}</span></div>
        <div class="profile-row"><span class="k">Preferred language</span><span>${p.language}</span></div>
      </div>
      <div class="settings-list">${items.map(([label, sheet]) => `<div class="settings-item" onclick="NALAM.openSetting('${sheet}')">${label} ${icon("chevron", 16, "#5B6E68")}</div>`).join("")}</div>
      <button class="btn-outline danger" style="width:100%;margin-top:14px;padding:12px;display:flex;align-items:center;justify-content:center;gap:8px;" onclick="NALAM.logout()">${icon("logout", 15, "#C85A42")} Log out</button>
    </div>`;
}

function screenEmergency() {
  const p = state.patient;
  return `
    <div class="topbar"><span class="back-btn" onclick="NALAM.goto('home')">${icon("back", 20)}</span><h1>Emergency</h1></div>
    <div class="screen" style="padding-top:0;">
      <div class="emergency-call" onclick="NALAM.callAmbulance()" style="cursor:pointer;">${icon("phone", 22)}<div><h3>Call Ambulance</h3><p>Connects to local emergency services</p></div></div>
      <div class="card">
        <p class="section-label" style="margin-top:0;">Basic health info to share</p>
        <p style="font-size:13.5px;margin:4px 0;">Blood group: ${p.bloodGroup}</p>
        <p style="font-size:13.5px;margin:4px 0;">Allergies: ${p.allergies.join(", ")}</p>
        <p style="font-size:13.5px;margin:4px 0;">Conditions: ${p.conditions.join(", ")}</p>
        <p style="font-size:13.5px;margin:4px 0;">Emergency contact: ${p.emergencyContact ? `${p.emergencyContact.name} · ${p.emergencyContact.phone}` : "Not set"}</p>
      </div>
      <div class="card" style="display:flex;align-items:center;gap:10px;margin-top:12px;cursor:pointer;" onclick="NALAM.openHospitals()">${icon("location", 18, "#0E4749")}<span style="font-size:14px;">Find nearest hospital</span></div>
    </div>`;
}

/* ---------------- Bottom nav + FAB ---------------- */
const NAV = [
  ["heart", "Home", "home"],
  ["search", "Doctors", "doctors"],
  ["clipboard", "Records", "records"],
  ["pill", "Medicines", "medicines"],
  ["person", "Profile", "profile"],
];
function bottomNav() {
  return `<div class="bottom-nav">${NAV.map(([ic, label, key]) => `
    <div class="nav-item ${state.screen === key ? "active" : ""}" onclick="NALAM.goto('${key}')">${icon(ic, 19)}<span>${label}</span></div>`).join("")}</div>`;
}
function fab() {
  return `<div class="fab" onclick="NALAM.openAssistant()">${icon("bot", 22, "#fff")}</div>`;
}

/* ---------------- Assistant panel ---------------- */
function assistantPanel() {
  const suggestions = ["When is my next appointment?", "Explain my prescription", "What should I ask my doctor?"];
  return `
    <div class="assistant-overlay ${state.assistantOpen ? "open" : ""}" onclick="if(event.target===this) NALAM.closeAssistant()">
      <div class="assistant-panel">
        <div class="assistant-header">
          <div class="who">
            <div class="bot-icon">${icon("bot", 16, "#D98E2C")}</div>
            <div><h3>NALAM AI</h3><p class="sub">Healthcare assistant, not a diagnosis</p></div>
          </div>
          <div class="close-btn" onclick="NALAM.closeAssistant()">${icon("close", 16)}</div>
        </div>
        <div class="messages" id="chat-messages">
          ${state.chatMessages.map((m) => `<div class="msg ${m.role}">${m.text}</div>`).join("")}
          ${state.chatLoading ? `<div class="msg loading">Thinking…</div>` : ""}
        </div>
        ${state.chatMessages.length < 3 ? `
          <div class="suggestions">${suggestions.map((s) => `<div class="suggestion-chip" onclick="NALAM.sendChat('${s.replace(/'/g, "\\'")}')">${s}</div>`).join("")}</div>` : ""}
        <div class="assistant-input-row">
          <div class="mic-btn ${state.isListeningChat ? "recording" : ""}" onclick="NALAM.voiceChatInput()" title="Speak to NALAM AI">${icon("mic", 16)}</div>
          <input id="chat-input" placeholder="Ask NALAM AI..." onkeydown="if(event.key==='Enter') NALAM.sendChat()" />
          <div class="send-btn" onclick="NALAM.sendChat()">${icon("send", 15, "#fff")}</div>
        </div>
      </div>
    </div>`;
}

/* ---------------- Generic bottom sheet ---------------- */
function sheetWrapper(title, subtitle, bodyHtml, tall = false) {
  const open = Boolean(state.activeSheet);
  return `
    <div class="assistant-overlay ${open ? "open" : ""}" onclick="if(event.target===this) NALAM.closeSheet()">
      <div class="assistant-panel" style="${tall ? "" : "height:auto; max-height:80%;"}">
        <div class="assistant-header">
          <div class="who"><div><h3>${title}</h3>${subtitle ? `<p class="sub">${subtitle}</p>` : ""}</div></div>
          <div class="close-btn" onclick="NALAM.closeSheet()">${icon("close", 16)}</div>
        </div>
        <div style="padding:4px 20px 24px; overflow-y:auto; flex:1;">${bodyHtml}</div>
      </div>
    </div>`;
}

function sheetContent() {
  const type = state.activeSheet;
  if (!type) return "";

  if (type === "language") {
    return sheetWrapper("Language settings", "Applies to the app and NALAM AI",
      LANGUAGES.map((l) => `
        <div class="settings-item" style="border-radius:12px; margin-bottom:6px; border:1px solid var(--line); ${l === state.patient.language ? "background:var(--sage-soft);" : ""}" onclick="NALAM.setLanguage('${l}')">
          <span>${l}</span> ${l === state.patient.language ? icon("check", 16, "#0E4749") : ""}
        </div>`).join(""));
  }

  if (type === "editProfile") {
    const d = state.editDraft;
    return sheetWrapper("Edit profile", null, `
      <span class="field-label">Name</span>
      <input class="auth-input" value="${d.name}" oninput="NALAM.setEditField('name', this.value)" />
      <span class="field-label" style="margin-top:12px;">Age</span>
      <input class="auth-input" type="number" value="${d.age}" oninput="NALAM.setEditField('age', this.value)" />
      <span class="field-label" style="margin-top:12px;">Blood group</span>
      <input class="auth-input" value="${d.bloodGroup}" oninput="NALAM.setEditField('bloodGroup', this.value)" />
      <span class="field-label" style="margin-top:12px;">Allergies (comma-separated)</span>
      <input class="auth-input" value="${d.allergies}" oninput="NALAM.setEditField('allergies', this.value)" />
      <span class="field-label" style="margin-top:12px;">Conditions (comma-separated)</span>
      <input class="auth-input" value="${d.conditions}" oninput="NALAM.setEditField('conditions', this.value)" />
      <button class="btn-primary" style="margin-top:18px;" onclick="NALAM.saveProfile()">Save changes</button>
    `);
  }

  if (type === "emergencyContact") {
    const d = state.editDraft;
    return sheetWrapper("Emergency contact", null, `
      <span class="field-label">Contact name</span>
      <input class="auth-input" value="${d.name || ""}" oninput="NALAM.setEditField('name', this.value)" />
      <span class="field-label" style="margin-top:12px;">Phone number</span>
      <input class="auth-input" value="${d.phone || ""}" oninput="NALAM.setEditField('phone', this.value)" />
      <button class="btn-primary" style="margin-top:18px;" onclick="NALAM.saveEmergencyContact()">Save contact</button>
    `);
  }

  if (type === "notificationPrefs") {
    const prefs = state.patient.notificationPrefs || {};
    const rows = [
      ["medicineReminders", "Medicine reminders"],
      ["appointmentReminders", "Appointment reminders"],
      ["refillReminders", "Refill reminders"],
    ];
    return sheetWrapper("Notification preferences", null, rows.map(([key, label]) => `
      <div class="settings-item" style="cursor:pointer;" onclick="NALAM.toggleNotificationPref('${key}')">
        <span>${label}</span>
        <span class="toggle ${prefs[key] ? "on" : ""}"><span class="toggle-dot"></span></span>
      </div>`).join(""));
  }

  if (type === "privacy") {
    const u = state.currentUser || {};
    return sheetWrapper("Privacy & security", null, `
      <div class="card" style="margin-bottom:0;">
        <div class="profile-row"><span class="k">Name</span><span>${u.name || "—"}</span></div>
        <div class="profile-row"><span class="k">Email</span><span>${u.email || "—"}</span></div>
        <div class="profile-row"><span class="k">Phone</span><span>${u.phone || "—"}</span></div>
        <div class="profile-row"><span class="k">Account status</span><span>${u.verified ? "Verified" : "Unverified"}</span></div>
      </div>
      <p style="font-size:12.5px;color:var(--text-sub);line-height:1.5;margin-top:14px;">
        Passwords are hashed before storage. This demo uses a simple in-memory session token — a production build should use HTTPS, refreshable tokens, and rate-limited login attempts.
      </p>
    `);
  }

  if (type === "apiKey") {
    const status = state.apiKeyStatus;
    return sheetWrapper("AI Assistant Settings", "Powers the NALAM AI chat", `
      <div class="card" style="margin-bottom:14px; display:flex; align-items:center; gap:10px;">
        ${icon("key", 18, status?.hasKey ? "#0E4749" : "#C85A42")}
        <span style="font-size:13.5px;">${status?.hasKey ? "An API key is currently set on the server." : "No API key set — NALAM AI won't respond until one is added."}</span>
      </div>
      <span class="field-label">Google Gemini or Claude API key</span>
      <input class="auth-input" type="password" placeholder="AIzaSy... (Gemini) or sk-ant-... (Claude)" value="${state.apiKeyInput}" oninput="NALAM.setApiKeyInput(this.value)" />
      <p style="font-size:12px;color:var(--text-sub);margin-top:8px;">Supports <b>Google Gemini API Key</b> (free at <a href="https://aistudio.google.com" target="_blank" style="color:var(--teal);font-weight:600;">aistudio.google.com</a>) or Anthropic Claude Key. Stored securely on the server.</p>
      <button class="btn-primary" style="margin-top:14px;" onclick="NALAM.saveApiKey()">Save key</button>
    `);
  }

  if (type === "notifications") {
    return sheetWrapper("Notifications", null, state.notifications.length === 0
      ? `<p class="empty-note">No notifications right now.</p>`
      : state.notifications.map((n) => `
        <div class="card" style="margin-bottom:10px;">
          <p style="font-size:13.5px;margin:0;">${n.text}</p>
          <p style="font-size:11.5px;color:var(--text-sub);margin-top:6px;">${n.time}</p>
        </div>`).join(""));
  }

  if (type === "hospitals") {
    return sheetWrapper("Nearby hospitals", null, state.hospitalsList?.map((h) => `
      <div class="card" style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div><p class="doctor-name" style="font-size:14.5px;">${h.name}</p><p class="doctor-hosp">${h.distance} · ${h.phone}</p></div>
        ${icon("location", 16, "#0E4749")}
      </div>`).join("") || "");
  }

  if (type === "reschedule") {
    const rd = state.rescheduleDraft;
    const currentSlot = state.slotQueueData.find((s) => s.time === rd.time) || { bookedCount: 0, nextQueueNumber: "Q01" };
    return sheetWrapper("Reschedule appointment", rd.id, `
      <span class="field-label">New date</span>
      <div class="chip-row" style="padding-top:0;">${BOOK_DATES.map((dt) => `<div class="chip ${rd.date === dt ? "active" : ""}" onclick="NALAM.setRescheduleField('date','${dt}')">${dt}</div>`).join("")}</div>
      <span class="field-label" style="margin-top:14px;">New time & slot</span>
      <div style="margin-top:4px;">
        ${BOOK_TIMES.map((t) => {
          const s = state.slotQueueData.find((item) => item.time === t) || { bookedCount: 0, nextQueueNumber: "Q01" };
          const isSel = rd.time === t;
          return `
            <div class="slot-card ${isSel ? "active" : ""}" style="padding:8px 12px; margin-bottom:6px;" onclick="NALAM.setRescheduleField('time','${t}')">
              <div class="slot-header">
                <span class="slot-time" style="font-size:13px;">${t}</span>
                <span class="slot-badge">${icon("ticket", 11)} ${s.nextQueueNumber}</span>
              </div>
              <div class="slot-meta" style="font-size:11px;">
                <span>${s.bookedCount} booked</span>
                <span>•</span>
                <span>Expected queue: <b>${s.nextQueueNumber}</b></span>
              </div>
            </div>`;
        }).join("")}
      </div>
      <div class="queue-info" style="margin-top:12px; padding:10px 12px;">
        <span style="font-size:12px; color:var(--teal-deep);">Selected slot queue: <b class="queue-highlight">${currentSlot.nextQueueNumber}</b> (${currentSlot.bookedCount} patients ahead, ~${currentSlot.bookedCount * 10} min wait)</span>
      </div>
      <button class="btn-primary" style="margin-top:16px;" onclick="NALAM.confirmReschedule()">Confirm new time</button>
    `);
  }

  return "";
}

function toastHtml() {
  if (!state.toastMessage) return "";
  return `<div class="toast">${state.toastMessage}</div>`;
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

/* ---------------- Doctor Dashboard Screen ---------------- */
function screenDoctorDashboard() {
  const doc = state.doctorData;
  if (!doc) {
    return `<div class="screen" style="text-align:center;padding:80px 20px;"><p>Loading Doctor Portal…</p></div>`;
  }

  // Active queue entries for this doctor
  const queue = state.doctorQueue || [];
  const waitingList = queue.filter((q) => q.status === "waiting");
  const calledPatient = queue.find((q) => q.status === "called");
  const inConsultation = queue.find((q) => q.status === "in-consultation");

  // Next patient logic
  const nextPatient = calledPatient || waitingList[0];

  // Bookings list and filter
  const allAppts = state.doctorAppointments || [];
  const tab = state.doctorBookingsTab || "all";
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
      <button class="btn-outline danger" style="padding:6px 12px;font-size:12px;" onclick="NALAM.logout()">${icon("logout", 14)} Sign Out</button>
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
          <span style="font-size:11px;color:var(--text-sub);">Auto-refreshing</span>
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
            <button class="btn-primary" style="margin-top:10px;padding:8px 16px;font-size:13px;" onclick="NALAM.completeConsultation('${inConsultation.id}')">
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
            <p class="patient-queue-meta">Called to room — awaiting entry</p>
            <div style="display:flex;gap:8px;margin-top:10px;">
              <button class="doc-btn-call" style="flex:1;justify-content:center;padding:8px 14px;" onclick="NALAM.startConsultation('${calledPatient.id}')">
                ▶ Start Consult
              </button>
              <button class="doc-btn-skip" onclick="NALAM.skipPatient('${calledPatient.id}')">
                Skip
              </button>
            </div>
          </div>
        ` : ""}

        <!-- Next in line button -->
        ${!calledPatient && !inConsultation && waitingList.length > 0 ? `
          <div style="background:var(--card);border-radius:12px;padding:14px;text-align:center;margin-bottom:12px;border:1px dashed var(--teal);">
            <p style="font-size:13px;color:var(--text-sub);margin:0 0 6px;">Next patient ready in waiting area:</p>
            <p style="font-size:17px;font-weight:700;color:var(--teal);margin:0 0 10px;">Token #${waitingList[0].tokenNumber} — ${waitingList[0].patientName}</p>
            <button class="btn-primary" style="width:100%;font-size:14px;" onclick="NALAM.callNextPatient('${waitingList[0].id}')">
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
                  <button class="doc-btn-call" onclick="NALAM.callNextPatient('${q.id}')">Call</button>
                ` : ""}
                <button class="doc-btn-skip" onclick="NALAM.skipPatient('${q.id}')">Skip</button>
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
          <div class="chip ${tab === "all" ? "active" : ""}" onclick="NALAM.setDoctorBookingsTab('all')">All (${allAppts.length})</div>
          <div class="chip ${tab === "today" ? "active" : ""}" onclick="NALAM.setDoctorBookingsTab('today')">Today / Mon 1 Sep</div>
          <div class="chip ${tab === "upcoming" ? "active" : ""}" onclick="NALAM.setDoctorBookingsTab('upcoming')">Upcoming</div>
          <div class="chip ${tab === "completed" ? "active" : ""}" onclick="NALAM.setDoctorBookingsTab('completed')">Completed</div>
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

/* ---------------- Render ---------------- */
const SCREENS = {
  login: screenLogin, signup: screenSignup, otp: screenOtp,
  home: screenHome, doctors: screenDoctors, doctorProfile: screenDoctorProfile,
  book: screenBook, confirmed: screenConfirmed, appointments: screenAppointments,
  records: screenRecords, medicines: screenMedicines, profile: screenProfile, emergency: screenEmergency,
  doctorDashboard: screenDoctorDashboard,
};
const NAV_SCREENS = ["home", "doctors", "records", "medicines", "profile"];
const AUTH_SCREENS = ["login", "signup", "otp"];

function render() {
  const isAuthScreen = AUTH_SCREENS.includes(state.screen);
  if (state.screen === "doctorDashboard") {
    document.getElementById("app").innerHTML = `
      ${screenDoctorDashboard()}
      ${toastHtml()}
    `;
    return;
  }
  if (!isAuthScreen && !state.patient) return; // still loading app data

  const showNav = NAV_SCREENS.includes(state.screen);
  document.getElementById("app").innerHTML = `
    ${SCREENS[state.screen]()}
    ${!isAuthScreen && showNav ? fab() + bottomNav() : ""}
    ${!isAuthScreen ? assistantPanel() : ""}
    ${!isAuthScreen ? sheetContent() : ""}
    ${toastHtml()}
  `;
  if (state.assistantOpen) {
    const box = document.getElementById("chat-messages");
    if (box) box.scrollTop = box.scrollHeight;
  }
}

/* ---------------- Boot / app data ---------------- */
async function loadAppData() {
  try {
    const [patient, appointments, prescriptions, reports, apiKeyStatus] = await Promise.all([
      api("/patient"), api("/appointments"), api("/prescriptions"), api("/reports"), api("/settings/api-key"),
    ]);
    state.patient = patient;
    state.appointments = appointments;
    state.prescriptions = prescriptions;
    state.reports = reports;
    state.apiKeyStatus = apiKeyStatus;
    state.doctors = await api("/doctors");
    goto("home");
  } catch (e) {
    console.error(e);
    document.getElementById("app").innerHTML = `<div class="screen"><p>Couldn't reach the NALAM backend. Make sure it's running at ${API_BASE.replace("/api", "")}.</p></div>`;
  }
}

/* ---------------- Actions ---------------- */
const NALAM = {
  goto,

  /* Auth & Role Selection */
  setLoginRole(role) {
    state.loginRole = role;
    state.authError = null;
    render();
  },
  fillLogin(id, pw) {
    const idInput = document.getElementById("login-id");
    const pwInput = document.getElementById("login-pw");
    if (idInput) idInput.value = id;
    if (pwInput) pwInput.value = pw;
  },
  goToLogin() { state.screen = "login"; state.authError = null; render(); },
  goToSignup() { state.screen = "signup"; state.authError = null; render(); },
  async login() {
    const identifier = document.getElementById("login-id")?.value.trim();
    const password = document.getElementById("login-pw")?.value;
    if (!identifier || !password) { state.authError = "Enter your email/phone and password."; render(); return; }
    state.authBusy = true; state.authError = null; render();
    try {
      const { token, user } = await api("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) });
      state.authToken = token;
      state.currentUser = user;
      localStorage.setItem("nalam_token", token);
      if (user.role === "doctor") {
        await NALAM.loadDoctorData();
      } else {
        await loadAppData();
      }
    } catch (e) {
      state.authError = e.message;
    } finally {
      state.authBusy = false; render();
    }
  },
  async register() {
    const name = document.getElementById("signup-name")?.value.trim();
    const email = document.getElementById("signup-email")?.value.trim();
    const phone = document.getElementById("signup-phone")?.value.trim();
    const password = document.getElementById("signup-pw")?.value;
    if (!name || !email || !phone || !password) { state.authError = "Please fill in every field."; render(); return; }
    state.authBusy = true; state.authError = null; render();
    try {
      const { userId, otp } = await api("/auth/register", { method: "POST", body: JSON.stringify({ name, email, phone, password }) });
      state.pendingUserId = userId;
      state.pendingOtpHint = otp; // demo only — a real build sends this by SMS instead
      state.screen = "otp";
    } catch (e) {
      state.authError = e.message;
    } finally {
      state.authBusy = false; render();
    }
  },
  async verifyOtp() {
    const otp = document.getElementById("otp-input")?.value.trim();
    if (!otp) { state.authError = "Enter the OTP."; render(); return; }
    state.authBusy = true; state.authError = null; render();
    try {
      const { token, user } = await api("/auth/verify-otp", { method: "POST", body: JSON.stringify({ userId: state.pendingUserId, otp }) });
      state.authToken = token;
      state.currentUser = user;
      localStorage.setItem("nalam_token", token);
      if (user.role === "doctor") {
        await NALAM.loadDoctorData();
      } else {
        await loadAppData();
      }
    } catch (e) {
      state.authError = e.message;
    } finally {
      state.authBusy = false; render();
    }
  },
  logout() {
    NALAM.stopDoctorPolling();
    NALAM.stopQueuePolling();
    state.authToken = null;
    state.currentUser = null;
    state.patient = null;
    state.doctorData = null;
    state.doctorAppointments = [];
    state.doctorQueue = [];
    localStorage.removeItem("nalam_token");
    state.screen = "login";
    render();
  },

  /* Doctor Portal Actions */
  setDoctorBookingsTab(tab) {
    state.doctorBookingsTab = tab;
    render();
  },
  async loadDoctorData() {
    try {
      const res = await api("/doctor/me");
      state.doctorData = res.doctor;
      state.doctorAppointments = res.appointments || [];
      const qRes = await api(`/queue/doctor/${res.doctor.id}`).catch(() => []);
      state.doctorQueue = qRes || [];
      state.screen = "doctorDashboard";
      render();
      NALAM.startDoctorPolling();
    } catch (err) {
      console.error("Failed to load doctor portal data:", err);
      showToast(err.message || "Failed to load doctor portal");
    }
  },
  async refreshDoctorData() {
    if (state.screen !== "doctorDashboard" || !state.doctorData) return;
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
  startDoctorPolling() {
    NALAM.stopDoctorPolling();
    state.doctorPollTimer = setInterval(NALAM.refreshDoctorData, 4000);
  },
  stopDoctorPolling() {
    if (state.doctorPollTimer) {
      clearInterval(state.doctorPollTimer);
      state.doctorPollTimer = null;
    }
  },
  async callNextPatient(entryId) {
    try {
      await api(`/queue/${entryId}/call`, { method: "POST" });
      showToast("Patient called to room.");
      speak("Next patient has been called.");
      await NALAM.refreshDoctorData();
    } catch (e) {
      showToast(e.message || "Failed to call patient.");
    }
  },
  async startConsultation(entryId) {
    try {
      await api(`/queue/${entryId}/start`, { method: "POST" });
      showToast("Consultation started.");
      await NALAM.refreshDoctorData();
    } catch (e) {
      showToast(e.message || "Failed to start consult.");
    }
  },
  async completeConsultation(entryId) {
    try {
      await api(`/queue/${entryId}/complete`, { method: "POST" });
      showToast("Consultation marked as completed.");
      await NALAM.refreshDoctorData();
    } catch (e) {
      showToast(e.message || "Failed to complete consult.");
    }
  },
  async skipPatient(entryId) {
    try {
      await api(`/queue/${entryId}/skip`, { method: "POST" });
      showToast("Patient skipped in queue.");
      await NALAM.refreshDoctorData();
    } catch (e) {
      showToast(e.message || "Failed to skip patient.");
    }
  },

  setDoctorQuery(v) {
    state.doctorQuery = v;
    const input = document.querySelector(".search-box input");
    const pos = input ? input.selectionStart : null;
    render();
    const newInput = document.querySelector(".search-box input");
    if (newInput) {
      newInput.focus();
      if (pos !== null) {
        newInput.setSelectionRange(pos, pos);
      }
    }
  },
  setDoctorSpec(s) { state.doctorSpec = s; render(); },
  async selectDoctor(id) {
    state.selectedDoctor = state.doctors.find((d) => d.id === id);
    state.bookDraft = { date: "Mon, 1 Sep", time: "10:30 AM", type: "", reason: "" };
    await NALAM.fetchSlotQueueData(id, state.bookDraft.date);
    goto("doctorProfile");
  },
  async fetchSlotQueueData(doctorId, date) {
    try {
      state.loadingSlots = true;
      const slots = await api(`/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`);
      state.slotQueueData = slots;
    } catch (err) {
      console.warn("Failed to fetch slot queue data:", err);
      state.slotQueueData = [];
    } finally {
      state.loadingSlots = false;
      render();
    }
  },
  async setBookDate(date) {
    state.bookDraft.date = date;
    render();
    if (state.selectedDoctor) {
      await NALAM.fetchSlotQueueData(state.selectedDoctor.id, date);
    }
  },
  setBookField(field, value) { state.bookDraft[field] = value; render(); },
  async confirmBooking() {
    const d = state.selectedDoctor, bd = state.bookDraft;
    const appt = await api("/appointments", { method: "POST", body: JSON.stringify({ doctorId: d.id, ...bd }) });
    state.appointments = [appt, ...state.appointments];
    state.lastBooked = appt;
    state.doctors = await api("/doctors");
    goto("confirmed");
  },
  async cancelAppointment(id) {
    await api(`/appointments/${id}/cancel`, { method: "POST" });
    const [appts, docs] = await Promise.all([api("/appointments"), api("/doctors")]);
    state.appointments = appts;
    state.doctors = docs;
    render();
    showToast("Appointment cancelled.");
  },
  async openReschedule(id) {
    const appt = state.appointments.find((a) => a.id === id);
    const date = appt ? appt.date : "Mon, 1 Sep";
    const time = appt ? appt.time : "10:30 AM";
    state.rescheduleDraft = { id, date, time };
    state.activeSheet = "reschedule";
    if (appt?.doctorId) {
      await NALAM.fetchSlotQueueData(appt.doctorId, date);
    }
    render();
  },
  async setRescheduleField(field, value) {
    state.rescheduleDraft[field] = value;
    render();
    if (field === "date") {
      const appt = state.appointments.find((a) => a.id === state.rescheduleDraft.id);
      if (appt?.doctorId) {
        await NALAM.fetchSlotQueueData(appt.doctorId, value);
      }
    }
  },
  async confirmReschedule() {
    const { id, date, time } = state.rescheduleDraft;
    await api(`/appointments/${id}/reschedule`, { method: "PATCH", body: JSON.stringify({ date, time }) });
    const [appts, docs] = await Promise.all([api("/appointments"), api("/doctors")]);
    state.appointments = appts;
    state.doctors = docs;
    state.activeSheet = null;
    render();
    showToast("Appointment rescheduled.");
  },

  /* Voice features */
  voiceDoctorSearch() {
    if (state.isListeningSearch) return;
    state.isListeningSearch = true;
    render();
    showToast("Listening for doctor name or specialty...");
    startVoiceInput(
      (text) => {
        state.doctorQuery = text;
        showToast(`Heard: "${text}"`);
        render();
      },
      () => {
        state.isListeningSearch = false;
        render();
      },
      langToBCP47(state.patient?.language || "English")
    );
  },
  voiceChatInput() {
    if (state.isListeningChat) return;
    state.isListeningChat = true;
    render();
    showToast("Listening for NALAM AI...");
    startVoiceInput(
      (text) => {
        const input = document.getElementById("chat-input");
        if (input) input.value = text;
        NALAM.sendChat(text);
      },
      () => {
        state.isListeningChat = false;
        render();
      },
      langToBCP47(state.patient?.language || "English")
    );
  },

  /* Queue */
  async checkIn(appointmentId) {
    try {
      const status = await api("/queue/checkin", { method: "POST", body: JSON.stringify({ appointmentId }) });
      state.queueByAppointment[appointmentId] = status;
      render();
      showToast(`Checked in — you're token #${status.tokenNumber}.`);
      NALAM.startQueuePolling();
    } catch (e) {
      showToast(e.message || "Couldn't check in right now.");
    }
  },
  async refreshQueueStatuses() {
    try {
      const [appts, docs] = await Promise.all([api("/appointments"), api("/doctors")]);
      state.appointments = appts;
      state.doctors = docs;
    } catch (e) {
      console.warn("Queue refresh error:", e);
    }
    const ids = Object.keys(state.queueByAppointment);
    for (const id of ids) {
      try {
        const prev = state.queueByAppointment[id];
        const status = await api(`/queue/status/${id}`);
        state.queueByAppointment[id] = status;
        if (prev && prev.status === "waiting" && status.status === "called") {
          showToast(`Your turn is here! Token #${status.tokenNumber} — please head in.`);
          speak(`Your turn is here! Token number ${status.tokenNumber}, please head in.`);
        }
      } catch {
        // entry may have been completed/removed server-side; leave last known state
      }
    }
    if (state.screen === "appointments") render();
  },
  startQueuePolling() {
    NALAM.stopQueuePolling();
    state.queuePollTimer = setInterval(NALAM.refreshQueueStatuses, 6000);
  },
  stopQueuePolling() {
    if (state.queuePollTimer) { clearInterval(state.queuePollTimer); state.queuePollTimer = null; }
  },

  /* Records */
  setRecordsTab(t) { state.recordsTab = t; render(); },

  /* Medicine check */
  setMedField(field, value) {
    state.medCheck[field] = value;
    const btn = document.getElementById("med-compare-btn");
    if (btn) {
      btn.disabled = !state.medCheck.prescribed?.trim() || !state.medCheck.pharmacy?.trim();
    }
  },
  triggerScan(field) {
    state.medCheck.scanTarget = field;
    document.getElementById("ocr-file-input")?.click();
  },
  async handleScanFile(file) {
    if (!file) return;
    const field = state.medCheck.scanTarget;
    state.medCheck.scanningField = field;
    render();

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const [header, base64] = dataUrl.split(",");
      const mediaType = header.match(/data:(.*);base64/)?.[1] || "image/jpeg";

      const result = await api("/ocr/medicine", { method: "POST", body: JSON.stringify({ imageBase64: base64, mediaType }) });

      if (!result.name) {
        showToast("Couldn't read a medicine name from that photo — try a clearer shot of the label, or type it in manually.");
      } else {
        state.medCheck[field] = result.strength ? `${result.name} ${result.strength}` : result.name;
        showToast(result.confidence === "low" ? `Read "${state.medCheck[field]}" — double-check it's correct.` : `Scanned: ${state.medCheck[field]}`);
      }
    } catch (e) {
      showToast(e.message || "Scan failed. Please try again.");
    } finally {
      state.medCheck.scanningField = null;
      const input = document.getElementById("ocr-file-input");
      if (input) input.value = "";
      render();
    }
  },
  async compareMedicines() {
    const { prescribed, pharmacy } = state.medCheck;
    const result = await api("/medicine-check", { method: "POST", body: JSON.stringify({ prescribed, pharmacy }) });
    state.medCheck.result = result;
    render();
  },

  /* Assistant */
  openAssistant() { state.assistantOpen = true; render(); },
  closeAssistant() { state.assistantOpen = false; render(); },
  async sendChat(text) {
    const input = document.getElementById("chat-input");
    const userText = (text ?? input?.value ?? "").trim();
    if (!userText || state.chatLoading) return;
    state.chatMessages.push({ role: "user", text: userText });
    state.chatLoading = true;
    render();
    try {
      const { reply, error } = await api("/assistant", {
        method: "POST",
        body: JSON.stringify({ messages: state.chatMessages.map((m) => ({ role: m.role, content: m.text })) }),
      });
      state.chatMessages.push({ role: "assistant", text: error || reply });
    } catch (e) {
      state.chatMessages.push({ role: "assistant", text: e.message || "I'm having trouble connecting right now." });
    } finally {
      state.chatLoading = false;
      render();
    }
  },

  /* Settings sheets */
  openSetting(sheet) {
    if (sheet === "editProfile") {
      const p = state.patient;
      state.editDraft = { name: p.name, age: p.age, bloodGroup: p.bloodGroup, allergies: p.allergies.join(", "), conditions: p.conditions.join(", ") };
    }
    if (sheet === "emergencyContact") {
      state.editDraft = { ...(state.patient.emergencyContact || {}) };
    }
    if (sheet === "apiKey") {
      state.apiKeyInput = "";
    }
    state.activeSheet = sheet;
    render();
  },
  closeSheet() { state.activeSheet = null; render(); },
  setEditField(field, value) { state.editDraft[field] = value; },
  async saveProfile() {
    const d = state.editDraft;
    const updated = await api("/patient", {
      method: "PATCH",
      body: JSON.stringify({
        name: d.name, age: Number(d.age), bloodGroup: d.bloodGroup,
        allergies: d.allergies.split(",").map((s) => s.trim()).filter(Boolean),
        conditions: d.conditions.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    state.patient = updated;
    state.activeSheet = null;
    render();
    showToast("Profile updated.");
  },
  async saveEmergencyContact() {
    const d = state.editDraft;
    const updated = await api("/patient/emergency-contact", { method: "PATCH", body: JSON.stringify({ name: d.name, phone: d.phone }) });
    state.patient = updated;
    state.activeSheet = null;
    render();
    showToast("Emergency contact saved.");
  },
  async toggleNotificationPref(key) {
    const next = { [key]: !state.patient.notificationPrefs[key] };
    const updated = await api("/patient/notifications", { method: "PATCH", body: JSON.stringify(next) });
    state.patient = updated;
    render();
  },
  setLanguage(lang) {
    api("/patient", { method: "PATCH", body: JSON.stringify({ language: lang }) }).then((updated) => {
      state.patient = updated;
      state.activeSheet = null;
      render();
      showToast(`Language set to ${lang}.`);
    });
  },
  setApiKeyInput(v) { state.apiKeyInput = v; },
  async saveApiKey() {
    if (!state.apiKeyInput || state.apiKeyInput.length < 10) { showToast("That doesn't look like a valid key."); return; }
    try {
      const status = await api("/settings/api-key", { method: "POST", body: JSON.stringify({ apiKey: state.apiKeyInput }) });
      state.apiKeyStatus = status;
      state.activeSheet = null;
      render();
      showToast("API key saved to the server for this session.");
    } catch (e) {
      showToast(e.message);
    }
  },

  /* Notifications / emergency */
  async openNotifications() {
    state.notifications = await api("/notifications");
    state.activeSheet = "notifications";
    render();
  },
  async openHospitals() {
    state.hospitalsList = await api("/hospitals");
    state.activeSheet = "hospitals";
    render();
  },
  async callAmbulance() {
    try {
      const res = await api("/emergency/alert", { method: "POST" });
      showToast(res.message);
    } catch (e) {
      showToast(e.message);
    }
  },
};
window.NALAM = NALAM;

/* ---------------- Boot ---------------- */
(async function init() {
  if (state.authToken) {
    try {
      state.currentUser = await api("/auth/me");
      if (state.currentUser.role === "doctor") {
        await NALAM.loadDoctorData();
        return;
      }
      await loadAppData();
      return;
    } catch (e) {
      localStorage.removeItem("nalam_token");
      state.authToken = null;
    }
  }
  render(); // shows login screen
})();
