import { NextResponse } from "next/server";
import connectMongoDB from "@/util/connectMongoDB";
import Venue from "@/models/venue";

export async function GET(request, { params }) {
    try {
        await connectMongoDB();
        const { id } = params;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: "Venue ID is required",
                errorType: "VALIDATION_ERROR"
            }, { status: 400 });
        }

        const venue = await Venue.findOne({ venueId: id });

        if (!venue) {
            return NextResponse.json({
                success: false,
                message: `Venue with id ${id} not found`,
                errorType: "NOT_FOUND"
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: venue });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
            errorType: "SERVER_ERROR"
        }, { status: 500 });
    }
}
