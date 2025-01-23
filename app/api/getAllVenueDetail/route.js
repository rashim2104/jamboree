import { NextResponse } from "next/server";
import connectMongoDB from "@/util/connectMongoDB";
import Venue from "@/models/venue";

export async function GET(request) {
  try {
    await connectMongoDB();

    const venues = await Venue.find();

    if (!venues || venues.length === 0) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    return NextResponse.json(venues);
  } catch (error) {
    console.error("Error fetching venue:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
