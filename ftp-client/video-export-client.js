/**
 * =============================================================================
 * Video Export Client
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
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const VIDEO_EXPORT_CONFIG = {
  // Railway server URL - UPDATE THIS after deploying your server
  serverUrl: 'https://gsap-video-export-production.up.railway.app/export-video',
  
  // Animation page URL (automatically uses current page)
  // IMPORTANT: Must be publicly accessible, not localhost!
  pageUrl: window.location.href,
  
  // GSAP timeline variable name (must match your animation.js export)
  timeline: 'tl',
  
  // CSS selector for the element to capture
  selector: '.animation-container',
  
  // Video dimensions (9:16 vertical format for social media)
  viewport: '720x1280',
  resolution: '720x1280',
  
  // Frames per second (24 is cinematic, 30 is standard, 60 is smooth)
  fps: 24,
  
  // Output filename
  filename: 'gsap-animation-9-16.mp4',
  
  // Elements to hide during capture (e.g., the export button itself)
  hideSelector: '#videoExportButton'
};

// -----------------------------------------------------------------------------
// Export Button Handler
// -----------------------------------------------------------------------------

document.getElementById('videoExportButton').addEventListener('click', async () => {
  const exportButton = document.getElementById('videoExportButton');
  
  // --- UPDATE UI: Show loading state ---
  exportButton.disabled = true;
  exportButton.textContent = 'Exporting... (30-60 seconds)';
  
  try {
    // --- SEND EXPORT REQUEST TO SERVER ---
    const response = await fetch(VIDEO_EXPORT_CONFIG.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: VIDEO_EXPORT_CONFIG.pageUrl,
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
    
    // Create temporary download link and trigger click
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = VIDEO_EXPORT_CONFIG.filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up blob URL
    URL.revokeObjectURL(downloadUrl);
    
    console.log('✅ Video downloaded successfully!');
    
  } catch (error) {
    console.error('Export error:', error);
    alert(`Export failed: ${error.message}\n\nPlease try again.`);
    
  } finally {
    // --- RESET UI: Restore button state ---
    exportButton.disabled = false;
    exportButton.textContent = 'Export Video (9:16)';
  }
});
