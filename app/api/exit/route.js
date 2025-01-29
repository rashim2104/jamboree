import connectMongoDB from "@/util/connectMongoDB";
import Patrol from "@/models/patrol";
import { NextResponse } from "next/server";
import { google } from 'googleapis';
import path from 'path';

const READY_FOR_LIFE_VENUE_ID = "faclty_cubk6jamd29s7145qmn0";

export async function POST(req) {
    const { patrolData } = await req.json();

    let patrolId;
    try {
        const parsedData = JSON.parse(patrolData);
        patrolId = parsedData.ticket_id;
        if (!patrolId) throw new Error("Missing ticket_id");
    } catch (error) {
        return NextResponse.json({ message: "Invalid patrolId format" }, { status: 400 });
    }

    try {
        await connectMongoDB();
        const patrol = await Patrol.findOne({ patrolId });

        if (!patrol) {
            return NextResponse.json({
                success: false,
                message: "Invalid QR code - Patrol not found",
                errorType: "NOT_FOUND"
            }, { status: 404 });
        }

        if (patrol.visitedVenues.includes(READY_FOR_LIFE_VENUE_ID)) {
            return NextResponse.json({
                success: false,
                message: "This patrol has already completed Ready for Life",
                errorType: "DUPLICATE_VISIT"
            }, { status: 409 });
        }

        // Add Ready for Life to visited venues
        patrol.visitedVenues.push(READY_FOR_LIFE_VENUE_ID);
        patrol.lastUpdated = new Date();
        await patrol.save();

        // Google Sheets Integration
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
            const istTime = new Date(now.getTime() + (0 * 60 * 60 * 1000));
            const timestamp = istTime.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'medium'
            });

            // Prepare new row data
            const newRow = [
                READY_FOR_LIFE_VENUE_ID,  // Venue ID
                patrolId,                 // Patrol ID
                timestamp,                // IST Timestamp
            ];

            // Append the new row to the sheet
            await googleSheets.spreadsheets.values.append({
                spreadsheetId,
                range: "Sheet1!A:D",
                valueInputOption: "RAW",
                requestBody: {
                    values: [newRow],
                },
            });

            return NextResponse.json({
                success: true,
                message: "Ready for Life visit recorded successfully!",
                timestamp
            }, { status: 200 });

        } catch (sheetError) {
            console.error("Google Sheets Error:", sheetError);
            // Still return success if MongoDB update worked but sheets failed
            return NextResponse.json({
                success: true,
                message: "Visit recorded (sheet update failed)",
                timestamp: new Date().toISOString()
            }, { status: 200 });
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: "Server error while processing QR code",
            errorType: "SERVER_ERROR"
        }, { status: 500 });
    }
}