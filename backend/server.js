import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import {
  patient, doctors, appointments, addAppointment, cancelAppointment, rescheduleAppointment,
  prescriptions, reports, medicineDb,
  users, findUserByEmailOrPhone, createUser, checkPassword, generateOtp, verifyOtp,
  createSession, getUserFromToken, setRuntimeApiKey, hasApiKey, getActiveApiKey,
  getNotifications, hospitals, logEmergencyAlert,
  getDoctorQueueCount, getNextQueueNumberForDoctor, getDoctorQueue, getSlotQueueInfo,
  assignAppointmentQueue, computeQueueStatus, checkinToQueue, queueForDoctor,
  queueStatusForEntry, findQueueEntryByAppointment, setQueueStatus, getDoctorAppointments,
} from "./data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" })); // medicine photos can be a few MB
app.use(express.static(path.join(__dirname, "../frontend")));

const PORT = process.env.PORT || 4000;

/* ---------------- Auth middleware ---------------- */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const user = token && getUserFromToken(token);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  req.user = user;
  next();
}

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    verified: u.verified,
    role: u.role || "patient",
    doctorId: u.doctorId || null,
  };
}

/* ---------------- Auth routes ---------------- */
// Register — creates an unverified user and returns an OTP.
// NOTE: in production the OTP goes out over SMS/email; here it's returned
// directly in the response so you can test the flow without an SMS provider.
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "name, email, phone, and password are required" });
  }
  if (findUserByEmailOrPhone(email) || findUserByEmailOrPhone(phone)) {
    return res.status(409).json({ error: "An account with that email or phone already exists" });
  }
  const user = createUser({ name, email, phone, password });
  const otp = generateOtp(user.id);
  res.status(201).json({ userId: user.id, otp, message: "Enter the OTP to verify your account (demo mode: OTP shown directly, not sent by SMS)." });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { userId, otp } = req.body;
  const ok = verifyOtp(userId, otp);
  if (!ok) return res.status(400).json({ error: "Invalid or expired OTP" });
  const token = createSession(userId);
  const user = users.find((u) => u.id === userId);
  res.json({ token, user: publicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  const user = findUserByEmailOrPhone(identifier || "");
  if (!user || !checkPassword(user, password)) {
    return res.status(401).json({ error: "Incorrect email/phone or password" });
  }
  if (!user.verified) return res.status(403).json({ error: "Account not verified. Please complete OTP verification." });
  const token = createSession(user.id);
  res.json({ token, user: publicUser(user) });
});

app.get("/api/auth/me", requireAuth, (req, res) => res.json(publicUser(req.user)));

/* ---------------- Patient ---------------- */
app.get("/api/patient", (req, res) => res.json(patient));

app.patch("/api/patient", requireAuth, (req, res) => {
  const { name, age, bloodGroup, allergies, conditions, language } = req.body;
  if (name !== undefined) patient.name = name;
  if (age !== undefined) patient.age = age;
  if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
  if (allergies !== undefined) patient.allergies = allergies;
  if (conditions !== undefined) patient.conditions = conditions;
  if (language !== undefined) patient.language = language;
  res.json(patient);
});

app.patch("/api/patient/emergency-contact", requireAuth, (req, res) => {
  const { name, phone } = req.body;
  patient.emergencyContact = { name, phone };
  res.json(patient);
});

app.patch("/api/patient/notifications", requireAuth, (req, res) => {
  patient.notificationPrefs = { ...patient.notificationPrefs, ...req.body };
  res.json(patient);
});

/* ---------------- AI settings ---------------- */
app.get("/api/settings/api-key", requireAuth, (req, res) => res.json({ hasKey: hasApiKey() }));

app.post("/api/settings/api-key", requireAuth, (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || apiKey.trim().length < 10) return res.status(400).json({ error: "That doesn't look like a valid API key" });
  setRuntimeApiKey(apiKey.trim());
  res.json({ hasKey: true });
});

/* ---------------- Doctors ---------------- */
function enrichDoctor(d) {
  return {
    ...d,
    queueCount: getDoctorQueueCount(d.id),
    nextQueueNumber: getNextQueueNumberForDoctor(d.id),
  };
}

app.get("/api/doctors", (req, res) => {
  const { spec, q } = req.query;
  let list = doctors;
  if (spec && spec !== "All") list = list.filter((d) => d.spec === spec);
  if (q) {
    const query = q.toLowerCase();
    list = list.filter((d) => d.name.toLowerCase().includes(query) || d.spec.toLowerCase().includes(query));
  }
  res.json(list.map(enrichDoctor));
});

app.get("/api/doctors/:id", (req, res) => {
  const d = doctors.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "Doctor not found" });
  res.json(enrichDoctor(d));
});

app.get("/api/doctors/:id/slots", (req, res) => {
  const d = doctors.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "Doctor not found" });
  const date = req.query.date;
  res.json(getSlotQueueInfo(d.id, date));
});

app.get("/api/doctors/:id/queue", (req, res) => {
  const d = doctors.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "Doctor not found" });
  res.json(getDoctorQueue(d.id));
});

/* ---------------- Doctor Portal Routes ---------------- */
app.get("/api/doctor/me", requireAuth, (req, res) => {
  if (req.user.role !== "doctor" || !req.user.doctorId) {
    return res.status(403).json({ error: "Access denied. Doctor account required." });
  }
  const doctor = doctors.find((d) => d.id === req.user.doctorId);
  if (!doctor) return res.status(404).json({ error: "Doctor profile not found" });
  const enriched = enrichDoctor(doctor);
  const queueData = getDoctorQueue(doctor.id);
  const appts = getDoctorAppointments(doctor.id);
  res.json({
    user: publicUser(req.user),
    doctor: enriched,
    queue: queueData,
    appointments: appts,
  });
});

app.get("/api/doctor/:id/appointments", (req, res) => {
  const d = doctors.find((x) => x.id === req.params.id);
  if (!d) return res.status(404).json({ error: "Doctor not found" });
  res.json(getDoctorAppointments(d.id));
});

/* ---------------- Appointments ---------------- */
app.get("/api/appointments", (req, res) => {
  res.json(appointments.map(computeQueueStatus));
});

app.post("/api/appointments", (req, res) => {
  const { doctorId, date, time, type, reason } = req.body;
  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) return res.status(400).json({ error: "Unknown doctor" });
  if (!date || !time) return res.status(400).json({ error: "date and time are required" });

  const qInfo = assignAppointmentQueue(doctorId, date, time);
  const id = `A-${1000 + Math.floor(Math.random() * 9000)}`;
  const appt = {
    id,
    patientName: req.body.patientName || (req.user && req.user.name) || "Meena Raghavan",
    doctorId,
    doctor: doctor.name,
    spec: doctor.spec,
    date,
    time,
    type: type || (doctor.types && doctor.types[0]) || "In-person",
    status: "Upcoming",
    hospital: doctor.hospital,
    reason: reason || "",
    queueNumber: qInfo.queueNumber,
    queueStatus: "Waiting",
    patientsAhead: qInfo.patientsAhead,
    estimatedWaitingMinutes: qInfo.estimatedWaitingMinutes,
  };
  const created = addAppointment(appt);
  res.status(201).json(created);
});

app.post("/api/appointments/:id/cancel", (req, res) => {
  const appt = cancelAppointment(req.params.id);
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  res.json(appt);
});

app.patch("/api/appointments/:id/reschedule", (req, res) => {
  const { date, time } = req.body;
  const appt = rescheduleAppointment(req.params.id, date, time);
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  res.json(appt);
});

/* ---------------- Staff Queue Management ---------------- */
app.post("/api/queue/checkin", (req, res) => {
  const { appointmentId } = req.body;
  const entry = checkinToQueue(appointmentId);
  if (!entry) return res.status(404).json({ error: "Appointment not found" });
  res.status(201).json(queueStatusForEntry(entry.id));
});

app.get("/api/queue/status/:appointmentId", (req, res) => {
  const entry = findQueueEntryByAppointment(req.params.appointmentId);
  if (!entry) return res.status(404).json({ error: "Not checked in yet" });
  res.json(queueStatusForEntry(entry.id));
});

app.get("/api/queue/doctor/:doctorId", (req, res) => {
  res.json(queueForDoctor(req.params.doctorId));
});

app.post("/api/queue/:id/call", (req, res) => {
  const entry = setQueueStatus(req.params.id, "called");
  if (!entry) return res.status(404).json({ error: "Queue entry not found" });
  res.json(entry);
});

app.post("/api/queue/:id/start", (req, res) => {
  const entry = setQueueStatus(req.params.id, "in-consultation");
  if (!entry) return res.status(404).json({ error: "Queue entry not found" });
  res.json(entry);
});

app.post("/api/queue/:id/complete", (req, res) => {
  const entry = setQueueStatus(req.params.id, "completed");
  if (!entry) return res.status(404).json({ error: "Queue entry not found" });
  res.json(entry);
});

app.post("/api/queue/:id/skip", (req, res) => {
  const entry = setQueueStatus(req.params.id, "skipped");
  if (!entry) return res.status(404).json({ error: "Queue entry not found" });
  res.json(entry);
});

/* ---------------- Records ---------------- */
app.get("/api/prescriptions", (req, res) => res.json(prescriptions));
app.get("/api/reports", (req, res) => res.json(reports));

/* ---------------- Medicine verification ---------------- */
app.post("/api/medicine-check", (req, res) => {
  const { prescribed, pharmacy } = req.body;
  const a = medicineDb[(prescribed || "").trim().toLowerCase()];
  const b = medicineDb[(pharmacy || "").trim().toLowerCase()];

  if (!a || !b) {
    return res.json({
      verdict: "unknown",
      message:
        "One of these medicines isn't in the reference database yet. Try: Paracetamol 500, Dolo 650, Crocin 500, Metformin 500, Glycomet 500, Amlodipine 5, Amlopres 5.",
    });
  }

  let verdict;
  if (a.generic === b.generic && a.strength === b.strength && a.form === b.form) {
    verdict = "equivalent";
  } else if (a.generic !== b.generic) {
    verdict = "different";
  } else {
    verdict = "check";
  }

  const messages = {
    equivalent: "Both medicines share the same active ingredient, strength, and form.",
    different: "These medicines have different active ingredients or strengths — do not treat them as interchangeable.",
    check: "Same active ingredient but the strength or form differs. Confirm the correct dose with your doctor or pharmacist before taking it.",
  };

  res.json({ verdict, message: messages[verdict], prescribedInfo: a, pharmacyInfo: b });
});

/* ---------------- Medicine OCR (photo -> name + strength) ---------------- */
app.post("/api/ocr/medicine", async (req, res) => {
  const { imageBase64, mediaType } = req.body;
  if (!imageBase64 || !mediaType) return res.status(400).json({ error: "imageBase64 and mediaType are required" });

  const apiKey = getActiveApiKey();
  if (!apiKey || apiKey === "your_key_here") {
    // Demo mode: no key configured, return a sample scan result
    return res.json({ name: "Dolo 650", strength: "650 mg", confidence: "high", demo: true });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
              {
                type: "text",
                text: "This is a photo of a medicine package, strip, or label. Read the medicine name and strength printed on it. Respond with ONLY a JSON object, no other text, no markdown fences, in this exact shape: {\"name\": string or null, \"strength\": string or null, \"confidence\": \"high\" or \"low\"}. If you cannot clearly read a medicine name, set name to null. Strength should be like \"500 mg\" if visible, otherwise null.",
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message || "The AI service rejected the request — check your API key." });

    const textBlock = (data.content || []).find((c) => c.type === "text");
    const raw = textBlock?.text?.trim() || "";
    const cleaned = raw.replace(/^```json\s*|```$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.json({ name: null, strength: null, confidence: "low", raw });
    }
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reach the AI service for OCR." });
  }
});

/* ---------------- Notifications ---------------- */
app.get("/api/notifications", (req, res) => res.json(getNotifications()));

/* ---------------- Emergency ---------------- */
app.get("/api/hospitals", (req, res) => res.json(hospitals));

app.post("/api/emergency/alert", requireAuth, (req, res) => {
  const alert = logEmergencyAlert(req.user.id);
  res.status(201).json({ ...alert, message: "Emergency alert logged. In a real deployment this would dial local emergency services." });
});

/* ---------------- Instant local answers (no API call) ---------------- */
// Answers from the patient's own appointments, prescriptions and reports.
// Returns null when the question isn't recognised, so the caller can fall back to the AI.
function localAssistantReply(messages) {
  const last = (messages || []).slice(-1)[0] || {};
  const q = String(last.text || last.content || "").toLowerCase().trim();
  if (!q) return null;
  const has = (...w) => w.some((x) => new RegExp("\\b" + x).test(q));

  const mine = appointments.filter((a) => a.patientName === patient.name);
  const upcoming = mine.filter((a) => !["Completed", "Cancelled"].includes(a.status));
  const past = mine.filter((a) => a.status === "Completed");
  const meds = prescriptions.flatMap((rx) => rx.medicines.map((m) => ({ ...m, rx })));
  const apptLine = (a) => {
    const qs = computeQueueStatus(a);
    return `${a.doctor} (${a.spec}) on ${a.date} at ${a.time}, ${String(a.type || "").toLowerCase()} at ${a.hospital}${a.reason ? ` for ${a.reason.toLowerCase()}` : ""}`;
  };

  if (/^(hi|hello|hey|namaste|vanakkam)\b/.test(q)) {
    const first = upcoming[0];
    return `Hello ${String(patient.name).split(" ")[0]}! ` + (first
      ? `You have an appointment with ${first.doctor} on ${first.date} at ${first.time}. Ask me about your queue, medicines or reports.`
      : "I can help with your appointments, medicines and reports.");
  }
  if (has("chest pain", "breath", "unconscious", "bleeding", "stroke", "emergency", "heart attack")) {
    return "That sounds serious. Please use the Emergency button in the app or call 108 right away. I'm not a doctor, so please don't wait.";
  }
  // A specific medicine from the prescription
  const med = meds.find((m) => q.includes(m.name.toLowerCase()));
  if (med) {
    return `${med.name} ${med.strength}: take it ${med.freq.toLowerCase()}, ${med.food.toLowerCase()}. It was prescribed by ${med.rx.doctor} on ${med.rx.date} for ${med.rx.diagnosis.toLowerCase()}. Please don't change the dose without asking your doctor.`;
  }
  // Allergy mention
  const allergy = patient.allergies.find((x) => q.includes(x.toLowerCase()));
  if (allergy || has("allerg")) {
    return `Your record lists an allergy to: ${patient.allergies.join(", ") || "nothing"}. Please remind every doctor and pharmacist, and don't take any medicine containing it.`;
  }
  if (has("queue", "wait", "token", "turn", "how long", "ahead", "my number")) {
    if (!upcoming.length) return "You don't have an upcoming appointment, so there's no queue for you right now. You can book one from the Doctors tab.";
    const a = upcoming[0];
    const qs = computeQueueStatus(a);
    return `Your token is #${qs.queueNumber} for ${a.doctor}. Right now #${qs.currentQueue} is being served, ${qs.patientsAhead} patient(s) are ahead of you, and the estimated wait is about ${qs.estimatedWaitingMinutes} minutes.`;
  }
  if (has("previous", "past", "history", "last visit", "completed")) {
    if (!past.length) return "I don't see any past appointments on your record.";
    return "Your past appointments: " + past.map((a) => `${a.doctor} on ${a.date}`).join("; ") + ".";
  }
  if (has("appointment", "appointments", "booking", "booked", "doctor", "visit", "schedule", "next")) {
    if (!upcoming.length) return "You have no upcoming appointments. Open the Doctors tab to book one.";
    const list = upcoming.map(apptLine).join("; ");
    return `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? "s" : ""}: ${list}. Your token is #${computeQueueStatus(upcoming[0]).queueNumber}. Please arrive 10 minutes early.`;
  }
  if (has("medicine", "medicines", "medication", "tablet", "tablets", "pill", "pills", "dose", "prescription", "prescriptions", "drug")) {
    if (!prescriptions.length) return "I don't see any prescriptions on your record yet.";
    return prescriptions.map((rx) =>
      `From ${rx.doctor} on ${rx.date} (${rx.diagnosis}): ` + rx.medicines.map((m) => `${m.name} ${m.strength}, ${m.freq.toLowerCase()}, ${m.food.toLowerCase()}`).join("; ")
    ).join(" | ") + ". Please follow exactly what your doctor wrote.";
  }
  if (has("report", "reports", "test", "lab", "blood", "ecg", "hba1c", "result")) {
    if (!reports.length) return "I don't see any reports on your record yet.";
    return "Your reports: " + reports.map((r) => `${r.type} on ${r.date} (${r.lab})`).join("; ") + ". You can open them from the Reports section.";
  }
  if (has("condition", "conditions", "diabetes", "diabetic", "sugar", "pressure", "bp", "hypertension")) {
    return `Your record lists: ${patient.conditions.join(", ") || "no conditions"}. Regular check-ups and taking your medicines on time help keep these under control.`;
  }
  if (has("fever", "pain", "headache", "cough", "cold", "vomit", "dizzy", "dizziness", "symptom", "sick", "unwell")) {
    return "I'm sorry you're not feeling well. I can't diagnose, but it's best to see a doctor. You can book one from the Doctors tab. If it gets worse suddenly, please seek urgent care.";
  }
  return null;
}

/* ---------------- NALAM AI assistant ---------------- */
app.post("/api/assistant", async (req, res) => {
  const { messages } = req.body;

  // 1) Answer instantly from the patient's own data when we can (no network call)
  const local = localAssistantReply(messages);
  if (local) return res.json({ reply: local });

  // 2) Otherwise use the AI if a key is configured; if not, give a helpful fallback
  const apiKey = getActiveApiKey();
  if (!apiKey || apiKey === "your_key_here") {
    return res.json({ reply: 'I can help with your appointments, queue status, medicines, allergies and reports. Try: "When is my appointment?" or "What medicines do I take?"' });
  }

  const apptsContext = appointments.filter((a) => a.patientName === patient.name).map((a) => {
    const q = computeQueueStatus(a);
    return `${a.doctor} (${a.spec}) on ${a.date} at ${a.time}, status ${a.status}, Queue #${q.queueNumber}, Current serving #${q.currentQueue}, ${q.patientsAhead} patients ahead, Estimated wait ${q.estimatedWaitingMinutes} mins`;
  }).join("; ");
  const context = `Patient: ${patient.name}, age ${patient.age}, conditions: ${patient.conditions.join(", ")}, allergies: ${patient.allergies.join(", ")}.
Appointments: ${apptsContext}.
Prescriptions: ${prescriptions.map((p) => `${p.date} by ${p.doctor} for ${p.diagnosis}: ${p.medicines.map((m) => `${m.name} ${m.strength} ${m.freq} ${m.food}`).join(", ")}`).join("; ")}.`;

  const systemPrompt = `You are NALAM AI, a warm, plain-language healthcare organization assistant inside the NALAM patient app. You are NOT a doctor and must never diagnose, change dosages, or tell a patient to stop or substitute medication. Use the patient's data below to answer specific questions concretely. For anything symptom-related or urgent, gently recommend seeing a doctor. Keep answers short (2-4 sentences), warm, and easy for an elderly patient to understand.\n\nPatient context:\n${context}`;

  // Check if key is Google Gemini (starts with AIza or GEMINI_API_KEY set)
  const isGemini = apiKey.startsWith("AIza") || Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

  if (isGemini) {
    try {
      const contents = (messages || []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text || m.content || "" }],
      }));

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        }),
      });

      const data = await response.json();
      if (data.error) {
        return res.status(500).json({ error: data.error.message || "Google Gemini API error — please check your Google API key." });
      }
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return res.json({ reply: reply?.trim() || "I couldn't quite process that — could you rephrase?" });
    } catch (err) {
      console.error("Gemini API error:", err);
      return res.status(500).json({ error: "Failed to reach Google Gemini AI service." });
    }
  }

  // Anthropic Claude fallback
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey.trim(),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message || "The AI service rejected the request — check your API key." });
    const textBlock = (data.content || []).find((c) => c.type === "text");
    res.json({ reply: textBlock?.text?.trim() || "I couldn't quite process that — could you rephrase?" });
  } catch (err) {
    console.error("Anthropic API error:", err);
    res.status(500).json({ error: "Failed to reach the AI service." });
  }
});

app.listen(PORT, () => console.log(`NALAM backend running on http://localhost:${PORT}`));
