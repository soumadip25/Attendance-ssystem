# PCE Attendance Tracker (Division F)

A lightweight web app for students of Pillai College of Engineering (PCE), to track attendance and monitor the 75% attendance criteria.

Built by Soumadip Samanta.

## Features

- **Class roster preloaded**: Roll numbers 601 to 662 with live name preview on input.
- **75% target calculator**: Shows how many classes you can skip while staying safe, or how many you need to attend consecutively to reach 75%. Threshold can be changed in settings (65% to 85%).
- **Subject management**: Includes semester coursework. You can add custom subjects, rename them, or delete them anytime.
- **Accurate undo**: Action history tracks whether each mark was Present or Absent, avoiding incorrect subtraction on undo.
- **Quick batch actions**: One-click "Mark All Today", search bar, and filters (All, Low attendance, Safe).
- **Per-roll storage**: Saves attendance in localStorage keyed by roll number (`pce_attendance_v3_<roll>`). Includes JSON export and import for backups.

## Running locally

Just double-click `index.html` to open it directly in your browser.

No build step or dependencies needed. If you prefer running a local server:

```bash
npx serve .
# or
python -m http.server 3000
```
