# GSAP Video Export Server (Railway)

Server-side service that converts GSAP animations into MP4 video files.

## What This Does

This Node.js server:
1. Receives video export requests from client animations
2. Uses Puppeteer (headless Chrome) to visit the animation URL
3. Captures each frame of the GSAP timeline
4. Encodes frames into an MP4 video file
5. Streams the video back to the browser for download

## Deployment to Railway

### 1. Initialize Git Repository
```bash
cd railway-server
git init
git add .
git commit -m "Initial commit"
```

### 2. Push to GitHub
```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/gsap-video-export-server.git
git push -u origin main
```

### 3. Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway auto-detects Node.js and deploys
6. Copy your deployment URL (e.g., `https://your-app.railway.app`)

### 4. Update Client Configuration
In your FTP-hosted animation's `video-export-client.js`, update:
```javascript
const VIDEO_EXPORT_CONFIG = {
  serverUrl: 'https://your-app.railway.app/export-video',
  // ... other settings
}
```

## API Endpoint

### POST `/export-video`

**Request Body (JSON):**
```json
{
  "url": "https://your-ftp-site.com/animation/",
  "timeline": "tl",
  "selector": ".animation-container",
  "viewport": "1080x1920",
  "resolution": "1080x1920",
  "fps": 30,
  "filename": "my-animation.mp4"
}
```

**How it works:**
- Client builds the capture URL: `https://site.com/animation/index4capture.html?h1=...&p=...`
- Server receives the full URL (or a bare directory URL — it appends `index4capture.html` if the URL ends with `/`)
- Server always appends/sets `?resolution=` on the capture URL
- `index4capture.html` fetches `index.html`, strips `.do-not-capture` elements, and reads optional query params
- Clean animation is captured without UI controls

**Optional query params supported by `index4capture.html`:**
- `h1` — headline text
- `p` — body text
- `video` — background video filename
- `model` — 3D model filename
- `entries` — JSON-encoded programme entries
- `bgColor` — CSS variable name for background color
- `logoMode` — logotype mode flag
- `useLogoOutro` — logo outro flag

**Response:** Binary MP4 file download

## Environment

- **Runtime:** Node.js 18+
- **Key Dependencies:**
  - `express` - Web server
  - `puppeteer` - Headless Chrome browser
  - `gsap-video-export` - Animation frame capture library
