import { NextResponse } from 'next/server';
import venueCords from '@/public/image/data/venueCords.json';

export async function GET() {
  try {
    return NextResponse.json(venueCords);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch venue data' },
      { status: 500 }
    );
  }
}
