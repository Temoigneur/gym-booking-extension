const STEPS = [
  'INTRO',
  'CAPTURE_CLUB',
  'CAPTURE_USERNAME_FIELD',
  'CAPTURE_PASSWORD_FIELD',
  'CAPTURE_SUBMIT_BUTTON',
  'CAPTURE_CLASS_NAME',
  'CAPTURE_TIMESLOT',
  'CAPTURE_PARTICIPANTS',
  'CAPTURE_SPOT_PREFERENCES',
  'SET_SCHEDULE',
  'EXPORT'
];

// ─── DIAG LOGGER (beta) ───────────────────────────────────────────────────────
// Lightweight, crash-proof logging for beta testers. Never throws.
const __DIAG = { lines: [], max: 500 };
function logDiag(tag, msg, extra) {
  try {
    const ts = new Date().toISOString().slice(11, 23);
    let line = '[' + ts + '] [' + tag + '] ' + msg;
    if (extra !== undefined) {
      let e = extra;
      try { e = (typeof extra === 'object') ? JSON.stringify(redactForLog(extra)) : String(extra); }
      catch (_) { e = '[unserializable]'; }
      line += ' ' + e;
    }
    __DIAG.lines.push(line);
    if (__DIAG.lines.length > __DIAG.max) __DIAG.lines.shift();
    console.log(line);
    try { chrome.storage.local.set({ diagLog: __DIAG.lines.slice(-__DIAG.max) }); } catch (_) {}
  } catch (_) { /* logging must never break the app */ }
}
// Strip credentials before anything is logged or copied.
function redactForLog(obj) {
  try {
    const clone = JSON.parse(JSON.stringify(obj));
    const scrub = (o) => {
      if (!o || typeof o !== 'object') return;
      for (const k of Object.keys(o)) {
        if (/pass|pwd|secret|token/i.test(k)) o[k] = '***REDACTED***';
        else if (typeof o[k] === 'object') scrub(o[k]);
      }
    };
    scrub(clone);
    return clone;
  } catch (_) { return {}; }
}
function getDiagText() {
  return (__DIAG.lines || []).join('\n');
}
// ──────────────────────────────────────────────────────────────────────────────

let state = {
  currentStep: 0,
  config: {}
};

const STEP_META = {
  INTRO: {
    title: 'Welcome to the Booking Wizard',
    instruction: 'This wizard will walk you through a one-time setup to automatically book your gym classes. You\'ll click a few things on the Life Time website and we\'ll handle the rest.\n\nKeep this panel open the whole time - it stays visible while you browse.',
    captureKey: null,
    captureType: null
  },
  CAPTURE_CLUB: {
    title: 'Step 1 - Your Club',
    instruction: 'Select your Life Time club from the list below. This tells the macro which schedule page to navigate to.',
    captureKey: 'club',
    captureType: 'typed'
  },
  CAPTURE_USERNAME_FIELD: {
    title: 'Step 2 - Username Field',
    instruction: 'Navigate to my.lifetime.life, click "Account" in the upper right, then "Log In". Once the login form appears, click "Capture Field" below, then click on the username/email input box on the page (an orange outline shows what you\'re hovering over). If you are already logged in, just log out, then complete this step, so the macro can log you in every week when it makes the scheduled booking.',
    captureKey: 'usernameSelector',
    captureLabel: 'Capture Field',
    captureType: 'click'
  },
  CAPTURE_PASSWORD_FIELD: {
    title: 'Step 3 - Password Field',
    instruction: 'Still on the login form, click "Capture Field" below, then click on the password input box on the page.',
    captureKey: 'passwordSelector',
    captureLabel: 'Capture Field',
    captureType: 'click'
  },
  CAPTURE_SUBMIT_BUTTON: {
    title: 'Step 4 - Login Button',
    instruction: 'Click "Capture Button" below, then click the Log In or Submit button on the login form.',
    captureKey: 'submitSelector',
    captureLabel: 'Capture Button',
    captureType: 'click'
  },

  CAPTURE_CLASS_NAME: {
    title: 'Step 5 - Your Class',
    instruction: 'Click the Log In button to Log in, then navigate to the class schedule/calendar page containing the class you want by clicking "Schedule" => "All Classes" => click the day or week your class is on. Next, simply click "Capture Class" below, then click directly on the name of the class you want to book.',
    captureKey: 'classSelector',
    captureLabel: 'Capture Class',
    captureType: 'click'
  },
  CAPTURE_TIMESLOT: {
    title: 'Step 6 - Class Time',
    instruction: 'The clicking is all done! We just need a few more details to make your bookings automatic.\n\nEnter the exact time your class starts.',
    captureKey: 'timeslot',
    captureType: 'typed'
  },
  CAPTURE_PARTICIPANTS: {
    title: 'Step 7 - Who\'s Booking',
    instruction: 'Enter the first names of everyone to book for, one per line, up to 7 people.\n\nInclude YOUR OWN name if you want to book for yourself — put it on the first line. Leave your name out if you only want to book for others.',
    captureKey: 'participants',
    captureType: 'typed'
  },
  CAPTURE_SPOT_PREFERENCES: {
    title: 'Step 8 - Preferred Spots (optional)',
    instruction: 'Some classes (yoga, cycle, barre) let you choose your spot. Enter a preferred seat number for any participant who wants a specific one — same order as the names from Step 8. Leave blank to take whatever the site auto-assigns.\n\nIf your class doesn\'t use assigned seating (most classes), just leave everything blank and click Next — the macro will skip this step automatically. If your preferred seat is already taken, then macro will auto-assign you seat(s), but you can always change those by clicking "edit spots" in your reservation.',
    captureKey: 'spotPreferences',
    captureType: 'typed'
  },
  SET_SCHEDULE: {
    title: 'Step 9 - Booking Schedule',
    instruction: 'How far in advance should the macro book, (ideally when the booking window opens "n" days in advance of the class), and what time should it run?',
    captureKey: 'schedule',
    captureType: 'typed'
  },
EXPORT: {
  title: 'Step 10 - Name & Download',
  instruction: 'Give this booking a unique name (e.g. "Pickleball_Wednesday" or "Yoga_Friday"). Then click Export to download your 3 automation files.',
  captureKey: null,
  captureType: null
}
};


const CLICK_ARMED_INSTRUCTIONS = {
  CAPTURE_CLASS_NAME: 'Now click the class name on the Class Schedule page...',
  DEFAULT: 'Now click the element on the page...'
};

// ─── BLOCKED RESOURCES ───────────────────────────────────────────────────────
const BLOCKED_RESOURCES = {
  courts: {
    keywords: [
      'pickleball', 'tennis', 'squash',
      'racquetball', 'basketball', 'court',
      'court-reservation', 'court_reservation'
    ],
    reason: "Court bookings aren't supported — this tool is for group fitness classes only. Please book courts directly through the Life Time app."
  }
};

function checkBlockedResource(urlOrTitle) {
  if (!urlOrTitle) return { blocked: false };
  const text = urlOrTitle.toLowerCase();
  for (const [category, config] of Object.entries(BLOCKED_RESOURCES)) {
    for (const keyword of config.keywords) {
      if (text.includes(keyword)) {
        return { blocked: true, reason: config.reason };
      }
    }
  }
  return { blocked: false };
}
// ─────────────────────────────────────────────────────────────────────────────

// --- Render -------------------------------------------------------------------

function render() {
  const stepError = document.getElementById('step-error');
  if (stepError) {
    stepError.style.display = 'none';
    stepError.textContent = '';
  }
  const stepName = STEPS[state.currentStep];
  const meta = STEP_META[stepName];
  const captured = meta.captureKey ? state.config[meta.captureKey] : null;

  document.getElementById('step-title').textContent = meta.title;
  document.getElementById('step-instruction').textContent = meta.instruction;

  document.getElementById('step-counter').textContent = '';

  document.getElementById('progress-bar').style.width =
    `${((state.currentStep + 1) / STEPS.length) * 100}%`;

  const screenshot = document.getElementById('step-screenshot');
  if (meta.screenshot) {
    screenshot.onerror = () => { screenshot.style.display = 'none'; };
    screenshot.src = chrome.runtime.getURL(meta.screenshot);
    screenshot.style.display = 'block';
  } else {
    screenshot.style.display = 'none';
  }

  const captureBtn = document.getElementById('btn-capture');
  if (meta.captureLabel) {
    captureBtn.style.display = 'block';
    captureBtn.textContent = meta.captureLabel;
  } else {
    captureBtn.style.display = 'none';
  }

  const inputArea = document.getElementById('input-area');
  inputArea.innerHTML = '';

  if (stepName === 'EXPORT') {
    const defaultName = state.config.macroName || 'BookingTemplate';
    inputArea.innerHTML = `
      <div class="field-row">
        <label>Macro name (no spaces — use underscores)</label>
        <input type="text" id="t-macroname"
          placeholder="e.g. Pickleball_Wednesday"
          value="${defaultName}">
        <small style="color:#888; font-size:11px; margin-top:4px; display:block;">
          Each class you automate needs a unique name.
          This becomes the filename and the Windows task name.
        </small>
      </div>
      <p style="margin-top:12px;">Clicking <strong>Export</strong> will download 4 files:</p>
      <ul style="font-size:13px; line-height:1.8; margin:0 0 0 16px;">
        <li><strong>${defaultName}.json</strong> — your UIVision macro</li>
        <li><strong>RunBooking.bat</strong> — runs the macro instantly</li>
        <li><strong>RegisterTask.bat</strong> — sets up weekly scheduling</li>
        <li><strong>README_BOOKING.txt</strong> — setup instructions</li>
      </ul>`;
  } else if (meta.captureType === 'typed') {
    inputArea.innerHTML = buildTypedInput(stepName);
    loadTypedValues(stepName);
  }

  const capturedDiv = document.getElementById('captured-value');
  const capturedLabel = document.getElementById('captured-label');
  if (captured) {
    capturedDiv.style.display = 'block';
    capturedLabel.style.display = 'block';
    let displayVal = typeof captured === 'object'
      ? JSON.stringify(captured, null, 2)
      : captured;
    if (stepName === 'CAPTURE_CLASS_NAME' && state.config.className) {
      displayVal += `\n\nClass name: "${state.config.className}"`;
    }
    capturedDiv.textContent = displayVal;
  } else {
    capturedDiv.style.display = 'none';
    capturedLabel.style.display = 'none';
  }

  const isExport = stepName === 'EXPORT';
  const copyLogBtn = document.getElementById('btn-copylog');
  if (copyLogBtn) copyLogBtn.style.display = isExport ? 'block' : 'none';
  document.getElementById('btn-export').style.display = isExport ? 'block' : 'none';
  document.getElementById('btn-restart').style.display = isExport ? 'block' : 'none';
  document.getElementById('btn-next').style.display    = isExport ? 'none'  : 'block';
  document.getElementById('btn-back').style.display =
    state.currentStep > 0 ? 'block' : 'none';
}

// --- Typed Inputs -------------------------------------------------------------

function buildTypedInput(stepName) {
  if (stepName === 'CAPTURE_TIMESLOT') {
    return `
      <div class="field-row">
        <label>Hour (1-12)</label>
        <input type="number" id="t-hour" min="1" max="12" placeholder="9">
      </div>
      <div class="field-row">
        <label>Minute</label>
        <input type="number" id="t-minute" min="0" max="59" placeholder="30">
      </div>
      <div class="field-row">
        <label>AM / PM</label>
        <select id="t-ampm">
          <option value="AM">AM</option>
          <option value="PM">PM</option>
          <option value="Any">Any (book either period)</option>
        </select>
      </div>`;
  }

  if (stepName === 'CAPTURE_CLUB') {
    const regionOrder = ['Canada','USA-Northeast','USA-South','USA-Midwest','USA-West'];
    let options = '<option value="">— select your club —</option>';
    for (const region of regionOrder) {
      const clubs = CLUBS_DATA[region];
      options += `<optgroup label="${region}">`;
      for (const [slug, data] of Object.entries(clubs)) {
        options += `<option value="${slug}">${data.name} (${data.state})</option>`;
      }
      options += '</optgroup>';
    }
    return `
      <div class="field-row">
        <label>Your Life Time Club</label>
        <select id="t-club">${options}</select>
      </div>`;
  }

  if (stepName === 'CAPTURE_PARTICIPANTS') {
    return `
      <div class="field-row">
        <label>Names to book for - one per line, up to 7 (include yourself on line 1 if booking for yourself)</label>
        <textarea id="t-participants" rows="7"
          placeholder="Ben&#10;Rejosh"></textarea>
      </div>`;
  }

  if (stepName === 'CAPTURE_SPOT_PREFERENCES') {
    const names = state.config.participants || [];
    if (names.length === 0) {
      return `<div class="field-row"><p style="color:#888">No participants captured yet. Go back to Step 8 first.</p></div>`;
    }
    let rows = '';
    for (let i = 0; i < names.length; i++) {
      rows += `
        <div class="field-row">
          <label>${escapeHtml(names[i])}</label>
          <input type="number" id="t-spot-${i}" min="1" max="99" placeholder="no preference">
        </div>`;
    }
    return rows;
  }

  if (stepName === 'SET_SCHEDULE') {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for min attribute
    return `
      <div class="field-row">
        <label>Days ahead to book</label>
        <input type="number" id="t-days" min="1" max="14" placeholder="8">
      </div>
      <div class="field-row">
        <label>Time to run the macro (24hr format, e.g. 09:00)</label>
        <input type="text" id="t-runtime" placeholder="09:00">
      </div>
      <div class="field-row">
        <label>Date of the class you want to book</label>
        <input type="date" id="t-classdate"
          min="${today}"
          style="width:100%; padding:6px; font-size:14px; cursor:pointer; box-sizing:border-box;">
        <small style="color:#888; font-size:11px; margin-top:4px; display:block;">
          Click the calendar icon on the right to pick a date.
          The task will be scheduled ${'{daysAhead}'} days before this date.
        </small>
      </div>
      <div class="field-row">
        <label>Your timezone</label>
        <select id="t-timezone">
          <option value="America/Toronto">America/Toronto (EST/EDT)</option>
          <option value="America/New_York">America/New_York</option>
          <option value="America/Chicago">America/Chicago</option>
          <option value="America/Denver">America/Denver</option>
          <option value="America/Los_Angeles">America/Los_Angeles</option>
          <option value="America/Vancouver">America/Vancouver</option>
        </select>
      </div>
      <div class="field-row">
        <label>
          <input type="checkbox" id="t-runnow">
          Run immediately for testing (skip waiting for the booking window)
        </label>
      </div>
      <div class="field-row">
        <label>Your Life Time username / email</label>
        <input type="email" id="t-username" placeholder="you@email.com" autocomplete="username">
      </div>
      <div class="field-row">
        <label>Your Life Time password</label>
        <input type="password" id="t-password" placeholder="********" autocomplete="current-password">
      </div>`;
  }

  return '';
}

function loadTypedValues(stepName) {
  if (stepName === 'CAPTURE_CLUB' && state.config.club) {
    document.getElementById('t-club').value = state.config.club;
  }
  if (stepName === 'CAPTURE_TIMESLOT' && state.config.timeslot) {
    const t = state.config.timeslot;
    document.getElementById('t-hour').value = t.hour || '';
    document.getElementById('t-minute').value = t.minute || '';
    document.getElementById('t-ampm').value = t.ampm || 'AM';
  }
  if (stepName === 'CAPTURE_PARTICIPANTS' && state.config.participants) {
    document.getElementById('t-participants').value =
      state.config.participants.join('\n');
  }
  if (stepName === 'CAPTURE_SPOT_PREFERENCES' && state.config.spotPreferences) {
    const prefs = state.config.spotPreferences;
    for (let i = 0; i < prefs.length; i++) {
      const el = document.getElementById(`t-spot-${i}`);
      if (el) el.value = prefs[i] || '';
    }
  }
  if (stepName === 'SET_SCHEDULE' && state.config.schedule) {
    const s = state.config.schedule;
    document.getElementById('t-days').value = s.daysAhead || '';
    document.getElementById('t-runtime').value = s.runTime || '';
    document.getElementById('t-timezone').value = s.timezone || 'America/Toronto';
    document.getElementById('t-runnow').checked = s.runImmediately === true;
    document.getElementById('t-username').value = s.username || '';
    // Never pre-fill password
  }
}

function collectTypedInput() {
  const stepName = STEPS[state.currentStep];

if (stepName === 'CAPTURE_CLUB') {
  const slug = document.getElementById('t-club').value;
  if (slug && CLUBS_DATA) {
    for (const region of Object.values(CLUBS_DATA)) {
      if (region[slug]) {
        state.config.club = slug;
        state.config.clubHomeUrl = region[slug].url;
        state.config.scheduleUrl = region[slug].url.replace('.html', '/classes.html');
        break;
      }
    }
  }
}
  if (stepName === 'CAPTURE_TIMESLOT') {
    state.config.timeslot = {
      hour: document.getElementById('t-hour').value,
      minute: document.getElementById('t-minute').value,
      ampm: document.getElementById('t-ampm').value
    };
  }
  if (stepName === 'CAPTURE_PARTICIPANTS') {
    const raw = document.getElementById('t-participants').value;
    state.config.participants = raw.split('\n')
      .map(s => s.trim()).filter(Boolean).slice(0, 7);
  }
  if (stepName === 'CAPTURE_SPOT_PREFERENCES') {
    const prefs = [];
    const names = state.config.participants || [];
    for (let i = 0; i < names.length; i++) {
      const el = document.getElementById(`t-spot-${i}`);
      prefs.push(el ? el.value.trim() : '');
    }
    state.config.spotPreferences = prefs;
  }

  if (stepName === 'SET_SCHEDULE') {
    state.config.schedule = {
      daysAhead:      parseInt(document.getElementById('t-days').value)  || 7,
      runTime:        document.getElementById('t-runtime').value          || '09:00',
      classDate:      document.getElementById('t-classdate').value        || null,
      timezone:       document.getElementById('t-timezone').value         || 'America/Toronto',
      runImmediately: document.getElementById('t-runnow').checked,
      username:       document.getElementById('t-username').value         || '',
      password:       document.getElementById('t-password').value         || ''
    };
  }
}

// --- Navigation ---------------------------------------------------------------

document.getElementById('btn-next').addEventListener('click', () => {
  const stepName = STEPS[state.currentStep];
  const meta = STEP_META[stepName];
  if (meta.captureType === 'typed') collectTypedInput();
  if (state.currentStep < STEPS.length - 1) {
    state.currentStep++;
    saveState();
    render();
  }
});

document.getElementById('btn-back').addEventListener('click', () => {
  if (state.currentStep > 0) {
    state.currentStep--;
    saveState();
    render();
  }
});

const restartBtn = document.getElementById('btn-restart');
if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    if (confirm('Start over? This will clear all captured data.')) {
      state = { currentStep: 0, config: {} };
      chrome.storage.local.remove('wizardState');
      chrome.storage.session.remove('lastCapture');
      render();
    }
  });
}

// --- Capture Button -----------------------------------------------------------

document.getElementById('btn-capture').addEventListener('click', () => {
  const stepName = STEPS[state.currentStep];
  const meta = STEP_META[stepName];
  const recordingType = meta.captureType === 'url' ? 'url' : 'click';
  logDiag('capture', 'armed', { step: stepName, recordingType });
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const lifetimeTab = tabs.find(t => t.url &&
      (t.url.includes('lifetime.life') || t.url.includes('ltfitness.ca'))) || tabs[0];
    if (!lifetimeTab) return;

    chrome.scripting.executeScript(
      { target: { tabId: lifetimeTab.id }, files: ['content/recorder.js'] },
      () => {
        void chrome.runtime.lastError;
        logDiag('capture', 'START_RECORDING ack', { lastError: (chrome.runtime.lastError && chrome.runtime.lastError.message) || null });
        logDiag('capture', 'recorder injected', { lastError: (chrome.runtime.lastError && chrome.runtime.lastError.message) || null });
        chrome.tabs.sendMessage(lifetimeTab.id,
          { type: 'START_RECORDING', recordingType },
          () => {
            void chrome.runtime.lastError;
            const msg = recordingType === 'url'
              ? (URL_ARMED_INSTRUCTIONS[stepName] || 'Now click anywhere on the page to capture its URL...')
              : (CLICK_ARMED_INSTRUCTIONS[stepName] || CLICK_ARMED_INSTRUCTIONS.DEFAULT);
            document.getElementById('step-instruction').textContent = msg;
          }
        );
      }
    );
  });
});

// --- Capture Polling ----------------------------------------------------------

let capturePoller = null;
let lastAppliedCaptureTime = 0;

function applyCapture(capture) {
  logDiag('capture', 'applyCapture', { step: STEPS[state.currentStep], captureType: capture && capture.captureType });
  const stepName = STEPS[state.currentStep];
  const meta = STEP_META[stepName];
  if (!meta.captureKey || meta.captureType === 'typed') return false;

  // ─── BLOCK CHECK ─────────────────────────────────────────────
  if (stepName === 'CAPTURE_CLASS_NAME') {
    const urlAndTitle = `${capture.url || ''} ${capture.pageTitle || ''}`;
    const innerText = (capture.innerText || '').toLowerCase();
    const COURT_SPORT_WORDS = [
      'pickleball', 'tennis', 'squash',
      'racquetball', 'basketball', 'court'
    ];
    const innerTextBlocked = COURT_SPORT_WORDS.some(word =>
      new RegExp(`\\b${word}\\b`).test(innerText)
    );
    const urlCheck = checkBlockedResource(urlAndTitle);
    if (urlCheck.blocked || innerTextBlocked) {
      const stepError = document.getElementById('step-error');
      if (stepError) {
        stepError.textContent = "⚠️ Court bookings aren't supported — this tool is for group fitness classes only. Please book courts directly through the Life Time app.";
        stepError.style.display = 'block';
      }
      logDiag('block', 'court booking blocked', { step: stepName });
      return false;
    }
  }
  // ─────────────────────────────────────────────────────────────

  if (capture.captureType === 'url') {
    state.config[meta.captureKey] = stepName === 'CAPTURE_SCHEDULE_URL'
      ? capture.cleanUrl
      : capture.url;
  } else {
    state.config[meta.captureKey] = capture.selector;
    if (stepName === 'CAPTURE_CLASS_NAME' && capture.innerText) {
      state.config.className = capture.innerText;
    }
  }
  return true;
}

function startCapturePolling() {
  if (capturePoller) return;
  capturePoller = setInterval(() => {
    chrome.storage.session.get('lastCapture', (r) => {
      const cap = r.lastCapture;
      if (!cap) return;
      const capTime = cap.time || 0;
      if (capTime && capTime <= lastAppliedCaptureTime) {
        chrome.storage.session.remove('lastCapture');
        return;
      }
      const applied = applyCapture(cap);
      lastAppliedCaptureTime = capTime || Date.now();
      chrome.storage.session.remove('lastCapture');
      if (applied) {
        saveState();
        render();
      }
    });
  }, 500);
}
startCapturePolling();

// --- Export -------------------------------------------------------------------

document.getElementById('btn-export').addEventListener('click', () => {
  logDiag('export', 'export started', { participants: (state.config.participants || []).length });   // ← ADD THIS LINE
  const c = state.config;
  const t = c.timeslot || {};
  const s = c.schedule || {};
  const parts = c.participants || [];

  const tHour   = String(t.hour   || '');
  const tMinRaw = String(t.minute || '0');
  const tMinute = tMinRaw.padStart(2, '0');
  // FIX: wrap template literal in backticks
  const classTimeStr = (tMinute === '00') ? tHour : `${tHour}:${tMinute}`;

  const runParts  = (s.runTime || '09:00').split(':');
  const runHour   = (runParts[0] || '09').padStart(2, '0');
  const runMinute = (runParts[1] || '00').padStart(2, '0');

  function jsStr(v) { return JSON.stringify(v || ''); }

  // For single-value placeholders that are already wrapped in JSON quotes
  // inside the macro template (e.g. "Target": "##participant0Json##"), we
  // strip the outer quotes that JSON.stringify added and escape inner quotes.
  function jsStrEscaped(v) { return jsStr(v).replace(/"/g, '\\"'); }

  // For ARRAY placeholders that get inlined inside an outer JSON string
  // (e.g. "Target": "var x=JSON.parse('##participantsJson##')") we need:
  //   1. A valid JSON array string  -> JSON.stringify(arr)
  //   2. All " inside that string escaped as \" so the outer JSON value stays valid
  //   3. All \ escaped to \\ first so we don't double-escape
  //   4. Single quotes left alone (they're inside JSON.parse('...') so they're fine,
  //      and JSON arrays never contain raw apostrophes as structural chars)
  // The two .replace() calls below run in this exact order: \ first, then ".
  function jsonArrayForInlineString(arr) {
    return JSON.stringify(arr)
      .replace(/\\/g, '\\\\')   // escape backslashes first
      .replace(/"/g, '\\"');    // then escape double quotes
  }

  const spotPrefs = c.spotPreferences || [];

  // Auto-compute daysAhead from classDate so the user can't enter mismatched values.
  // classDate is the source of truth; daysAhead the user typed is ignored.
  let computedDaysAhead = s.daysAhead || 6;
  if (s.classDate) {
    const tz = s.timezone || 'America/Toronto';
    const todayStr = new Date().toLocaleString('en-US', { timeZone: tz });
    const today = new Date(todayStr);
    today.setHours(0, 0, 0, 0);
    const target = new Date(s.classDate + 'T00:00:00');
    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    if (diffDays > 0) computedDaysAhead = diffDays;
  }

  const replacements = {
    '##clubHomeUrl##':       c.clubHomeUrl || 'https://my.lifetime.life',
    '##loginUrl##':          'https://my.lifetime.life/login',
    '##usernameSelector##':  selectorToString(c.usernameSelector),
    '##passwordSelector##':  selectorToString(c.passwordSelector),
    '##submitSelector##':    selectorToString(c.submitSelector),
    '##scheduleUrl##':       c.scheduleUrl || '',
    '##targetDate##':        s.classDate || '',
    '##className##':         c.className || '',
    '##classTime##':         classTimeStr,
    '##timeslotAmPm##':      t.ampm || 'AM',
    '##classTime_runtime##': classTimeStr,
    '##daysAhead##':         String(computedDaysAhead),
    '##runHour##':           runHour,
    '##runMinute##':         runMinute,
    '##timezone##':          s.timezone || 'America/Toronto',
    '##runImmediately##':    s.runImmediately ? 'true' : 'false',
    '##username##': s.username || '',
    '##password##': s.password || '',

    '##participant0##':      parts[0] || '',
    '##participant1##':      parts[1] || '',
    '##participant2##':      parts[2] || '',
    '##participant3##':      parts[3] || '',
    '##participant4##':      parts[4] || '',
    '##participant5##':      parts[5] || '',
    '##participant6##':      parts[6] || '',

    '##participant0Json##':  jsStrEscaped(parts[0]),
    '##participant1Json##':  jsStrEscaped(parts[1]),
    '##participant2Json##':  jsStrEscaped(parts[2]),
    '##participant3Json##':  jsStrEscaped(parts[3]),
    '##participant4Json##':  jsStrEscaped(parts[4]),
  '##participant5Json##':  jsStrEscaped(parts[5]),
    '##participant6Json##':  jsStrEscaped(parts[6]),

    '##spotPref0##':         spotPrefs[0] || '',
    '##spotPref1##':         spotPrefs[1] || '',
    '##spotPref2##':         spotPrefs[2] || '',
    '##spotPref3##':         spotPrefs[3] || '',
    '##spotPref4##':         spotPrefs[4] || '',
    '##spotPref5##':         spotPrefs[5] || '',
    '##spotPref6##':         spotPrefs[6] || '',

    '##spotPref0Json##':     jsStrEscaped(spotPrefs[0]),
    '##spotPref1Json##':     jsStrEscaped(spotPrefs[1]),
    '##spotPref2Json##':     jsStrEscaped(spotPrefs[2]),
    '##spotPref3Json##':     jsStrEscaped(spotPrefs[3]),
    '##spotPref4Json##':     jsStrEscaped(spotPrefs[4]),
    '##spotPref5Json##':     jsStrEscaped(spotPrefs[5]),
    '##spotPref6Json##':     jsStrEscaped(spotPrefs[6]),

    // These two placeholders get inlined INSIDE a JSON string value in the macro,
    // i.e. "Target": "var names=JSON.parse('##participantsJson##'); ..."
    // jsonArrayForInlineString() escapes \ then " so the outer JSON stays valid.
    '##participantsJson##':  jsonArrayForInlineString(parts.slice(0, 7)),
    '##spotPrefsJson##':     jsonArrayForInlineString(spotPrefs.slice(0, 7).map(p => p || ''))
  };

  // Build the substituted macro JSON object, wrapped in try/catch so a bad
  // replacement value (unescaped quotes, backslashes in a password, etc.)
  // surfaces a clear error instead of silently aborting the export.
  let macroJson;
  try {
    let macroStr = JSON.stringify(MACRO_TEMPLATE, null, 2);
    for (const [placeholder, value] of Object.entries(replacements)) {
      macroStr = macroStr.split(placeholder).join(value);
    }
    macroJson = JSON.parse(macroStr);
  } catch (err) {
    console.error('[Export] Macro substitution produced invalid JSON:', err);
    logDiag('export', 'export FAILED — invalid JSON', { error: String(err && err.message || err) });
    for (const [k, v] of Object.entries(replacements)) {
      if (typeof v === 'string' && (v.includes('"') || v.includes('\\'))) {
        console.warn('  Suspect placeholder:', k, '→', v);
      }
    }
    alert('Export failed: a config value broke the macro JSON.\nOpen DevTools → Console for the exact placeholder.');
    return;
  }

  // Read macro name from EXPORT step input, sanitize for filename/task name safety
  const rawName   = (document.getElementById('t-macroname')?.value || state.config.macroName || 'BookingTemplate').trim();
  const macroName = rawName.replace(/[^a-zA-Z0-9_\-]/g, '_');
  state.config.macroName = macroName;
  logDiag('export', 'export OK', { macroName });
  // exportAll() downloads all 4 files: macro JSON + RunBooking.bat + RegisterTask.bat + README
  exportAll(state.config, macroJson, macroName);
});


// --- Helpers ------------------------------------------------------------------

function selectorToString(sel) {
  if (!sel) return '';
  if (typeof sel === 'string') return sel;
  if (sel.css)               return 'css='   + sel.css;
  if (sel.xpath)             return 'xpath=' + sel.xpath;
  if (sel.type && sel.value) return sel.type + '=' + sel.value;
  return JSON.stringify(sel);
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

function saveState() {
  chrome.storage.local.set({ wizardState: state });
}

function loadState() {
  chrome.storage.local.get('wizardState', (r) => {
    if (r.wizardState) state = r.wizardState;
    render();
  });
}

loadState();

// ─── COPY DEBUG LOG BUTTON (beta) ─────────────────────────────────────────────
(function () {
  const btn = document.getElementById('btn-copylog');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const text = getDiagText() || '(no log entries yet)';
    navigator.clipboard.writeText(text).then(
      () => { btn.textContent = '✅ Copied — paste it to the developer'; setTimeout(() => { btn.textContent = '📋 Copy debug log'; }, 2500); },
      () => { btn.textContent = '⚠️ Copy failed — open DevTools console'; }
    );
  });
})();
// ──────────────────────────────────────────────────────────────────────────────