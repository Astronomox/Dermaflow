// src/app/api/geocode/route.ts
// Geocodes city names to lat/lon using Open-Meteo's free geocoding API.
// Usage: GET /api/geocode?q=Lagos

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=5&language=en&format=json`;
    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache 24h

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = data.results.map((r: any) => ({
      name: r.name,
      country: r.country,
      admin1: r.admin1, // state/region
      latitude: r.latitude,
      longitude: r.longitude,
      displayName: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('[DERMAFLOW] Geocoding error:', error.message);
    return NextResponse.json({ error: 'Failed to geocode location' }, { status: 502 });
  }
}
