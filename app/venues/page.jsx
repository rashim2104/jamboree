"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import { toast } from "sonner"; // Import toast from sonner

export default function Home() {
  const [data, setData] = useState([]);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("People"); // Set default theme to "People"
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


        // Format the data
        const formattedData = result.map((venue) => ({
          ...venue,
        }));

        setData(formattedData);

        // Define the order of themes
        const themeOrder = [
          "People",
          "Prosperity",
          "Planet",
          "Peace and Partnership",
          "WAGGGS",
          "CLAP",
          "WOSM",
        ];
        
        // Extract unique themes and sort them according to themeOrder
        const uniqueThemes = Array.from(
          new Set(result.map((venue) => venue.parentTheme))
        ).sort((a, b) => {
          return themeOrder.indexOf(a) - themeOrder.indexOf(b);
        });
        
        setThemes(uniqueThemes);

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

  // Add device detection utility
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
  };

  // Modified handleVenueClick with device-specific routing
  const handleVenueClick = (venueId) => {
    try {
      const route = isMobileDevice() ? `/v/${venueId}` : `/venue/${venueId}`;
      router.push(route);
      toast.success(`Redirecting to ${isMobileDevice() ? 'mobile' : 'desktop'} view...`);
    } catch (error) {
      toast.error("Error redirecting to venue details.");
      console.error("Error redirecting to venue details:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow rounded-lg p-4">
        <nav className="bg-blue-600 text-white p-3 rounded-t-lg">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {themes.map((theme) => (
              <span
                key={theme}
                className={`cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm md:text-base transition-colors duration-200 ${
                  selectedTheme === theme 
                  ? "font-bold bg-blue-700 rounded-full" 
                  : "hover:bg-blue-500 rounded-full"
                }`}
                onClick={() => setSelectedTheme(theme)}
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
