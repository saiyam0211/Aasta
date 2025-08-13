import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: 'Latitude and longitude are required',
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Maps API key not configured',
        },
        { status: 500 }
      );
    }

    console.log('Reverse geocoding for:', { lat, lng });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Google Maps API response status:', data.status);

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Geocoding failed: ${data.status}`,
        },
        { status: 400 }
      );
    }

    const result = data.results[0];
    const addressComponents = result.address_components;

    // Extract address components
    let city = '';
    let state = '';
    let zipCode = '';

    addressComponents.forEach((component: any) => {
      const types = component.types;
      if (
        types.includes('locality') ||
        types.includes('administrative_area_level_2')
      ) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    const locationData = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      address: result.formatted_address,
      city,
      state,
      zipCode,
    };

    console.log('Processed location data:', locationData);

    return NextResponse.json({
      success: true,
      data: locationData,
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reverse geocode location',
      },
      { status: 500 }
    );
  }
}
