import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const SETTINGS_KEY = 'settings';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Default settings with the new data structure
const DEFAULT_SETTINGS = {
  target_domain: 'cosmolaser.dk',
  competitors: [
    'haevnklinik.dk',
    'velux-medical.dk',
    'hud-laser.dk',
    'nage.dk',
  ],
  // New structure for treatment categories
  treatment_categories: [
    { id: '1', name: 'Permanent hårfjerning', keywords: ['permanent hårfjerning', 'hårfjerning', 'laser hårfjerning', 'ipl hårfjerning', 'diode laser', 'alexandrite laser', 'epilering', 'hår fjernelse'] },
    { id: '2', name: 'Botox', keywords: ['botox', 'botulinum', 'rynkebehandling', 'panderynker', 'kragerødder', 'bekymringsrynke'] },
    { id: '3', name: 'Filler', keywords: ['filler', 'hyaluronsyre', 'læbefiller', 'kindben', 'jawline', 'hageforstørrelse'] },
    { id: '4', name: 'Karsprængninger', keywords: ['karsprængninger', 'åreknuder', 'blodsprængninger', 'kapillarer', 'couperose', 'rosacea', 'blodkar', 'vaskulære læsioner'] },
    { id: '5', name: 'Pigmentforandringer', keywords: ['pigmentforandringer', 'pigmentpletter', 'aldersletter', 'solskader', 'melasma', 'hyperpigmentering', 'misfarvning', 'brune pletter'] },
    { id: '6', name: 'CO2 laser', keywords: ['co2 laser', 'fraktionel laser', 'hudfornyelse', 'laser resurfacing', 'ar behandling', 'porereduktion', 'hudstramning', 'laser peeling'] }
  ],
  filter_keywords: true,
  last_updated: new Date().toISOString()
};

export async function GET() {
  try {
    let settings = await redis.get(SETTINGS_KEY);
    
    if (!settings) {
      // If no settings are found, save and return the default ones.
      await redis.set(SETTINGS_KEY, DEFAULT_SETTINGS);
      settings = DEFAULT_SETTINGS;
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error reading settings from Redis:', error);
    // In case of an error, return default settings to ensure the app can still function.
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // Add timestamp
    settings.last_updated = new Date().toISOString();
    
    await redis.set(SETTINGS_KEY, settings);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings to Redis:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}