# Google Maps API Setup Guide

This guide will help you set up Google Maps API integration for real location services in your Night Delivery app.

## Prerequisites

1. A Google Cloud Platform account
2. A billing account set up in Google Cloud (required for Maps APIs)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud project:

1. **Maps JavaScript API**
   - Used for loading the Google Maps library
   
2. **Places API**  
   - Used for place autocomplete and place details
   
3. **Geocoding API**
   - Used for converting addresses to coordinates and vice versa

To enable these APIs:
1. Go to [API Library](https://console.cloud.google.com/apis/library)
2. Search for each API listed above
3. Click on the API and then click "Enable"

## Step 3: Create API Key

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Important**: Click "Restrict Key" to secure your API key

## Step 4: Configure API Key Restrictions

### Application Restrictions
- Select "HTTP referrers (web sites)"
- Add your domains:
  - `localhost:3000/*` (for development)
  - `yourdomain.com/*` (for production)

### API Restrictions
- Select "Restrict key"
- Choose the APIs you enabled:
  - Maps JavaScript API
  - Places API  
  - Geocoding API

## Step 5: Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Maps API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

   **Note**: The `NEXT_PUBLIC_` prefix is required for the API key to be available in the browser.

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to a page with the location input component
3. Try the following features:
   - **Type in the address field**: Should show real Google Places suggestions
   - **Click the location button**: Should detect your current location and show the actual address
   - **Select a suggestion**: Should populate the field with the real address

## Features Implemented

### ✅ Real Location Detection
- Uses browser's geolocation API to get user's coordinates
- Reverse geocodes coordinates to get readable address
- Shows exact location in the input field

### ✅ Smart Address Autocomplete  
- Real-time suggestions from Google Places API
- Shows formatted addresses as you type
- Filters results to relevant locations
- No hardcoded data - all results come from Google

### ✅ Accurate Geocoding
- Converts addresses to precise coordinates
- Extracts city, state, and zip code information
- Handles various address formats

## Troubleshooting

### Common Issues

**1. API Key Not Working**
- Verify the API key is correctly set in `.env.local`
- Check that all required APIs are enabled
- Ensure API key restrictions allow your domain

**2. No Suggestions Appearing**
- Check browser console for API errors
- Verify Places API is enabled and properly restricted
- Test with a different search term

**3. Current Location Not Working**
- Browser must support geolocation
- User must grant location permission
- HTTPS required in production (localhost works for development)

**4. CORS Errors**  
- Add your domain to the API key restrictions
- Ensure you're using `NEXT_PUBLIC_` prefix for the environment variable

### API Quotas and Billing

- Google Maps APIs have daily quotas and may require billing
- Monitor your usage in the [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
- Set up billing alerts to avoid unexpected charges

## Cost Optimization Tips

1. **Enable API key restrictions** to prevent unauthorized usage
2. **Implement caching** for repeated requests (already done in the location service)
3. **Use session tokens** for Places API autocomplete to get discounted rates
4. **Monitor API usage** regularly through Google Cloud Console

## Security Best Practices

1. **Never expose your API key** in client-side code without restrictions
2. **Use environment variables** for all sensitive configuration
3. **Regularly rotate API keys** as part of security maintenance  
4. **Monitor API usage** for any suspicious activity

## Support

If you encounter issues:
1. Check the [Google Maps API Documentation](https://developers.google.com/maps/documentation)
2. Review your Google Cloud Console for error messages
3. Test your API key with Google's [API Explorer](https://developers.google.com/maps/documentation/javascript/examples/api-explorer)
