import Patrol from "@/models/patrol";
import connectMongoDB from "@/util/connectMongoDB";
import { NextResponse } from "next/server";
import venueData from "@/public/image/data/venueCords.json";

export async function POST(req) {
  try {
    await connectMongoDB();
    const patrolData = await req.json();

    let patrolId;
    try {
      const parsedData = JSON.parse(patrolData.patrolId);
      patrolId = parsedData.ticket_id;
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid patrolId format" },
        { status: 400 }
      );
    }

    if (!patrolId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patrol ID is required",
          errorType: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const patrol = await Patrol.findOne({ patrolId });

    if (!patrol) {
      return NextResponse.json(
        {
          success: false,
          message: "Patrol not found",
          errorType: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Get all displayable venues
    const displayableVenues = venueData.filter(venue => venue.display === true);

    // Find unvisited venues by comparing venueIds
    const unvisitedVenues = displayableVenues
      .filter(venue => !patrol.visitedVenues.includes(venue.venueId))
      .map(venue => venue.venueName);

    // Map visited venueIds to venue names
    const visitedVenueNames = patrol.visitedVenues
      .map(venueId => {
        const venue = venueData.find(v => v.venueId === venueId);
        return venue ? venue.venueName : null;
      })
      .filter(name => name !== null);

    return NextResponse.json(
      {
        success: true,
        data: {
          patrolId: patrol.patrolId,
          visitedVenues: visitedVenueNames,
          totalVenues: visitedVenueNames.length,
          unvisitedVenues,
          lastUpdated: patrol.lastUpdated,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching patrol details",
        errorType: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
