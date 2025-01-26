import { NextResponse } from "next/server";
import Venue from "@/models/venue";
import connectMongoDB from "@/util/connectMongoDB";

export async function POST(request) {
    try {
        await connectMongoDB();
        const { venueId, participants } = await request.json();

        if (!venueId || !participants) {
            return NextResponse.json({
                success: false,
                message: "Venue ID and participants are required",
                errorType: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        const venue = await Venue.findOne({ venueId: venueId });
        if (!venue) {
            return NextResponse.json({
                success: false,
                message: "Venue not found",
                errorType: "NOT_FOUND"
            }, { status: 404 });
        }

        if (participants > venue.capacity) {
            return NextResponse.json({
                success: false,
                message: "Participants exceed the maximum capacity",
                errorType: "CAPACITY_REACHED"
            }, { status: 403 });
        }

        if (!venue.isAvailable) {
            return NextResponse.json({
                success: false,
                message: "Venue is already blocked",
                errorType: "VENUE_BLOCKED"
            }, { status: 403 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAttendance = venue.attendees.find(
            (a) => new Date(a.date).getTime() === today.getTime()
        );

        if (todayAttendance) {
            todayAttendance.count += participants;
        } else {
            venue.attendees.push({ date: today, count: participants });
        }

        venue.isAvailable = false;
        venue.totalAttendees = venue.attendees.reduce((sum, a) => sum + a.count, 0);
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
