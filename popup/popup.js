const STEPS = [
  'INTRO',
  'CAPTURE_LOGIN_URL',
  'CAPTURE_USERNAME_FIELD',
  'CAPTURE_PASSWORD_FIELD',
  'CAPTURE_SUBMIT_BUTTON',
  'CAPTURE_SCHEDULE_URL',
  'CAPTURE_CLASS_NAME',
  'CAPTURE_TIMESLOT',
  'CAPTURE_PARTICIPANTS',
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
  CAPTURE_LOGIN_URL: {
    title: 'Step 1 - Login Page URL',
    instruction: 'The login URL for Life Time is always the same - click "Capture URL" right now without navigating anywhere. We already know where it is.',
    captureKey: 'loginUrl',
    captureLabel: 'Capture URL',
    captureType: 'hardcoded'
  },
  CAPTURE_USERNAME_FIELD: {
    title: 'Step 2 - Username Field',
    instruction: 'Navigate to my.lifetime.life, click "Account" in the upper right, then "Log In". Once the login form appears, click "Capture Field" below, then click on the username/email input box on the page (an orange outline shows what you\'re hovering over).',
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
    instruction: 'Click the Log In button on the page to log in to Life Time. Then navigate to the Class Schedule page showing the class you want to book on the date you\'d like.\n\nOnce you can see the class listed on screen, click "Capture URL" below.',
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
    instruction: 'Enter the first names of everyone to book for, EXCEPT yourself - the account holder is always included automatically. One name per line, up to 6 additional people. Leave blank if booking only for yourself.',
    captureKey: 'participants',
    captureType: 'typed'
  },
  SET_SCHEDULE: {
    title: 'Step 9 - Booking Schedule',
    instruction: 'How far in advance should the macro book, and what time should it run?',
    captureKey: 'schedule',
    captureType: 'typed'
  },
  EXPORT: {
    title: 'All Done!',
    instruction: 'Your macro is ready. Click "Download Macro" to get your BookingTemplate.json file, then import it into UIVision and hit Play.',
    captureKey: null,
    captureType: null
  }
};

const URL_ARMED_INSTRUCTIONS = {
  CAPTURE_LOGIN_URL: 'Now click anywhere on the login page to capture its URL...',
  CAPTURE_SCHEDULE_URL: 'Now click anywhere on the Class Schedule page to capture its URL...'
};

const CLICK_ARMED_INSTRUCTIONS = {
  CAPTURE_CLASS_NAME: 'Now click the class name on the Class Schedule page...',
  DEFAULT: 'Now click the element on the page...'
};

// --- Macro Template -----------------------------------------------------------
// ##placeholder## values are replaced at export time with real collected values.
// Double-hash avoids any conflict with UIVision's own ${} variable syntax.
// This is the CORRECTED macro: login-first flow, runImmediately gate,
// fixed if/while syntax, no throw_error, index-paired participant matching,
// correct seat-map spinner, and seat-assignment wait before Finish.

const MACRO_TEMPLATE = {
    "Name": "BookingTemplate",
    "CreationDate": "2026-5-24",
    "Commands": [
      {
        "Command": "open",
        "Target": "https://my.lifetime.life/clubs/on/woodbridge.html",
        "Value": "",
        "Description": "Open the Woodbridge club homepage - gives UIVision a live tab and a place to check login state"
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
        "Description": "Detect login via Life Time auth cookies (reliable) - the js-login-link element is visible even when logged in"
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
        "Target": "FIND CLASS CARD",
        "Value": "",
        "Description": ""
      },
      {
        "Command": "executeScript",
        "Target": "const ampm='##timeslotAmPm##'; const ct='##classTime##'; const cn='##className##'; const xp = ampm==='Any' ? \"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and normalize-space(text())='\"+ct+\"']]//a[@data-testid='classLink']\" : \"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and normalize-space(text())='\"+ct+\"'] and .//span[@class='time-ampm' and normalize-space(text())='\"+ampm+\"']]//a[@data-testid='classLink']\"; return document.evaluate(xp,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue ? 'FOUND' : 'NOT_FOUND';",
        "Value": "classFound",
        "Description": ""
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
        "Target": "const ampm='##timeslotAmPm##'; const ct='##classTime##'; const cn='##className##'; const xp = ampm==='Any' ? \"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and normalize-space(text())='\"+ct+\"']]//a[@data-testid='classLink']\" : \"//div[@data-testid='classCell'][.//a[@data-testid='classLink' and contains(.,'\"+cn+\"')] and .//time[@class='time-start' and normalize-space(text())='\"+ct+\"'] and .//span[@class='time-ampm' and normalize-space(text())='\"+ampm+\"']]//a[@data-testid='classLink']\"; const el=document.evaluate(xp,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue; el&&el.click();",
        "Value": "",
        "Description": ""
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
        "Target": "SEAT MAP - wait for spots assigned, then Finish",
        "Value": "",
        "Description": ""
      },
      {
        "Command": "waitForElementNotVisible",
        "Target": "css=[data-testid='spinner']",
        "Value": "20000",
        "Description": "Wait for the seat-map spinner (data-testid='spinner', NOT sectionSpinner) to clear"
      },
      {
        "Command": "waitForElementPresent",
        "Target": "css=[data-testid='spotSelected']",
        "Value": "20000",
        "Description": "Wait until the seat map has actually assigned spots for all participants"
      },
      {
        "Command": "pause",
        "Target": "2000",
        "Value": "",
        "Description": "Let the seat map fully settle for a multi-person booking before finishing"
      },
      {
        "Command": "executeScript",
        "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"finishBtn\"]')); var btn=btns.find(function(b){return b.offsetParent!==null;})||btns[0]; return btn ? 'VISIBLE' : 'NOT_FOUND';",
        "Value": "finishBtnState",
        "Description": ""
      },
      {
        "Command": "if",
        "Target": "${finishBtnState} == 'VISIBLE'",
        "Value": "",
        "Description": ""
      },
      {
        "Command": "executeScript",
        "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"finishBtn\"]')); var btn=btns.find(function(b){return b.offsetParent!==null;})||btns[0]; if(btn){ btn.click(); } return btn ? 'CLICKED' : 'NOT_FOUND';",
        "Value": "finishClicked",
        "Description": "Click the VISIBLE finish button (site may render a hidden mobile duplicate)"
      },
      {
        "Command": "waitForPageToLoad",
        "Target": "15000",
        "Value": "",
        "Description": ""
      },
      {
        "Command": "end",
        "Target": "",
        "Value": "",
        "Description": ""
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
  document.getElementById('step-counter').textContent =
    `Step ${state.currentStep + 1} of ${STEPS.length}`;
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
  if (meta.captureType === 'typed') {
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
  document.getElementById('btn-next').style.display = isExport ? 'none' : 'block';
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
  if (stepName === 'CAPTURE_PARTICIPANTS') {
    return `
      <div class="field-row">
        <label>Additional names - one per line (max 6, do NOT include yourself)</label>
        <textarea id="t-participants" rows="6"
          placeholder="Jane&#10;John"></textarea>
      </div>`;
  }
  if (stepName === 'SET_SCHEDULE') {
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
      .map(s => s.trim()).filter(Boolean).slice(0, 6);
  }
  if (stepName === 'SET_SCHEDULE') {
    state.config.schedule = {
      daysAhead: document.getElementById('t-days').value,
      runTime: document.getElementById('t-runtime').value,
      timezone: document.getElementById('t-timezone').value,
      runImmediately: document.getElementById('t-runnow').checked,
      username: document.getElementById('t-username').value,
      password: document.getElementById('t-password').value
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

  if (meta.captureType === 'hardcoded') {
    state.config[meta.captureKey] = 'https://my.lifetime.life/login';
    saveState();
    render();
    return;
  }

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

// Timestamp of the most recent capture this popup has already applied.
// The recorder stamps every capture with `time`, so we apply a capture
// whenever a newer one arrives — even if the current step already has a
// value. This is what lets a user re-capture (e.g. after clicking the wrong
// element) and see the "Captured" box update.
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

      // Only act on a capture newer than the last one we applied. A capture
      // with no `time` (older recorder, or unexpected payload) is treated as
      // new once, then cleared, so it can't loop.
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

  let loginUrl = c.loginUrl || 'https://my.lifetime.life/login';
  if (loginUrl.includes('auth.lifetime.life')) {
    loginUrl = 'https://my.lifetime.life/login';
  }

  // Build the class-time string the macro expects.
  // Macro XPath matches the page's <time> text: bare hour when minutes are 00
  // (e.g. "9"), otherwise "H:MM" (e.g. "10:45").
  const tHour   = String(t.hour   || '');
  const tMinRaw = String(t.minute || '0');
  const tMinute = tMinRaw.padStart(2, '0');
  const classTimeStr = (tMinute === '00') ? tHour : `${tHour}:${tMinute}`;

  // Run time -> hour/minute for the clock gate.
  const runParts  = (s.runTime || '09:00').split(':');
  const runHour   = (runParts[0] || '09').padStart(2, '0');
  const runMinute = (runParts[1] || '00').padStart(2, '0');

  const replacements = {
    '##loginUrl##':         loginUrl,
    '##usernameSelector##': selectorToString(c.usernameSelector),
    '##passwordSelector##': selectorToString(c.passwordSelector),
    '##submitSelector##':   selectorToString(c.submitSelector),
    '##scheduleUrl##':      c.scheduleUrl || '',
    '##className##':        c.className   || '',
    '##classTime##':        classTimeStr,
    '##timeslotAmPm##':     t.ampm        || 'AM',
    '##participant1##':     parts[0]      || '',
    '##participant2##':     parts[1]      || '',
    '##participant3##':     parts[2]      || '',
    '##participant4##':     parts[3]      || '',
    '##participant5##':     parts[4]      || '',
    '##participant6##':     parts[5]      || '',
    '##daysAhead##':        String(s.daysAhead || '8'),
    '##runHour##':          runHour,
    '##runMinute##':        runMinute,
    '##timezone##':         s.timezone    || 'America/Toronto',
    '##runImmediately##':   s.runImmediately === true ? 'true' : 'false',
    '##username##':         s.username    || '',
    '##password##':         s.password    || ''
  };

  // Serialize the macro, then substitute placeholders.
  // safeValue escaping: a value may land inside a JSON string AND inside a
  // JS string literal within an executeScript Target. Escaping backslash and
  // double-quote covers JSON; for the JS-literal case the macro uses single
  // quotes, so we also neutralize any single quote in collected values.
  let macroStr = JSON.stringify(MACRO_TEMPLATE);
  for (const [placeholder, rawValue] of Object.entries(replacements)) {
    const value = String(rawValue);
    const safeValue = value
      .replace(/\\/g, '\\\\')   // backslash
      .replace(/"/g, '\\"')         // double quote (JSON level)
      .replace(/'/g, "\\'");        // single quote (JS-literal level)
    macroStr = macroStr.split(placeholder).join(safeValue);
  }

  const macroBlob = new Blob([macroStr], { type: 'application/json' });
  const macroUrl  = URL.createObjectURL(macroBlob);
  chrome.downloads.download({ url: macroUrl, filename: 'BookingTemplate.json', saveAs: false });
});

// --- Helpers ------------------------------------------------------------------

function selectorToString(sel) {
  if (!sel) return '';
  if (typeof sel === 'string') return sel;
  return `${sel.type}=${sel.value}`;
}

// --- Persistence --------------------------------------------------------------

function saveState() {
  chrome.storage.local.set({ wizardState: state });
}

function loadState() {
  chrome.storage.local.get('wizardState', (result) => {
    if (result.wizardState) state = result.wizardState;
    chrome.storage.session.get('lastCapture', (r) => {
      const cap = r.lastCapture;
      if (cap) {
        // Apply any capture left in storage from before the popup opened,
        // and seed lastAppliedCaptureTime so the poller won't re-apply it.
        applyCapture(cap);
        lastAppliedCaptureTime = cap.time || Date.now();
        saveState();
      }
      render();
    });
  });
}

loadState();
