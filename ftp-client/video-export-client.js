/**
 * =============================================================================
 * Video Export Client (Shared)
 * =============================================================================
 *
 * This script handles the video export functionality on the client side.
 * It sends a request to the Railway-hosted server, which captures the
 * animation and returns an MP4 video file for download.
 *
 * Requirements:
 * - The animation page must be publicly accessible (not localhost)
 * - The GSAP timeline must be exposed as `window.tl`
 * - The Railway server must be running and accessible
 *
 * Supported optional UI elements (auto-detected via null guards):
 * - #videoFormat        — aspect ratio / resolution selector
 * - #headlineInput      — headline text passed to capture page as ?h1=
 * - #bodyInput          — body text passed to capture page as ?p=
 * - #bgVideoSelect      — background video passed as ?video=
 * - #modelSelect        — 3D model passed as ?model=
 * - #entriesData        — JSON-encoded programme entries as ?entries=
 * - #bgColor            — CSS variable name for background color as ?bgColor=
 * - #logoMode           — logotype mode flag as ?logoMode=
 * - #useLogoOutroData   — logo outro flag as ?useLogoOutro=
 *
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const VIDEO_EXPORT_CONFIG = {
  // Railway server URL
  serverUrl: 'https://gsap-video-export-production.up.railway.app/export-video',

  // Animation page URL (automatically uses current page's directory)
  // IMPORTANT: Must be publicly accessible, not localhost!
  pageUrl: window.location.href.replace(/[^/]*$/, ''),

  // GSAP timeline variable name (must match your animation.js export)
  timeline: 'tl',

  // CSS selector for the element to capture
  selector: '.animation-container',

  // Video dimensions (from dropdown, or fallback to 9:16)
  get viewport() {
    const el = document.getElementById('videoFormat');
    return el ? el.value : '1080x1920';
  },
  get resolution() {
    const el = document.getElementById('videoFormat');
    return el ? el.value : '1080x1920';
  },

  // Frames per second
  fps: 24,

  // Output filename (dynamically generated)
  get filename() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const resolution = this.resolution.replace('x', 'x');
    return `${dateStr}-animation-${resolution}.mp4`;
  }
};

// -----------------------------------------------------------------------------
// Format Selector Handler (only if #videoFormat exists)
// -----------------------------------------------------------------------------

const formatSelect = document.getElementById('videoFormat');

if (formatSelect) {
  // Update animation container aspect ratio when format changes
  formatSelect.addEventListener('change', (e) => {
    const container = document.querySelector('.animation-container');
    const format = e.target.value;

    // Remove existing aspect ratio classes
    container.classList.remove('aspect-1-1', 'aspect-9-16', 'aspect-16-9', 'aspect-24-27');

    // Add appropriate class based on selection
    if (format === '1080x1080') {
      container.classList.add('aspect-1-1');
    } else if (format === '1920x1080') {
      container.classList.add('aspect-16-9');
    } else if (format === '960x1080') {
      container.classList.add('aspect-24-27');
    } else {
      container.classList.add('aspect-9-16');
    }
  });

  // Set initial aspect ratio on page load
  window.addEventListener('DOMContentLoaded', () => {
    const format = formatSelect.value;
    const container = document.querySelector('.animation-container');

    if (format === '1080x1080') {
      container.classList.add('aspect-1-1');
    } else if (format === '1920x1080') {
      container.classList.add('aspect-16-9');
    } else if (format === '960x1080') {
      container.classList.add('aspect-24-27');
    } else {
      container.classList.add('aspect-9-16');
    }
  });
}

// -----------------------------------------------------------------------------
// Export Button Handler
// -----------------------------------------------------------------------------

document.getElementById('videoExportButton').addEventListener('click', async () => {
  const exportButton = document.getElementById('videoExportButton');

  // --- UPDATE UI: Show loading state ---
  exportButton.disabled = true;
  exportButton.textContent = 'Exporting... (this might take a while, do not close this tab/window)';

  try {
    // --- BUILD CAPTURE URL WITH OPTIONAL PARAMS ---
    const captureParams = new URLSearchParams();
    const h1Input    = document.getElementById('headlineInput');
    const pInput     = document.getElementById('bodyInput');
    const videoInput = document.getElementById('bgVideoSelect');
    const modelInput = document.getElementById('modelSelect');
    if (h1Input)    captureParams.set('h1',    h1Input.value);
    if (pInput)     captureParams.set('p',     pInput.value);
    if (videoInput) captureParams.set('video', videoInput.value);
    if (modelInput) captureParams.set('model', modelInput.value);
    const entriesInput = document.getElementById('entriesData');
    if (entriesInput && entriesInput.value) captureParams.set('entries', entriesInput.value);
    const bgColorInput = document.getElementById('bgColor');
    if (bgColorInput && bgColorInput.value) captureParams.set('bgColor', bgColorInput.value);
    const logoModeInput = document.getElementById('logoMode');
    if (logoModeInput && logoModeInput.value) captureParams.set('logoMode', logoModeInput.value);
    const useLogoOutroInput = document.getElementById('useLogoOutroData');
    if (useLogoOutroInput && useLogoOutroInput.value) captureParams.set('useLogoOutro', useLogoOutroInput.value);
    const captureUrl = VIDEO_EXPORT_CONFIG.pageUrl + 'index4capture.html?' + captureParams.toString();

    // --- SEND EXPORT REQUEST TO SERVER ---
    const response = await fetch(VIDEO_EXPORT_CONFIG.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: captureUrl,
        timeline: VIDEO_EXPORT_CONFIG.timeline,
        selector: VIDEO_EXPORT_CONFIG.selector,
        viewport: VIDEO_EXPORT_CONFIG.viewport,
        resolution: VIDEO_EXPORT_CONFIG.resolution,
        fps: VIDEO_EXPORT_CONFIG.fps,
        filename: VIDEO_EXPORT_CONFIG.filename,
        hideSelector: VIDEO_EXPORT_CONFIG.hideSelector
      })
    });
    // --- HANDLE SERVER ERRORS ---
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server error:', errorData);
      throw new Error(errorData.error || errorData.message || 'Export failed');
    }

    // --- DOWNLOAD THE VIDEO ---
    const videoBlob = await response.blob();
    const downloadUrl = URL.createObjectURL(videoBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = VIDEO_EXPORT_CONFIG.filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    console.error('Export error:', error);
    alert(`Export failed: ${error.message}\n\nPlease try again.`);

  } finally {
    // --- RESET UI: Restore button state ---
    exportButton.disabled = false;
    exportButton.textContent = 'Export Video';
  }
});
