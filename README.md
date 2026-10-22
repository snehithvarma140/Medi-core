# 🏥 Medi — Smart Healthcare & Hospital Management Platform

<p align="center">
  <strong>A unified digital healthcare platform connecting patients, doctors, hospitals, and emergency response teams.</strong>
</p>

<p align="center">
  <a href="YOUR_LIVE_DEMO_URL">🌐 https://remix-medi-hospital-personal-healthcare-plat-r6bz-708162273988.asia-south1.run.app </a> •
</p>

---

## 📌 Overview

**Medi** is a smart healthcare and hospital management platform designed to bring essential patient health information and hospital workflows together in one digital environment.

Traditional healthcare systems can make it difficult to access medical history, track prescriptions, coordinate appointments, and retrieve critical patient information during emergencies. Medi aims to address these challenges through a unified platform that supports patients, healthcare professionals, hospital administrators, and emergency response staff.

The platform provides a centralized interface for viewing patient information, monitoring health metrics, managing prescriptions and appointments, and coordinating healthcare activities.

## 🎯 Objectives

- Digitize and organize patient health information.
- Make medical history and prescription information easier to access.
- Improve coordination between patients, doctors, and hospitals.
- Support emergency staff with access to essential patient information.
- Provide health monitoring dashboards for better visibility into patient status.
- Maintain audit-log functionality to support transparency and traceability.

## ✨ Key Features

### 👤 Patient Portal

- Personalized patient dashboard.
- Patient identification through a unique Medi ID.
- Access to patient details and medical history.
- Health metrics, including heart rate, blood pressure, oxygen saturation, and body temperature.
- Prescription and medication schedule tracking.
- Appointment booking and appointment status management.
- Hospital and healthcare facility information.
- Notifications and medication adherence tracking.

### 🩺 Doctor Portal

- Dedicated interface for healthcare professionals.
- Access to the doctor-specific portal within the application.
- Support for healthcare workflows involving patient information and prescriptions.

### 🏥 Hospital Administration

- Dedicated hospital management interface.
- Patient admission and discharge workflow support.
- Ward and bed status management.
- Hospital facilities and resource information.

### 🚨 Emergency Response Portal

- Dedicated interface for emergency response staff.
- Emergency patient intake workflow.
- Patient identification and emergency record linking.
- Support for retrieving relevant patient information during emergency workflows.

### 📊 Health Monitoring

- Visual presentation of patient vital signs.
- Health status dashboard.
- ECG-style visual representation.
- Real-time telemetry interface with Firebase Firestore integration.

### 🔎 Search and Audit Logs

- Global search interface for navigating healthcare information.
- Audit ledger interface for reviewing recorded audit information.

### ☁️ Cloud and Data Integration

- Firebase integration for Firestore-based data operations.
- Supabase integration for synchronizing supported healthcare records.
- Google Gemini API integration capability for AI-powered functionality.

*Feature availability and integrations depend on the application's configuration and connected services.*

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| UI Icons | Lucide React |
| Animations | Motion |
| Cloud Database | Firebase Firestore |
| Additional Data Integration | Supabase |
| AI Integration | Google Gemini API |
| Supporting Libraries | Express.js, dotenv |
| Package Manager | npm or Bun |

## 🏗️ Project Structure

```text
Medi/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication interface
│   │   ├── common/        # Shared UI components
│   │   ├── patient/       # Patient dashboard and views
│   │   ├── doctor/        # Doctor portal
│   │   ├── hospital/      # Hospital administration
│   │   └── emergency/     # Emergency response portal
│   ├── context/
│   │   └── HealthcareContext.tsx
│   ├── firebase/          # Firebase configuration
│   ├── supabase/          # Supabase integration
│   ├── types/             # Healthcare TypeScript types
│   ├── App.tsx            # Main application
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

*The directory structure above is a template. Update it to match your actual project files.*

## 🚀 Getting Started

Follow these steps to run Medi on your local machine.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) — a version compatible with the project dependencies.
- npm, included with Node.js, or [Bun](https://bun.sh/).
- Git.
- Firebase and Supabase projects if you want to configure the corresponding cloud integrations.
- A Google Gemini API key if you intend to use Gemini-powered functionality.

### 1. Clone the repository

Replace the URL with your own GitHub repository URL.

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_REPOSITORY_NAME
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

Alternatively, using Bun:

```bash
bun install
```

### 3. Configure environment variables

Create a local `.env` file using the supplied template:

```bash
cp .env.example .env
```

On Windows Command Prompt:

```cmd
copy .env.example .env
```

Configure the required values in `.env` according to your project's setup.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace all placeholder values with your own configuration. Configure Firebase in the appropriate project files if Firebase integration is enabled.

**Security note:** Never commit real API keys, service credentials, or private environment files to GitHub. Variables prefixed with `VITE_` are exposed to client-side code and must not contain private service-role keys.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

### 5. Build for production

```bash
npm run build
```

The optimized production build is generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

### 6. Check TypeScript and code quality

Run the appropriate validation command configured in your `package.json`.

For example:

```bash
npm run lint
```

*Make sure the command exists in your project scripts before running it.*

## 🔐 Security and Privacy

Healthcare applications handle sensitive information and require careful security practices.

A production deployment should ensure:

- Strong authentication and authorization for every user role.
- Server-side enforcement of access permissions.
- Properly configured Firebase Security Rules and Supabase Row Level Security policies.
- Secure API key management and HTTPS.
- Appropriate audit logging and monitoring.
- Compliance with applicable healthcare data protection and privacy requirements.
- Protection of patient information during storage, transmission, and emergency access.

Do not use real patient data in a demonstration environment unless the necessary security, privacy, and authorization safeguards have been verified.

## 🌐 Live Demo

Explore the deployed application:

** https://remix-medi-hospital-personal-healthcare-plat-r6bz-708162273988.asia-south1.run.app **

*Replace the placeholder with your own deployed application URL. If the project is not deployed yet, you can remove this section until a live demo is available.*

## 🗺️ Future Enhancements

Potential improvements include:

- AI-assisted summaries of medical history.
- Secure patient identity verification and emergency medical information access.
- Enhanced appointment scheduling and reminders.
- Improved interoperability with healthcare data standards.
- Advanced analytics and health trend visualization.
- Mobile-friendly and progressive web application support.
- Expanded automated testing and deployment pipelines.
- Stronger role-based access controls and security auditing.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the changes locally.
5. Submit a pull request describing the improvement.

For major changes, open an issue first to discuss the proposed implementation.

## ⚕️ Disclaimer

Medi is a healthcare software project intended for educational, demonstration, and development purposes.

It is not a substitute for professional medical advice, diagnosis, monitoring, or treatment. The application has not been established as a clinically validated medical device. Displayed health values and sample records must not be treated as verified clinical information.

Any real-world healthcare deployment requires appropriate clinical validation, security testing, privacy safeguards, and regulatory review.

## 👨‍💻 Author

**Snehith Varma**

- Project: https://remix-medi-hospital-personal-healthcare-plat-r6bz-708162273988.asia-south1.run.app

---

<p align="center">
  <strong>Built to make healthcare information more accessible, connected, and organized. ❤️</strong>
</p>
