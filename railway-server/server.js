/**
 * =============================================================================
 * GSAP Video Export Server
 * =============================================================================
 * 
 * Purpose: Node.js server that renders GSAP animations to MP4 video files.
 * Deployment: Railway.app (or any Node.js hosting with Puppeteer support)
 * 
 * How it works:
 * 1. Receives POST request with animation URL and configuration
 * 2. Uses Puppeteer (headless Chrome) to visit the animation page
 * 3. Captures each frame using gsap-video-export library
 * 4. Encodes frames into MP4 and streams back to client
 * 
 * =============================================================================
 */

import express from 'express'
import { videoExport } from 'gsap-video-export'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import os from 'os'

// ES Module path resolution
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Express server
const app = express()
const PORT = process.env.PORT || 3000

// -----------------------------------------------------------------------------
// Middleware Configuration
// -----------------------------------------------------------------------------

// Parse JSON request bodies
app.use(express.json())

// Enable CORS for cross-origin requests from FTP-hosted animations
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// -----------------------------------------------------------------------------
// Video Export Endpoint
// -----------------------------------------------------------------------------

/**
 * POST /export-video
 * 
 * Request body parameters:
 * @param {string} url - Public URL of the animation page to capture
 * @param {string} timeline - Name of the GSAP timeline variable (default: 'tl')
 * @param {string} selector - CSS selector of the element to capture (default: '.animation-container')
 * @param {string} viewport - Viewport size as 'WIDTHxHEIGHT' (default: '1080x1920')
 * @param {string} resolution - Output resolution as 'WIDTHxHEIGHT' (default: '1080x1920')
 * @param {number} fps - Frames per second (default: 30)
 * @param {string} filename - Output filename (default: 'animation.mp4')
 */
app.post('/export-video', async (req, res) => {
  console.log('📹 Video export request received')
  console.log('Request configuration:', JSON.stringify(req.body, null, 2))
  
  // Extract configuration from request body with defaults
  const {
    url,
    timeline = 'tl',
    selector = '.animation-container',
    viewport = '1080x1920',
    resolution = '1080x1920',
    fps = 30,
    filename = 'animation.mp4'
  } = req.body
  
  // Validate required URL parameter
  if (!url) {
    return res.status(400).json({ 
      error: 'Missing required parameter: url',
      message: 'Please provide the public URL of your animation page'
    })
  }
  
  // Generate unique temporary filename in system temp directory
  const tempOutputFile = path.join(os.tmpdir(), `gsap-export-${Date.now()}.mp4`)
  
  // Use index4capture.html which strips out .do-not-capture elements
  // If URL ends with /, append index4capture.html, otherwise use as-is
  const captureUrl = url.endsWith('/') ? url + 'index4capture.html' : url
  
  console.log('Export configuration:', {
    originalUrl: url,
    captureUrl,
    timeline,
    selector,
    viewport,
    resolution,
    fps
  })

  try {
    // Run the video export using Puppeteer
    await videoExport({
      url: captureUrl,
      output: tempOutputFile,
      viewport: viewport,
      resolution: resolution,
      fps: fps,
      selector: selector,
      timeline: timeline,
      scale: 1,
      verbose: true,
      wait: 5000  // Wait 5 seconds for page and assets to fully load
    })
    
    console.log('✅ Video export complete, sending file to client')
    
    // Send the video file to the client, then clean up
    res.download(tempOutputFile, filename, (downloadError) => {
      if (downloadError) {
        console.error('❌ File download error:', downloadError)
      }
      
      // Delete temporary file after download
      try {
        fs.unlinkSync(tempOutputFile)
        console.log('🧹 Temporary file cleaned up')
      } catch (cleanupError) {
        console.error('⚠️ Cleanup warning:', cleanupError.message)
      }
    })
    
  } catch (exportError) {
    console.error('❌ Export failed:', exportError.message)
    console.error('Stack trace:', exportError.stack)
    
    // Clean up any partial file
    try {
      if (fs.existsSync(tempOutputFile)) {
        fs.unlinkSync(tempOutputFile)
      }
    } catch (e) { /* ignore cleanup errors */ }
    
    res.status(500).json({ 
      error: 'Video export failed',
      message: exportError.message,
      details: process.env.NODE_ENV !== 'production' ? exportError.stack : undefined
    })
  }
})

// -----------------------------------------------------------------------------
// Health Check Endpoint (useful for Railway monitoring)
// -----------------------------------------------------------------------------

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// -----------------------------------------------------------------------------
// Start Server
// -----------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log('='.repeat(60))
  console.log('🚀 GSAP Video Export Server')
  console.log('='.repeat(60))
  console.log(`📍 Port: ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📅 Started: ${new Date().toISOString()}`)
  console.log('='.repeat(60))
})
