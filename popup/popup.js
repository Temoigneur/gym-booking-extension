const STEPS = [
  'INTRO',
  'CAPTURE_CLUB',
  'CAPTURE_USERNAME_FIELD',
  'CAPTURE_PASSWORD_FIELD',
  'CAPTURE_SUBMIT_BUTTON',
  'CAPTURE_SCHEDULE_URL',
  'CAPTURE_CLASS_NAME',
  'CAPTURE_TIMESLOT',
  'CAPTURE_PARTICIPANTS',
  'CAPTURE_SPOT_PREFERENCES',
  'SET_SCHEDULE',
  'EXPORT'
];

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
  CAPTURE_SCHEDULE_URL: {
    title: 'Step 5 - Class Schedule Page',
    instruction: 'Click the Log In button on the page to log in to Lifetime, then navigate to the Class Schedule page showing the class you want to book on the date you\'d like.\n\nOnce you can see the class listed on screen, click "Capture URL" below, then click anywhere on the screen, even if a class is highlighted, the wizard will capture the "Class Schedule webpage URL".',
    captureKey: 'scheduleUrl',
    captureLabel: 'Capture URL',
    captureType: 'url',
    screenshot: 'images/schedule-example.png'
  },
  CAPTURE_CLASS_NAME: {
    title: 'Step 6 - Your Class',
    instruction: 'On the same Class Schedule page, click "Capture Class" below, then click directly on the name of the class you want to book.',
    captureKey: 'classSelector',
    captureLabel: 'Capture Class',
    captureType: 'click'
  },
  CAPTURE_TIMESLOT: {
    title: 'Step 7 - Class Time',
    instruction: 'The clicking is all done! We just need a few more details to make your bookings automatic.\n\nEnter the exact time your class starts.',
    captureKey: 'timeslot',
    captureType: 'typed'
  },
  CAPTURE_PARTICIPANTS: {
    title: 'Step 8 - Who\'s Booking',
    instruction: 'Enter the first names of everyone to book for, one per line, up to 7 people.\n\nInclude YOUR OWN name if you want to book for yourself — put it on the first line. Leave your name out if you only want to book for others.',
    captureKey: 'participants',
    captureType: 'typed'
  },
  CAPTURE_SPOT_PREFERENCES: {
    title: 'COMING SOON!!! THIS FEATURE IS NOT YET AVAILABLE - Step 9 - Preferred Spots (optional)',
    instruction: 'Some classes (yoga, cycle, barre) let you choose your spot. Enter a preferred seat number for any participant who wants a specific one — same order as the names from Step 8. Leave blank to take whatever the site auto-assigns.\n\nIf your class doesn\'t use assigned seating (most classes), just leave everything blank and click Next — the macro will skip this step automatically. If your preferred seat is already taken, then macro will auto-assign you seat(s), but you can always change those by clicking "edit spots" in your reservation.',
    captureKey: 'spotPreferences',
    captureType: 'typed'
  },
  SET_SCHEDULE: {
    title: 'Step 10 - Booking Schedule',
    instruction: 'How far in advance should the macro book, and what time should it run?',
    captureKey: 'schedule',
    captureType: 'typed'
  },
EXPORT: {
  title: 'Step 11 - Name & Download',
  instruction: 'Give this booking a unique name (e.g. "Pickleball_Wednesday" or "Yoga_Friday"). Then click Export to download your 4 automation files.',
  captureKey: null,
  captureType: null
}
};

const URL_ARMED_INSTRUCTIONS = {
  CAPTURE_SCHEDULE_URL: 'Now click anywhere on the Class Schedule page to capture its URL...'
};

const CLICK_ARMED_INSTRUCTIONS = {
  CAPTURE_CLASS_NAME: 'Now click the class name on the Class Schedule page...',
  DEFAULT: 'Now click the element on the page...'
};

// --- Macro Template -----------------------------------------------------------
const MACRO_TEMPLATE = {
  "Name": "BookingTemplate",
  "CreationDate": "2026-5-27",
  "Commands": [
    {
      "Command": "open",
      "Target": "##clubHomeUrl##",
      "Value": "",
      "Description": "Open the club homepage - gives UIVision a live tab"
    },
    {
      "Command": "waitForPageToLoad",
      "Target": "30000",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "RUN MODE \u2014 true = run immediately (testing), false = wait for booking window",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "store",
      "Target": "##runImmediately##",
      "Value": "runImmediately",
      "Description": "Set by wizard checkbox. true skips the clock gate; false holds until the booking window opens."
    },
    {
      "Command": "comment",
      "Target": "CHECK LOGIN STATE \u2014 log in first, before anything else",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "var c = document.cookie || ''; var hasAuth = /(^|;)\\s*(lt-authentication|lt-authorization|LTFSSOIDCookie)=/.test(c); return hasAuth ? 'LOGGED_IN' : 'LOGGED_OUT';",
      "Value": "loginState",
      "Description": "Detect login via Life Time auth cookies (reliable)"
    },
    {
      "Command": "if",
      "Target": "${loginState} == 'LOGGED_OUT'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "open",
      "Target": "##loginUrl##",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForPageToLoad",
      "Target": "30000",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForElementVisible",
      "Target": "##usernameSelector##",
      "Value": "10000",
      "Description": ""
    },
    {
      "Command": "click",
      "Target": "##usernameSelector##",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "type",
      "Target": "##usernameSelector##",
      "Value": "##username##",
      "Description": ""
    },
    {
      "Command": "waitForElementVisible",
      "Target": "##passwordSelector##",
      "Value": "10000",
      "Description": ""
    },
    {
      "Command": "click",
      "Target": "##passwordSelector##",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "type",
      "Target": "##passwordSelector##",
      "Value": "##password##",
      "Description": ""
    },
    {
      "Command": "clickAndWait",
      "Target": "##submitSelector##",
      "Value": "",
      "Description": "Submit login \u2014 clickAndWait blocks for the navigation"
    },
    {
      "Command": "pause",
      "Target": "5000",
      "Value": "",
      "Description": "Give the Azure AD B2C redirect chain time to complete (auth.lifetime.life -> landing.html)"
    },
    {
      "Command": "waitForElementNotPresent",
      "Target": "##usernameSelector##",
      "Value": "20000",
      "Description": "Confirm the login form is gone \u2014 i.e. login actually completed"
    },
    {
      "Command": "waitForPageToLoad",
      "Target": "30000",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": "End login if block"
    },
    {
      "Command": "comment",
      "Target": "CALCULATE TARGET DATE",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const d = new Date(new Date().toLocaleString('en-US', {timeZone: '##timezone##'})); d.setDate(d.getDate() + parseInt('##daysAhead##')); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); return d.getFullYear() + '-' + mm + '-' + dd;",
      "Value": "targetDate",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "NAVIGATE TO DATED SCHEDULE PAGE",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "open",
      "Target": "##scheduleUrl##?selectedDate=${targetDate}&mode=day",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForPageToLoad",
      "Target": "30000",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "CLOCK GATE \u2014 held until booking window opens, unless runImmediately is true",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "if",
      "Target": "${runImmediately} != 'true'",
      "Value": "",
      "Description": "Skip the entire wait loop when running in immediate/test mode"
    },
    {
      "Command": "executeScript",
      "Target": "const now = new Date(); const target = new Date(); target.setHours(parseInt('##runHour##'), parseInt('##runMinute##'), 3, 0); return now >= target ? 'GO' : 'WAIT';",
      "Value": "clockStatus",
      "Description": ""
    },
    {
      "Command": "while",
      "Target": "${clockStatus} != 'GO'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "2000",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const now = new Date(); const target = new Date(); target.setHours(parseInt('##runHour##'), parseInt('##runMinute##'), 3, 0); return now >= target ? 'GO' : 'WAIT';",
      "Value": "clockStatus",
      "Description": ""
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": "End while loop"
    },
    {
      "Command": "comment",
      "Target": "Booking window open \u2014 reload dated page to get fresh availability",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "open",
      "Target": "##scheduleUrl##?selectedDate=${targetDate}&mode=day",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForPageToLoad",
      "Target": "30000",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": "End runImmediately if block"
    },
    {
      "Command": "comment",
      "Target": "WAIT FOR VUE SPINNER",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForElementNotVisible",
      "Target": "css=[data-testid='sectionSpinner']",
      "Value": "15000",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "FORCE DAY VIEW \u2014 click dayViewBtn if present (only renders when page is in Week View)",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "var btn=document.querySelector('[data-testid=\"dayViewBtn\"]'); if(btn && btn.offsetParent!==null){ btn.click(); return 'SWITCHED'; } return 'ALREADY_DAY';",
      "Value": "viewState",
      "Description": "If the dayViewBtn exists we are in Week View \u2014 click it to force Day View. Otherwise we are already in Day View."
    },
    {
      "Command": "if",
      "Target": "${viewState} == 'SWITCHED'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForElementNotVisible",
      "Target": "css=[data-testid='sectionSpinner']",
      "Value": "15000",
      "Description": "Wait for the schedule to re-render after switching to Day View"
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": "Brief settle so Vue commits the Day View DOM before XPath runs"
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": "End viewState if block"
    },
    {
      "Command": "comment",
      "Target": "FIND CLASS CARD",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const ampm='##timeslotAmPm##'; const ct='##classTime##'; const cn='##className##'; const xpWeek=ampm==='Any'?\"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and normalize-space(text())='\"+ct+\"']]//a[@data-testid='classLink']\":\"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and normalize-space(text())='\"+ct+\"'] and .//span[@class='time-ampm' and normalize-space(text())='\"+ampm+\"']]//a[@data-testid='classLink']\"; const xpDay=ampm==='Any'?\"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and (normalize-space(text())='\"+ct+\":00' or normalize-space(text())='\"+ct+\"')]]//a[@data-testid='classLink']\":\"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and (normalize-space(text())='\"+ct+\":00' or normalize-space(text())='\"+ct+\"')] and .//span[@class='time-ampm' and normalize-space(text())='\"+ampm+\"']]//a[@data-testid='classLink']\"; const ev=document.evaluate.bind(document); const hit=ev(xpWeek,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue||ev(xpDay,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue; return hit?'FOUND':'NOT_FOUND';",
      "Value": "classFound",
      "Description": "Dual-view XPath: tries Week View bare-hour format first, then Day View H:MM format"
    },
    {
      "Command": "if",
      "Target": "${classFound} != 'FOUND'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "echo",
      "Target": "ERROR: Class not found - ##className## at ##classTime## ##timeslotAmPm## on ${targetDate} \u2014 macro ends here",
      "Value": "red",
      "Description": "Class not on schedule \u2014 macro ends naturally after this block"
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const ampm='##timeslotAmPm##'; const ct='##classTime##'; const cn='##className##'; const xpWeek=ampm==='Any'?\"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and normalize-space(text())='\"+ct+\"']]//a[@data-testid='classLink']\":\"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and normalize-space(text())='\"+ct+\"'] and .//span[@class='time-ampm' and normalize-space(text())='\"+ampm+\"']]//a[@data-testid='classLink']\"; const xpDay=ampm==='Any'?\"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and (normalize-space(text())='\"+ct+\":00' or normalize-space(text())='\"+ct+\"')]]//a[@data-testid='classLink']\":\"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and (normalize-space(text())='\"+ct+\":00' or normalize-space(text())='\"+ct+\"')] and .//span[@class='time-ampm' and normalize-space(text())='\"+ampm+\"']]//a[@data-testid='classLink']\"; const ev=document.evaluate.bind(document); const el=ev(xpWeek,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue||ev(xpDay,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue; if(el)el.click();",
      "Value": "",
      "Description": "Dual-view XPath click: tries Week View bare-hour format first, then Day View H:MM format"
    },
    {
      "Command": "comment",
      "Target": "WAIT FOR REGISTRATION PANEL",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForElementNotVisible",
      "Target": "css=[data-testid='sectionSpinner']",
      "Value": "15000",
      "Description": ""
    },
    {
      "Command": "waitForElementPresent",
      "Target": "css=[data-testid='reserveButton']",
      "Value": "15000",
      "Description": "Wait for presence, not visibility \u2014 Vue renders the button into the DOM before it is painted"
    },
    {
      "Command": "comment",
      "Target": "CHECK RESERVE BUTTON TEXT",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"reserveButton\"]')); var btn=btns.find(function(b){return b.offsetParent!==null;})||btns[0]; return btn ? btn.innerText.trim() : 'NOT_FOUND';",
      "Value": "reserveButtonText",
      "Description": ""
    },
    {
      "Command": "if",
      "Target": "${reserveButtonText} == 'Log in to Reserve'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "echo",
      "Target": "ERROR: Not logged in \u2014 macro ends here",
      "Value": "red",
      "Description": "Reserve button shows login prompt \u2014 macro ends naturally after this block"
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "SELECT PARTICIPANTS",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForElementPresent",
      "Target": "css=[data-testid='participantCheckBox']",
      "Value": "15000",
      "Description": "Wait for the participant list to render before ticking any boxes"
    },
    {
      "Command": "pause",
      "Target": "1000",
      "Value": "",
      "Description": "Brief settle so all participant rows are wired up by Vue"
    },
    {
      "Command": "comment",
      "Target": "participant0 \u2014 primary account holder: check if name provided, uncheck if blank",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const name='##participant0##'; const cbs=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')); const lbls=Array.from(document.querySelectorAll('[data-testid=\"participantLabel\"]')); if(!name){ const pre=cbs.find(c=>c.checked && c.offsetParent!==null); if(pre){ pre.click(); } return 'UNCHECKED'; } let hits=[]; for(let i=0;i<lbls.length;i++){ if(lbls[i].innerText.includes(name)){ hits.push(i); } } if(hits.length===0){ return 'NOT_FOUND'; } let idx=hits.find(i=>cbs[i]&&cbs[i].offsetParent!==null); if(idx===undefined){ idx=hits[0]; } const cb=cbs[idx]; if(!cb){ return 'NOT_FOUND'; } if(!cb.checked){ cb.click(); } return cb.checked?'CHECKED':'CLICKED';",
      "Value": "p0Status",
      "Description": "Primary account holder slot \u2014 unchecks the pre-checked box if name is blank"
    },
    {
      "Command": "comment",
      "Target": "participant1",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const name='##participant1##'; if(!name){ return 'SKIP'; } const cbs=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')); const lbls=Array.from(document.querySelectorAll('[data-testid=\"participantLabel\"]')); let hits=[]; for(let i=0;i<lbls.length;i++){ if(lbls[i].innerText.includes(name)){ hits.push(i); } } if(hits.length===0){ return 'NOT_FOUND'; } let idx=hits.find(i=>cbs[i]&&cbs[i].offsetParent!==null); if(idx===undefined){ idx=hits[0]; } const cb=cbs[idx]; if(!cb){ return 'NOT_FOUND'; } if(!cb.checked){ cb.click(); } return cb.checked?'CHECKED':'CLICKED';",
      "Value": "p1Status",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "participant2",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const name='##participant2##'; if(!name){ return 'SKIP'; } const cbs=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')); const lbls=Array.from(document.querySelectorAll('[data-testid=\"participantLabel\"]')); let hits=[]; for(let i=0;i<lbls.length;i++){ if(lbls[i].innerText.includes(name)){ hits.push(i); } } if(hits.length===0){ return 'NOT_FOUND'; } let idx=hits.find(i=>cbs[i]&&cbs[i].offsetParent!==null); if(idx===undefined){ idx=hits[0]; } const cb=cbs[idx]; if(!cb){ return 'NOT_FOUND'; } if(!cb.checked){ cb.click(); } return cb.checked?'CHECKED':'CLICKED';",
      "Value": "p2Status",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "participant3",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const name='##participant3##'; if(!name){ return 'SKIP'; } const cbs=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')); const lbls=Array.from(document.querySelectorAll('[data-testid=\"participantLabel\"]')); let hits=[]; for(let i=0;i<lbls.length;i++){ if(lbls[i].innerText.includes(name)){ hits.push(i); } } if(hits.length===0){ return 'NOT_FOUND'; } let idx=hits.find(i=>cbs[i]&&cbs[i].offsetParent!==null); if(idx===undefined){ idx=hits[0]; } const cb=cbs[idx]; if(!cb){ return 'NOT_FOUND'; } if(!cb.checked){ cb.click(); } return cb.checked?'CHECKED':'CLICKED';",
      "Value": "p3Status",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "participant4",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const name='##participant4##'; if(!name){ return 'SKIP'; } const cbs=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')); const lbls=Array.from(document.querySelectorAll('[data-testid=\"participantLabel\"]')); let hits=[]; for(let i=0;i<lbls.length;i++){ if(lbls[i].innerText.includes(name)){ hits.push(i); } } if(hits.length===0){ return 'NOT_FOUND'; } let idx=hits.find(i=>cbs[i]&&cbs[i].offsetParent!==null); if(idx===undefined){ idx=hits[0]; } const cb=cbs[idx]; if(!cb){ return 'NOT_FOUND'; } if(!cb.checked){ cb.click(); } return cb.checked?'CHECKED':'CLICKED';",
      "Value": "p4Status",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "participant5",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const name='##participant5##'; if(!name){ return 'SKIP'; } const cbs=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')); const lbls=Array.from(document.querySelectorAll('[data-testid=\"participantLabel\"]')); let hits=[]; for(let i=0;i<lbls.length;i++){ if(lbls[i].innerText.includes(name)){ hits.push(i); } } if(hits.length===0){ return 'NOT_FOUND'; } let idx=hits.find(i=>cbs[i]&&cbs[i].offsetParent!==null); if(idx===undefined){ idx=hits[0]; } const cb=cbs[idx]; if(!cb){ return 'NOT_FOUND'; } if(!cb.checked){ cb.click(); } return cb.checked?'CHECKED':'CLICKED';",
      "Value": "p5Status",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "participant6",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "const name='##participant6##'; if(!name){ return 'SKIP'; } const cbs=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')); const lbls=Array.from(document.querySelectorAll('[data-testid=\"participantLabel\"]')); let hits=[]; for(let i=0;i<lbls.length;i++){ if(lbls[i].innerText.includes(name)){ hits.push(i); } } if(hits.length===0){ return 'NOT_FOUND'; } let idx=hits.find(i=>cbs[i]&&cbs[i].offsetParent!==null); if(idx===undefined){ idx=hits[0]; } const cb=cbs[idx]; if(!cb){ return 'NOT_FOUND'; } if(!cb.checked){ cb.click(); } return cb.checked?'CHECKED':'CLICKED';",
      "Value": "p6Status",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "CLICK RESERVE - wait until button count matches checked participants",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"reserveButton\"]')); var btn=btns.find(function(b){return b.offsetParent!==null;})||btns[0]; if(!btn){ return 'WAIT'; } var txt=(btn.innerText||'').trim(); var m=txt.match(/(\\d+)/); var btnCount=m?parseInt(m[1],10):(/reserve/i.test(txt)?1:0); var cbs=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')); var checked=cbs.filter(function(c){return c.checked && c.offsetParent!==null;}).length; return (checked>=1 && btnCount===checked) ? 'READY' : 'WAIT';",
      "Value": "reserveReady",
      "Description": "READY when reserve button participant count matches the checked boxes"
    },
    {
      "Command": "while",
      "Target": "${reserveReady} != 'READY'",
      "Value": "",
      "Description": "Wait for Vue to commit all participants into the reserve button state"
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"reserveButton\"]')); var btn=btns.find(function(b){return b.offsetParent!==null;})||btns[0]; if(!btn){ return 'WAIT'; } var txt=(btn.innerText||'').trim(); var m=txt.match(/(\\d+)/); var btnCount=m?parseInt(m[1],10):(/reserve/i.test(txt)?1:0); var cbs=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')); var checked=cbs.filter(function(c){return c.checked && c.offsetParent!==null;}).length; return (checked>=1 && btnCount===checked) ? 'READY' : 'WAIT';",
      "Value": "reserveReady",
      "Description": "Re-check reserve-ready state"
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": "End reserve-ready while loop"
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": "Small settle after counts agree, before clicking Reserve"
    },
    {
      "Command": "executeScript",
      "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"reserveButton\"]')); var btn=btns.find(function(b){return b.offsetParent!==null;})||btns[0]; if(btn){ btn.click(); } return btn ? 'CLICKED' : 'NOT_FOUND';",
      "Value": "reserveClicked",
      "Description": "Click the VISIBLE reserve button (site renders a hidden mobile duplicate)"
    },
    {
      "Command": "comment",
      "Target": "POST-RESERVE — unified flow handler (seat-map OR no-seat-map)",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForElementPresent",
      "Target": "css=[data-testid='reservation-component']",
      "Value": "20000",
      "Description": "Both flows land on the reservation-component page — wait for it to mount."
    },
    {
      "Command": "waitForElementNotVisible",
      "Target": "css=[data-testid='spinner']",
      "Value": "20000",
      "Description": "Wait for the post-reserve spinner (data-testid='spinner', NOT sectionSpinner) to clear."
    },
    {
      "Command": "executeScript",
      "Target": "var checked=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')).filter(function(c){return c.checked && c.offsetParent!==null;}).length; return checked||1;",
      "Value": "participantCount",
      "Description": "Snapshot checked-participant count for spot-assignment readiness check. Falls back to 1 if checkboxes already unmounted."
    },
    {
      "Command": "executeScript",
      "Target": "return document.querySelectorAll('[data-testid=\"spotAvailable\"]').length>0 ? 'SEAT_MAP' : 'NO_SEAT_MAP';",
      "Value": "postReserveFlow",
      "Description": "Branch detection: spotAvailable elements only render for classes with assigned seating."
    },
    {
      "Command": "if",
      "Target": "${postReserveFlow} == 'SEAT_MAP'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "Flow A — APPLY PREFERRED SPOTS",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var btns=Array.from(document.querySelectorAll('button')).filter(function(b){return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); var spots=document.querySelectorAll('[data-testid=\"spotAvailable\"]'); return (btns.length>0 && spots.length>0) ? 'READY' : 'NOT_READY';",
      "Value": "seatMapReady",
      "Description": "Returns READY when Edit Spot buttons and spotAvailable nodes are both present."
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${seatMapReady} == 'READY'",
      "Value": "spotsReadyDone",
      "Description": "Skip wait if already ready."
    },
    {
      "Command": "pause",
      "Target": "1500",
      "Value": "",
      "Description": "Give the seat map a moment to load."
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var btns=Array.from(document.querySelectorAll('button')).filter(function(b){return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); var spots=document.querySelectorAll('[data-testid=\"spotAvailable\"]'); return (btns.length>0 && spots.length>0) ? 'READY' : 'NOT_READY';",
      "Value": "seatMapReady",
      "Description": "Re-check readiness."
    },
    {
      "Command": "label",
      "Target": "spotsReadyDone",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var names=JSON.parse('##participantsJson##'); var prefs=JSON.parse('##spotPrefsJson##'); window.__lt={names:names,prefs:prefs,results:[]}; return 'PARSED:'+names.length;",
      "Value": "parseResult",
      "Description": "Stash names/prefs on window.__lt for subsequent per-participant scripts."
    },
    {
      "Command": "comment",
      "Target": "PRE-FLIGHT — if any preferred spot is unavailable, revert: keep auto-assigned defaults and skip the per-participant Edit Spot loop entirely.",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var prefs=window.__lt.prefs||[]; var names=window.__lt.names||[]; var avail=Array.from(document.querySelectorAll('[data-testid=\"spotAvailable\"]')).map(function(s){return (s.textContent||'').trim();}); var sel=Array.from(document.querySelectorAll('[data-testid=\"spotSelected\"]')); var defaults=sel.map(function(e){ var t=e.getAttribute('data-original-title')||e.getAttribute('title')||''; var m=t.match(/^(.+?)\\s*\\(Spot\\s*(\\d+)\\)/i); return m?(m[1].trim()+'=Spot'+m[2]):'?'; }).join(', '); var missing=[]; for(var i=0;i<names.length;i++){ if(!names[i]||!prefs[i]) continue; if(avail.indexOf(String(prefs[i]))===-1){ missing.push(names[i]+':'+prefs[i]); } } if(missing.length>0){ window.__lt.revertToDefaults=true; window.__lt.defaults=defaults; window.__lt.missing=missing.join(','); return 'REVERT'; } window.__lt.revertToDefaults=false; window.__lt.defaults=defaults; return 'PROCEED';",
      "Value": "spotCheck",
      "Description": "If any preferred spot isn't in spotAvailable, set revertToDefaults=true and record the site's auto-assigned defaults so the verify block can report them."
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${spotCheck} == 'REVERT'",
      "Value": "spotsDone",
      "Description": "One or more preferred spots are taken — skip the per-participant loop entirely and let the auto-assigned defaults stand."
    },
    {
      "Command": "comment",
      "Target": "Participant 1",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=0; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var btn=Array.from(document.querySelectorAll('button')).find(function(b){ return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null && new RegExp('\\\\b'+n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&')+'\\\\b.*assigned spot','i').test((b.parentElement&&b.parentElement.textContent)||''); }); if(!btn){ return 'NO_EDIT'; } btn.click(); return 'CLICKED';",
      "Value": "editClick1",
      "Description": "Find and click Edit Spot for participant."
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": "Wait for edit mode to engage."
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${editClick1} != 'CLICKED'",
      "Value": "skipSpot1",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=0; var p=window.__lt.prefs[i]; var n=window.__lt.names[i]; var target=Array.from(document.querySelectorAll('[data-testid=\"spotAvailable\"]')).find(function(s){return (s.textContent||'').trim()===String(p) && s.getBoundingClientRect().width>0;}); if(!target){ var cancel=Array.from(document.querySelectorAll('button')).find(function(b){return /^cancel$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); if(cancel) cancel.click(); window.__lt.results.push(n+':SPOT_'+p+'_UNAVAILABLE'); return 'UNAVAILABLE'; } var r=target.getBoundingClientRect(); ['mousedown','mouseup','click'].forEach(function(t){ target.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0})); }); window.__lt.results.push(n+':SPOT_'+p); return 'OK';",
      "Value": "spotClick1",
      "Description": "Click preferred spot for participant; cancel edit mode if spot taken."
    },
    {
      "Command": "pause",
      "Target": "700",
      "Value": "",
      "Description": "Wait for Vue to commit the selection."
    },
    {
      "Command": "label",
      "Target": "skipSpot1",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "Participant 2",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=1; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var btn=Array.from(document.querySelectorAll('button')).find(function(b){ return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null && new RegExp('\\\\b'+n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&')+'\\\\b.*assigned spot','i').test((b.parentElement&&b.parentElement.textContent)||''); }); if(!btn){ return 'NO_EDIT'; } btn.click(); return 'CLICKED';",
      "Value": "editClick2",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${editClick2} != 'CLICKED'",
      "Value": "skipSpot2",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=1; var p=window.__lt.prefs[i]; var n=window.__lt.names[i]; var target=Array.from(document.querySelectorAll('[data-testid=\"spotAvailable\"]')).find(function(s){return (s.textContent||'').trim()===String(p) && s.getBoundingClientRect().width>0;}); if(!target){ var cancel=Array.from(document.querySelectorAll('button')).find(function(b){return /^cancel$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); if(cancel) cancel.click(); window.__lt.results.push(n+':SPOT_'+p+'_UNAVAILABLE'); return 'UNAVAILABLE'; } var r=target.getBoundingClientRect(); ['mousedown','mouseup','click'].forEach(function(t){ target.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0})); }); window.__lt.results.push(n+':SPOT_'+p); return 'OK';",
      "Value": "spotClick2",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "700",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "label",
      "Target": "skipSpot2",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "Participant 3",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=2; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var btn=Array.from(document.querySelectorAll('button')).find(function(b){ return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null && new RegExp('\\\\b'+n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&')+'\\\\b.*assigned spot','i').test((b.parentElement&&b.parentElement.textContent)||''); }); if(!btn){ return 'NO_EDIT'; } btn.click(); return 'CLICKED';",
      "Value": "editClick3",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${editClick3} != 'CLICKED'",
      "Value": "skipSpot3",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=2; var p=window.__lt.prefs[i]; var n=window.__lt.names[i]; var target=Array.from(document.querySelectorAll('[data-testid=\"spotAvailable\"]')).find(function(s){return (s.textContent||'').trim()===String(p) && s.getBoundingClientRect().width>0;}); if(!target){ var cancel=Array.from(document.querySelectorAll('button')).find(function(b){return /^cancel$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); if(cancel) cancel.click(); window.__lt.results.push(n+':SPOT_'+p+'_UNAVAILABLE'); return 'UNAVAILABLE'; } var r=target.getBoundingClientRect(); ['mousedown','mouseup','click'].forEach(function(t){ target.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0})); }); window.__lt.results.push(n+':SPOT_'+p); return 'OK';",
      "Value": "spotClick3",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "700",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "label",
      "Target": "skipSpot3",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "Participant 4",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=3; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var btn=Array.from(document.querySelectorAll('button')).find(function(b){ return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null && new RegExp('\\\\b'+n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&')+'\\\\b.*assigned spot','i').test((b.parentElement&&b.parentElement.textContent)||''); }); if(!btn){ return 'NO_EDIT'; } btn.click(); return 'CLICKED';",
      "Value": "editClick4",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${editClick4} != 'CLICKED'",
      "Value": "skipSpot4",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=3; var p=window.__lt.prefs[i]; var n=window.__lt.names[i]; var target=Array.from(document.querySelectorAll('[data-testid=\"spotAvailable\"]')).find(function(s){return (s.textContent||'').trim()===String(p) && s.getBoundingClientRect().width>0;}); if(!target){ var cancel=Array.from(document.querySelectorAll('button')).find(function(b){return /^cancel$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); if(cancel) cancel.click(); window.__lt.results.push(n+':SPOT_'+p+'_UNAVAILABLE'); return 'UNAVAILABLE'; } var r=target.getBoundingClientRect(); ['mousedown','mouseup','click'].forEach(function(t){ target.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0})); }); window.__lt.results.push(n+':SPOT_'+p); return 'OK';",
      "Value": "spotClick4",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "700",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "label",
      "Target": "skipSpot4",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "Participant 5",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=4; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var btn=Array.from(document.querySelectorAll('button')).find(function(b){ return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null && new RegExp('\\\\b'+n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&')+'\\\\b.*assigned spot','i').test((b.parentElement&&b.parentElement.textContent)||''); }); if(!btn){ return 'NO_EDIT'; } btn.click(); return 'CLICKED';",
      "Value": "editClick5",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${editClick5} != 'CLICKED'",
      "Value": "skipSpot5",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=4; var p=window.__lt.prefs[i]; var n=window.__lt.names[i]; var target=Array.from(document.querySelectorAll('[data-testid=\"spotAvailable\"]')).find(function(s){return (s.textContent||'').trim()===String(p) && s.getBoundingClientRect().width>0;}); if(!target){ var cancel=Array.from(document.querySelectorAll('button')).find(function(b){return /^cancel$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); if(cancel) cancel.click(); window.__lt.results.push(n+':SPOT_'+p+'_UNAVAILABLE'); return 'UNAVAILABLE'; } var r=target.getBoundingClientRect(); ['mousedown','mouseup','click'].forEach(function(t){ target.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0})); }); window.__lt.results.push(n+':SPOT_'+p); return 'OK';",
      "Value": "spotClick5",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "700",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "label",
      "Target": "skipSpot5",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "Participant 6",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=5; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var btn=Array.from(document.querySelectorAll('button')).find(function(b){ return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null && new RegExp('\\\\b'+n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&')+'\\\\b.*assigned spot','i').test((b.parentElement&&b.parentElement.textContent)||''); }); if(!btn){ return 'NO_EDIT'; } btn.click(); return 'CLICKED';",
      "Value": "editClick6",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${editClick6} != 'CLICKED'",
      "Value": "skipSpot6",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=5; var p=window.__lt.prefs[i]; var n=window.__lt.names[i]; var target=Array.from(document.querySelectorAll('[data-testid=\"spotAvailable\"]')).find(function(s){return (s.textContent||'').trim()===String(p) && s.getBoundingClientRect().width>0;}); if(!target){ var cancel=Array.from(document.querySelectorAll('button')).find(function(b){return /^cancel$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); if(cancel) cancel.click(); window.__lt.results.push(n+':SPOT_'+p+'_UNAVAILABLE'); return 'UNAVAILABLE'; } var r=target.getBoundingClientRect(); ['mousedown','mouseup','click'].forEach(function(t){ target.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0})); }); window.__lt.results.push(n+':SPOT_'+p); return 'OK';",
      "Value": "spotClick6",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "700",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "label",
      "Target": "skipSpot6",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "Participant 7",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=6; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var btn=Array.from(document.querySelectorAll('button')).find(function(b){ return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null && new RegExp('\\\\b'+n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&')+'\\\\b.*assigned spot','i').test((b.parentElement&&b.parentElement.textContent)||''); }); if(!btn){ return 'NO_EDIT'; } btn.click(); return 'CLICKED';",
      "Value": "editClick7",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "500",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${editClick7} != 'CLICKED'",
      "Value": "skipSpot7",
      "Description": ""
    },
    {
      "Command": "executeScript_Sandbox",
      "Target": "var i=6; var p=window.__lt.prefs[i]; var n=window.__lt.names[i]; var target=Array.from(document.querySelectorAll('[data-testid=\"spotAvailable\"]')).find(function(s){return (s.textContent||'').trim()===String(p) && s.getBoundingClientRect().width>0;}); if(!target){ var cancel=Array.from(document.querySelectorAll('button')).find(function(b){return /^cancel$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); if(cancel) cancel.click(); window.__lt.results.push(n+':SPOT_'+p+'_UNAVAILABLE'); return 'UNAVAILABLE'; } var r=target.getBoundingClientRect(); ['mousedown','mouseup','click'].forEach(function(t){ target.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0})); }); window.__lt.results.push(n+':SPOT_'+p); return 'OK';",
      "Value": "spotClick7",
      "Description": ""
    },
    {
      "Command": "pause",
      "Target": "700",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "label",
      "Target": "skipSpot7",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "label",
      "Target": "spotsDone",
      "Value": "",
      "Description": "Jump target for the pre-flight revert path."
    },
  {
        "Command": "executeScript_Sandbox",
        "Target": "var sel=Array.from(document.querySelectorAll('[data-testid=\"spotSelected\"]')); var assigns=sel.map(function(e){ var t=e.getAttribute('data-original-title')||e.getAttribute('title')||''; var m=t.match(/^(.+?)\\s*\\(Spot\\s*(\\d+)\\)/i); return m?{name:m[1].trim(),spot:m[2]}:null; }).filter(Boolean); var prefs=window.__lt.prefs||[], names=window.__lt.names||[]; if(window.__lt.revertToDefaults){ var current=assigns.map(function(a){return a.name+'=Spot'+a.spot;}).join(', '); return 'REVERTED_TO_DEFAULTS: preferred unavailable=['+(window.__lt.missing||'')+'] | current assignments=['+current+']'; } var report=[]; for(var i=0;i<names.length;i++){ if(!names[i]||!prefs[i]) continue; var a=assigns.find(function(x){return x.name.toLowerCase()===names[i].toLowerCase();}); if(!a){ report.push(names[i]+':NOT_ASSIGNED'); } else if(a.spot===String(prefs[i])){ report.push(names[i]+':OK_'+a.spot); } else { report.push(names[i]+':GOT_'+a.spot+'_WANTED_'+prefs[i]); } } var log=(window.__lt.results||[]).join('; '); return 'APPLIED_PREFERENCES: '+report.join('; ')+' || LOG: '+log;",
        "Value": "verifyResult",
        "Description": "If reverted, reports the auto-assigned spots. Otherwise diffs current assignments against preferences."
      },
    {
      "Command": "echo",
      "Target": "Spot assignment result: ${verifyResult}",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": "End SEAT_MAP if block — Flow B falls through directly to Finish"
    },
    {
      "Command": "comment",
      "Target": "CLICK FINISH — same button on both flows",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"finishBtn\"]')); var btn=btns.find(function(b){return b.offsetParent!==null && !b.disabled;})||btns.find(function(b){return b.offsetParent!==null;})||btns[0]; return btn ? (btn.disabled ? 'DISABLED' : 'READY') : 'NOT_FOUND';",
      "Value": "finishBtnState",
      "Description": "Verify Finish button is present, visible, and enabled."
    },
    {
      "Command": "if",
      "Target": "${finishBtnState} != 'READY'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "echo",
      "Target": "ERROR: Finish button not ready (state=${finishBtnState}) — booking incomplete",
      "Value": "red",
      "Description": ""
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "if",
      "Target": "${finishBtnState} == 'READY'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"finishBtn\"]')); var btn=btns.find(function(b){return b.offsetParent!==null && !b.disabled;})||btns.find(function(b){return b.offsetParent!==null;})||btns[0]; if(btn){ btn.click(); } return btn ? 'CLICKED' : 'NOT_FOUND';",
      "Value": "finishClicked",
      "Description": "Click the visible enabled Finish button."
    },
    {
      "Command": "waitForPageToLoad",
      "Target": "15000",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "var hdr=Array.from(document.querySelectorAll('[data-testid=\"pendingReservationHeader\"]')).find(function(e){return e.offsetParent!==null;}); return hdr ? 'STILL_PENDING' : 'CONFIRMED';",
      "Value": "bookingResult",
      "Description": "If Pending Reservation header is gone, booking committed. If it remains, the Finish click didn't take."
    },
    {
      "Command": "if",
      "Target": "${bookingResult} == 'CONFIRMED'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "echo",
      "Target": "SUCCESS: Booking confirmed (flow=${postReserveFlow})",
      "Value": "green",
      "Description": ""
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "if",
      "Target": "${bookingResult} == 'STILL_PENDING'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "echo",
      "Target": "WARNING: Finish clicked but reservation still pending — please verify manually",
      "Value": "red",
      "Description": ""
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "end",
      "Target": "",
      "Value": "",
      "Description": "End finishBtnState==READY if block"
    },
    {
      "Command": "comment",
      "Target": "DONE",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "echo",
      "Target": "Booking complete: ##className## on ${targetDate} at ##classTime## ##timeslotAmPm##",
      "Value": "",
      "Description": ""
    }
  ]
};

// --- Render -------------------------------------------------------------------

function render() {
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
      // FIX: was `document.getElementByIdt-spot-${i})` — missing open paren and quotes
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
          state.config.scheduleUrl = region[slug].url
            .replace('.html', '/classes.html');
          state.config.clubHomeUrl = region[slug].url;
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

if (stepName === 'EXPORT') {
  const defaultName = state.config.macroName || 'BookingTemplate';
  return `
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
    <p style="margin-top:12px;">
      Clicking <strong>Export</strong> will download 4 files:
    </p>
    <ul style="font-size:13px; line-height:1.8; margin:0 0 0 16px;">
      <li><strong>${defaultName}.json</strong> — your UIVision macro</li>
      <li><strong>RunBooking.bat</strong> — runs the macro instantly</li>
      <li><strong>RegisterTask.bat</strong> — sets up weekly scheduling</li>
      <li><strong>README_BOOKING.txt</strong> — setup instructions</li>
    </ul>`;
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
  if (meta.captureType === 'url') {
    chrome.tabs.query({ active: true }, (tabs) => {
      const lifetimeTab = tabs.find(t => t.url && t.url.includes('lifetime.life'))
        || tabs[0];
      if (!lifetimeTab) return;
      chrome.tabs.sendMessage(lifetimeTab.id,
        { type: 'START_RECORDING', recordingType: 'url' },
        () => {
          const msg = URL_ARMED_INSTRUCTIONS[stepName]
            || 'Now click anywhere on the page to capture its URL...';
          document.getElementById('step-instruction').textContent = msg;
        }
      );
    });
  } else {
    chrome.tabs.query({ active: true }, (tabs) => {
      const lifetimeTab = tabs.find(t => t.url && t.url.includes('lifetime.life'))
        || tabs[0];
      if (!lifetimeTab) return;
      chrome.tabs.sendMessage(lifetimeTab.id,
        { type: 'START_RECORDING', recordingType: 'click' },
        () => {
          const msg = CLICK_ARMED_INSTRUCTIONS[stepName]
            || CLICK_ARMED_INSTRUCTIONS.DEFAULT;
          document.getElementById('step-instruction').textContent = msg;
        }
      );
    });
  }
});

// --- Capture Polling ----------------------------------------------------------

let capturePoller = null;
let lastAppliedCaptureTime = 0;

function applyCapture(capture) {
  const stepName = STEPS[state.currentStep];
  const meta = STEP_META[stepName];
  if (!meta.captureKey || meta.captureType === 'typed') return false;

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

  const replacements = {
    '##clubHomeUrl##':       c.clubHomeUrl || 'https://my.lifetime.life',
    '##loginUrl##':          'https://my.lifetime.life/login',
    '##usernameSelector##':  selectorToString(c.usernameSelector),
    '##passwordSelector##':  selectorToString(c.passwordSelector),
    '##submitSelector##':    selectorToString(c.submitSelector),
    '##scheduleUrl##':       c.scheduleUrl || '',
    '##className##':         c.className || '',
    '##classTime##':         classTimeStr,
    '##timeslotAmPm##':      t.ampm || 'AM',
    '##classTime_runtime##': classTimeStr,
    '##daysAhead##':         String(s.daysAhead || '6'),
    '##runHour##':           runHour,
    '##runMinute##':         runMinute,
    '##timezone##':          s.timezone || 'America/Toronto',
    '##runImmediately##':    s.runImmediately ? 'true' : 'false',
    '##username##':          s.username || '',
    '##password##':          s.password || '',

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

    // ===== CRITICAL FIX =====
    // These two placeholders get inlined INSIDE a JSON string value in the macro,
    // i.e. "Target": "var names=JSON.parse('##participantsJson##'); ..."
    // jsonArrayForInlineString() escapes \ then " so the outer JSON stays valid.
    '##participantsJson##':  jsonArrayForInlineString(parts.slice(0, 7)),
    '##spotPrefsJson##':     jsonArrayForInlineString(spotPrefs.slice(0, 7).map(p => p || ''))
  };

  // Build the substituted macro JSON object
  let macroStr = JSON.stringify(MACRO_TEMPLATE, null, 2);
  for (const [placeholder, value] of Object.entries(replacements)) {
    macroStr = macroStr.split(placeholder).join(value);
  }
  const macroJson = JSON.parse(macroStr);

  // Read macro name from EXPORT step input, sanitize for filename/task name safety
  const rawName   = (document.getElementById('t-macroname')?.value || state.config.macroName || 'BookingTemplate').trim();
  const macroName = rawName.replace(/[^a-zA-Z0-9_\-]/g, '_');
  state.config.macroName = macroName;

  // exportAll() downloads all 4 files: macro JSON + RunBooking.bat + RegisterTask.bat + README
  exportAll(state.config, macroJson, macroName);
});

// --- Helpers ------------------------------------------------------------------

function selectorToString(sel) {
  if (!sel) return '';
  if (typeof sel === 'string') return sel;
  if (sel.css) return 'css=' + sel.css;
  if (sel.xpath) return 'xpath=' + sel.xpath;
  if (sel.type && sel.value) return sel.type + '=' + sel.value;
  return JSON.stringify(sel);
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function saveState() {
  chrome.storage.local.set({ wizardState: state });
}

function loadState() {
  chrome.storage.local.get('wizardState', (r) => {
    if (r.wizardState) {
      state = r.wizardState;
    }
    render();
  });
}

loadState();