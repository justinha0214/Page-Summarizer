# Textbook Summarizer — Edge/Chrome Extension (Gemini)

Screenshot any browser tab showing a textbook page and get instant AI-powered
key point summaries using Google's Gemini Vision — completely free, no credit card needed.

---

## Installation (Edge)

1. Open Edge and go to: `edge://extensions`
2. Enable **Developer mode** (toggle, top-left)
3. Click **Load unpacked**
4. Select this folder (`textbook-ext-gemini/`)
5. The extension appears in your toolbar — pin it for easy access

### Chrome
Same steps, but go to `chrome://extensions` instead.

---

## Setup (free, no credit card)

1. Go to **aistudio.google.com** and sign in with your Google account
2. Click **Get API key** → **Create API key**
3. Copy the key (starts with `AIza...`)
4. Click the extension icon → ⚙ Settings
5. Paste your key and click **Save key**

Your key is stored locally in the browser and only ever sent to
generativelanguage.googleapis.com (Google's Gemini API).

---

## Usage

### Screenshot the current tab
1. Open your textbook PDF or webpage in Edge
2. Click the extension icon
3. Optionally add a chapter/context note
4. Click **Screenshot tab** — Gemini analyzes the visible page instantly

### Upload images
1. Click **Upload image**
2. Drop in PNG/JPG screenshots, or click to browse
3. Queue multiple pages at once
4. Click **Summarize N image(s)**

### Output
Each summary includes:
- **Summary** — 1–2 sentence core idea
- **Key points** — 3–7 standalone study notes
- **Terms to know** — vocabulary definitions (when present)
- **Watch out for** — common misconception or tricky nuance

Use **Copy** or **Save .txt** to keep your notes.

---

## Free tier limits (Gemini 2.5 Flash)

- 10 requests per minute
- 250 requests per day
- No credit card required

More than enough for personal study use.

---

## File structure

```
textbook-ext-gemini/
├── manifest.json     extension config
├── background.js     service worker (screenshot + Gemini API calls)
├── popup.html        main UI
├── popup.js          UI logic
├── options.html      settings page (API key)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
