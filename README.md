# AI landing page builder

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/aymens-projects-3d26d65f/v0-ai-landing-page-builder)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/l8VvLhWQ430)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/aymens-projects-3d26d65f/v0-ai-landing-page-builder](https://vercel.com/aymens-projects-3d26d65f/v0-ai-landing-page-builder)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/l8VvLhWQ430](https://v0.app/chat/l8VvLhWQ430)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Builder Streaming Interface

The experimental builder UI lives at `/builder` and streams agent output from your backend.

### Session Behavior
- A new session id (`launch-session-<uuid>`) is generated automatically on page load.
- Restart button creates a fresh session and resets message history.

### Endpoint Contract
`POST http://localhost:8080/v1/agent/init/stream`

Headers:
- `x-session-id: launch-session-<uuid>`
- `Content-Type: multipart/form-data` (handled by browser)

Multipart Parts:
- `payload`: JSON blob of campaign/audience/etc.
- `assets`: (0..n) files (logo, hero, secondary images)

### Streaming Format
Server sends SSE-style lines:
```
data: {"type":"message","node":"designer_tools","text":"..."}
data: {"type":"message","node":"coder","text":"..."}
...
data: {"type":"done"}
```

Client stops on the single `type=done` signal and marks status completed.

### Accessibility
- Messages container exposes `aria-live="polite"` for screen reader announcement.

### Resize
- Split layout preview/chat ratio persisted in `localStorage` key `builder:ratio`.
*** End Patch
