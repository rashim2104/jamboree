import connectMongoDB from "@/util/connectMongoDB";
import Patrol from "@/models/patrol";
import { NextResponse } from "next/server";

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

        return NextResponse.json({
            success: true,
            message: "Ready for Life visit recorded successfully!"
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