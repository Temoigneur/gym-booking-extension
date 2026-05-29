if (window.__gymRecorderLoaded) { /* already injected */ } else {
window.__gymRecorderLoaded = true;

let isRecording = false;
let recordingType = 'click'; // 'click' or 'url'
let lastHighlighted = null;

const HIGHLIGHT_STYLE = '2px solid #FF6B35';

function getBestSelector(el) {
  if (el.id && !/\d{4,}/.test(el.id)) {
    // FIX: wrap template literal in backticks
    return { type: 'css', value: `#${el.id}` };
  }
  if (el.dataset.testid) {
    // FIX: wrap template literal in backticks
    return { type: 'css', value: `[data-testid="${el.dataset.testid}"]` };
  }
  if (el.name) {
    // FIX: wrap template literal in backticks
    return { type: 'css', value: `[name="${el.name}"]` };
  }
  const anchor = el.closest('[data-testid]');
  if (anchor && anchor !== el) {
    const tag = el.tagName.toLowerCase();
    return {
      type: 'xpath',
      // FIX: wrap template literal in backticks
      value: `//*[@data-testid="${anchor.dataset.testid}"]//${tag}`
    };
  }
  return { type: 'xpath', value: getAbsoluteXPath(el) };
}

function getAbsoluteXPath(el) {
  if (el.nodeType !== Node.ELEMENT_NODE) return '';
  const parts = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sib = el.previousSibling;
    while (sib) {
      if (sib.nodeType === Node.ELEMENT_NODE && sib.tagName === el.tagName) index++;
      sib = sib.previousSibling;
    }
    // FIX: was `parts.unshift${el.tagName.toLowerCase()}[${index}]);`
    //   — missing the opening "(" AND the backticks around the template literal.
    //   This is the syntax error that recorder.js:88 was actually choking on.
    parts.unshift(`${el.tagName.toLowerCase()}[${index}]`);
    el = el.parentNode;
  }
  return '/' + parts.join('/');
}

function highlight(el) {
  if (lastHighlighted) lastHighlighted.style.outline = '';
  el.style.outline = HIGHLIGHT_STYLE;
  lastHighlighted = el;
}

function clearHighlight() {
  if (lastHighlighted) lastHighlighted.style.outline = '';
  lastHighlighted = null;
}

document.addEventListener('mouseover', (e) => {
  if (!isRecording) return;
  highlight(e.target);
}, true);

document.addEventListener('click', (e) => {
  if (!isRecording) return;

  // Guard immediately — context may already be gone
  if (!chrome.runtime?.id) {
    isRecording = false;
    document.body.style.cursor = '';
    if (lastHighlighted) lastHighlighted.style.outline = '';
    lastHighlighted = null;
    alert('Extension was reloaded. Please refresh this tab and try again.');
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  let payload;

  if (recordingType === 'url') {
    payload = {
      type: 'ELEMENT_CAPTURED',
      captureType: 'url',
      time: Date.now(),
      url: window.location.href,
      cleanUrl: window.location.origin + window.location.pathname,
      pageTitle: document.title
    };
  } else {
    const selector = getBestSelector(e.target);
    payload = {
      type: 'ELEMENT_CAPTURED',
      captureType: 'click',
      time: Date.now(),
      selector,
      tagName: e.target.tagName,
      innerText: e.target.innerText?.trim().slice(0, 80),
      url: window.location.href,
      pageTitle: document.title
    };
  }

  clearHighlight();
  isRecording = false;
  document.body.style.cursor = '';

  try {
    chrome.runtime.sendMessage(payload, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[recorder] sendMessage error:', chrome.runtime.lastError.message);
        return;
      }
      console.log('[recorder] ELEMENT_CAPTURED ack:', response);
    });
  } catch (err) {
    console.warn('[recorder] sendMessage threw:', err.message);
    alert('Extension was reloaded. Please refresh this tab and try again.');
  }

}, true);

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'START_RECORDING') {
    isRecording = true;
    recordingType = msg.recordingType || 'click';
    document.body.style.cursor = 'crosshair';
    sendResponse({ ok: true });
  }
  if (msg.type === 'STOP_RECORDING') {
    isRecording = false;
    document.body.style.cursor = '';
    clearHighlight();
    sendResponse({ ok: true });
  }
});
}