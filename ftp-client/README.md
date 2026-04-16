# FTP Client - GSAP Animation with Video Export

This folder contains the files to upload to your FTP/web server.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main animation page (with export button) |
| `index4capture.html` | Clean version for video export (no UI controls) |
| `animation.js` | GSAP timeline definition |
| `animation.css` | Animation-specific styles |
| `video-export-client.js` | Handles export button, optional UI params & server communication |
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

**Note:** The client builds the full capture URL (`index4capture.html` + any optional params) and sends it to Railway. The server uses the URL as-is.

## Customization

### Video Dimensions

Resolution is driven by a `#videoFormat` dropdown element. If no dropdown is present, the script falls back to `1080x1920` (9:16). Supported values:

| Value | Format |
|---|---|
| `1080x1920` | 9:16 vertical (Instagram Story / TikTok) — default |
| `1920x1080` | 16:9 landscape (YouTube) |
| `1080x1080` | 1:1 square (Instagram Post) |
| `960x1080` | 24:27 |

The script also switches CSS aspect ratio classes on `.animation-container` when the dropdown changes.

### Optional UI Params

The following elements are auto-detected and passed as query params to `index4capture.html` if present in the page:

| Element ID | Query param | Purpose |
|---|---|---|
| `#headlineInput` | `?h1=` | Headline text |
| `#bodyInput` | `?p=` | Body text |
| `#bgVideoSelect` | `?video=` | Background video |
| `#modelSelect` | `?model=` | 3D model |
| `#entriesData` | `?entries=` | JSON programme entries |
| `#bgColor` | `?bgColor=` | CSS background color variable |
| `#logoMode` | `?logoMode=` | Logotype mode flag |
| `#useLogoOutroData` | `?useLogoOutro=` | Logo outro flag |

### Animation

Edit `animation.js` to customize the GSAP timeline. Remember:
- The timeline must be exposed as `window.tl`
- Add delays at start/end for video intro/outro