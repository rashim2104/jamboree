"use client";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/footer";
import { useEffect, useState } from "react";

import { useEffect, useState } from "react";
export default function Home() {
  // State for authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Static credentials
  const USERNAME = "admin@123";
  const PASSWORD = "Welcome@123";

  // State for your main content
  const [data, setData] = useState([]);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [expandedVenueId, setExpandedVenueId] = useState(null);

  // Authentication handler
  const handleLogin = () => {
    if (usernameInput === USERNAME && passwordInput === PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid username or password. Please try again.");
    }
  };

  // Fetch data from the backend
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/getAllVenueDetail"); // Replace with your backend API endpoint
        const result = await response.json();

        console.log("Raw Data from Backend:", result); // Debugging

        // Format the data with proper date parsing
        const formattedData = result.map((venue) => ({
          ...venue,
          attendees: venue.attendees.map((attendee) => ({
            ...attendee,
            formattedDate: attendee.date
              ? new Date(attendee.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Invalid Date",
          })),
        }));

        setData(formattedData);

        // Extract unique parent themes
        const uniqueThemes = Array.from(
          new Set(result.map((venue) => venue.parentTheme))
        );
        setThemes(uniqueThemes);

        console.log("Formatted Data:", formattedData); // Debugging
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (isAuthenticated) {
      // Initial data fetch
      fetchData();

      // Set up interval to fetch data every 5 seconds
      const interval = setInterval(fetchData, 5000);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]); // Only run the fetch logic if authenticated

  // Toggle venue details
  const toggleVenueDetails = (venue) => {
    setExpandedVenueId((prevId) =>
      prevId === venue.venueId ? null : venue.venueId
    );
  };
  // Filter venues by selected parent theme
  const filteredVenues = selectedTheme
    ? data.filter((venue) => venue.parentTheme === selectedTheme)
    : data;
  // Sort the venues by venueId
  const sortedVenues = filteredVenues.sort((a, b) => a.venueId - b.venueId);
  // Sort child venues (attendees) by venueId
  const sortedVenueWithAttendees = sortedVenues.map((venue) => ({
    ...venue,
    attendees: venue.attendees.sort((a, b) => a.venueId - b.venueId), // Sorting attendees by venueId
  }));

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow rounded-lg p-6 w-96">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded-lg"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

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
            {sortedVenueWithAttendees.map((venue) => (
              <li
                key={venue.venueId}
                className="bg-gray-200 p-3 rounded-lg shadow"
              >
                <div
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-300 p-2"
                  onClick={() => toggleVenueDetails(venue)}
                >
                  <h2 className="font-bold text-lg">
                    {venue.venueName || "N/A"}
                    <span className="text-sm text-gray-600 ml-2">
                      ID: {venue.venueId || "N/A"}
                    </span>
                  </h2>
                  <span className="text-gray-600">
                    Total: {venue.totalAttendees || "N/A"}
                  </span>
                </div>
                {expandedVenueId === venue.venueId && (
                  <div className="mt-2 bg-gray-50 p-4 rounded-lg shadow">
                    <h3 className="text-md font-semibold mb-2">
                      Attendance Details:
                    </h3>
                    <ul className="space-y-2">
                      {venue.attendees && venue.attendees.length > 0 ? (
                        venue.attendees.map((attendee, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{attendee.formattedDate}</span>
                            <span>{attendee.count}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">
                          No attendance data available
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
