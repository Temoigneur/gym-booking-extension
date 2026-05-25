# Life Time Gym Booking Chrome Extension — Master Project Summary

## What This Project Is

A Chrome extension + UIVision macro system that automates class booking on Life Time Fitness's website (my.lifetime.life). The user runs a one-time setup wizard in the extension, which captures all required selectors and preferences, then exports a ready-to-run `BookingTemplate.json` macro that UIVision executes on a schedule.

---

## Three Deliverables

| Deliverable | Status |
|---|---|
| Chrome Extension wizard | ✅ Functional (seat selection still needed) |
| BookingTemplate.json | ✅ Functional (Opus-repaired, pre-baked variables) |
| RunBooking.bat (Windows Task Scheduler launcher) | 🔴 Not yet built |

---

## File Structure

```
chrome-extension/
├── manifest.json              # MV3
├── popup/
│   ├── popup.html             # Wizard UI
│   └── popup.js               # 11-step wizard state machine + export logic
├── content.js                 # Injected into lifetime.life — captures clicks/URLs
├── background/
│   └── service-worker.js      # Message bus — relays START_RECORDING between
│                              # content.js and popup.js via chrome.storage.session
└── images/
    └── schedule-example.png   # Screenshot shown in Step 5

UIVision/UserMacros/
└── BookingTemplate.json       # The RPA macro — only export from wizard
```

### Architectural Rule
`popup.js` never touches the gym site DOM directly.
`content.js` is the only file that reads the Life Time page.
Captured selectors flow: `content.js` → `chrome.storage.session (lastCapture)` → `popup.js` polls every 500ms → `state.config`

### What Does NOT Exist (Disregard if Seen Elsewhere)
- `gym-variables.csv` — never used; variables are baked into macro at export
- `gym-config.json` — never used
- `shared/xpath-utils.js` — never built
- sidePanel API — wizard is a standard **popup**, not a side panel

---

## Data Flow

```
User clicks through Life Time site
        ↓
content.js captures selectors/URLs → chrome.storage.session (lastCapture)
        ↓
popup.js polls storage every 500ms → stores in state.config
        ↓
On export: ##placeholder## tokens replaced with real values
        ↓
BookingTemplate.json downloaded → imported into UIVision → runs on schedule
```

---

## Wizard Steps (popup.js)

| Step | Key | Capture Type | Notes |
|------|-----|--------------|-------|
| INTRO | — | — | Welcome screen |
| CAPTURE_LOGIN_URL | loginUrl | hardcoded | Always `https://my.lifetime.life/login` |
| CAPTURE_USERNAME_FIELD | usernameSelector | click | Orange hover outline on page |
| CAPTURE_PASSWORD_FIELD | passwordSelector | click | |
| CAPTURE_SUBMIT_BUTTON | submitSelector | click | |
| CAPTURE_SCHEDULE_URL | scheduleUrl | url | Strips query params (cleanUrl) |
| CAPTURE_CLASS_NAME | classSelector + className | click | Stores both selector and innerText |
| CAPTURE_TIMESLOT | timeslot | typed | hour, minute, ampm |
| CAPTURE_PARTICIPANTS | participants | typed | First names, max 6, one per line |
| SET_SCHEDULE | schedule | typed | daysAhead, runTime, timezone, username, password |
| EXPORT | — | — | Generates and downloads BookingTemplate.json |

---

## Macro Template (BookingTemplate.json)

### Placeholder Tokens

All variables use `##double-hash##` delimiters to avoid conflict with UIVision's own `${}` syntax.

| Placeholder | Source |
|-------------|--------|
| `##loginUrl##` | Hardcoded: `https://my.lifetime.life/login` |
| `##usernameSelector##` | Captured click |
| `##passwordSelector##` | Captured click |
| `##submitSelector##` | Captured click |
| `##scheduleUrl##` | Captured URL (stripped of query params) |
| `##className##` | innerText of clicked class link |
| `##timeslotHour##` / `##timeslotMinute##` / `##timeslotAmPm##` | Typed input |
| `##classTime_runtime##` | Pre-computed: `"10"` or `"10:45"` format |
| `##participant1##`–`##participant6##` | Typed names |
| `##daysAhead##` | Typed number |
| `##runHour##` / `##runMinute##` | Parsed from runTime input |
| `##timezone##` | Dropdown selection |
| `##username##` / `##password##` | Typed credentials |

### Macro Execution Flow

1. `open ##scheduleUrl##` — gives UIVision a live tab for executeScript
2. **CLOCK GATE** — while loop polling until `runHour:runMinute:03`
3. **CALCULATE TARGET DATE** — current date + daysAhead in user's timezone
4. **NAVIGATE TO SCHEDULE PAGE** — opens `scheduleUrl?selectedDate=${targetDate}&mode=day`
5. **CHECK LOGIN STATE** — detects `a.js-login-link` visibility
6. **LOGIN FLOW** (if needed) — fills username/password, submits, redirects back
7. **WAIT FOR SPINNER** — `css=[data-testid='sectionSpinner']`
8. **FIND CLASS CARD** — XPath matching className + time + AM/PM
9. **CLICK CLASS LINK** — opens registration panel
10. **CHECK RESERVE BUTTON** — error if shows "Log in to Reserve"
11. **SELECT PARTICIPANTS** — checks checkbox for each name via `participantLabel`
12. **CLICK RESERVE** — `css=[data-testid='reserveButton']`
13. **SEAT MAP** — detects `finishBtn`, clicks if present (auto-assign only for now)
14. **DONE** — echo confirmation

### Key UIVision Rules (Hard-Won)
- Use `end` not `endIf` / `endWhile` to close all blocks
- `executeScript` needs a live page tab — first command must always be `open`
- Prompt cache expires after 5 minutes of inactivity (affects `/compact` strategy)
- Block openers (`if`/`while`) must balance with `end` closers exactly
- `${targetDate}` is a UIVision runtime variable — never replace it
- `##double-hash##` delimiters avoid conflict with UIVision's own `${}` syntax

---

## Development History & Key Decisions

### What Worked
- Started from a manually-built working pickleball court booking macro as ground truth
- Claude Opus (via Claude Code) analyzed working macro vs broken template side-by-side to repair it

### What Was Broken (Now Fixed)
- Clock gate `executeScript` had no live page to run on → fixed by adding `open ##scheduleUrl##` as first command
- Quoting/escaping issues in `executeScript` XPath strings
- `endIf` used instead of `end` in some blocks

### Still Needed
- **Seat selection** — currently auto-assigns via `finishBtn`. Needs specific seat selection by label (e.g. "B4") for classes with assigned seating maps. Use working pickleball macro as reference.

---

## Tooling & Environment

| Tool | Role |
|------|------|
| VS Code | Primary editor |
| Claude Code (Anthropic Console) | AI-assisted dev — pay-as-you-go credits |
| UIVision | Chrome extension that runs the exported macro |
| Git + GitHub | Version control |
| Chrome DevTools | Debugging content script / selector capture |

### Claude Code Cost Management
- Run `/cost` to check spend; `/compact` every 30 min active; `/clear` between tasks
- Default to **Sonnet**; switch to **Opus** only for complex multi-file reasoning
- Keep `CLAUDE.md` in project root so context is never re-explained
- Monitor balance: **console.anthropic.com/settings/billing**

---

## Next Steps (Prioritized)

1. **Push to GitHub** — protect working state before any changes
2. **End-to-end test** — run full wizard → export → UIVision play on a real class
3. **Add seat selection** — prompt Opus with both `BookingTemplate.json` and working pickleball macro
4. **Scheduling** — configure UIVision's built-in scheduler or Windows Task Scheduler + `RunBooking.bat`
5. **Polish** — error handling UX, edge cases (class full, already booked, etc.)

---

## CLAUDE.md (Save This as `/CLAUDE.md` in Project Root)

```
# Life Time Gym Booking Chrome Extension

Chrome extension + UIVision macro system for automating class booking at Life Time Fitness.

## Key Files
- popup/popup.js — wizard UI, state machine, macro template, export logic
- content.js — captures element selectors and URLs on Life Time pages
- background/service-worker.js — Chrome service worker bridging content ↔ popup
- BookingTemplate.json — exported UIVision macro (not edited directly)

## Critical Rules
- Keep all ##placeholder## tokens intact — replaced at export time
- Never add csvRead or variable-loading commands — values are pre-baked
- Use `end` (not `endIf` or `endWhile`) to close all blocks
- First macro command must be `open ##scheduleUrl##` — UIVision needs a live tab
- `${targetDate}` is a UIVision runtime variable — never replace it
- ##double-hash## delimiters avoid conflict with UIVision's own ${} syntax
- popup.js never touches the gym site DOM — only content.js reads the page

## What Does NOT Exist
- gym-variables.csv, gym-config.json — not used
- shared/xpath-utils.js — not built
- sidePanel API — wizard is a standard popup

## Next Task
Add seat selection: after Reserve is clicked, if a seat map appears,
either auto-assign (click finishBtn) or select a specific seat by label.
Reference the working pickleball macro for how the seat map interaction works.
```
