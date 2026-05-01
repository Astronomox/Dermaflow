// src/app/api/weather/route.ts
// Proxies Open-Meteo API for live UV index, temperature, humidity, wind data.
// Open-Meteo is free for non-commercial use, no API key required.
// Usage: GET /api/weather?lat=6.5244&lon=3.3792

import { NextRequest, NextResponse } from 'next/server';

interface WeatherData {
  location: { latitude: number; longitude: number };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    weatherCode: number;
    apparentTemperature: number;
    cloudCover: number;
  };
  daily: {
    uvIndexMax: number;
    temperatureMax: number;
    temperatureMin: number;
    precipitationProbability: number;
  };
}

// Open-Meteo weather codes to descriptions
function weatherCodeToDescription(code: number): string {
  const codes: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  };
  return codes[code] || 'Unknown';
}

function getUVLevel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

function getSafeExposureTime(uv: number): string {
  if (uv <= 2) return '60+ minutes';
  if (uv <= 5) return '30-45 minutes';
  if (uv <= 7) return '15-25 minutes';
  if (uv <= 10) return '10-15 minutes';
  return '5-10 minutes';
}

function getRecommendation(uv: number): string {
  if (uv <= 2) return 'Minimal protection needed. Enjoy the outdoors safely.';
  if (uv <= 5) return 'Wear sunscreen SPF 30+. Seek shade during midday hours.';
  if (uv <= 7) return 'Apply SPF 50+ sunscreen. Wear a hat and sunglasses. Reduce time in the sun.';
  if (uv <= 10) return 'Limit sun exposure. Wear SPF 50+ with protective clothing and a wide-brim hat.';
  return 'Avoid outdoor exposure between 10am-4pm. Wear SPF 50+ with full protective clothing.';
}

function getMelanomaRisk(uv: number): 'low' | 'moderate' | 'high' {
  if (uv <= 5) return 'low';
  if (uv <= 8) return 'moderate';
  return 'high';
}

function getAirQualityLabel(cloudCover: number): string {
  // Rough proxy — we'd need a real AQI API for accuracy
  // Open-Meteo has an Air Quality API too, but keeping it simple
  if (cloudCover > 80) return 'Moderate';
  if (cloudCover > 50) return 'Fair';
  return 'Good';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Missing lat and lon query parameters' },
      { status: 400 }
    );
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,wind_speed_10m,uv_index&daily=uv_index_max,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`;

    const response = await fetch(url, { next: { revalidate: 600 } }); // Cache 10 min

    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;
    const uvIndex = Math.round((current.uv_index || 0) * 10) / 10;
    const uvMax = Math.round((daily.uv_index_max?.[0] || uvIndex) * 10) / 10;

    const result = {
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      },
      current: {
        temperature: Math.round(current.temperature_2m),
        apparentTemperature: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        uvIndex,
        cloudCover: current.cloud_cover,
        weatherCode: current.weather_code,
        weatherDescription: weatherCodeToDescription(current.weather_code),
      },
      uv: {
        index: uvIndex,
        maxToday: uvMax,
        level: getUVLevel(uvMax),
        safeExposureTime: getSafeExposureTime(uvMax),
        recommendation: getRecommendation(uvMax),
        melanomaRisk: getMelanomaRisk(uvMax),
      },
      environment: {
        temperature: `${Math.round(current.temperature_2m)}°C`,
        humidity: `${current.relative_humidity_2m}%`,
        airQuality: getAirQualityLabel(current.cloud_cover),
        windSpeed: `${Math.round(current.wind_speed_10m)} km/h`,
      },
      daily: {
        temperatureMax: Math.round(daily.temperature_2m_max?.[0] || 0),
        temperatureMin: Math.round(daily.temperature_2m_min?.[0] || 0),
        precipitationProbability: daily.precipitation_probability_max?.[0] || 0,
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[DERMAFLOW] Weather API error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch weather data. Please try again.' },
      { status: 502 }
    );
  }
}
