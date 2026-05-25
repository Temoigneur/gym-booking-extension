let isRecording = false;
let recordingType = 'click'; // 'click' or 'url'
let lastHighlighted = null;

const HIGHLIGHT_STYLE = '2px solid #FF6B35';

function getBestSelector(el) {
  if (el.id && !/\d{4,}/.test(el.id)) {
    return { type: 'css', value: `#${el.id}` };
  }
  if (el.dataset.testid) {
    return { type: 'css', value: `[data-testid="${el.dataset.testid}"]` };
  }
  if (el.name) {
    return { type: 'css', value: `[name="${el.name}"]` };
  }
  const anchor = el.closest('[data-testid]');
  if (anchor && anchor !== el) {
    const tag = el.tagName.toLowerCase();
    return {
      type: 'xpath',
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
  e.preventDefault();
  e.stopPropagation();

  let payload;

  if (recordingType === 'url') {
    // Capture the CURRENT page URL before any redirect fires.
    payload = {
      type: 'ELEMENT_CAPTURED',
      captureType: 'url',
      time: Date.now(),               // stamp every capture so the popup can tell new from old
      url: window.location.href,
      // Also strip query params for schedule URL — keep base path only
      cleanUrl: window.location.origin + window.location.pathname
    };
  } else {
    const selector = getBestSelector(e.target);
    payload = {
      type: 'ELEMENT_CAPTURED',
      captureType: 'click',
      time: Date.now(),               // stamp every capture so the popup can tell new from old
      selector,
      tagName: e.target.tagName,
      innerText: e.target.innerText?.trim().slice(0, 80),
      url: window.location.href
    };
  }

  chrome.runtime.sendMessage(payload, (response) => {
    console.log('[recorder] ELEMENT_CAPTURED ack:', response);
  });

  clearHighlight();
  isRecording = false;
  document.body.style.cursor = '';
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
