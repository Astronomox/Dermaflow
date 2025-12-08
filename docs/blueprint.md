# **App Name**: Dermaflow AI

## Core Features:

- Cool Dashboard and Landing Page: Visually appealing and user-friendly dashboard and landing page to welcome and engage users.
- Skin Lesion Analysis: Analyze uploaded or captured skin lesion images using an on-device TensorFlow Lite model to detect potential melanoma, basal cell carcinoma, or benign conditions. Includes confidence score.
- Explainable AI with Grad-CAM: Generate a heatmap overlay on the skin lesion image to visualize the areas influencing the AI's prediction.
- Polyglot Interface with Voice Readouts: Automatic translation of the app's interface and AI results into 50+ languages, including voice readouts for diagnoses, risk levels, and recommended actions. Store audio packs for offline use.
- Personalized Recommendation Engine: Generate personalized hygiene tips, dietary advice, sun protection planner based on user's skin condition and provide safe, affordable skincare recommendations.
- Onco-Connect Triage System: Generate a Digital Referral Card (DRC) containing a QR code, original lesion image, AI probability score, and patient lesion history. Use Google Maps API integration to show nearest verified oncology centers.
- Diagnostic Questionnaire: Incorporate a questionnaire assessing lesion characteristics (duration, bleeding, itching, etc.) to refine risk assessment.
- Integrated Bio-LLM Tool: Embed a medical-domain trained Bio-LLM tool for medical question answering, symptom explanations and dermatology counseling, providing a step-by-step urgency roadmap to the user. LLM results should be medically verified and always cite the medical guidelines to maintain user safety. Always suggest users seek in person consult if uncertain
- Data persistence: Store the users' images, results and triage history in Firestore, using the provided API

## Style Guidelines:

- Primary color: A calm blue (#42A5F5), associated with trust, health, and technology, will be the core of the palette. Blue also offers strong accessibility due to high color contrast, necessary in the targeted use-case.
- Background color: A very light gray (#F0F4F7), will create a clean, modern interface and offer the best readability.
- Accent color: A warm orange (#FFAB40), will be used for calls to action and elements needing emphasis, creating a welcoming feel.
- Headline font: 'Space Grotesk', sans-serif, offering a futuristic yet clear typeface, will give a technological feel that also offers excellent readability.
- Body font: 'Inter', sans-serif, provides clarity for medical information and broad language support, optimizing for a global user base.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use simple, clean icons to represent different skin conditions and features.
- Maintain a clear, user-friendly layout for ease of navigation, ensuring quick access to skin analysis and resources. Optimize for one-handed mobile use.
- Incorporate subtle animations for user feedback and loading states to enhance the overall experience, especially during AI analysis and data fetching.