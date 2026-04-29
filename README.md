# 📖 Textbook Summarizer

> A browser extension for Edge and Chrome that captures screenshots of textbook pages and uses Google's Gemini Vision AI to extract key points, definitions, and study notes — instantly.

![Version](https://img.shields.io/badge/version-1.0.1-blue) ![Manifest](https://img.shields.io/badge/Manifest-V3-green) ![License](https://img.shields.io/badge/license-MIT-brightgreen) ![API](https://img.shields.io/badge/API-Gemini%202.5%20Flash-orange)

---

## What it does

Reading a textbook is one thing. Retaining it is another.

Textbook Summarizer sits in your browser toolbar while you study. When you hit a page worth remembering, click the extension — it captures the page, sends it to Google's Gemini Vision model, and returns:

- **A one-sentence summary** of the core idea
- **3–7 key points** written as standalone study notes
- **Terms to know** — vocabulary and definitions pulled from the page
- **Watch out for** — a common misconception or tricky nuance flagged by AI

You can copy the summary to your clipboard or save it as a `.txt` file to build up a full set of notes as you read.

---

## Demo

| Screenshot a tab | Upload existing images | Review your summary |
|:---:|:---:|:---:|
| Click once to capture the visible page | Drop in multiple pages at once | Key points, terms, and gotchas |

> 📸 *Screenshots coming soon*

---

## Features

- **One-click tab capture** — screenshots the active tab instantly, no setup required per page
- **Image upload** — drag and drop PNG/JPG screenshots if you prefer capturing manually
- **Multi-page support** — queue multiple images and get summaries for each in sequence
- **Chapter context** — tag summaries with a book title and chapter for organised notes
- **Copy & export** — copy to clipboard or save as a `.txt` file
- **Free to use** — powered by Google Gemini's free API tier, no credit card required
- **Private by default** — your API key is stored locally in the browser and never leaves your device except in direct calls to Google's API

---

## Tech stack

| Layer | Technology |
|---|---|
| Platform | Chrome Extensions — Manifest V3 |
| Languages | HTML, CSS, Vanilla JavaScript |
| AI Model | Google Gemini 2.5 Flash (Vision) |
| API | Google Generative Language REST API |
| Storage | `chrome.storage.local` |
| Screenshot | `chrome.tabs.captureVisibleTab` |

No build step. No dependencies. No frameworks. Just files you can load directly into the browser.

---

## Getting started

### Prerequisites

- Microsoft Edge or Google Chrome
- A free Google account
- A Gemini API key (free — instructions below)

### 1. Get a free Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API key** → **Create API key**
4. Copy the key — it starts with `AIza...`

No credit card required. The free tier allows 250 requests/day and 10 requests/minute — more than enough for personal study use.

### 2. Install the extension

1. Download or clone this repository
2. Open Edge and navigate to `edge://extensions` (or `chrome://extensions` for Chrome)
3. Enable **Developer mode** using the toggle in the top-left corner
4. Click **Load unpacked** and select the project folder
5. The extension icon will appear in your toolbar — pin it for easy access

### 3. Add your API key

1. Click the extension icon in the toolbar
2. Click the **⚙ settings** icon
3. Paste your Gemini API key and click **Save key**

You're ready to go.

---

## Usage

### Summarize the current tab

1. Open a textbook PDF or webpage in your browser
2. Click the **Textbook Summarizer** icon in the toolbar
3. Optionally type a chapter or context note (e.g. *"Chapter 3: Cell Biology"*)
4. Click **Screenshot tab**
5. Your summary appears within a few seconds

### Summarize uploaded images

1. Click the extension icon
2. Click **Upload image**
3. Drag and drop your screenshot(s) into the upload zone, or click to browse
4. Click **Summarize N image(s)**

### Save your notes

- Click **Copy** to copy the summary to your clipboard
- Click **Save .txt** to download a plain-text file you can keep alongside your notes

---

## Project structure

```
textbook-summarizer-extension/
│
├── manifest.json       # Extension configuration (Manifest V3)
├── background.js       # Service worker — handles screenshots and Gemini API calls
├── popup.html          # Main extension UI
├── popup.js            # UI logic — capture, upload, render, export
├── options.html        # Settings page UI
├── options.js          # Settings logic — API key save/load/clear
│
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Gemini free tier limits

| Model | Requests/min | Requests/day |
|---|---|---|
| Gemini 2.5 Flash | 10 RPM | 250 RPD |
| Gemini 2.5 Flash-Lite | 15 RPM | 1,000 RPD |

For heavier use, adding a billing method unlocks significantly higher limits at low cost.

---

## Roadmap

Planned features for future versions:

- [ ] **Quiz mode** — auto-generate questions from key points to test comprehension via active recall
- [ ] **Session notebook** — accumulate summaries across pages into a single chapter-organised document
- [ ] **Anki export** — convert key points and terms directly into Anki flashcard format
- [ ] **Side panel UI** — move from popup to Edge's persistent side panel so the summary stays visible while reading
- [ ] **Region selector** — drag to select just the page content rather than capturing the full tab
- [ ] **PDF text extraction** — pull text directly from PDF pages instead of screenshotting for higher accuracy
- [ ] **Retry on rate limit** — automatic backoff and retry when the free API tier limit is hit
- [ ] **History view** — browse past summaries without re-scanning
- [ ] **Markdown / Notion export** — one-click export for popular note-taking tools
- [ ] **Keyboard shortcut** — trigger capture without touching the mouse

---

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/quiz-mode`)
3. Commit your changes (`git commit -m 'Add quiz mode'`)
4. Push to the branch (`git push origin feature/quiz-mode`)
5. Open a Pull Request

---

## Privacy

- Your API key is stored in `chrome.storage.local` — it never leaves your browser except in direct HTTPS requests to Google's Gemini API
- Screenshots are sent to Google's API for processing and are subject to [Google's privacy policy](https://policies.google.com/privacy)
- On the free tier, Google may use inputs and outputs to improve their models. Enabling billing opts you out of this

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- Built with [Google Gemini](https://deepmind.google/technologies/gemini/) Vision API
- Developed with assistance from [Claude](https://claude.ai) by Anthropic

---

*Built as a personal study tool. Designed to make reading actually stick.*
