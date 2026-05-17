# Placement Preparation Tracker

A modern, responsive web app to help students track their placement preparation — problems solved, daily goals, mock interview notes, and progress analytics. Built with **pure HTML, CSS, and JavaScript** (no frameworks, no build step).

## ✨ Features

- **Dashboard** — Animated stat cards: Problems Solved, Today's Goals, Mock Interviews, Study Streak.
- **Problem Tracker** — Add / edit / delete problems with platform, difficulty, status. Search, filter, sort.
- **Daily Goals** — Add goals with deadline & priority. Mark complete, track progress.
- **Mock Interview Notes** — Save company, type, questions, feedback, score (0–10).
- **Analytics** — Animated counters, CSS progress bars, weekly bar chart, 28-day consistency grid, streak.
- **Dark / Light mode** with persistent preference.
- **Sidebar navigation** with mobile drawer.
- **Form validation**, **toast notifications**, **empty-state UI**.
- **Data persists** via `localStorage` — no backend required.

## 📁 Folder Structure

```
placement-prep-tracker/
├── index.html                  # Dashboard (home)
├── pages/
│   ├── problems.html
│   ├── goals.html
│   ├── interviews.html
│   └── analytics.html
├── css/
│   ├── style.css               # Global tokens, layout, sidebar, modal, toast
│   ├── dashboard.css
│   ├── problems.css
│   ├── goals.css
│   ├── interviews.css
│   └── analytics.css
├── js/
│   ├── theme.js                # Theme toggle + shared utils (Store, toast, validators)
│   ├── dashboard.js
│   ├── problems.js
│   ├── goals.js
│   ├── interviews.js
│   └── analytics.js
├── components/
│   └── sidebar.html            # Reference markup for the sidebar
└── README.md
```

## 🚀 Run Locally

It's static HTML — just open `index.html` in any modern browser.

For best results (and to avoid any browser file:// quirks), serve the folder:

## 💾 Data

All data is stored in `localStorage` under these keys:

| Key              | Purpose                          |
|------------------|----------------------------------|
| `ppt_problems`   | Problem list                     |
| `ppt_goals`      | Daily goals                      |
| `ppt_interviews` | Mock interview notes             |
| `ppt_streak`     | Current study streak (days)      |
| `ppt_activity`   | Map of `YYYY-MM-DD → action count` |
| `ppt_theme`      | `light` or `dark`                |

To reset the app, run in DevTools console:

```js
['ppt_problems','ppt_goals','ppt_interviews','ppt_streak','ppt_activity']
  .forEach(k => localStorage.removeItem(k));
```

## 🎨 Tech

- HTML5 semantic markup
- CSS variables for theming, CSS Grid + Flexbox for layout
- Vanilla JavaScript (ES6+), no dependencies

## 📝 License

MIT — use it freely for your placement prep journey. Good luck! 🚀
