# Dermaflow AI — Skin Health for People Who Can't Afford to Guess

I built Dermaflow because in Nigeria, the sun is unforgiving and dermatologist visits are expensive. Most people just live with skin conditions they don't understand, hoping it goes away. I wanted to change that.

Dermaflow puts AI-powered skin analysis in your hands. Upload a photo, get answers.

## What It Does

**Instant Skin Analysis**
Upload a photo of any skin concern and get an AI-powered risk assessment in seconds — no appointment, no waiting room, no bill.

**Explainable AI (XAI)**
We don't just give you a result and leave you confused. Dermaflow shows you heatmap visualizations that highlight the exact areas of concern, so you understand *why* the AI flagged something. You're in control of your own health information.

**Personalized Care Plans**
Based on your analysis, you get custom hygiene tips, dietary recommendations, and product suggestions tailored to your specific skin — not generic advice copied from Google.

**Bio-LLM Chatbot**
Have questions? Ask our medical-trained AI assistant anything about your skin. It pulls from verified dermatological knowledge, not random forums.

**Onco-Connect Triage**
This is the feature I'm most proud of. If your analysis suggests something that needs professional attention, Onco-Connect generates a digital referral card and finds verified oncology centers near you. The goal is to bridge the gap between getting a result on your phone and actually getting real help.

## Tech Stack

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **AI/ML:** Google Gemini API
- **Auth & Database:** Firebase
- **Hosting:** Vercel

## Why I Built This

Skin cancer and serious skin conditions are underdiagnosed in West Africa. Not because people don't care, but because access is a barrier. I'm a CS student at UNILAG, not a doctor — but I know how to build tools. So I built one.

This project is not a finished product. It's a starting point. Feedback, contributions, and brutal honesty are all welcome.

## Live Demo

[dermaflow-zeta.vercel.app](https://dermaflow-zeta.vercel.app)

## Getting Started
```bash
git clone https://github.com/Astronomox/Dermaflow.git
cd Dermaflow
npm install
npm run dev
```

Create a `.env.local` file and add your keys:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_GEMINI_API_KEY=
```

## Disclaimer

Dermaflow is for informational purposes only. It is not a substitute for professional medical diagnosis or treatment. Always consult a qualified healthcare provider for serious concerns.

---

Built by [Astronomox](https://github.com/Astronomox) — A Data Science student who got tired of problems having no solutions.


