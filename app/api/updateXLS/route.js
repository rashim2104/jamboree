import { google } from "googleapis";
import { NextResponse } from "next/server";
import connectMongoDB from "@/util/connectMongoDB";
import Patrol from "@/models/patrol";
import path from "path";

// export async function GET(request) {
//   try {
//     const spreadsheetId = "1BQUksWGQhGTuDmmvoNA1BMeGH3TED1USc1oo8dUOCH0";
//     const credentialsPath = path.join(
//       process.cwd(),
//       "app/api/getAllPatrol/credentials.json"
//     );

//     const auth = new google.auth.GoogleAuth({
//       keyFile: credentialsPath,
//       scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
//     });

//     const client = await auth.getClient();
//     const googleSheets = google.sheets({ version: "v4", auth: client });

//     const metadata = await googleSheets.spreadsheets.get({
//       auth,
//       spreadsheetId,
//     });
//     const getRow = await googleSheets.spreadsheets.values.get({
//       auth,
//       spreadsheetId,
//       range: "Sheet1!A1:Z",
//     });

//     return NextResponse.json(
//       { message: "Spreadsheet metadata retrieved successfully", getRow },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error accessing Google Sheets:", error);
//     return NextResponse.json(
//       { message: "Failed to access Google Sheets", error: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function PUT(request) {
  try {
    await connectMongoDB();
    const patrols = await Patrol.find({});

    const spreadsheetId = "1BQUksWGQhGTuDmmvoNA1BMeGH3TED1USc1oo8dUOCH0";
    const credentialsPath = path.join(
      process.cwd(),
      "app/api/updateXLS/credentials.json"  // Changed from "app/api/getAllPatrol/updateXLS.json"
    );

    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });

    // First, set up the headers
    const headers = [
      "Patrol Id",
      "People",
      "Prosperity",
      "Planet",
      "WAGGGS",
      "CLAP",
      "S2",
      "S3",
      "S6",
      "S7",
      "S11",
      "S12",
      "WA1",
      "WA2",
      "WA3",
      "WA4",
      "C1",
      "C2",
      "C3",
      "C4",
      "C5",
      "C6",
      "C7",
      "WO1",
      "WO2",
      "WO3",
      "WO4",
      "WO5",
      "WO6",
      "WO7",
      "WO8",
      "WO9",
      "WO10",
      "WO11",
      "WO12",
    ];

    // Update headers first
    await googleSheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1:AI1",
      valueInputOption: "RAW",
      requestBody: {
        values: [headers],
      },
    });

    for (const patrol of patrols) {
      // Create an array filled with empty strings matching headers length
      const updateData = new Array(headers.length).fill("");
      updateData[0] = patrol.patrolId;

      // Map pavilions
      patrol.visitedPavilions.forEach((visit) => {
        const pavilionIndex = headers.indexOf(visit.pavilion);
        if (pavilionIndex !== -1) {
          updateData[pavilionIndex] = "✓";
        }
      });

      // Map all venue types (S, WA, C, WO)
      patrol.visitedVenues.forEach((venue) => {
        const venueIndex = headers.indexOf(venue);
        if (venueIndex !== -1) {
          updateData[venueIndex] = "✓";
        }
      });

      // Find the row for this patrol or create a new one
      const searchResult = await googleSheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!A:A",
      });

      const rows = searchResult.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === patrol.patrolId);

      const targetRow = rowIndex === -1 ? rows.length + 1 : rowIndex + 1;

      // Update the sheet
      await googleSheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A${targetRow}:AI${targetRow}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [updateData],
        },
      });
    }

    return NextResponse.json(
      { message: "Google Sheet updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating Google Sheets:", error);
    return NextResponse.json(
      { message: "Failed to update Google Sheets", error: error.message },
      { status: 500 }
    );
  }
}
