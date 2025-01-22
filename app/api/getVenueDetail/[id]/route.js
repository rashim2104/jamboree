import { NextResponse } from "next/server";
import connectMongoDB from "@/util/connectMongoDB";
import Venue from "@/models/venue";

export async function GET(request, { params }) {
    try {
        await connectMongoDB();
        const { id } = await params;  // Access params after awaiting

        if (!id) {
            return NextResponse.json(
                { error: "ID parameter is missing" },
                { status: 400 }
            );
        }

        const venue = await Venue.findOne({ venueId: id });

        if (!venue) {
            return NextResponse.json(
                { error: `Venue with id ${id} not found` },
                { status: 404 }
            );
        }

        return NextResponse.json(venue);
    } catch (error) {
        console.error("Error fetching venue:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
