// app/api/getVenueDetail/route.js
import connectMongoDB from "@/util/connectMongoDB";
import Venue from "@/models/venue"; // Make sure this points to the updated model

export async function GET(req) {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }

  // Get 'id' from query parameter
  const url = new URL(req.url);
  const id = url.searchParams.get("id"); // Use URLSearchParams to get query parameters
  console.log(`Venue ID: ${id}`);
  console.log(typeof id);

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing 'id' in the URL" }), {
      status: 400,
    });
  }

  try {
    // Query the database for documents in the `venue` collection where `venueId` matches 'id'
    const data = await Venue.find({ venueId: id });
    console.log(data);

    if (!data.length) {
      return new Response(
        JSON.stringify({ error: "No venue found with the given ID" }),
        { status: 404 }
      );
    }

    // Returning the found data
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
