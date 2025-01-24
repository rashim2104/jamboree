"use client";
import React, { useState, useEffect } from "react";

async function getVenueDetails(id) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/getVenueDetail/" + id,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch venue: " + response.status);
    }
    return response.json();
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export default function VenuePage({ params }) {
  const [venue, setVenue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [participants, setParticipants] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Add error message state
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    const fetchData = async () => {
      const data = await getVenueDetails(id);
      setVenue(data);
    };
    fetchData();
    // toast.success("Data rcvd");
  }, [id]);

  if (!venue) return <div>Loading...</div>;

  const handleBlock = async () => {
    const response = await fetch("/api/venueBlocker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueId: id,
        participants: parseInt(participants),
      }),
    });
    if (response.status === 201) {
      console.log("Participants exceed the maximum capacity");
      setErrorMessage("Error: Participants exceed the maximum capacity!"); // Set error message
      return; // Prevent further processing if the condition is met
    }
    if (response.ok) {
      const updatedVenue = await getVenueDetails(id);
      setVenue(updatedVenue);
      setShowModal(false);
      setParticipants("");
      setErrorMessage(""); // Clear error message on success
    }
  };

  const handleUnblock = async () => {
    const response = await fetch("/api/venueUnblocker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueId: id }),
    });
    if (response.ok) {
      const updatedVenue = await getVenueDetails(id);
      setVenue(updatedVenue);
    }
  };

  const lastUpdated = new Date(venue.lastUpdated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Venue - {venue.venueName}
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
      <div className="mt-6 flex justify-center">
        {venue.isAvailable ? (
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Block Venue
          </button>
        ) : (
          <button
            onClick={handleUnblock}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Unblock Venue
          </button>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Enter Number of Participants
            </h3>
            <input
              type="number"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="border p-2 mb-4 w-full"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
