Here’s a **clean, professional, and engaging README.md** for your project **Policy AI** based on your provided details:

---

````md
# 🧠 Policy AI

**Policy AI** is a smart assistant that helps users analyze and extract insights from insurance policy documents using powerful language models.

---

## 🚀 Run Locally

**Prerequisites:**  
- [Node.js](https://nodejs.org/) (v16 or later) installed on your system

### Steps to run:

1. **Install dependencies**
   ```bash
   npm install
````

2. **Set up API key**

   Create a `.env.local` file in the root directory with your Gemini API key:

   ```
   GEMINI_API_KEY=your-api-key-here
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
New_App/
├─ components/           # Reusable UI components
│  ├─ ResultDisplay.tsx
│  └─ Spinner.tsx
├─ services/             # API service files
│  └─ geminiService.ts
├─ .env.local            # Environment variables (keep secret)
├─ App.tsx               # Main app component
├─ constants.ts          # Static strings and config
├─ index.html            # Root HTML file
├─ index.tsx             # Entry point
├─ metadata.json         # App metadata
├─ tsconfig.json         # TypeScript config
├─ types.ts              # Shared type definitions
├─ vite.config.ts        # Vite config
```

## 💡 Features

* Upload or parse policy documents
* Ask semantic questions like "What is the refund policy?"
* Get AI-powered answers backed by Gemini Pro
* Responsive and clean UI

---

## 👥 Credits

Developed by:
**Tech Byte**

---

## 🛡️ License

MIT © 2025 – Use freely with attribution.

```

