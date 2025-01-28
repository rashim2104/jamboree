import { google } from "googleapis";
import connectMongoDB from "@/util/connectMongoDB";
import Patrol from "@/models/patrol";
import Venue from "@/models/venue";
import { NextResponse } from "next/server";
import { venueMappings } from "@/public/image/data/venueInfo";
import { pavillionLimits } from "@/public/image/data/pavillionLimit";
import path from "path";
import venueCords from "@/public/image/data/venueCords.json";

export async function POST(req) {
  const { venueId, patrolData } = await req.json();

  let patrolId;
  try {
    const parsedData = JSON.parse(patrolData);
    patrolId = parsedData.ticket_id;
    if (!patrolId) throw new Error("Missing ticket_id");
  } catch (error) {
    return NextResponse.json({ message: "Invalid patrolId format" }, { status: 400 });
  }

  if (!venueId || !patrolId) {
    return NextResponse.json(
      {
        success: false,
        message: "Both venue ID and patrol ID are required",
        errorType: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  try {
    // Parallel database connection and initial queries
    const [mongoConnection, venue, patrol] = await Promise.all([
      connectMongoDB(),
      Venue.findOne({ venueId }),
      Patrol.findOne({ patrolId })
    ]);

    // Validation checks
    if (!venue) {
      return NextResponse.json({
        success: false,
        message: "Venue does not exist in the system",
        errorType: "NOT_FOUND"
      }, { status: 404 });
    }

    if (!venue.isAvailable) {
      return NextResponse.json({
        success: false,
        message: "This venue is currently blocked and not accepting visitors",
        errorType: "VENUE_BLOCKED"
      }, { status: 403 });
    }

    if (venue.currentValue >= venue.capacity) {
      return NextResponse.json({
        success: false,
        message: "Venue has reached maximum capacity",
        errorType: "CAPACITY_REACHED"
      }, { status: 403 });
    }

    if (!patrol) {
      return NextResponse.json({
        success: false,
        message: "Invalid QR code - Patrol not found",
        errorType: "NOT_FOUND"
      }, { status: 404 });
    }

    // Required venue IDs from the venue data (excluding Ready for Life)
    const requiredVenueIds = [
      "faclty_cubkceamd29s7145qms0", // Be Prepared
      "faclty_cubkc3amd29s7145qmrg", // People
      "faclty_cubkb6imd29s7145qmr0", // Prosperity
      "faclty_cubk6ramd29s7145qmng", // Planet
      "faclty_cubk9hamd29s7145qmqg", // Peace & Partnership
      "faclty_cubkasva07fc716fu2pg", // WAGGS
      "faclty_cubkajna07fc716fu2p0", // CLAP
      "faclty_cubk9qva07fc716fu2og", // Earth Tribe
      "faclty_cubk89imd29s7145qmq0", // Scouts Go Solar
      "faclty_cubk7pimd29s7145qmpg", // MOP and Dialogue for Peace
      "faclty_cubk782md29s7145qmog", // Health Allies
      "faclty_cubk7hamd29s7145qmp0", // Life Leaders
      "faclty_cubk72amd29s7145qmo0", // World Scout Initiatives
    ];

    // For Ready for Life venue check
    if (venueId === "faclty_cubk6jamd29s7145qmn0") {
      const missingVenueIds = requiredVenueIds.filter(
        id => !patrol.visitedVenues.includes(id)
      );

      if (missingVenueIds.length > 0) {
        // Get venue names for missing venues
        const venueNames = missingVenueIds.map(id => {
            const venue = venueCords.find(v => v.venueId === id);
          return venue ? venue.venueName : id;
        });

        return NextResponse.json({
          success: false,
          message: "You must visit all other venues before visiting Ready for Life",
          errorType: "INCOMPLETE_VISITS",
          missingVenues: venueNames,
          missingVenuesCount: missingVenueIds.length
        }, { status: 403 });
      }
    }

    if (patrol.visitedVenues.includes(venueId)) {
      return NextResponse.json({
        success: false,
        message: "This patrol has already visited this venue",
        errorType: "DUPLICATE_VISIT"
      }, { status: 409 });
    }

    // Venue and pavilion validations
    // const venueInfo = venueMappings.find(mapping => mapping[venueId])?.[venueId];
    // if (!venueInfo) {
    //   return NextResponse.json({
    //     success: false,
    //     message: "Venue configuration not found",
    //     errorType: "CONFIG_ERROR"
    //   }, { status: 400 });
    // }

    // const pavilionLimit = pavillionLimits.find(limit => limit[venueInfo.pavilion])?.[venueInfo.pavilion];
    // if (!pavilionLimit) {
    //   return NextResponse.json({
    //     success: false,
    //     message: "Pavilion limit configuration not found",
    //     errorType: "CONFIG_ERROR"
    //   }, { status: 400 });
    // }

    // let pavilionRecord = patrol.visitedPavilions.find(p => p.pavilion === venueInfo.pavilion);
    // if (pavilionRecord && pavilionRecord.visitedCount >= pavilionLimit) {
    //   return NextResponse.json({
    //     success: false,
    //     message: `This patrol has reached the maximum visits (${pavilionLimit}) for ${venueInfo.pavilion} pavilion`,
    //     errorType: "LIMIT_REACHED"
    //   }, { status: 400 });
    // }

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
      a => new Date(a.date).setHours(0, 0, 0, 0) === today.getTime()
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
    // if (pavilionRecord) {
    //   pavilionRecord.visitedCount += 1;
    // } else {
    //   patrol.visitedPavilions.push({
    //     pavilion: venueInfo.pavilion,
    //     visitedCount: 1
    //   });
    // }

    patrol.visitedVenues.push(venueId);
    patrol.lastUpdated = new Date();
    await patrol.save();

    // After successful patrol and venue updates, update Google Sheet
    try {
      const spreadsheetId = "1BQUksWGQhGTuDmmvoNA1BMeGH3TED1USc1oo8dUOCH0";
      const credentialsPath = path.join(
        process.cwd(),
        "app/api/updateXLS/credentials.json"
      );

      const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: "v4", auth: client });

      // Create timestamp in IST
      const now = new Date();
      const istTime = new Date(now.getTime() + (0 * 60 * 60 * 1000)); // Add 5:30 hours for IST
      const timestamp = istTime.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium'
      });

      // Prepare new row data with venue first and IST timestamp
      const newRow = [
        venueId,          // First column: Venue ID
        patrolId,         // Second column: Patrol ID
        timestamp,        // Third column: IST Timestamp
      ];

      // Append the new row to the sheet
      await googleSheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:C",
        valueInputOption: "RAW",
        requestBody: {
          values: [newRow],
        },
      });
    } catch (sheetError) {
      console.error("Error updating Google Sheet:", sheetError);
      // Don't return error response here, as the main operation was successful
    }

    return NextResponse.json({
      success: true,
      message: "Visit recorded successfully!",
      // visitCount: pavilionRecord ? pavilionRecord.visitedCount : 1,
      // pavilion: venueInfo.pavilion,
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