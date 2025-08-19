import { NextRequest, NextResponse } from 'next/server';

// Minimal shape we return to clients
interface Suggestion {
  // Human-readable suggestion text
  description: string;
  // Optional coordinates if upstream returns them; otherwise null
  latitude: number | null;
  longitude: number | null;
  // Raw item for debugging/advanced use
  _raw?: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = (searchParams.get('input') || '').trim();
    const country = (searchParams.get('country') || 'IN').toUpperCase();

    if (input.length < 3) {
      return NextResponse.json(
        { success: true, data: [] as Suggestion[] },
        { status: 200 }
      );
    }

    const apiKey = process.env.OLA_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OLA_MAPS_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const upstreamUrl = new URL(
      'https://api.olamaps.io/places/v1/autocomplete'
    );
    upstreamUrl.searchParams.set('input', input);
    // Restrict by country when provided
    if (country)
      upstreamUrl.searchParams.set('components', `country:${country}`);

    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      // Ensure server-to-server request
      cache: 'no-store',
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text().catch(() => '');
      return NextResponse.json(
        {
          success: false,
          error: 'Upstream Ola Maps error',
          status: upstreamRes.status,
          body: text,
        },
        { status: upstreamRes.status }
      );
    }

    const json = await upstreamRes.json().catch(() => null);
    if (!json) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON from Ola Maps' },
        { status: 502 }
      );
    }

    // Best-effort normalization. Different providers return different shapes.
    // Try common fields: `predictions`, `suggestions`, or top-level array
    const rawItems: any[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.predictions)
        ? json.predictions
        : Array.isArray(json?.suggestions)
          ? json.suggestions
          : [];

    const data: Suggestion[] = rawItems.map((item) => {
      // Heuristics for description text
      const description =
        item?.description ||
        (item?.structured_formatting?.main_text &&
          item?.structured_formatting?.secondary_text)
          ? `${item.structured_formatting.main_text}, ${item.structured_formatting.secondary_text}`
          : item?.name || item?.formatted_address || '';

      // Some providers include coordinates directly; if not present, return nulls
      const lat =
        typeof item?.lat === 'number'
          ? item.lat
          : typeof item?.latitude === 'number'
            ? item.latitude
            : null;
      const lng =
        typeof item?.lng === 'number'
          ? item.lng
          : typeof item?.longitude === 'number'
            ? item.longitude
            : null;

      return {
        description,
        latitude: lat,
        longitude: lng,
        _raw: item,
      };
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
