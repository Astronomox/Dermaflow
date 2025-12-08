
# Dermaflow 🩺

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Dermaflow** is a modern dermatology and skincare platform designed to streamline patient records and skin analysis. Built with performance and scalability in mind, it leverages the power of Next.js 14 and Firebase to deliver a seamless, secure, and responsive user experience.

🔗 **Live Demo**: [https://dermaflow-zeta.vercel.app](https://dermaflow-zeta.vercel.app/)

---

## 🚀 Key Features

* **Modern Architecture**: Built on Next.js 14 App Router with Server Components for superior performance.
* **Secure Authentication**: Integrated Firebase Authentication for secure user management.
* **Responsive UI**: Mobile-first design using Tailwind CSS, ensuring accessibility across all devices.
* **Theme Support**: Built-in dark and light mode toggles for user preference.
* **SEO Optimized**: structured metadata implementation for better search visibility.

## 🛠️ Tech Stack

* **Framework**: Next.js 14
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Backend/Auth**: Firebase (Auth, Firestore, Storage)
* **Deployment**: Vercel

---

## 💻 Local Development Setup

Follow these steps to run Dermaflow on your local machine.

### Prerequisites
* Node.js (v18 or higher)
* npm, yarn, or pnpm

### 1. Installation

```bash
# Get the repository
git clone [https://github.com/Astronomox/Dermaflow.git](https://github.com/Astronomox/Dermaflow.git)

# Navigate to directory
cd Dermaflow

# Install dependencies
npm install
````

### 2\. Environment Configuration

Dermaflow requires Firebase configuration to function. Create a `.env.local` file in the root directory and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3\. Start the Server

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the application.

-----

## 📂 Project Structure

```bash
src/
├── app/                # App Router (Pages & Layouts)
│   ├── layout.tsx      # Root layout (Theme & Font providers)
│   └── page.tsx        # Dashboard / Landing page
├── components/         # Reusable UI components
├── lib/                # Firebase configuration & Helper functions
├── hooks/              # Custom React hooks
└── public/             # Static assets (Images, Icons)
```

## 🤝 Contributing

Contributions are always welcome to help improve Dermaflow.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

-----
**Built by [YASINLASISI](https://github.com/YASINLASISI)**

---------------------------------------------------------------------

**Re-built and Maintained by [Astronomox](https://www.google.com/search?q=https://github.com/Astronomox)**
