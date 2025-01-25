import connectMongoDB from "@/util/connectMongoDB";
import Patrol from "@/models/patrol"; // Patrol model
import Venue from "@/models/venue"; // Venue model
import { NextResponse } from "next/server"; // Import NextResponse

export async function POST(req) {
  const { venueId, patrolId } = await req.json(); // Parse body for JSON payload

  if (!venueId || !patrolId) {
    return NextResponse.json(
      { message: "venueId and patrolId are required" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();

    // Check if the venue exists
    const venue = await Venue.findOne({ venueId: venueId });
    if (!venue) {
      return NextResponse.json({ message: "Venue not found" }, { status: 404 });
    }

    console.log("venue", venue.venueId); // Check the document

    // Check if the patrol exists
    const patrol = await Patrol.findOne({ patrolId });
    if (!patrol) {
      return NextResponse.json(
        { message: "Patrol not found" },
        { status: 404 }
      );
    }

    console.log("patrol.visitedVenues", patrol.visitedVenues); // Check the array
    if (patrol.visitedVenues.includes(venueId)) {
      return NextResponse.json(
        { message: "Venue already visited" },
        { status: 200 }
      );
    }

    // Add venueId to visitedVenues and save the document
    console.log("venue.venueId", venue.venueId);
    patrol.visitedVenues.push(venueId);
    await patrol.save();

    return NextResponse.json(
      { message: "Venue added to visitedVenues", patrol },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
