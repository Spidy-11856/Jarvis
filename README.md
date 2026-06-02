# 🔴 JARVIS — Free Multi-AI Assistant

> **Just A Rather Very Intelligent System**  
> Rotates between real AI models — all free — auto-switching when limits hit.

![JARVIS](https://img.shields.io/badge/JARVIS-Multi%20AI-ff1744?style=for-the-badge)
![Cost](https://img.shields.io/badge/Cost-$0.00%20Forever-00e676?style=for-the-badge)
![Models](https://img.shields.io/badge/AI%20Models-25+-448aff?style=for-the-badge)

---

## ⚡ How It Works

JARVIS connects to **multiple free AI providers** and automatically rotates between them:

| Priority | Provider | Models | Free Tier | Card Needed |
|----------|----------|--------|-----------|-------------|
| 1️⃣ | **OpenRouter** | DeepSeek V3, Qwen3 235B, Llama 4 Maverick + 22 more | 200 req/day per model | ❌ No |
| 2️⃣ | **Groq** | Llama 3.3 70B, Gemma 2 | 30 req/min, ~14K/day | ❌ No |
| 3️⃣ | **Google Gemini** | Gemini 2.0/2.5 Flash | 1,500 req/day | ❌ No |
| 4️⃣ | **DuckDuckGo AI** | GPT-4o Mini, Claude Haiku, Llama | Unlimited* | ❌ No account |
| 5️⃣ | **HuggingFace** | Mistral 7B | Free inference | ❌ No |

> **Auto-rotation:** If Provider 1 hits its limit → seamlessly switches to Provider 2 → 3 → etc.  
> **Context preserved:** Your conversation history carries over between switches.

**Total free capacity: ~5,000+ requests/day** by stacking all providers.

---

## 🚀 Quick Start (2 minutes)

### Step 1: Deploy
**GitHub Pages (recommended):**
1. Fork this repo
2. Settings → Pages → Source: `main` branch
3. Visit `https://yourusername.github.io/jarvis`

**Or just open `index.html`** in Chrome/Edge — it works locally too.

### Step 2: Add Free API Keys (30 seconds each)
Open ⚙ Settings in JARVIS and add keys from any/all:

| Provider | Get Free Key | Time |
|----------|-------------|------|
| OpenRouter | [openrouter.ai](https://openrouter.ai) → Keys → Create | 15 sec |
| Groq | [console.groq.com](https://console.groq.com) → API Keys | 15 sec |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com/apikey) | 15 sec |

> **No credit card needed for any of these.** Just email signup → get key → paste into JARVIS.

### Step 3: Use It
Just type or speak — JARVIS handles the rest.

---

## ✨ Features

### 🤖 Real AI Responses
Not a chatbot script — actual LLM responses from DeepSeek, Llama 4, Qwen3, Gemini, GPT-4o Mini, Mistral.

### 🔍 Web Search + AI
Automatically searches DuckDuckGo & Wikipedia when your question needs current info, then feeds results to the AI for an intelligent answer.

### 🎤 Speech-to-Text & Text-to-Speech  
Browser's built-in Web Speech API. Click 🎤, speak, get answers read aloud.

### 🔴 Premium UI
- Animated red glow orb with spinning rings
- Wave animations during voice mode
- Responsive orb that beats when AI is thinking
- Clean, minimal ChatGPT-style chat interface
- Full markdown rendering with code highlighting
- Dark theme optimized for readability

### ⚡ Auto-Rotation
When one AI provider hits its rate limit, JARVIS seamlessly switches to the next — you never notice. Conversation context is preserved across switches.

### 💾 Persistent
Conversations saved in localStorage. Close browser, come back, everything's there.

---

## 🏗 Architecture

```
Single file: index.html (everything inline — zero dependencies)

┌─────────────────────────────────────────┐
│  JARVIS UI Layer                        │
│  ├── Chat Interface (Markdown render)   │
│  ├── Voice Overlay (Web Speech API)     │
│  ├── Settings Modal (Key management)    │
│  └── Sidebar (Conversation history)     │
├─────────────────────────────────────────┤
│  AI Engine (Auto-rotation)              │
│  ├── Provider 1: OpenRouter (3 models)  │
│  ├── Provider 2: Groq (2 models)        │
│  ├── Provider 3: Gemini (1 model)       │
│  ├── Provider 4: DuckDuckGo (fallback)  │
│  └── Provider 5: HuggingFace (fallback) │
├─────────────────────────────────────────┤
│  Search Engine                          │
│  ├── DuckDuckGo Instant Answers API     │
│  └── Wikipedia REST API                 │
├─────────────────────────────────────────┤
│  Speech Engine                          │
│  ├── Web Speech Recognition API         │
│  └── Speech Synthesis API               │
└─────────────────────────────────────────┘
```

---

## 💰 Total Cost

**$0.00** — All providers offer genuine free tiers with no credit card required.

---

## 📄 License

MIT — free to use, modify, distribute.
