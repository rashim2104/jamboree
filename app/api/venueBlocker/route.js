import { NextResponse } from "next/server";
import Venue from "@/models/venue";
import connectMongoDB from "@/util/connectMongoDB";

export async function POST(request) {
  try {
    await connectMongoDB();
    const { venueId, participants } = await request.json();
    console.log(venueId, participants);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const venue = await Venue.findOne({ venueId: venueId });
    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }
    console.log("max", venue.capacity);
    const max = venue.capacity;
    const todayAttendance = venue.attendees.find(
      (a) => new Date(a.date).getTime() === today.getTime()
    );
    if (participants > max) {
      return NextResponse.json(
        { message: "Participants exceed the maximum capacity" },
        { status: 201 }
      );
    }
    if (todayAttendance) {
      todayAttendance.count += participants;
    } else {
      venue.attendees.push({ date: today, count: participants });
    }

    if (venue.isAvailable == false) {
      return NextResponse.json(
        { error: "It is already block " },
        { status: 202 }
      );
    }
    venue.isAvailable = false;
    venue.totalAttendees = venue.attendees.reduce((sum, a) => sum + a.count, 0);
    venue.lastUpdated = new Date();

    await venue.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
