// Open side panel when extension icon is clicked — no dropdown.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // Relay recording start/stop from the popup to the recorder content script.
  if (msg.type === 'START_RECORDING' || msg.type === 'STOP_RECORDING') {
    chrome.tabs.query({ active: true }, (tabs) => {
      const lifetimeTab = tabs.find(t => t.url && t.url.includes('lifetime.life'))
        || tabs[0];
      if (!lifetimeTab) {
        sendResponse({ ok: false, error: 'No tab found' });
        return;
      }
      chrome.tabs.sendMessage(lifetimeTab.id, msg, (resp) => {
        if (chrome.runtime.lastError) {
          console.log('[sw] sendMessage error:', chrome.runtime.lastError.message);
          sendResponse({ ok: false });
        } else {
          sendResponse(resp);
        }
      });
    });
    return true;
  }

  // A capture arrived from the recorder. Store it in session storage so the
  // popup's poller can pick it up. The recorder stamps msg.time on every
  // capture, which lets the popup distinguish a fresh capture from an old one.
  //
  // Note: we do NOT re-broadcast an ELEMENT_CAPTURED message here. The popup
  // reads captures by polling chrome.storage.session, so a re-broadcast is
  // unnecessary — and broadcasting ELEMENT_CAPTURED would be received by this
  // same listener, causing a redundant store-and-rebroadcast cycle.
  if (msg.type === 'ELEMENT_CAPTURED') {
    chrome.storage.session.set({ lastCapture: msg }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

});
