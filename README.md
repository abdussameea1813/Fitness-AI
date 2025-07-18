# 🏋️‍♂️ Fitness‑AI

AI-Powered Fitness Mentor — generate personalized workout & meal plans, track your goals, and optimize results with ease.

## 🚀 Features

- **Personalized Programs**: Answer a few simple questions, then let AI build your fitness & nutrition plan.
- **Interactive User Flow**: Guided multi-step form with slick animations & real-time data validation.
- **Profile & Plan Management**: View existing plans, switch between active ones, and review workouts/diets.
- **AI Backend Integration**: Powered by OpenAI / Gemini through Convex serverless functions.
- **Modern UI Stack**: Built with Next.js, ShadCN components, Tailwind CSS, Swiper.js, Clerk, and Framer Motion.

## 📦 Live Demo

View it in action at: `[Your Production URL here]`

---

## 🧰 Tech Stack

| Area            | Technology                           |
|----------------|--------------------------------------|
| Frontend       | React / Next.js (app directory)      |
| UI Components  | ShadCN-ui, Tailwind CSS              |
| Forms & Nav    | Swiper.js, Framer Motion             |
| Auth           | Clerk for Next.js                    |
| Backend        | Convex Functions + OpenAI (Gemini)   |
| Hosting        | Vercel                                |

---

## ⚙️ Getting Started (Local Dev)

1. **Clone & Install**
   ```bash
   git clone https://github.com/abdussameea1813/Fitness-AI.git
   cd Fitness-AI
   npm install
Set Up Env Variables

Create .env.local with:

env
Copy
Edit
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CONVEX_URL=https://YOUR-CONVEX-DEPLOYMENT
OPENAI_API_KEY=your_openai_key
Run Dev Server

bash
Copy
Edit
npm run dev
Visit http://localhost:3000

Trigger AI Plan Generation

Go to Generate Program

Fill out the Swiper form

Generate and view your plan in the profile section

📂 Project Structure
bash
Copy
Edit
/
├── app/                   # Next.js app pages
│   ├── generate-program.tsx
│   ├── profile.tsx
│   └── ...
├── components/            # UI components (cards, tabs, swipers)
├── convex/                # Convex definitions and generated API
├── styles/                # Tailwind overrides & globals
└── package.json
🛠️ Deployment
Push to GitHub

Connect to Vercel

Set environment variables (Clerk, Convex, OpenAI)

Deploy — and enjoy your AI-powered platform!

🧩 Contributing
Fork the repo

Create a feature branch (git checkout -b feat/xyz)

Make your changes and test

Open a PR against main — description, issue link, file changes

I'll review and merge once approved

🙌 Acknowledgements
UI inspired by Codeflex‑AI

Auth powered by Clerk, state handled by Convex & OpenAI

📬 Contact
Created by Abdussameea — 

⭐ If you find this tool cool, please star the repo!

---

### ✨ Tips

- Replace placeholder links (demo URL, Twitter, email)
- 🎨 Add animated GIF or demo video under the Features block for extra polish
- Expand **Auth/Backend** sections if needed (e.g., Clerk session flow, Convex schema)

Let me know if you'd like me to add screenshots, badge links, or CI/CD integration steps!
