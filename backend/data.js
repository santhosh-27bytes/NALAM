// In-memory "database" — mirrors the Users / Doctors / Appointments /
// Prescriptions / Medical_Reports / Medicines tables from the NALAM spec.
// Swap this module for real PostgreSQL queries later; the route handlers
// in server.js don't need to change shape if you keep the same fields.
//
// NOTE ON AUTH: tokens here are random strings held in an in-memory map,
// and passwords are hashed with Node's built-in scrypt. This is fine for
// local testing but is NOT a production auth system — there's no HTTPS
// enforcement, no rate limiting, no password reset flow, and everything
// resets when the server restarts. Replace with a real auth provider or
// a hardened implementation before this goes anywhere near real patients.

import crypto from "crypto";

/* ---------------- Patient profile ---------------- */
export const patient = {
  id: "p1",
  userId: "u1",
  name: "Meena Raghavan",
  age: 58,
  bloodGroup: "B+",
  language: "English",
  allergies: ["Penicillin"],
  conditions: ["Type 2 Diabetes", "Hypertension"],
  emergencyContact: { name: "Karthik Raghavan", phone: "+91 98765 43210" },
  notificationPrefs: { medicineReminders: true, appointmentReminders: true, refillReminders: true },
};

/* ---------------- Auth ---------------- */
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return check === hash;
}

// Pre-seeded demo accounts for both Patient and Doctor logins.
export const users = [
  {
    id: "u1",
    name: "Meena Raghavan",
    email: "meena@example.com",
    phone: "9999999999",
    passwordHash: hashPassword("password123"),
    verified: true,
    role: "patient",
  },
  {
    id: "doc-1",
    name: "Dr. Arvind Kumar",
    email: "arvind@nalam.health",
    phone: "9888888881",
    passwordHash: hashPassword("doctor123"),
    verified: true,
    role: "doctor",
    doctorId: "d1",
  },
  {
    id: "doc-2",
    name: "Dr. Priya Sundaram",
    email: "priya@nalam.health",
    phone: "9888888882",
    passwordHash: hashPassword("doctor123"),
    verified: true,
    role: "doctor",
    doctorId: "d2",
  },
  {
    id: "doc-3",
    name: "Dr. Rohan Mehta",
    email: "rohan@nalam.health",
    phone: "9888888883",
    passwordHash: hashPassword("doctor123"),
    verified: true,
    role: "doctor",
    doctorId: "d3",
  },
  {
    id: "doc-4",
    name: "Dr. Lakshmi Iyer",
    email: "lakshmi@nalam.health",
    phone: "9888888884",
    passwordHash: hashPassword("doctor123"),
    verified: true,
    role: "doctor",
    doctorId: "d4",
  },
];

export const sessions = {}; // token -> userId
export const pendingOtps = {}; // userId -> { otp, expiresAt }

export function findUserByEmailOrPhone(value) {
  const v = value.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === v || u.phone === value.trim());
}

export function createUser({ name, email, phone, password }) {
  const id = `u${users.length + 1}`;
  const user = { id, name, email, phone, passwordHash: hashPassword(password), verified: false };
  users.push(user);
  return user;
}

export function checkPassword(user, password) {
  return verifyPassword(password, user.passwordHash);
}

export function generateOtp(userId) {
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  pendingOtps[userId] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
  return otp;
}

export function verifyOtp(userId, otp) {
  const record = pendingOtps[userId];
  if (!record || record.expiresAt < Date.now()) return false;
  if (record.otp !== otp) return false;
  delete pendingOtps[userId];
  const user = users.find((u) => u.id === userId);
  if (user) user.verified = true;
  return true;
}

export function createSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions[token] = userId;
  return token;
}

export function getUserFromToken(token) {
  const userId = sessions[token];
  if (!userId) return null;
  return users.find((u) => u.id === userId) || null;
}

/* ---------------- Runtime AI settings ---------------- */
// Supports Google Gemini API Key and Anthropic Claude Key entered through UI
// or loaded from .env (GEMINI_API_KEY / GOOGLE_API_KEY / ANTHROPIC_API_KEY)
let runtimeApiKey = null;
export function setRuntimeApiKey(key) { runtimeApiKey = key; }
export function getActiveApiKey() {
  return runtimeApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.ANTHROPIC_API_KEY || null;
}
export function hasApiKey() {
  const key = getActiveApiKey();
  return Boolean(key && key !== "your_key_here");
}

/* ---------------- Queue Configuration & Utilities ---------------- */
export const AVG_CONSULT_MINUTES = 10;
export const STANDARD_SLOTS = ["9:00 AM", "10:30 AM", "2:00 PM", "4:30 PM"];

export function formatQueueNumber(num) {
  const n = parseInt(num, 10) || 1;
  return `Q${String(n).padStart(2, "0")}`;
}

export function parseQueueNumber(qStr) {
  if (!qStr) return 0;
  const match = String(qStr).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/* ---------------- Doctors ---------------- */
export const doctors = [
  { id: "d1", name: "Dr. Arvind Kumar", spec: "Cardiologist", exp: 14, hospital: "Apollo Heart Institute, Chennai", fee: 700, rating: 4.8, langs: ["English", "Tamil"], types: ["In-person", "Video"], next: "Mon, 10:30 AM" },
  { id: "d2", name: "Dr. Priya Sundaram", spec: "General Physician", exp: 9, hospital: "NALAM Community Clinic", fee: 400, rating: 4.6, langs: ["English", "Tamil", "Hindi"], types: ["In-person", "Video", "Audio"], next: "Today, 4:00 PM" },
  { id: "d3", name: "Dr. Rohan Mehta", spec: "Dermatologist", exp: 7, hospital: "SkinCare Speciality", fee: 550, rating: 4.5, langs: ["English", "Hindi"], types: ["In-person", "Video"], next: "Wed, 11:00 AM" },
  { id: "d4", name: "Dr. Lakshmi Iyer", spec: "Endocrinologist", exp: 12, hospital: "Apollo Heart Institute, Chennai", fee: 650, rating: 4.9, langs: ["English", "Tamil"], types: ["In-person", "Video"], next: "Thu, 9:15 AM" },
];

/* ---------------- Appointments with Smart Queue Data ---------------- */
export let appointments = [
  // Meena Raghavan's main appointment
  {
    id: "A-1042",
    patientName: "Meena Raghavan",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "10:30 AM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute",
    reason: "Routine review and cardiac evaluation",
    queueNumber: "Q06",
    queueStatus: "Waiting",
  },
  // Dr. Arvind Kumar — Mon, 1 Sep, 10:30 AM queue progression
  {
    id: "A-1001",
    patientName: "Kavitha Sundaram",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "10:30 AM",
    type: "In-person",
    status: "Completed",
    hospital: "Apollo Heart Institute",
    reason: "Hypertension check",
    queueNumber: "Q01",
    queueStatus: "Completed",
  },
  {
    id: "A-1002",
    patientName: "Venkatesh Rao",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "10:30 AM",
    type: "In-person",
    status: "Completed",
    hospital: "Apollo Heart Institute",
    reason: "ECG assessment",
    queueNumber: "Q02",
    queueStatus: "Completed",
  },
  {
    id: "A-1003",
    patientName: "Ramesh Kannan",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "10:30 AM",
    type: "In-person",
    status: "Confirmed",
    hospital: "Apollo Heart Institute",
    reason: "Post-op consultation",
    queueNumber: "Q03",
    queueStatus: "Consulting",
  },
  {
    id: "A-1004",
    patientName: "Suresh Babu",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "10:30 AM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute",
    reason: "Chest discomfort follow-up",
    queueNumber: "Q04",
    queueStatus: "Waiting",
  },
  {
    id: "A-1005",
    patientName: "Anitha Devi",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "10:30 AM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute",
    reason: "Lipid profile consultation",
    queueNumber: "Q05",
    queueStatus: "Waiting",
  },
  // Dr. Arvind Kumar — Mon, 1 Sep, 9:00 AM slot
  {
    id: "A-1006",
    patientName: "Deepak Sharma",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "9:00 AM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute",
    reason: "General cardiac check",
    queueNumber: "Q01",
    queueStatus: "Waiting",
  },
  {
    id: "A-1007",
    patientName: "Vijay Kumar",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "9:00 AM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute",
    reason: "Blood pressure review",
    queueNumber: "Q02",
    queueStatus: "Waiting",
  },
  {
    id: "A-1008",
    patientName: "Nandhini Prakash",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "9:00 AM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute",
    reason: "Heart palpitations review",
    queueNumber: "Q03",
    queueStatus: "Waiting",
  },
  // Dr. Arvind Kumar — Mon, 1 Sep, 2:00 PM slot
  {
    id: "A-1009",
    patientName: "Gopalakrishnan M.",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "2:00 PM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute",
    reason: "Echo cardiogram follow-up",
    queueNumber: "Q01",
    queueStatus: "Waiting",
  },
  {
    id: "A-1010",
    patientName: "Saravanan K.",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    spec: "Cardiologist",
    date: "Mon, 1 Sep",
    time: "2:00 PM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute",
    reason: "Second opinion",
    queueNumber: "Q02",
    queueStatus: "Waiting",
  },
  // Dr. Priya Sundaram (d2)
  {
    id: "A-1011",
    patientName: "Pooja Hegde",
    doctorId: "d2",
    doctor: "Dr. Priya Sundaram",
    spec: "General Physician",
    date: "Today, 29 Aug",
    time: "4:00 PM",
    type: "In-person",
    status: "Confirmed",
    hospital: "NALAM Community Clinic",
    reason: "Viral fever consult",
    queueNumber: "Q01",
    queueStatus: "Consulting",
  },
  {
    id: "A-1012",
    patientName: "Rajeshwaran T.",
    doctorId: "d2",
    doctor: "Dr. Priya Sundaram",
    spec: "General Physician",
    date: "Today, 29 Aug",
    time: "4:00 PM",
    type: "In-person",
    status: "Upcoming",
    hospital: "NALAM Community Clinic",
    reason: "Seasonal allergy review",
    queueNumber: "Q02",
    queueStatus: "Waiting",
  },
  // Dr. Rohan Mehta (d3)
  {
    id: "A-1013",
    patientName: "Manoj Verma",
    doctorId: "d3",
    doctor: "Dr. Rohan Mehta",
    spec: "Dermatologist",
    date: "Sun, 31 Aug",
    time: "11:00 AM",
    type: "In-person",
    status: "Upcoming",
    hospital: "SkinCare Speciality",
    reason: "Contact dermatitis check",
    queueNumber: "Q01",
    queueStatus: "Waiting",
  },
  // Dr. Lakshmi Iyer (d4)
  {
    id: "A-1014",
    patientName: "Meena Raghavan",
    doctorId: "d4",
    doctor: "Dr. Lakshmi Iyer",
    spec: "Endocrinologist",
    date: "Tue, 2 Sep",
    time: "9:15 AM",
    type: "In-person",
    status: "Completed",
    hospital: "Apollo Heart Institute, Chennai",
    reason: "HbA1c routine review",
    queueNumber: "Q01",
    queueStatus: "Completed",
  },
  {
    id: "A-1015",
    patientName: "Balaji Swaminathan",
    doctorId: "d4",
    doctor: "Dr. Lakshmi Iyer",
    spec: "Endocrinologist",
    date: "Tue, 2 Sep",
    time: "9:15 AM",
    type: "In-person",
    status: "Confirmed",
    hospital: "Apollo Heart Institute, Chennai",
    reason: "Insulin dosage review",
    queueNumber: "Q02",
    queueStatus: "Consulting",
  },
  {
    id: "A-1016",
    patientName: "Gayathri Raman",
    doctorId: "d4",
    doctor: "Dr. Lakshmi Iyer",
    spec: "Endocrinologist",
    date: "Tue, 2 Sep",
    time: "9:15 AM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute, Chennai",
    reason: "Thyroid follow-up",
    queueNumber: "Q03",
    queueStatus: "Waiting",
  },
  {
    id: "A-1017",
    patientName: "Karthikeyan S.",
    doctorId: "d4",
    doctor: "Dr. Lakshmi Iyer",
    spec: "Endocrinologist",
    date: "Tue, 2 Sep",
    time: "9:15 AM",
    type: "In-person",
    status: "Upcoming",
    hospital: "Apollo Heart Institute, Chennai",
    reason: "Metformin adjustment",
    queueNumber: "Q04",
    queueStatus: "Waiting",
  },
];

/* ---------------- Queue Calculations ---------------- */

export function isAppointmentActive(a) {
  if (!a) return false;
  if (a.status === "Cancelled" || a.queueStatus === "Cancelled") return false;
  if (a.status === "Completed" || a.queueStatus === "Completed") return false;
  if (a.queueStatus === "Skipped") return false;
  return true;
}

export function getDoctorQueueCount(doctorId) {
  return appointments.filter((a) => a.doctorId === doctorId && isAppointmentActive(a)).length;
}

export function getNextQueueNumberForDoctor(doctorId) {
  const waitingCount = getDoctorQueueCount(doctorId);
  const activeAppts = appointments.filter((a) => a.doctorId === doctorId && isAppointmentActive(a));
  const maxNum = activeAppts.reduce((max, a) => Math.max(max, parseQueueNumber(a.queueNumber)), 0);
  const nextNum = Math.max(waitingCount + 1, maxNum + 1);
  return formatQueueNumber(nextNum);
}

export function getDoctorQueue(doctorId) {
  const activeAppts = appointments.filter((a) => a.doctorId === doctorId && isAppointmentActive(a));
  const consulting = appointments.find((a) => a.doctorId === doctorId && a.queueStatus === "Consulting");
  const currentQueue = consulting ? consulting.queueNumber : (activeAppts[0]?.queueNumber || "Q01");

  const queueList = activeAppts
    .slice()
    .sort((a, b) => parseQueueNumber(a.queueNumber) - parseQueueNumber(b.queueNumber))
    .map((a) => ({
      queueNumber: a.queueNumber,
      status: a.queueStatus || "Waiting",
      appointmentId: a.id,
      patientName: a.patientName || "Patient",
      time: a.time,
      date: a.date,
    }));

  return {
    doctorId,
    currentQueue,
    waitingCount: activeAppts.length,
    queue: queueList,
  };
}

export function getSlotQueueInfo(doctorId, date) {
  const slots = [...STANDARD_SLOTS];
  const doctorApptsOnDate = appointments.filter((a) => a.doctorId === doctorId && (!date || a.date === date));

  // Also include any doctor-specific times from existing appointments
  doctorApptsOnDate.forEach((a) => {
    if (a.time && !slots.includes(a.time)) slots.push(a.time);
  });

  return slots.map((time) => {
    const slotAppts = doctorApptsOnDate.filter((a) => a.time === time);
    const activeInSlot = slotAppts.filter(isAppointmentActive);
    const bookedCount = activeInSlot.length;

    // Guaranteed collision-free next queue number: max existing in this doctor+date+time + 1
    const allSlotQueueNums = slotAppts.map((a) => parseQueueNumber(a.queueNumber)).filter(Boolean);
    const maxNum = allSlotQueueNums.length ? Math.max(...allSlotQueueNums) : 0;
    const nextQueueNumber = formatQueueNumber(Math.max(maxNum, bookedCount) + 1);

    return {
      time,
      bookedCount,
      nextQueueNumber,
    };
  });
}

export function assignAppointmentQueue(doctorId, date, time) {
  const allSlotAppts = appointments.filter((a) => a.doctorId === doctorId && a.date === date && a.time === time);
  const activeInSlot = allSlotAppts.filter(isAppointmentActive);
  const allNums = allSlotAppts.map((a) => parseQueueNumber(a.queueNumber)).filter(Boolean);
  const maxNum = allNums.length ? Math.max(...allNums) : 0;
  const queueNumber = formatQueueNumber(Math.max(maxNum, activeInSlot.length) + 1);

  // Determine patients ahead in this slot
  const consulting = allSlotAppts.find((a) => a.queueStatus === "Consulting");
  let patientsAhead = 0;
  const myNum = parseQueueNumber(queueNumber);

  if (consulting) {
    const cNum = parseQueueNumber(consulting.queueNumber);
    patientsAhead = activeInSlot.filter((a) => {
      const num = parseQueueNumber(a.queueNumber);
      return num > cNum && num < myNum;
    }).length;
  } else {
    patientsAhead = activeInSlot.filter((a) => parseQueueNumber(a.queueNumber) < myNum).length;
  }

  const estimatedWaitingMinutes = patientsAhead * AVG_CONSULT_MINUTES;

  return {
    queueNumber,
    queueStatus: "Waiting",
    patientsAhead,
    estimatedWaitingMinutes,
  };
}

export function computeQueueStatus(appt) {
  if (!appt) return null;
  if (appt.status === "Cancelled" || appt.queueStatus === "Cancelled") {
    return {
      ...appt,
      queueStatus: "Cancelled",
      patientsAhead: 0,
      estimatedWaitingMinutes: 0,
      currentQueue: "—",
    };
  }
  if (appt.status === "Completed" || appt.queueStatus === "Completed") {
    return {
      ...appt,
      queueStatus: "Completed",
      patientsAhead: 0,
      estimatedWaitingMinutes: 0,
      currentQueue: "—",
    };
  }

  const slotAppts = appointments.filter(
    (a) => a.doctorId === appt.doctorId && a.date === appt.date && a.time === appt.time
  );
  const activeInSlot = slotAppts.filter(isAppointmentActive);

  let consulting = slotAppts.find((a) => a.queueStatus === "Consulting");
  if (!consulting) {
    // Check doctor-wide on that date
    consulting = appointments.find(
      (a) => a.doctorId === appt.doctorId && a.date === appt.date && a.queueStatus === "Consulting"
    );
  }

  const currentQueue = consulting ? consulting.queueNumber : (activeInSlot[0]?.queueNumber || appt.queueNumber || "Q01");
  const myNum = parseQueueNumber(appt.queueNumber);
  let patientsAhead = 0;

  if (appt.queueStatus === "Consulting") {
    patientsAhead = 0;
  } else if (consulting) {
    const cNum = parseQueueNumber(consulting.queueNumber);
    if (myNum <= cNum) {
      patientsAhead = 0;
    } else {
      patientsAhead = activeInSlot.filter((a) => {
        const num = parseQueueNumber(a.queueNumber);
        return num > cNum && num < myNum;
      }).length;
    }
  } else {
    patientsAhead = activeInSlot.filter((a) => parseQueueNumber(a.queueNumber) < myNum).length;
  }

  const estimatedWaitingMinutes = patientsAhead * AVG_CONSULT_MINUTES;
  const qEntry = queueEntries.find((e) => e.appointmentId === appt.id);
  const patientName = appt.patientName || qEntry?.patientName || "Meena Raghavan";

  return {
    ...appt,
    patientName,
    queueStatus: appt.queueStatus || "Waiting",
    currentQueue,
    patientsAhead,
    estimatedWaitingMinutes,
  };
}

export function addAppointment(appt) {
  appointments = [appt, ...appointments];
  return computeQueueStatus(appt);
}

export function cancelAppointment(id) {
  const a = appointments.find((x) => x.id === id);
  if (a) {
    a.status = "Cancelled";
    a.queueStatus = "Cancelled";
    // Also update any corresponding staff queue entry
    const q = queueEntries.find((e) => e.appointmentId === id);
    if (q) q.status = "skipped";
  }
  return a ? computeQueueStatus(a) : null;
}

export function rescheduleAppointment(id, date, time) {
  const a = appointments.find((x) => x.id === id);
  if (a) {
    a.date = date;
    a.time = time;
    a.status = "Rescheduled";
    const qInfo = assignAppointmentQueue(a.doctorId, date, time);
    a.queueNumber = qInfo.queueNumber;
    a.queueStatus = "Waiting";
    a.patientsAhead = qInfo.patientsAhead;
    a.estimatedWaitingMinutes = qInfo.estimatedWaitingMinutes;

    // Update staff queue entry if one exists
    const q = queueEntries.find((e) => e.appointmentId === id);
    if (q) {
      q.tokenNumber = parseQueueNumber(a.queueNumber);
      q.status = "waiting";
    }
  }
  return a ? computeQueueStatus(a) : null;
}

export function getDoctorAppointments(doctorId) {
  return appointments
    .filter((a) => a.doctorId === doctorId)
    .map(computeQueueStatus);
}

/* ---------------- Staff Queue Management ---------------- */
export const queueEntries = [
  {
    id: "Q-1003",
    appointmentId: "A-1003",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    patientName: "Ramesh Kannan",
    tokenNumber: 3,
    status: "in-consultation",
    checkedInAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "Q-1004",
    appointmentId: "A-1004",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    patientName: "Suresh Babu",
    tokenNumber: 4,
    status: "waiting",
    checkedInAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "Q-1005",
    appointmentId: "A-1005",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    patientName: "Anitha Devi",
    tokenNumber: 5,
    status: "waiting",
    checkedInAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "Q-1042",
    appointmentId: "A-1042",
    doctorId: "d1",
    doctor: "Dr. Arvind Kumar",
    patientName: "Meena Raghavan",
    tokenNumber: 6,
    status: "waiting",
    checkedInAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

export function checkinToQueue(appointmentId) {
  const appt = appointments.find((a) => a.id === appointmentId);
  if (!appt) return null;

  const existing = queueEntries.find(
    (q) => q.appointmentId === appointmentId && q.status !== "completed" && q.status !== "skipped"
  );
  if (existing) return existing;

  const tokenNumber = parseQueueNumber(appt.queueNumber) || (getDoctorQueueCount(appt.doctorId) + 1);
  const entry = {
    id: `Q-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    appointmentId,
    doctorId: appt.doctorId,
    doctor: appt.doctor,
    patientName: patient.name,
    tokenNumber,
    status: "waiting",
    checkedInAt: new Date().toISOString(),
  };
  queueEntries.push(entry);
  return entry;
}

export function queueForDoctor(doctorId) {
  return queueEntries
    .filter((q) => q.doctorId === doctorId && q.status !== "completed" && q.status !== "skipped")
    .sort((a, b) => a.tokenNumber - b.tokenNumber);
}

export function queueStatusForEntry(entryId) {
  const entry = queueEntries.find((q) => q.id === entryId);
  if (!entry) return null;

  const ahead = queueEntries.filter(
    (q) =>
      q.doctorId === entry.doctorId &&
      (q.status === "waiting" || q.status === "called") &&
      q.tokenNumber < entry.tokenNumber &&
      q.id !== entry.id
  );

  const patientsAhead = ahead.length;
  return {
    ...entry,
    patientsAhead,
    estimatedWaitMinutes: patientsAhead * AVG_CONSULT_MINUTES,
  };
}

export function findQueueEntryByAppointment(appointmentId) {
  return queueEntries.find(
    (q) => q.appointmentId === appointmentId && q.status !== "completed" && q.status !== "skipped"
  );
}

export function setQueueStatus(entryId, status) {
  const entry = queueEntries.find((q) => q.id === entryId);
  if (!entry) return null;
  entry.status = status;

  // Synchronize status back to appointment
  const appt = appointments.find((a) => a.id === entry.appointmentId);
  if (appt) {
    if (status === "in-consultation") {
      appt.queueStatus = "Consulting";
    } else if (status === "completed") {
      appt.status = "Completed";
      appt.queueStatus = "Completed";
    } else if (status === "skipped") {
      appt.queueStatus = "Skipped";
    } else if (status === "called") {
      appt.queueStatus = "Called";
    }
  }
  return entry;
}

/* ---------------- Records ---------------- */
export const prescriptions = [
  {
    id: "RX-3391", date: "28 Aug 2026", doctor: "Dr. Lakshmi Iyer", diagnosis: "Type 2 Diabetes — routine review",
    medicines: [
      { name: "Metformin", strength: "500 mg", freq: "Morning & Night", food: "After food" },
      { name: "Amlodipine", strength: "5 mg", freq: "Night", food: "After food" },
    ],
  },
];

export const reports = [
  { id: "R-1", type: "Blood Test — HbA1c", date: "22 Aug 2026", lab: "MedLife Diagnostics" },
  { id: "R-2", type: "ECG", date: "12 Jun 2026", lab: "Apollo Heart Institute" },
];

/* ---------------- Medicine verification ---------------- */
export const medicineDb = {
  "paracetamol 500": { generic: "Paracetamol", strength: "500 mg", form: "Tablet" },
  "dolo 650": { generic: "Paracetamol", strength: "650 mg", form: "Tablet" },
  "crocin 500": { generic: "Paracetamol", strength: "500 mg", form: "Tablet" },
  "metformin 500": { generic: "Metformin Hydrochloride", strength: "500 mg", form: "Tablet" },
  "glycomet 500": { generic: "Metformin Hydrochloride", strength: "500 mg", form: "Tablet" },
  "amlodipine 5": { generic: "Amlodipine Besylate", strength: "5 mg", form: "Tablet" },
  "amlopres 5": { generic: "Amlodipine Besylate", strength: "5 mg", form: "Tablet" },
};

/* ---------------- Notifications ---------------- */
export function getNotifications() {
  return [
    { id: "n1", type: "appointment", text: "Reminder: your appointment with Dr. Arvind Kumar is on Mon, 1 Sep at 10:30 AM.", time: "2h ago" },
    { id: "n2", type: "medicine", text: "Time to take Metformin 500 mg — Morning dose.", time: "5h ago" },
    { id: "n3", type: "refill", text: "Your Amlodipine may run out in 3 days. Set a refill reminder?", time: "1d ago" },
  ];
}

/* ---------------- Emergency ---------------- */
export const hospitals = [
  { id: "h1", name: "Apollo Hospitals, Greams Road", distance: "2.1 km", phone: "+91 44 2829 3333" },
  { id: "h2", name: "MIOT International", distance: "4.6 km", phone: "+91 44 4200 2288" },
  { id: "h3", name: "Government General Hospital", distance: "6.0 km", phone: "+91 44 2530 5000" },
];

export const emergencyAlerts = [];
export function logEmergencyAlert(userId) {
  const alert = { id: `E-${Date.now()}`, userId, at: new Date().toISOString() };
  emergencyAlerts.push(alert);
  return alert;
}
