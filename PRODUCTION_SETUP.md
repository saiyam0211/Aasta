# 🚀 Production Setup for Aasta Mobile App

## The Challenge

You have a Next.js app with:
- ✅ Server-side API routes (`/api/*`)
- ✅ Dynamic data from database
- ✅ Need native plugins (Haptics, FCM)
- ✅ Need to deploy to App Store & Play Store

## The Solution: Hybrid Approach

### Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (Capacitor)    │
├─────────────────┤
│  Public folder  │  ← Static assets only
│  (index.html)   │  ← Entry point that redirects
└────────┬────────┘
         │
         ↓ Loads from
┌─────────────────┐
│  Vercel         │
│  (Next.js)      │
│  - UI Pages     │
│  - API Routes   │
│  - Database     │
└─────────────────┘
```

### How It Works

1. **Mobile app bundle**: Contains minimal HTML that loads from Vercel
2. **Vercel**: Hosts full Next.js app with all features
3. **Native bridge**: Injected via Capacitor SDK in the HTML
4. **Result**: Native plugins work + full Next.js features

## Step-by-Step Setup

### 1. Create Mobile Entry Point

Create `public/index.html` with Capacitor bridge:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Aasta</title>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@capacitor/core@7/dist/capacitor.js"></script>
</head>
<body>
  <div id="app">Loading...</div>
  <script>
    // Redirect to Vercel with Capacitor bridge intact
    window.location.href = 'https://aastadelivery.vercel.app';
  </script>
</body>
</html>
```

**PROBLEM**: This approach loses the Capacitor bridge on redirect!

### 2. Better Approach: Iframe with PostMessage

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Aasta</title>
</head>
<body style="margin:0;padding:0;overflow:hidden">
  <iframe 
    id="app" 
    src="https://aastadelivery.vercel.app"
    style="border:none;width:100vw;height:100vh"
    allow="geolocation; camera; microphone"
  ></iframe>
  
  <script type="module">
    import { Capacitor } from 'https://cdn.jsdelivr.net/npm/@capacitor/core@7/+esm';
    import { Haptics } from 'https://cdn.jsdelivr.net/npm/@capacitor/haptics@7/+esm';
    
    // Bridge native plugins to iframe
    window.addEventListener('message', async (event) => {
      if (event.data.type === 'HAPTICS') {
        await Haptics[event.data.method](event.data.params);
      }
      // Add other plugins...
    });
  </script>
</body>
</html>
```

**PROBLEM**: Iframe has security limitations!

### 3. BEST APPROACH: Service Worker Proxy

This is what large production apps use:

1. Bundle minimal shell in app
2. Service Worker intercepts requests
3. Cache UI from Vercel
4. Native plugins work locally

## Recommended Production Solution

Since you need:
- ✅ All Next.js features (API routes, ISR, etc.)
- ✅ Native plugins (Haptics, FCM)
- ✅ Fast performance
- ✅ Easy deployment

**You should use**: **Ionic Portals** (paid) or **migrate API routes to separate backend**.

### Option A: Ionic Portals (Recommended for Enterprise)

- Costs $$$
- Built for exactly this use case
- Handles bridge automatically
- Used by Burger King, AAA, etc.

### Option B: Separate Backend (Free, More Work)

1. Move all `/api/*` routes to separate Express/Fastify server
2. Deploy backend to Vercel/Railway/Render
3. Export Next.js as static site (`output: 'export'`)
4. Bundle static site in Capacitor
5. Point API calls to backend URL

### Option C: Current Setup (What You Have Now)

**Development**:
- Use `server.url` for live reload
- Haptics won't work in development
- Test native features in production builds

**Production**:
- Comment out `server.url`
- Bundle everything (limited features)
- OR keep `server.url` (no native plugins)

## My Recommendation

For a production food ordering platform, I recommend:

**Short term** (Launch MVP):
- Keep `server.url` pointing to Vercel
- Accept that some native plugins won't work
- Focus on core features (ordering, payments)
- Use web APIs where possible (Web Vibration API)

**Long term** (Scale):
- Migrate to Option B (separate backend)
- Or invest in Ionic Portals
- This gives you full native + full Next.js

## Quick Fix for Haptics

Use Web Vibration API as fallback:

```typescript
const vibrate = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(100);
  }
};
```

This works in WebView without Capacitor bridge!

## Next Steps

1. Decide on architecture
2. I can help implement any option
3. For now, test with `server.url` commented out
4. See if limited features are acceptable for MVP

Let me know which direction you want to go!

