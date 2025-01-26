import connectMongoDB from "@/util/connectMongoDB";
import Patrol from "@/models/patrol";
import Venue from "@/models/venue";
import { NextResponse } from "next/server";
import { venueMappings } from "@/public/image/data/venueInfo";
import { pavillionLimits } from "@/public/image/data/pavillionLimit";
import { updatePatrolVenue } from "@/util/googleSheets";

export async function POST(req) {
  const { venueId, patrolData } = await req.json();

  let parsedPatrolData;
  let patrolId;

  console.log("Received patrol data:", patrolData);


  try {
    parsedPatrolData = JSON.parse(patrolData);
    console.log("Parsed patrol data:", parsedPatrolData);

    patrolId = parsedPatrolData.ticket_id;
    if (!patrolId) {
      throw new Error("Missing ticket_id");
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid patrolId format" },
      { status: 400 }
    );
  }

  if (!venueId || !patrolId) {
    return NextResponse.json({
      success: false,
      message: "Both venue ID and patrol ID are required",
      errorType: "VALIDATION_ERROR"
    }, { status: 400 });
  }

  try {
    await connectMongoDB();

    const venue = await Venue.findOne({ venueId: venueId });
    if (!venue) {
      return NextResponse.json({
        success: false,
        message: "Venue does not exist in the system",
        errorType: "NOT_FOUND"
      }, { status: 404 });
    }

    // Check if venue is blocked
    if (!venue.isAvailable) {
      return NextResponse.json({
        success: false,
        message: "This venue is currently blocked and not accepting visitors",
        errorType: "VENUE_BLOCKED"
      }, { status: 403 });
    }

    // Check if venue capacity will be exceeded
    if (venue.currentValue >= venue.capacity) {
      return NextResponse.json({
        success: false,
        message: "Venue has reached maximum capacity",
        errorType: "CAPACITY_REACHED"
      }, { status: 403 });
    }

    const patrol = await Patrol.findOne({ patrolId });
    if (!patrol) {
      return NextResponse.json({
        success: false,
        message: "Invalid QR code - Patrol not found",
        errorType: "NOT_FOUND"
      }, { status: 404 });
    }

    if (patrol.visitedVenues.includes(venueId)) {
      return NextResponse.json({
        success: false,
        message: "This patrol has already visited this venue",
        errorType: "DUPLICATE_VISIT"
      }, { status: 409 });
    }

    const venueInfo = venueMappings.find(mapping => mapping[venueId])?.[venueId];
    if (!venueInfo) {
      return NextResponse.json({
        success: false,
        message: "Venue configuration not found",
        errorType: "CONFIG_ERROR"
      }, { status: 400 });
    }

    const pavilionLimit = pavillionLimits.find(limit => limit[venueInfo.pavilion])?.[venueInfo.pavilion];
    if (!pavilionLimit) {
      return NextResponse.json({
        success: false,
        message: "Pavilion limit configuration not found",
        errorType: "CONFIG_ERROR"
      }, { status: 400 });
    }

    let pavilionRecord = patrol.visitedPavilions.find(
      p => p.pavilion === venueInfo.pavilion
    );

    if (pavilionRecord && pavilionRecord.visitedCount >= pavilionLimit) {
      return NextResponse.json({
        success: false,
        message: `This patrol has reached the maximum visits (${pavilionLimit}) for ${venueInfo.pavilion} pavilion`,
        errorType: "LIMIT_REACHED"
      }, { status: 400 });
    }

    // If all validations pass, update venue statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize or update venue properties
    venue.currentValue = (venue.currentValue || 0) + 1;
    venue.totalAttendees = (venue.totalAttendees || 0) + 1;
    venue.lastUpdated = new Date();
    venue.attendees = venue.attendees || [];

    // Find and update today's attendance
    const todayAttendanceIndex = venue.attendees.findIndex(
      a => new Date(a.date).setHours(0,0,0,0) === today.getTime()
    );

    if (todayAttendanceIndex >= 0) {
      venue.attendees[todayAttendanceIndex].count += 1;
    } else {
      venue.attendees.push({ date: today, count: 1 });
    }

    // Update venue availability based on capacity
    if (venue.currentValue >= venue.capacity) {
      venue.isAvailable = false;
    }

    // Save venue changes
    await venue.save();

    // Update patrol record
    if (pavilionRecord) {
      pavilionRecord.visitedCount += 1;
    } else {
      patrol.visitedPavilions.push({
        pavilion: venueInfo.pavilion,
        visitedCount: 1
      });
    }

    patrol.visitedVenues.push(venueId);
    patrol.lastUpdated = new Date();
    await patrol.save();

    // Update Google Sheet after successful patrol visit
    await updatePatrolVenue(patrolId, patrol.visitedVenues);

    return NextResponse.json({
      success: true,
      message: "Visit recorded successfully!",
      visitCount: pavilionRecord ? pavilionRecord.visitedCount : 1,
      pavilion: venueInfo.pavilion,
      venueCapacity: {
        current: venue.currentValue,
        max: venue.capacity
      }
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Server error while processing QR code",
      errorType: "SERVER_ERROR"
    }, { status: 500 });
  }
}
