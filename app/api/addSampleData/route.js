import { connectMongoDB } from "@/util/connectMongoDB";
import Venue from "@/models/venue";

export async function POST(req) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Sample venue data
    const sampleVenue = {
      venueName: "Planet",
      venueId: "S1",
      parentTheme: "SDG",
      isAvailable: false,
      capacity: 50,
      attendees: [
        {
          date: new Date('2025-01-01'),
          count: 0
        }
      ],
      totalAttendees: 0,
    };

    // Check if venue already exists
    const existingVenue = await Venue.findOne({ venueId: sampleVenue.venueId });
    if (existingVenue) {
      return new Response(
        JSON.stringify({ error: "Venue with this ID already exists" }),
        { status: 409 }
      );
    }

    // Create new venue
    const newVenue = await Venue.create(sampleVenue);

    return new Response(JSON.stringify(newVenue), { status: 201 });
  } catch (error) {
    console.error("Error creating venue:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create venue" }),
      { status: 500 }
    );
  }
}