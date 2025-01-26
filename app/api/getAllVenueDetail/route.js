import { NextResponse } from "next/server";
import connectMongoDB from "@/util/connectMongoDB";
import Venue from "@/models/venue";

export async function GET(request) {
    try {
        await connectMongoDB();
        const venues = await Venue.find();

        if (!venues || venues.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No venues found",
                errorType: "NOT_FOUND"
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: venues });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            errorType: "SERVER_ERROR"
        }, { status: 500 });
    }
}