// exporter.js
// Handles all file generation and download triggering at wizard export step.
// Requires scheduler.js to be loaded first (see popup.html script order).

/**
 * Triggers a file download in the browser.
 * @param {string} filename
 * @param {string} content
 * @param {string} mimeType
 */
function downloadFile(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.style.display = 'none';      // ← hide it visually
  document.body.appendChild(a);  // ← must be in the DOM
  a.click();
  document.body.removeChild(a);  // ← clean up immediately
  URL.revokeObjectURL(url);
}

/**
 * Master export function — call this from popup.js on the EXPORT step.
 * Generates and downloads all 4 files as a bundle.
 *
 * @param {object} config    - wizard state.config
 * @param {object} macroJson - the fully-substituted BookingTemplate object
 * @param {string} macroName - e.g. "BookingTemplate"
 */
function exportAll(config, macroJson, macroName = 'BookingTemplate') {
  if (!config || !macroJson) {
    console.error('[exportAll] Missing config or macroJson', { config, macroJson });
    return;
  }

  const files = [
    {
      name: `${macroName}.json`,
      content: JSON.stringify(macroJson, null, 2),
      mime: 'application/json'
    },
    {
      name: 'RunBooking.bat',
      content: generateRunBookingBat(macroName),
      mime: 'text/plain'
    },
    {
      name: 'RegisterTask.bat',
      content: generateRegisterTaskBat(config, macroName),
      mime: 'text/plain'
    },
    {
      name: 'README_BOOKING.txt',
      content: generateReadme(config, macroName),
      mime: 'text/plain'
    }
  ];

  // Build ALL anchors + append to DOM while still in the user-gesture context
  const anchors = files.map(({ name, content, mime }) => {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a); // ← appended HERE, inside the sync call
    return { a, url };
  });

  // Click them with small delays — anchors are already live in the DOM
  anchors.forEach(({ a, url }, i) => {
    setTimeout(() => {
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, i * 300);
  });
}