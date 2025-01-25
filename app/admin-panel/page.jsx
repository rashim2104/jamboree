"use client";
import { set } from "mongoose";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const [data, setData] = useState([]);
  const [themes, setThemes] = useState([]);
  const [expandedVenueId, setExpandedVenueId] = useState(null);
  const ORDERED_THEMES = [
    "People",
    "Prosperity",
    "Planet",
    "WAGGGS",
    "CLAP",
    "WOSM",
  ];
  const [selectedTheme, setSelectedTheme] = useState("People");

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: usernameInput,
          password: passwordInput,
          source: "admin-panel",
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsAdmin(true);
        sessionStorage.setItem("isAdmin", "true");
        toast.success("Login successful!");
      } else {
        toast.error(
          result.message || "Invalid username or password. Please try again."
        );
      }
    } catch (error) {
      toast.error("Error logging in. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("isAdmin");
    toast.success("Logged out successfully!");
    setUsernameInput("");
    setPasswordInput("");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/getAllVenueDetail");
        const result = await response.json();
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
        setThemes(ORDERED_THEMES);
      } catch (error) {
        toast.error("Error fetching data. Please try again later.");
      }
    }

    if (isAdmin) {
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const isAuth = sessionStorage.getItem("isAdmin") === "true";
        setIsAdmin(isAuth);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const toggleVenueDetails = (venue) => {
    setExpandedVenueId((prevId) =>
      prevId === venue.venueId ? null : venue.venueId
    );
  };
  const filteredVenues = selectedTheme
    ? data.filter((venue) => venue.parentTheme === selectedTheme)
    : data;
  const sortedVenues = filteredVenues.sort((a, b) => a.venueId - b.venueId);
  const sortedVenueWithAttendees = sortedVenues.map((venue) => ({
    ...venue,
    attendees: venue.attendees.sort((a, b) => a.venueId - b.venueId),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-lg rounded-xl p-8 space-y-4 flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-lg rounded-xl p-8 w-96 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Admin Login
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Username
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>
          </div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-medium"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto mb-4 flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden max-w-6xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total SDG</h3>
            <p className="text-2xl font-bold text-purple-600">
              {data
                .filter((venue) => venue.parentTheme === "SDG")
                .reduce((sum, venue) => sum + (venue.totalAttendees || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total WAGGS</h3>
            <p className="text-2xl font-bold text-pink-600">
              {data
                .filter((venue) => venue.parentTheme === "WAGGS")
                .reduce((sum, venue) => sum + (venue.totalAttendees || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total CLAP</h3>
            <p className="text-2xl font-bold text-green-600">
              {data
                .filter((venue) => venue.parentTheme === "CLAP")
                .reduce((sum, venue) => sum + (venue.totalAttendees || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total WOSM</h3>
            <p className="text-2xl font-bold text-blue-600">
              {data
                .filter((venue) => venue.parentTheme === "WOSM")
                .reduce((sum, venue) => sum + (venue.totalAttendees || 0), 0)}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex space-x-6">
            {ORDERED_THEMES.map((theme) => (
              <span
                key={theme}
                className={`cursor-pointer transition-all duration-200 hover:text-blue-200 ${
                  selectedTheme === theme
                    ? "font-bold border-b-2 border-white pb-1"
                    : "opacity-80"
                }`}
                onClick={() => setSelectedTheme(theme)}
              >
                {theme}
              </span>
            ))}
          </div>
        </nav>

        {/* Venues List */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Venues for {selectedTheme}:
          </h2>
          <ul className="space-y-4">
            {sortedVenueWithAttendees
              .filter((venue) => venue.parentTheme === selectedTheme)
              .map((venue) => (
                <li
                  key={venue.venueId}
                  className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <div
                    className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      toggleVenueDetails(venue);
                    }}
                  >
                    <h3 className="font-semibold text-lg text-gray-800">
                      {venue.venueName || "N/A"}
                      <span className="text-sm text-gray-500 ml-2">
                        ID: {venue.venueId || "N/A"}
                      </span>
                    </h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Total: {venue.totalAttendees || "N/A"}
                    </span>
                  </div>
                  {expandedVenueId === venue.venueId && (
                    <div className="border-t border-gray-200 bg-white p-4 space-y-3">
                      <h4 className="font-medium text-gray-700 mb-3">
                        Attendance Details:
                      </h4>
                      <ul className="divide-y divide-gray-100">
                        {venue.attendees && venue.attendees.length > 0 ? (
                          venue.attendees.map((attendee, index) => (
                            <li
                              key={index}
                              className="flex justify-between py-2 text-gray-600"
                            >
                              <span>{attendee.formattedDate}</span>
                              <span className="font-medium">
                                {attendee.count}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 py-2 italic">
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
