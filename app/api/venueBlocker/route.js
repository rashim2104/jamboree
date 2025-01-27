import { NextResponse } from "next/server";
import Venue from "@/models/venue";
import connectMongoDB from "@/util/connectMongoDB";

export async function POST(request) {
    try {
        await connectMongoDB();
        const { venueId } = await request.json();

        const venue = await Venue.findOne({ venueId: venueId });
        if (!venue) {
            return NextResponse.json({
                success: false,
                message: "Venue not found",
                errorType: "NOT_FOUND"
            }, { status: 404 });
        }

        if (!venue.isAvailable) {
            return NextResponse.json({
                success: false,
                message: "Venue is already blocked",
                errorType: "VENUE_BLOCKED"
            }, { status: 403 });
        }

        venue.isAvailable = false;
        venue.lastUpdated = new Date();

        await venue.save();
        return NextResponse.json({ success: true, message: "Venue blocked successfully" });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            errorType: "SERVER_ERROR"
        }, { status: 500 });
    }
}
