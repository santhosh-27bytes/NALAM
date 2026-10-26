# NALAM — Healthcare Management System

**NALAM** is a web-based healthcare management platform designed to bring essential healthcare services together in one place. It provides a centralized interface for managing patient profiles, doctor appointments, prescriptions, medical reports, medicine verification, and AI-powered healthcare assistance.

The platform also includes digital hospital queue management to help patients monitor their queue status and allow healthcare staff to manage patient flow.

NALAM aims to make healthcare management simpler, more accessible, and more convenient through technology.

## Live Demo

**Live Demo:** https://nalam-z6uo.onrender.com/

**GitHub Repository:** https://github.com/santhosh-27bytes/NALAM

> **Note:** NALAM is a demonstration prototype. Avoid entering real patient information or relying on it for medical decisions.

## Features

### 1. Patient Management

* Patient registration and login.
* Patient profile management.
* Personal health information management.
* Emergency contact management.
* Notification preference settings.

### 2. Doctor Appointment Management

* Browse available doctors.
* Search doctors by name or specialization.
* View doctor availability and appointment slots.
* Book appointments.
* Cancel or reschedule appointments.
* View appointment status and details.

### 3. Medicine Verification

* Check prescribed and pharmacy medicine information.
* Scan medicine packaging using an image.
* Use AI-powered image analysis to help identify medicine names and strengths.
* Provide medicine-related information through the verification interface.

**Important:** AI-based medicine identification may be inaccurate. Always verify medicines with a qualified pharmacist or healthcare professional before taking them. NALAM does not replace professional medical advice.

### 4. Prescriptions and Medical Reports

* View prescription information.
* Access medical report information.
* Review available patient health records.
* Keep healthcare information organized within the application.

### 5. NALAM AI Assistant

* AI-powered conversational healthcare assistance.
* Answers general healthcare organization questions.
* Helps users understand available appointment and queue information.
* Provides assistance related to prescriptions, allergies, and patient records.
* Supports Google Gemini and Anthropic API integration.
* Allows API key configuration through the application settings or backend environment.

**Important:** AI-generated responses may be inaccurate. The assistant does not replace a doctor, diagnose medical conditions, or determine medication changes.

### 6. Digital Hospital Queue Management

* Generate digital queue numbers for appointments.
* Check in to the hospital queue.
* View queue position and patients ahead.
* Display estimated waiting time.
* Monitor queue status through automatic updates.
* Provide a separate dashboard for hospital staff.
* Manage patient queue states, including waiting, called, in consultation, completed, and skipped.

### 7. Doctor Portal

* Dedicated doctor login interface.
* Access doctor-specific appointment information.
* View patient queue information.
* Monitor appointments and consultation status.

### 8. User-Friendly Interface

* Clean healthcare-focused interface.
* Separate patient, doctor, and staff views.
* Interactive navigation and dashboard components.
* Responsive styling for supported screen sizes.
* Voice input and speech assistance where supported by the browser.

## Technology Stack

| Component         | Technologies                              |
| ----------------- | ----------------------------------------- |
| Frontend          | HTML5, CSS3, JavaScript                   |
| Backend           | Node.js, Express.js                       |
| API Communication | REST API                                  |
| AI Integration    | Google Gemini API, Anthropic API          |
| Authentication    | Password hashing and token-based sessions |
| Data Management   | In-memory JavaScript data store           |
| Configuration     | Environment variables with dotenv         |
| Development Tools | npm, Git, GitHub                          |

## Project Structure

```text
NALAM/
│
├── backend/
│   ├── .env.example
│   ├── data.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── doctor.html
│   ├── doctor.js
│   ├── staff.html
│   ├── staff.js
│   ├── staff.css
│   └── ...
│
├── .gitignore
└── README.md
```

## Getting Started

Follow these instructions to run NALAM on your local machine.

### Prerequisites

Install the following tools:

* Node.js
* npm, included with Node.js
* A modern web browser
* An AI API key if you want to use the external AI-powered features

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/santhosh-27bytes/NALAM.git
```

Navigate to the project directory:

```bash
cd NALAM
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install the required dependencies:

```bash
npm install
```

Create your local environment file.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS or Linux:**

```bash
cp .env.example .env
```

Open the newly created `.env` file and configure the environment variables:

```env
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Replace the placeholders with your own API keys when needed.

API keys can be obtained from:

* Google AI Studio: https://aistudio.google.com/
* Anthropic Console: https://console.anthropic.com/

**Security:** Never upload your real `.env` file or expose your API keys in frontend JavaScript or a public repository.

### 3. Start the Application

While inside the `backend` directory, run:

```bash
npm start
```

The backend starts on:

```text
http://localhost:4000
```

The Express server also serves the frontend files, so you can access the application directly through the backend.

Open the following address in your browser:

http://localhost:4000

### 4. Access the Doctor and Staff Interfaces

**Doctor Interface:**

http://localhost:4000/doctor.html

**Staff Dashboard:**

http://localhost:4000/staff.html

These interfaces communicate with the backend to access their respective appointment and queue information.

## Demo Login Credentials

The application includes preconfigured demonstration accounts for testing.

### Patient Account

| Field    | Value               |
| -------- | ------------------- |
| Email    | `meena@example.com` |
| Password | `password123`       |

### Doctor Accounts

| Doctor             | Email                  | Password    |
| ------------------ | ---------------------- | ----------- |
| Dr. Arvind Kumar   | `arvind@nalam.health`  | `doctor123` |
| Dr. Priya Sundaram | `priya@nalam.health`   | `doctor123` |
| Dr. Rohan Mehta    | `rohan@nalam.health`   | `doctor123` |
| Dr. Lakshmi Iyer   | `lakshmi@nalam.health` | `doctor123` |

These credentials are intended exclusively for local demonstration and testing.

**Do not use these credentials for real accounts or store real patient information in the demonstration application.**

## AI API Configuration

NALAM supports AI integration through Google Gemini and Anthropic.

To configure AI access:

1. Obtain an API key from your chosen provider.
2. Open the application and sign in.
3. Navigate to **Profile → AI Assistant Settings**, where available.
4. Enter the API key and save the configuration.

Alternatively, configure the appropriate API key in the backend `.env` file and restart the backend.

The backend handles AI requests so that API keys do not need to be embedded in the frontend source code.

Some basic assistant responses may work without an external API key. AI-generated responses and image analysis require the relevant provider configuration.

## Data Storage

The current implementation uses an **in-memory JavaScript data store** defined in `backend/data.js`.

This allows the application to demonstrate patient management, appointments, prescriptions, reports, and queue functionality without requiring an external database.

However, data stored only in memory is not persistent. Changes may be lost when the backend restarts.

A persistent database should be integrated before using the application for long-term record management.

## Security Considerations

Security is important when developing healthcare applications.

The current implementation includes password hashing and token-based session handling. However, it remains a development prototype and requires additional security improvements before production use.

Recommended improvements include:

* Persistent and secure session management.
* Token expiration and revocation.
* Role-based authorization for all protected operations.
* Request validation and rate limiting.
* Secure HTTPS deployment.
* Persistent database integration.
* Improved access controls for medical records.
* Secure handling of sensitive healthcare information.
* Production-ready authentication and recovery mechanisms.

Never commit API keys, passwords, or other private credentials to GitHub.

## Current Limitations

NALAM is a working development prototype rather than a production-ready healthcare system.

Current limitations include:

* Application data is stored in memory rather than a persistent database.
* Data may reset when the backend restarts.
* Authentication requires additional hardening for production use.
* External AI features depend on valid API configuration and network availability.
* AI-based medicine identification may produce incorrect results.
* Medical information and AI responses require professional verification.
* The application has not been validated for clinical use.

**Do not use this prototype to make medical decisions or manage real patient records.**

## Future Enhancements

Potential improvements include:

* Integration with a persistent database such as PostgreSQL or MongoDB.
* Enhanced patient and doctor dashboards.
* More comprehensive role-based access control.
* Secure medical document storage.
* Appointment and medication reminders through configured notification services.
* Multilingual interface improvements.
* Improved accessibility and voice interaction.
* Automated testing and error handling.
* Production deployment with HTTPS and secure configuration.
* Better reporting and healthcare analytics.

## Contributing

Suggestions and contributions are welcome.

1. Fork the repository.
2. Create a new branch for your changes.
3. Implement and test your improvements.
4. Commit your changes with a descriptive message.
5. Submit a pull request.

## License

No license has been specified for this repository yet.

Until a license is added, users should not assume that they have permission to redistribute or reuse the project.

## Project Information

**Project Name:** NALAM — Healthcare Management System

**Live Demo:** https://nalam-z6uo.onrender.com/

**GitHub Repository:** https://github.com/santhosh-27bytes/NALAM

Developed to explore how web technologies and AI integration can help simplify healthcare management.

*Making healthcare management simpler through technology.* 🩺
