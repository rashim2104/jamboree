import connectMongoDB from "@/util/connectMongoDB";
import Venue from "@/models/venue"; // Make sure this points to the updated model

export async function GET(req) {
  // Only allow GET method, return 405 for others
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
    });
  }

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

  // Get 'venueId' from query parameter
  const url = new URL(req.url);
  const venueId = url.searchParams.get("venueId"); // Get 'venueId' from URL

  console.log(`Venue ID: ${venueId}`);

  if (!venueId) {
    return new Response(
      JSON.stringify({ error: "Missing 'venueId' in the URL" }),
      {
        status: 400,
      }
    );
  }

  try {
    // Query the database for the venue with the specified venueId
    const data = await Venue.findOne({ venueId: venueId }); // Filter by venueId

    if (!data) {
      return new Response(
        JSON.stringify({ error: `Venue with id ${venueId} not found` }),
        {
          status: 404,
        }
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
