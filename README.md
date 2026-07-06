# Dermaflow AI

**AI-powered skin health diagnostics for people who cannot afford to guess.**

In Nigeria, dermatologist visits are expensive and often inaccessible. Most people live with skin conditions they do not understand, hoping they will resolve on their own. Dermaflow puts clinical-grade skin analysis in your hands: upload a photo, get an answer, understand why, and know what to do next.

Live: [dermaflow-zeta.vercel.app](https://dermaflow-zeta.vercel.app)

---

## Origin

Dermaflow started as the technical foundation for a team entry at the Futurise Hackathon 2024, where the project placed **top 10 out of 100+ teams and 400+ participants**. After the hackathon, it was rebuilt from scratch as a full production platform with explainability, triage, and a medical AI assistant.

---

## What it does

### Skin analysis with explainable AI
Upload a photo of any skin concern. Dermaflow sends the image to Gemini 2.5 Flash via a Genkit flow, which identifies the condition (Benign Nevus, Melanoma, Basal Cell Carcinoma, etc.) and returns a confidence score. The model also returns a bounding box for the primary lesion.

The bounding box is used to generate a heatmap overlay: an SVG rendered server-side that draws a red highlight and a blurred radial glow over the exact area the model flagged. The user does not just see a result — they see *why* the AI flagged it. This is the explainability layer.

### Refined risk assessment
After the initial analysis, the user answers a short questionnaire: how long has the lesion been present, does it bleed or itch, has it changed color or size. A second Genkit flow feeds both the initial assessment and the questionnaire responses to Gemini, which produces a refined assessment and a rationale explaining how each symptom influenced the conclusion.

### Bio-LLM medical chatbot
A conversational AI assistant trained on dermatological knowledge. Users ask questions about their condition, symptoms, or treatment options in plain language. The assistant maintains conversation history and responds with cited medical information plus a recommendation on whether to seek in-person consultation. Supports multiple languages via a language context system.

### Onco-Connect triage
If the analysis suggests something requiring professional attention, Onco-Connect generates a printable digital referral card and surfaces verified dermatology and oncology centers near the user. Location is resolved via a geocode API route. Distance and wait time are shown per center. The user can download or print the referral card directly.

### UV risk monitor
Real-time UV index and melanoma risk assessment for the user's location. Fetches live weather data via an API route backed by Open-Meteo: temperature, humidity, wind speed, UV index, UV level, safe exposure time, and a melanoma risk flag (low / moderate / high). Designed specifically for West African sun conditions.

### Digital twin and genetic risk
Dashboard sections for tracking skin health over time and surfacing genetic risk factors based on user-provided history.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js, React, TypeScript |
| AI/ML | Google Gemini 2.5 Flash via Genkit (`@genkit-ai/google-genai`) |
| AI orchestration | Genkit flows with Zod schema validation |
| Auth and database | Firebase Auth, Firestore |
| Charts | Recharts |
| UI components | Radix UI, shadcn/ui, Tailwind CSS |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Project structure

```
src/
  ai/
    flows/
      explainable-ai.ts          Image analysis + heatmap generation
      refine-risk-assessment.ts  Questionnaire-based risk refinement
      medical-question-answering.ts  Bio-LLM chatbot with history
      personalized-hygiene-tips.ts   Custom care plan generation
      text-to-speech.ts          Voice output for accessibility
    genkit.ts                    Genkit + Gemini configuration

  app/
    api/
      geocode/route.ts           Location resolution
      weather/route.ts           UV index + weather data (Open-Meteo)
    dashboard/
      analysis/                  Main scan upload + heatmap display
      ask-ai/                    Bio-LLM chatbot interface
      triage/                    Onco-Connect center finder + referral card
      uv-risk/                   Real-time UV and melanoma risk monitor
      recommendations/           Personalized care plans
      digital-twin/              Skin health tracking over time
      genetic-risk/              Genetic risk factor input
      tele-derm/                 Telemedicine connection
```

---

## How the heatmap works

1. User uploads an image as a base64 data URI
2. Gemini receives the image and returns: condition name, confidence score, and a bounding box `[ymin, xmin, ymax, xmax]` where values are 0-1000
3. The server constructs an SVG that composites the original image with:
   - A semi-transparent red rectangle over the bounding box
   - A blurred radial ellipse for the heat glow effect
   - Rounded corners and stroke for visual clarity
4. The SVG is base64-encoded and returned as a data URI
5. The client renders it as an `<img>` overlay on the original photo

The entire heatmap is generated server-side without any canvas or browser API dependency.

---

## Running locally

```bash
git clone https://github.com/Astronomox/Dermaflow.git
cd Dermaflow
pnpm install
```

Create `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GEMINI_API_KEY=
```

```bash
pnpm dev
```

---

## Disclaimer

Dermaflow is for informational purposes only. It is not a substitute for professional medical diagnosis or treatment. Always consult a qualified healthcare provider for any serious skin concern.

---

Built by [Abdullahi Oriola](https://abdullahioriola.vercel.app) — Data Science student, UNILAG. Lagos, Nigeria.