// Client-side video export handler
// Configuration for this specific animation
const EXPORT_CONFIG = {
  // Server URL
  serverUrl: 'https://gsap-video-export-production.up.railway.app/export-video',  // Railway URL
  
  // Animation configuration
  url: window.location.href,  // Current page URL (must be publicly accessible)
  timeline: 'tl',             // Your timeline variable name (window.tl)
  selector: '.container',      // Element to capture
  viewport: '720x1280',      // 9:16 format (reduced for Railway memory limits)
  resolution: '720x1280',
  fps: 24,
  filename: 'gsap-animation-9-16.mp4',
  hideSelector: '#exportBtn'   // Hide export button in video
}

document.getElementById('exportBtn').addEventListener('click', async () => {
  const exportBtn = document.getElementById('exportBtn')
  const exportBtnParent = exportBtn.parentNode
  const exportBtnNextSibling = exportBtn.nextSibling
  
  // Disable button and show progress
  exportBtn.disabled = true
  exportBtn.textContent = 'Exporting... (this may take 30-60 seconds)'
  // Remove button from DOM during export to prevent it appearing in the capture
  exportBtn.remove()
  
  try {
    const response = await fetch(EXPORT_CONFIG.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: EXPORT_CONFIG.url,
        timeline: EXPORT_CONFIG.timeline,
        selector: EXPORT_CONFIG.selector,
        viewport: EXPORT_CONFIG.viewport,
        resolution: EXPORT_CONFIG.resolution,
        fps: EXPORT_CONFIG.fps,
        filename: EXPORT_CONFIG.filename,
        hideSelector: EXPORT_CONFIG.hideSelector
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Server error:', errorData)
      throw new Error(errorData.error || 'Export failed')
    }
    
    // Get the video blob
    const blob = await response.blob()
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = EXPORT_CONFIG.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // Re-add and reset button
    if (exportBtnParent) {
      exportBtnParent.insertBefore(exportBtn, exportBtnNextSibling)
    }
    exportBtn.disabled = false
    exportBtn.textContent = 'Export Video (9:16)'
    
    console.log('✅ Video downloaded successfully!')
    
  } catch (err) {
    console.error('Export error:', err)
    alert('Export failed. Please try again.')
    
    if (exportBtnParent) {
      exportBtnParent.insertBefore(exportBtn, exportBtnNextSibling)
    }
    exportBtn.disabled = false
    exportBtn.textContent = 'Export Video (9:16)'
  }
})
