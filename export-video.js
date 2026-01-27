import { videoExport } from 'gsap-video-export'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to the HTML file
const htmlFile = path.join(__dirname, 'index4capture.html')

console.log('Starting video export...')
console.log('This will take a few minutes to render all frames.\n')

try {
  const videoDetails = await videoExport({
    url: `file://${htmlFile}`,
    output: 'gsap-animation-9-16.mp4',
    viewport: '1080x1920',      // 9:16 format
    resolution: '1080x1920',     // Output resolution
    fps: 30,                     // 30 fps
    selector: '.container',      // Capture the container
    timeline: 'tl',              // Use our custom timeline
    scale: 1,
    verbose: true
  })
  
  console.log('\n✅ Video export complete!')
  console.log(`📁 File: ${videoDetails.file}`)
  console.log(`⏱️  Export time: ${videoDetails.exportTime}s`)
  console.log(`🎬 Render time: ${videoDetails.renderTime}s`)
} catch (err) {
  console.error('❌ Export failed:', err.message)
  process.exit(1)
}
