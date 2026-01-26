import express from 'express'
import { videoExport } from 'gsap-video-export'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Parse JSON bodies
app.use(express.json())

// Serve static files
app.use(express.static(__dirname))

// CORS for cross-origin requests (when deployed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Export endpoint - accepts configuration for any animation
app.post('/export-video', async (req, res) => {
  console.log('📹 Video export request received...')
  console.log('Request body:', JSON.stringify(req.body, null, 2))
  
  // Get configuration from request body
  const {
    url,              // URL of the page to capture
    timeline = 'tl',  // Timeline variable name
    selector = '.container',  // Element to capture
    viewport = '1080x1920',   // Viewport size
    resolution = '1080x1920', // Output resolution
    fps = 30,
    filename = 'animation.mp4',
    hideSelector = '#exportBtn'  // Element to hide during export
  } = req.body
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' })
  }
  
  const outputFile = path.join(__dirname, `export-${Date.now()}.mp4`)
  const scriptPath = path.join(__dirname, 'gsapAnimation.js')
  
  console.log('Export config:', {
    url,
    timeline,
    selector,
    viewport,
    resolution,
    fps,
    scriptPath,
    scriptExists: fs.existsSync(scriptPath)
  })

  if (!fs.existsSync(scriptPath)) {
    return res.status(400).json({
      error: `Timeline script not found on server: ${scriptPath}`
    })
  }
  
  try {
    console.log('Attempting export with config:', {
      url: url.endsWith('/') ? url + 'index.html' : url,
      selector,
      viewport,
      resolution,
      fps,
      scriptPath
    })
    
    await videoExport({
      url: url.endsWith('/') ? url + 'index.html' : url,  // Ensure explicit file
      output: outputFile,
      viewport: viewport,
      resolution: resolution,
      fps: fps,
      selector: selector,
      timeline: timeline,
      script: scriptPath,
      scale: 1,
      verbose: true,
      wait: 5000,  // Wait 5 seconds for page to fully load
      preparePage: `
        const hideButton = () => {
          const btn = document.querySelector('${hideSelector}');
          if (btn) {
            btn.style.display = 'none';
            btn.style.visibility = 'hidden';
            btn.style.opacity = '0';
            btn.remove(); // Remove from DOM entirely
            return true;
          }
          return false;
        };

        const keepHidingButton = (intervalMs = 200) => {
          hideButton();

          setInterval(() => {
            hideButton();
          }, intervalMs);

          const observer = new MutationObserver(() => {
            hideButton();
          });
          observer.observe(document.body, { childList: true, subtree: true });
        };

        // Add class first for CSS-based hiding
        document.body.classList.add('exporting');

        // Keep hiding for the duration of the export
        keepHidingButton();

        console.log('Page prepared. Timeline window.${timeline} exists:', !!window.${timeline});
        console.log('Button removed:', !document.querySelector('${hideSelector}'));
      `
    })
    
    console.log('✅ Export complete, sending file...')
    
    // Send the file
    res.download(outputFile, filename, (err) => {
      if (err) {
        console.error('Download error:', err)
      }
      // Clean up the temporary file
      try {
        fs.unlinkSync(outputFile)
      } catch (e) {
        console.error('Cleanup error:', e)
      }
    })
    
  } catch (err) {
    console.error('❌ Export failed:', err)
    console.error('Full error:', err.stack)
    res.status(500).json({ 
      error: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📄 Environment: ${process.env.NODE_ENV || 'development'}`)
})
