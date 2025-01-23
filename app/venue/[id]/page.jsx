import { notFound } from "next/navigation";

async function getVenueDetails(id) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/getVenueDetail/${id}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch venue: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export default async function VenuePage({ params }) {
  const { id } = await params;

  const venue = await getVenueDetails(id);

  if (!venue) {
    notFound();
  }

  // Format the last updated date
  const lastUpdated = new Date(venue.lastUpdated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {venue.venueName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Venue Details
          </h2>
          <div className="space-y-4">
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Venue ID</span>
              <span className="font-medium text-gray-800">{venue.venueId}</span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Theme</span>
              <span className="font-medium text-gray-800">
                {venue.parentTheme}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Capacity</span>
              <span className="font-medium text-gray-800">
                {venue.capacity}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  venue.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {venue.isAvailable ? "Available" : "Not Available"}
              </span>
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Attendance Information
          </h2>
          <div className="space-y-4">
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Total Attendees</span>
              <span className="font-medium text-gray-800">
                {venue.totalAttendees}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium text-gray-800">{lastUpdated}</span>
            </p>
          </div>
        </div>

        {venue.attendees && venue.attendees.length > 0 && (
          <div className="col-span-full border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Scheduled Attendance
            </h2>
            <div className="space-y-3">
              {venue.attendees.map((attendance, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-gray-600">
                    {new Date(attendance.date).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-gray-800">
                    Count: {attendance.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
