import { google } from "googleapis";
import Patrol from "@/models/patrol";
import connectMongoDB from "@/util/connectMongoDB";
import { NextResponse } from "next/server";
import path from "path";
import fs from 'fs/promises';

export async function POST(req) {
  const patrolData = await req.json();

  let patrolId;
  try {
    const parsedData = JSON.parse(patrolData.patrolId);
    patrolId = parsedData.ticket_id;

    if (!patrolId) {
      throw new Error("Missing ticket_id in parsed data");
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid patrolId format" },
      { status: 400 }
    );
  }

  try {
    // Read venueCords.json file
    const venueCords = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), 'public/image/data/venueCords.json'),
        'utf8'
      )
    );

    // Find Be Prepared venue
    const bePreparedVenue = venueCords.find(venue => venue.venueName === "Be Prepared");
    if (!bePreparedVenue) {
      throw new Error("Be Prepared venue not found");
    }

    // Parallel database connection and patrol check
    const [mongoConnection, existingPatrol] = await Promise.all([
      connectMongoDB(),
      Patrol.findOne({ patrolId })
    ]);

    if (existingPatrol) {
      return NextResponse.json(
        { message: "Patrol already exists" },
        { status: 409 }
      );
    }

    const newPatrol = new Patrol({
      patrolId,
      visitedVenues: [bePreparedVenue.venueId],
      visitedPavilions: [],
    });

    // Initialize Google Auth in parallel with saving patrol
    const [savedPatrol, auth] = await Promise.all([
      newPatrol.save(),
      new google.auth.GoogleAuth({
        keyFile: path.join(process.cwd(), "app/api/updateXLS/credentials.json"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
      }).getClient()
    ]);

    // Update spreadsheet asynchronously without waiting
    updateSpreadsheet(auth, patrolId).catch(error =>
      console.error("Sheet update error:", error)
    );

    return NextResponse.json(
      {
        message: "Patrol added successfully",
        patrol: savedPatrol
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Separate function for spreadsheet update
async function updateSpreadsheet(auth, patrolId) {
  const spreadsheetId = "1BQUksWGQhGTuDmmvoNA1BMeGH3TED1USc1oo8dUOCH0";

  const googleSheets = google.sheets({ version: "v4", auth });

  const istTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  await googleSheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A:C",
    valueInputOption: "RAW",
    requestBody: {
      values: [["Be Prepared", patrolId, istTime]]
    }
  });
}