import { NextResponse } from 'next/server';
import Venue from '@/models/venue';
import connectMongoDB from "@/util/connectMongoDB";

export async function POST(request) {
  try {
    await connectMongoDB();
    const { venueId } = await request.json();

    const venue = await Venue.findOne({ venueId: venueId });
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    venue.isAvailable = true;
    venue.lastUpdated = new Date();
    await venue.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
