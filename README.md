# 🎓Subject wise • Attendance Tracker

A modern, minimalist, and aesthetic attendance tracker tailored for students of **Pillai College of Engineering (PCE).

---

## ✨ Features & Improvements

- **⚡ Clean Separation of Concerns**:
  - `index.html`: Semantic, responsive HTML5 layout with glassmorphic modals.
  - `style.css`: Modern design system featuring dark glassmorphism, smooth animations, and custom CSS variables.
  - `app.js`: Clean vanilla JavaScript with zero compilation steps or heavy dependencies.
- **🛡️ 100% Accurate Undo System**:
  - Tracks complete action history per subject so clicking "Undo" properly checks whether your last action was **Present** or **Absent**, avoiding incorrect subtractions.
- **🎯 Smart 75% Target & Bunk Predictor**:
  - Automatically calculates whether you are **Safe** (how many classes you can miss without falling below the cutoff) or in **Shortage** (how many consecutive classes you must attend to reach 75%).
  - Configurable target threshold (65%, 75%, 80%, 85%) via Settings.
- **👥 Full F Division Student Roster**:
  - Roll numbers **601 to 662** with instant live student preview upon typing your roll number.
- **💾 Robust LocalStorage Management**:
  - Attendance data stored separately per roll number (`pce_attendance_v3_<roll>`).
  - Auto-remembers the last active student on device with easy one-tap switch/logout.
  - JSON **Export & Import** functionality to backup or transfer data across devices.
- **📚 Complete Subject Management**:
  - Pre-populated with default semester subjects (Mathematics, DSA, AEC, HVSE, DBMS, PFM, Practical sessions, etc.).
  - Add new custom subjects with suggestions.
  - Edit/rename or delete subjects anytime.
  - Search and filter classes (All / Low / Safe).
  - Quick "Mark All Today" button for busy class days.

---

## 🚀 How to Run

1. Simply double-click **`index.html`** to open it in any web browser (Chrome, Edge, Safari, Firefox, Brave).
2. Or serve it via any static server, e.g.:
   ```bash
   npx serve .
   # or
   python -m http.server 3000
   ```
3. Type your roll number (e.g., `601`), and your tracker is ready!
