import Patrol from "@/models/patrol";
import connectMongoDB from "@/util/connectMongoDB";
import { NextResponse } from "next/server";

// Controller function to add a new patrol
export async function POST(req) {
  await connectMongoDB();
  const { patrolId } = await req.json();

  // Check if patrolId is provided
  if (!patrolId) {
    return NextResponse.json(
      { message: "patrolId is required" },
      { status: 400 }
    );
  }

  try {
    // Check if a patrol with the same patrolId already exists
    const existingPatrol = await Patrol.findOne({ patrolId });
    if (existingPatrol) {
      return NextResponse.json(
        { message: "Patrol already exists" },
        { status: 409 }
      );
    }

    // Create a new patrol document
    const newPatrol = new Patrol({
      patrolId,
      visitedVenues: [], // Default empty array
      visitedPavilions: [], // Default empty array
    });

    // Save the new patrol to the database
    await newPatrol.save();

    // Respond with success
    return NextResponse.json(
      { message: "Patrol added successfully", patrol: newPatrol },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
