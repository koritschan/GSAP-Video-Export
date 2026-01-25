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
  
  console.log('Export config:', {
    url,
    timeline,
    selector,
    viewport,
    resolution,
    fps
  })
  
  try {
    await videoExport({
      url: url,
      output: outputFile,
      viewport: viewport,
      resolution: resolution,
      fps: fps,
      selector: selector,
      timeline: timeline,
      scale: 1,
      verbose: true,
      preparePage: `
        // Wait for timeline to be ready
        await new Promise(resolve => {
          const checkTimeline = () => {
            if (window.${timeline}) {
              resolve();
            } else {
              setTimeout(checkTimeline, 100);
            }
          };
          checkTimeline();
        });
        
        // Hide export button
        const btn = document.querySelector('${hideSelector}');
        if (btn) btn.style.display = 'none';
        
        console.log('Timeline ready:', window.${timeline});
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
