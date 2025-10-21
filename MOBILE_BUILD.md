# 📱 Mobile App Build Guide

## Architecture

This project uses a **hybrid architecture** for production:

- ✅ **UI bundled** in APK/IPA (static HTML/CSS/JS from Next.js)
- ✅ **API calls** go to Vercel (https://aastadelivery.vercel.app)
- ✅ **Native plugins** work (Haptics, FCM, Geolocation, etc.)
- ✅ **Fast & scalable** - UI loads instantly, data from Vercel

## How It Works

1. Next.js builds a static export (`output: 'export'`)
2. Static files go to `out/` directory
3. Capacitor bundles these files in the app
4. App loads UI from local files (fast!)
5. API calls go to Vercel (real-time data)
6. Native plugins work because UI is local

## Production Build Process

### 1. Build for Mobile

```bash
pnpm build:mobile
```

This will:
- Generate Prisma client
- Build Next.js static export
- Sync with Capacitor (Android & iOS)

### 2. Build Android APK

```bash
# Option A: Using npm script
pnpm build:android

# Option B: Manual
pnpm build:mobile
npx cap open android
# Then in Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### 3. Build iOS IPA

```bash
# Option A: Using npm script  
pnpm build:ios

# Option B: Manual
pnpm build:mobile
npx cap open ios
# Then in Xcode: Product > Archive
```

## Development vs Production

### Development (with live reload)
```typescript
// capacitor.config.ts
server: {
  url: 'http://localhost:3000', // or Vercel URL
}
```

### Production (for App Store/Play Store)
```typescript
// capacitor.config.ts
server: {
  // NO url property - UI bundled in app
  androidScheme: 'https',
}
```

## Important Notes

### ✅ What Works
- All native plugins (Haptics, FCM, etc.)
- Fast UI loading (bundled locally)
- Real-time data (API calls to Vercel)
- Push notifications
- Offline UI (can cache API responses)

### ⚠️ Limitations
- No server-side rendering in app
- No ISR (Incremental Static Regeneration)
- API routes must be on Vercel
- Images must use `unoptimized: true`

## API Configuration

All API calls automatically go to Vercel because:

1. Relative URLs in code: `/api/restaurants`
2. Next.js rewrites them during static export
3. Base URL can be configured via env vars

## Troubleshooting

### Haptics not working?
- Make sure `server.url` is NOT set in `capacitor.config.ts`
- Rebuild: `pnpm build:mobile`
- Clean build in Android Studio/Xcode

### API calls failing?
- Check that NEXT_PUBLIC_API_URL is set correctly
- Verify CORS settings on Vercel
- Check network permissions in AndroidManifest.xml

### Build fails?
- Make sure `output: 'export'` is in `next.config.ts`
- Check that all dynamic routes have fallbacks
- Verify no server-only features (getServerSideProps, etc.)

## File Structure

```
out/                    # Next.js static export
├── index.html         # Entry point
├── _next/             # JS/CSS bundles
├── images/            # Static images
└── ...

android/               # Android native project
├── app/
│   └── src/main/assets/public/  # Bundled web files
└── ...

ios/                   # iOS native project
└── App/App/public/    # Bundled web files
```

## Deployment Checklist

### Before building for production:

- [ ] Remove `server.url` from `capacitor.config.ts`
- [ ] Set `output: 'export'` in `next.config.ts`
- [ ] Set `images.unoptimized: true`
- [ ] Update app version in `package.json`
- [ ] Update version in Android (`build.gradle`)
- [ ] Update version in iOS (`Info.plist`)
- [ ] Test all native plugins
- [ ] Test API calls to Vercel
- [ ] Test offline behavior
- [ ] Build signed APK/IPA
- [ ] Upload to Play Store/App Store

## Performance Tips

1. **Enable caching**: Cache API responses in local storage
2. **Lazy load**: Use Next.js dynamic imports
3. **Optimize images**: Compress before bundling
4. **Service Worker**: Cache static assets
5. **Bundle size**: Monitor with `next build --analyze`

## Support

For issues or questions:
- Check Capacitor docs: https://capacitorjs.com
- Next.js static export: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- File an issue in the repo

