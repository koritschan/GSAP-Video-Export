# FTP Client - GSAP Animation with Video Export

This folder contains the files to upload to your FTP/web server.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main animation page (with export button) |
| `index4capture.html` | Clean version for video export (no UI controls) |
| `animation.js` | GSAP timeline definition |
| `animation.css` | Animation-specific styles |
| `video-export-client.js` | Handles export button & server communication |
| `mrz-corporate-design.css` | Corporate design tokens (colors, fonts) |
| `img/` | Image assets |

### Why Two HTML Files?

- **index.html** - The page users see with the export button
- **index4capture.html** - Railway server visits this page for video capture
  - Fetches `index.html` content
  - Removes all `.do-not-capture` elements (like the export button)
  - Renders clean animation for recording

## Setup

### 1. Configure Video Export Server URL

Edit `video-export-client.js` and update the server URL:

```javascript
const VIDEO_EXPORT_CONFIG = {
  serverUrl: 'https://YOUR-RAILWAY-APP.railway.app/export-video',
  // ...
}
```

### 2. Upload to FTP

Upload all files to your web server, maintaining the folder structure:

```
your-website.com/animation/
├── index.html                  ← Main page (users visit this)
├── index4capture.html          ← Capture page (Railway visits this)
├── animation.js
├── animation.css
├── video-export-client.js
├── mrz-corporate-design.css
└── img/
    ├── 2020.458_35905.jpg
    └── 2020.460_41719.jpg
```

### 3. Test

1. Open `https://your-website.com/animation/` in a browser
2. Click "Export Video (9:16)" button
3. Wait 30-60 seconds for the video to generate
4. Video will automatically download

**Note:** The client sends the directory URL to Railway, which appends `index4capture.html` automatically.

## Customization

### Video Dimensions

Common aspect ratios in `video-export-client.js`:

```javascript
// Instagram Story / TikTok (9:16 vertical)
viewport: '1080x1920',
resolution: '1080x1920',

// YouTube / Landscape (16:9)
viewport: '1920x1080',
resolution: '1920x1080',

// Instagram Post (1:1 square)
viewport: '1080x1080',
resolution: '1080x1080',
```

### Animation

Edit `animation.js` to customize the GSAP timeline. Remember:
- The timeline must be exposed as `window.tl`
- Add delays at start/end for video intro/outro
