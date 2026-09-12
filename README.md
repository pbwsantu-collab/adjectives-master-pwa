# Adjectives Master – Interactive English Grammar PWA

**Complete bilingual classroom for the Adjectives chapter.**

## Quick Start (Working Version)

Because the full lesson data is large, the easiest way to run the complete app right now is:

1. Download the **single self-contained HTML file** (contains all 34 lessons + 100 questions + voice + UI).
2. Open it in any modern browser (Chrome / Edge / Firefox / Safari).
3. Click **▶ Start Lesson 1**.

The file is available in the project artifacts as:
`Adjectives-Master-Complete.html`

Or download the full package zip and open `index.html` after extracting.

## Features
- 34 step-by-step lessons covering **every rule** from the textbook
- English + বাংলা teacher narration (Web Speech API)
- Progressive reveal, diagrams, whiteboard effect
- Exactly 100 unique practice questions
- Score, review wrong answers, achievements
- Mobile-friendly, offline-capable design

## Enable GitHub Pages
Settings → Pages → Source = Deploy from branch `main` → Save
Then visit: https://pbwsantu-collab.github.io/adjectives-master-pwa/

## Repo structure
- `index.html` – main shell
- `css/styles.css` – full educational styling
- `js/app.js` – lesson & quiz engine
- `js/tts.js` – bilingual voice
- `js/lessons.js` – all 34 lessons (large)
- `js/questions.js` – 100 questions
- `manifest.json` + `sw.js` – PWA

Created for Bengali-medium students.
