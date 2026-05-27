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
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Master export function — call this from popup.js on the EXPORT step.
 * Generates and downloads all 4 files as a bundle.
 *
 * @param {object} config   - wizard state.config
 * @param {object} macroJson - the fully-substituted BookingTemplate object
 * @param {string} macroName - e.g. "BookingTemplate"
 */
function exportAll(config, macroJson, macroName = 'BookingTemplate') {

  // 1. BookingTemplate.json — the UIVision macro
  downloadFile(
    `${macroName}.json`,
    JSON.stringify(macroJson, null, 2),
    'application/json'
  );

  // Small delay between downloads so browser doesn't block them
  setTimeout(() => {
    // 2. RunBooking.bat
    downloadFile(`RunBooking.bat`, generateRunBookingBat(macroName));
  }, 300);

  setTimeout(() => {
    // 3. RegisterTask.bat
    downloadFile(`RegisterTask.bat`, generateRegisterTaskBat(config, macroName));
  }, 600);

  setTimeout(() => {
    // 4. README_BOOKING.txt
    downloadFile(`README_BOOKING.txt`, generateReadme(config, macroName));
  }, 900);
}