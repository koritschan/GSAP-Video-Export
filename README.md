# GSAP Video Export Project

Convert GSAP animations into MP4 video files for social media and other uses.

## Project Structure

```
├── railway-server/     ← Deploy to Railway (Node.js server)
│   ├── server.js           Server-side video rendering
│   ├── timeline-script.js  Required by gsap-video-export
│   ├── package.json        Node.js dependencies
│   ├── nixpacks.toml       Railway Chromium config
│   └── README.md           Deployment instructions
│
├── ftp-client/         ← Upload to your FTP/web server
│   ├── index.html          Animation page
│   ├── animation.js        GSAP timeline
│   ├── animation.css       Animation styles
│   ├── video-export-client.js   Export button handler
│   ├── mrz-corporate-design.css Corporate styles
│   ├── img/                Image assets
│   └── README.md           Setup instructions
│
└── README.md           ← This file
```

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           YOUR BROWSER                                   │
│  ┌──────────────────────┐                                               │
│  │  FTP-hosted page     │                                               │
│  │  (index.html)        │  1. Click "Export"                            │
│  │                      │─────────────────────────────┐                 │
│  └──────────────────────┘                             │                 │
└───────────────────────────────────────────────────────│─────────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        RAILWAY SERVER                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  2. Server receives request with directory URL                   │  │
│  │  3. Puppeteer opens index4capture.html (clean version)           │  │
│  │     - Fetches index.html from same directory                     │  │
│  │     - Strips out .do-not-capture elements (export button)        │  │
│  │  4. Captures each frame of the GSAP timeline                     │  │
│  │  5. Encodes frames into MP4                                      │  │
│  │  6. Sends video back to browser ─────────────────────────────────│──┼──► Download
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Deploy Railway Server

```bash
cd railway-server
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

Then deploy on [railway.app](https://railway.app) → New Project → Deploy from GitHub

### 2. Configure & Upload FTP Client

1. Edit `ftp-client/video-export-client.js`:
   ```javascript
   serverUrl: 'https://YOUR-APP.railway.app/export-video'
   ```

2. Upload `ftp-client/` contents to your web server

### 3. Export Video

1. Open your animation page in a browser
2. Click "Export Video (9:16)"
3. Wait 30-60 seconds
4. Video downloads automatically!

## Requirements

- **Railway Server:** Node.js 18+ hosting with Puppeteer support
- **FTP Client:** Any static web hosting (must be publicly accessible)
- **Animation:** GSAP timeline exposed as `window.tl`
