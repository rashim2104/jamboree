"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import { toast } from "sonner"; // Import toast from sonner

export default function Home() {
  const [data, setData] = useState([]);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const router = useRouter(); // Initialize useRouter

  // Fetch data from the backend
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/getAllVenueDetail"); // Replace with your backend API endpoint
        if (!response.ok) {
          toast.error("Failed to fetch venue details.");
          return;
        }
        const result = await response.json();

        console.log("Raw Data from Backend:", result); // Debugging

        // Format the data
        const formattedData = result.map((venue) => ({
          ...venue,
        }));

        setData(formattedData);

        // Extract unique parent themes
        const uniqueThemes = Array.from(
          new Set(result.map((venue) => venue.parentTheme))
        );
        setThemes(uniqueThemes);

        console.log("Formatted Data:", formattedData); // Debugging
        toast.success("Venue details loaded successfully!");
      } catch (error) {
        toast.error("Error fetching data.");
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  // Filter venues by selected parent theme
  const filteredVenues = selectedTheme
    ? data.filter((venue) => venue.parentTheme === selectedTheme)
    : data;

  // Handle venue click to redirect to /venue/[id]
  const handleVenueClick = (venueId) => {
    try {
      router.push(`/venue/${venueId}`); // Use router.push for client-side navigation
      toast.success("Redirecting to venue details...");
    } catch (error) {
      toast.error("Error redirecting to venue details.");
      console.error("Error redirecting to venue details:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow rounded-lg p-4">
        <nav className="flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-t-lg">
          <div className="flex space-x-4">
            {themes.map((theme) => (
              <span
                key={theme}
                className={`cursor-pointer hover:underline ${
                  selectedTheme === theme ? "font-bold" : ""
                }`}
                onClick={() => setSelectedTheme(theme)} // Set the selected theme
              >
                {theme}
              </span>
            ))}
          </div>
        </nav>

        <div className="p-4">
          {selectedTheme ? (
            <h2 className="text-lg font-bold mb-4">
              Venues for {selectedTheme}:
            </h2>
          ) : (
            <h2 className="text-lg font-bold mb-4">
              Select a parent theme to view venues:
            </h2>
          )}

          <ul className="space-y-4">
            {filteredVenues.map((venue) => (
              <li
                key={venue.venueId}
                className="bg-gray-200 p-3 rounded-lg shadow cursor-pointer" // Added cursor-pointer for interactivity
                onClick={() => handleVenueClick(venue.venueId)} // Call handleVenueClick on venue click
              >
                <div className="flex justify-between items-center p-2">
                  <h2 className="font-bold text-lg">
                    {venue.venueName || "N/A"}
                    <span className="text-sm text-gray-600 ml-2">
                      ID: {venue.venueId || "N/A"}
                    </span>
                  </h2>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
