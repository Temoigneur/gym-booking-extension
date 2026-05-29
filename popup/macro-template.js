window.MACRO_TEMPLATE = {
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
      "Target": "return '##targetDate##';",
      "Value": "targetDate",
      "Description": "Calculate target booking date from today + daysAhead in the user's timezone"
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
    { "Command": "if",   "Target": "${classFound} != 'FOUND'", "Value": "", "Description": "" },
    { "Command": "echo", "Target": "ERROR: Class not found - ##className## at ##classTime## ##timeslotAmPm## on ${targetDate} \u2014 macro ends here", "Value": "red", "Description": "Class not on schedule \u2014 macro ends naturally after this block" },
    { "Command": "gotoLabel", "Target": "END_OF_MACRO", "Value": "", "Description": "Halt cleanly \u2014 don't fall through to click/reserve logic." },
    { "Command": "end",  "Target": "", "Value": "", "Description": "" },

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
      "Description": "Reserve button shows login prompt \u2014 jump straight to END_OF_MACRO so we don't fall through into participant/reserve logic."
    },
    {
      "Command": "gotoLabel",
      "Target": "END_OF_MACRO",
      "Value": "",
      "Description": "Halt cleanly \u2014 bare `end` only exits the if-block."
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
      "Target": "css=[data-testid='participantLabel']",
      "Value": "15000",
      "Description": "Wait on the VISIBLE participantLabel \u2014 the native participantCheckBox input is display:none under the c-checkbox styling and some waiters reject zero-size elements."
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
      "Target": "POST-RESERVE \u2014 unified flow handler (seat-map OR no-seat-map)",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "waitForElementPresent",
      "Target": "css=[data-testid='reservation-component']",
      "Value": "20000",
      "Description": "Both flows land on the reservation-component page \u2014 wait for it to mount."
    },
    {
      "Command": "waitForElementNotVisible",
      "Target": "css=[data-testid='sectionSpinner']",
      "Value": "20000",
      "Description": "Wait for the post-reserve spinner (data-testid='spinner', NOT sectionSpinner) to clear."
    },
    {
      "Command": "executeScript",
      "Target": "var checked=Array.from(document.querySelectorAll('[data-testid=\"participantCheckBox\"]')).filter(function(c){return c.checked && c.offsetParent!==null;}).length; return checked||1;",
      "Value": "participantCount",
      "Description": "Snapshot checked-participant count for spot-assignment readiness check. Falls back to 1 if checkboxes already unmounted."
    },
{ "Command": "executeScript",
  "Target": "return document.querySelectorAll('[data-testid=\"spotAvailable\"]').length > 0 ? 'SEAT_MAP' : (document.querySelector('[data-testid=\"finishBtn\"]') !== null ? 'NO_SEAT_MAP' : 'WAIT');",
  "Value": "postReserveFlow",
  "Description": "First check — WAIT if page not ready yet." },

{ "Command": "while",
  "Target": "${postReserveFlow} == 'WAIT'",
  "Value": "",
  "Description": "Poll until seat map or finish button appears." },
  { "Command": "pause", "Target": "500", "Value": "" },
  { "Command": "executeScript",
    "Target": "return document.querySelectorAll('[data-testid=\"spotAvailable\"]').length > 0 ? 'SEAT_MAP' : (document.querySelector('[data-testid=\"finishBtn\"]') !== null ? 'NO_SEAT_MAP' : 'WAIT');",
    "Value": "postReserveFlow",
    "Description": "Re-check." },
{ "Command": "end", "Target": "", "Value": "" },
{
  "Command": "executeScript",
  "Target": "return document.querySelectorAll('[data-testid=\"spotAvailable\"]').length > 0 ? 'SEAT_MAP' : 'NO_SEAT_MAP';",
  "Value": "postReserveFlow",
  "Description": "Safe to branch now — page is fully rendered."
},
    {
      "Command": "if",
      "Target": "${postReserveFlow} == 'SEAT_MAP'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "comment",
      "Target": "Flow A \u2014 APPLY PREFERRED SPOTS",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
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
      "Command": "executeScript",
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
      "Command": "executeScript",
      "Target": "var names=JSON.parse('##participantsJson##'); var prefs=JSON.parse('##spotPrefsJson##'); window.__lt={names:names,prefs:prefs,results:[]}; return 'PARSED:'+names.length;",
      "Value": "parseResult",
      "Description": "Stash names/prefs on window.__lt for subsequent per-participant scripts."
    },
    {
      "Command": "comment",
      "Target": "PRE-FLIGHT \u2014 if any preferred spot is unavailable, revert: keep auto-assigned defaults and skip the per-participant Edit Spot loop entirely.",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "executeScript",
      "Target": "var prefs=window.__lt.prefs||[]; var names=window.__lt.names||[]; var avail=Array.from(document.querySelectorAll('[data-testid=\"spotAvailable\"]')).map(function(s){return (s.textContent||'').trim();}); var sel=Array.from(document.querySelectorAll('[data-testid=\"spotSelected\"]')); var defaults=sel.map(function(e){ var t=e.getAttribute('data-original-title')||e.getAttribute('title')||''; var m=t.match(/^(.+?)\\s*\\(Spot\\s*(\\d+)\\)/i); return m?(m[1].trim()+'=Spot'+m[2]):'?'; }).join(', '); var missing=[]; for(var i=0;i<names.length;i++){ if(!names[i]||!prefs[i]) continue; if(avail.indexOf(String(prefs[i]))===-1){ missing.push(names[i]+':'+prefs[i]); } } if(missing.length>0){ window.__lt.revertToDefaults=true; window.__lt.defaults=defaults; window.__lt.missing=missing.join(','); return 'REVERT'; } window.__lt.revertToDefaults=false; window.__lt.defaults=defaults; return 'PROCEED';",
      "Value": "spotCheck",
      "Description": "If any preferred spot isn't in spotAvailable, set revertToDefaults=true and record the site's auto-assigned defaults so the verify block can report them."
    },
    {
      "Command": "gotoIf_v2",
      "Target": "${spotCheck} == 'REVERT'",
      "Value": "spotsDone",
      "Description": "One or more preferred spots are taken \u2014 skip the per-participant loop entirely and let the auto-assigned defaults stand."
    },
    {
      "Command": "comment",
      "Target": "Participant 1",
      "Value": "",
      "Description": ""
    },
{
      "Command": "executeScript",
      "Target": "var i=0; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var esc=n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&'); var rx=new RegExp('\\\\b'+esc+'\\\\b.*assigned spot','i'); var allEdit=Array.from(document.querySelectorAll('button')).filter(function(b){return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); var btn=allEdit.find(function(b){ var row=b.closest('div.m-b-0'); return row && rx.test((row.textContent||'').replace(/\\\\s+/g,' ')); }); if(!btn){ return 'NO_EDIT'; } window.__lt.activeName=n; btn.click(); return 'CLICKED';",
      "Value": "editClick1",
      "Description": "Find Edit Spot by participant row (name match), fallback to i-th visible button."
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
      "Command": "executeScript",
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
      "Command": "executeScript",
      "Target": "var i=1; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var esc=n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&'); var rx=new RegExp('\\\\b'+esc+'\\\\b.*assigned spot','i'); var allEdit=Array.from(document.querySelectorAll('button')).filter(function(b){return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); var btn=allEdit.find(function(b){ var row=b.closest('div.m-b-0'); return row && rx.test((row.textContent||'').replace(/\\\\s+/g,' ')); }); if(!btn){ return 'NO_EDIT'; } window.__lt.activeName=n; btn.click(); return 'CLICKED';",
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
      "Command": "executeScript",
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
      "Command": "executeScript",
      "Target": "var i=2; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var esc=n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&'); var rx=new RegExp('\\\\b'+esc+'\\\\b.*assigned spot','i'); var allEdit=Array.from(document.querySelectorAll('button')).filter(function(b){return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); var btn=allEdit.find(function(b){ var row=b.closest('div.m-b-0'); return row && rx.test((row.textContent||'').replace(/\\\\s+/g,' ')); }); if(!btn){ return 'NO_EDIT'; } window.__lt.activeName=n; btn.click(); return 'CLICKED';",
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
      "Command": "executeScript",
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
      "Command": "executeScript",
      "Target": "var i=3; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var esc=n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&'); var rx=new RegExp('\\\\b'+esc+'\\\\b.*assigned spot','i'); var allEdit=Array.from(document.querySelectorAll('button')).filter(function(b){return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); var btn=allEdit.find(function(b){ var row=b.closest('div.m-b-0'); return row && rx.test((row.textContent||'').replace(/\\\\s+/g,' ')); }); if(!btn){ return 'NO_EDIT'; } window.__lt.activeName=n; btn.click(); return 'CLICKED';",
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
      "Command": "executeScript",
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
      "Command": "executeScript",
      "Target": "var i=4; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var esc=n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&'); var rx=new RegExp('\\\\b'+esc+'\\\\b.*assigned spot','i'); var allEdit=Array.from(document.querySelectorAll('button')).filter(function(b){return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); var btn=allEdit.find(function(b){ var row=b.closest('div.m-b-0'); return row && rx.test((row.textContent||'').replace(/\\\\s+/g,' ')); }); if(!btn){ return 'NO_EDIT'; } window.__lt.activeName=n; btn.click(); return 'CLICKED';",
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
      "Command": "executeScript",
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
      "Command": "executeScript",
      "Target": "var i=5; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var esc=n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&'); var rx=new RegExp('\\\\b'+esc+'\\\\b.*assigned spot','i'); var allEdit=Array.from(document.querySelectorAll('button')).filter(function(b){return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); var btn=allEdit.find(function(b){ var row=b.closest('div.m-b-0'); return row && rx.test((row.textContent||'').replace(/\\\\s+/g,' ')); }); if(!btn){ return 'NO_EDIT'; } window.__lt.activeName=n; btn.click(); return 'CLICKED';",
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
      "Command": "executeScript",
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
      "Command": "executeScript",
      "Target": "var i=6; var n=window.__lt.names[i]; var p=window.__lt.prefs[i]; if(!n||!p){ return 'SKIP'; } var esc=n.replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g,'\\\\$&'); var rx=new RegExp('\\\\b'+esc+'\\\\b.*assigned spot','i'); var allEdit=Array.from(document.querySelectorAll('button')).filter(function(b){return /^edit spot$/i.test((b.textContent||'').trim()) && b.offsetParent!==null;}); var btn=allEdit.find(function(b){ var row=b.closest('div.m-b-0'); return row && rx.test((row.textContent||'').replace(/\\\\s+/g,' ')); }); if(!btn){ return 'NO_EDIT'; } window.__lt.activeName=n; btn.click(); return 'CLICKED';",
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
      "Command": "executeScript",
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
      "Command": "executeScript",
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
      "Description": "End SEAT_MAP if block \u2014 Flow B falls through directly to Finish"
    },
    {
      "Command": "comment",
      "Target": "CLICK FINISH \u2014 same button on both flows",
      "Value": "",
      "Description": ""
    },
    {
    "Command": "waitForElementPresent",
    "Target": "css=[data-testid='finishBtn']",
    "Value": "20000",
    "Description": "Wait up to 20s for the Finish button to mount."
    },
{ "Command": "waitForElementPresent",
  "Target": "css=[data-testid='finishBtn']",
  "Value": "20000",
  "Description": "Wait for DOM mount first." },

{ "Command": "executeScript",
  "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"finishBtn\"]')); var btn=btns.find(function(b){return b.offsetParent!==null && !b.disabled;})||btns.find(function(b){return b.offsetParent!==null;})||btns[0]; return btn ? (btn.disabled ? 'DISABLED' : 'READY') : 'NOT_FOUND';",
  "Value": "finishBtnState",
  "Description": "First check." },

{ "Command": "while",
  "Target": "${finishBtnState} != 'READY'",
  "Value": "",
  "Description": "Poll until enabled." },
  { "Command": "pause", "Target": "500", "Value": "" },
  { "Command": "executeScript",
    "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"finishBtn\"]')); var btn=btns.find(function(b){return b.offsetParent!==null && !b.disabled;})||btns.find(function(b){return b.offsetParent!==null;})||btns[0]; return btn ? (btn.disabled ? 'DISABLED' : 'READY') : 'NOT_FOUND';",
    "Value": "finishBtnState",
    "Description": "Re-check." },
{ "Command": "end", "Target": "", "Value": "" },
    {
      "Command": "if",
      "Target": "${finishBtnState} != 'READY'",
      "Value": "",
      "Description": ""
    },
    {
      "Command": "echo",
      "Target": "ERROR: Finish button not ready (state=${finishBtnState}) \u2014 booking incomplete",
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
    "Target": "var btns=Array.from(document.querySelectorAll('[data-testid=\"finishBtn\"]')); var btn=btns.find(function(b){return b.offsetParent!==null && !b.disabled;})||btns[0]; if(btn){ btn.click(); } return btn ? 'CLICKED' : 'NOT_FOUND';",
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
      "Target": "WARNING: Finish clicked but reservation still pending \u2014 please verify manually",
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
    },
    { "Command": "gotoLabel", "Target": "END_OF_MACRO", "Value": "", "Description": "Skip past error-handler labels on successful runs." },

    { "Command": "label", "Target": "LOGIN_FAILED_NO_FORM", "Value": "", "Description": "" },
    { "Command": "echo", "Target": "ERROR: Login form not found at /login. Selectors may have changed \u2014 inspect auth.lifetime.life manually.", "Value": "red", "Description": "" },
    { "Command": "throwError", "Target": "Login form not found", "Value": "", "Description": "" },

    { "Command": "label", "Target": "LOGIN_FAILED_NO_SESSION", "Value": "", "Description": "" },
    { "Command": "echo", "Target": "ERROR: Submitted credentials but no logged-in signals after wait. Check credentials, account lockout, or 2FA challenge.", "Value": "red", "Description": "" },
    { "Command": "throwError", "Target": "Login did not establish session", "Value": "", "Description": "" },

    { "Command": "label", "Target": "END_OF_MACRO", "Value": "", "Description": "Clean exit point for successful runs." }
  ]
};