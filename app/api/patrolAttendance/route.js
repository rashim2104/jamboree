import connectMongoDB from "@/util/connectMongoDB";
import Patrol from "@/models/patrol";
import Venue from "@/models/venue";
import { NextResponse } from "next/server";
import { venueMappings } from "@/public/image/data/venueInfo";
import { pavillionLimits } from "@/public/image/data/pavillionLimit";

export async function POST(req) {
  const { venueId, patrolId } = await req.json();

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

    // Check if the patrol exists
    const patrol = await Patrol.findOne({ patrolId });
    if (!patrol) {
      return NextResponse.json({ message: "Patrol not found" }, { status: 404 });
    }

    if (patrol.visitedVenues.includes(venueId)) {
      return NextResponse.json(
        { message: "Venue already visited" },
        { status: 200 }
      );
    }

    // Get pavilion info for the venue
    const venueInfo = venueMappings.find(mapping => mapping[venueId])?.[venueId];
    if (!venueInfo) {
      return NextResponse.json(
        { message: "Venue mapping not found" },
        { status: 400 }
      );
    }

    console.log(venueInfo);

    // Get pavilion limit
    const pavilionLimit = pavillionLimits.find(limit => limit[venueInfo.pavilion])?.[venueInfo.pavilion];
    if (!pavilionLimit) {
      return NextResponse.json(
        { message: "Pavilion limit not found" },
        { status: 400 }
      );
    }

    console.log(pavilionLimit);

    // Find existing pavilion record or create new one
    let pavilionRecord = patrol.visitedPavilions.find(
      p => p.pavilion === venueInfo.pavilion
    );

    if (pavilionRecord) {
      if (pavilionRecord.visitedCount >= pavilionLimit) {
        return NextResponse.json(
          { message: `Pavilion ${venueInfo.pavilion} visit limit reached` },
          { status: 400 }
        );
      }
      pavilionRecord.visitedCount += 1;
    } else {
      patrol.visitedPavilions.push({
        pavilion: venueInfo.pavilion,
        visitedCount: 1
      });
    }

    // Add venueId to visitedVenues and save
    patrol.visitedVenues.push(venueId);
    patrol.lastUpdated = new Date();
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
