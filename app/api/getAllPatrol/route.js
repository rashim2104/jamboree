import { NextResponse } from "next/server";
import connectMongoDB from "@/util/connectMongoDB";
import Patrol from "@/models/patrol";

export async function GET(request) {
  try {
    await connectMongoDB();
    const patrols = await Patrol.find({});

    if (!patrols || patrols.length === 0) {
      return NextResponse.json(
        { message: "No patrol records found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Patrols retrieved successfully", patrols },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching patrols:", error);
    return NextResponse.json(
      { message: "Failed to fetch patrol records", error: error.message },
      { status: 500 }
    );
  }
}
