import { NextResponse } from "next/server";
import Patrol from "@/models/patrol";
import connectMongoDB from "@/util/connectMongoDB";
import Venue from "@/models/venue";

export async function POST(request) {
  try {
    await connectMongoDB();
    const { venueId, patrolId } = await request.json();
    console.log("Venue ID: ", venueId);
    console.log("Patrol ID: ", patrolId);

    // Find the venue by venueId
    const venue = await Venue.findOne({ venueId: venueId });
    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    // Find the patrol by patrolId
    const patrol = await Patrol.findOne({ patrolId: patrolId });
    if (!patrol) {
      return NextResponse.json({ error: "Patrol not found" }, { status: 404 });
    }

    console.log("Patrol before update: ", patrol);

    // Ensure visitedVenues is an array
    let visitedVenues = Array.isArray(patrol.visitedVenues)
      ? patrol.visitedVenues
      : [];

    console.log("Visited Venues before update: ", visitedVenues);

    // Check if the venue is already visited by this patrol
    const venueAlreadyVisited = visitedVenues.some(
      (visitedVenue) => visitedVenue.venueId === venueId
    );

    if (venueAlreadyVisited) {
      return NextResponse.json(
        { message: "You have already visited this venue" },
        { status: 400 }
      );
    }

    // Add the new venue to the visitedVenues array with the current date
    visitedVenues.push({
      venueId: venueId,
      visitedAt: new Date(), // Current date of visit
    });

    // Update the patrol's visitedVenues in the database
    patrol.visitedVenues = visitedVenues;
    patrol.lastUpdated = new Date(); // Update the lastUpdated timestamp

    await patrol.save(); // Save the updated patrol

    console.log("Visited Venues after update: ", patrol.visitedVenues);

    // Return success response
    return NextResponse.json(
      {
        message: "Venue visited successfully",
        visitedVenues: patrol.visitedVenues,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
