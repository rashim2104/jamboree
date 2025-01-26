"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const ORDERED_THEMES = [
  "People",
  "Prosperity",
  "Planet",
  "Peace and Partnership",
  "WAGGGS",
  "CLAP",
  "WOSM",
];

function StatsCard({ title, total, available }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
      <h3 className="text-xs font-medium text-gray-500">{title}</h3>
      <div className="mt-1 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-gray-900">{available}</span>
          <span className="text-xs text-gray-500">available</span>
        </div>
        <div className="text-xs text-gray-400">of {total}</div>
      </div>
    </div>
  );
}

function Stats({ venueData }) {
  const getStats = (theme) => {
    let prefix;
    switch (theme) {
      case "CLAP":
        prefix = "C";
        break;
      case "WAGGGS":
        prefix = "WA";
        break;
      case "WOSM":
        prefix = "WO";
        break;
      case "People":
      case "Prosperity":
      case "Planet":
      case "Peace and Partnership":
        prefix = "S";
        break;
      default:
        prefix = "";
    }

    const venues = venueData.filter((v) => {
      if (theme === "People")
        return v.venueId.startsWith("S") && parseInt(v.venueId.slice(1)) <= 5;
      if (theme === "Prosperity")
        return (
          v.venueId.startsWith("S") &&
          parseInt(v.venueId.slice(1)) > 5 &&
          parseInt(v.venueId.slice(1)) <= 10
        );
      if (theme === "Planet")
        return (
          v.venueId.startsWith("S") &&
          parseInt(v.venueId.slice(1)) > 10 &&
          parseInt(v.venueId.slice(1)) <= 15
        );
      if (theme === "Peace and Partnership")
        return v.venueId.startsWith("S") && parseInt(v.venueId.slice(1)) > 15;
      return v.venueId.startsWith(prefix);
    });

    return {
      total: venues.length,
      available: venues.filter((v) => v.isAvailable).length,
    };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
      {ORDERED_THEMES.map((theme) => (
        <StatsCard key={theme} title={`${theme} Venues`} {...getStats(theme)} />
      ))}
    </div>
  );
}

function SingleBlock({ venue, xVal, yVal, color }) {
  return (
    <div
      className={`absolute w-[3.9rem] h-[3.9rem] bg-${color}-100 border-2 border-${color}-500 
      rounded-lg flex items-center justify-center shadow-md 
      transition-all duration-300 hover:scale-105 hover:shadow-lg 
      cursor-pointer group`}
      style={{
        top: `${yVal}px`,
        left: `${xVal}px`,
      }}
    >
      <h1
        className="text-xs font-medium text-center w-full px-1 
        leading-tight group-hover:font-bold transition-all"
      >
        {venue}
      </h1>
    </div>
  );
}
function Legend() {
  return (
    <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-md flex gap-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
        <span className="text-sm font-medium">Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
        <span className="text-sm font-medium">Occupied</span>
      </div>
    </div>
  );
}
export default function OccupancyChart() {
  const [venueData, setVenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const venuePositions = [
    // Clap Section (Left Side)
    { venueId: "C1", xVal: 64, yVal: 62 },
    { venueId: "C2", xVal: 141, yVal: 62 },
    { venueId: "C3", xVal: 218, yVal: 62 },
    { venueId: "C4", xVal: 295, yVal: 62 },
    { venueId: "C5", xVal: 108, yVal: 160 },
    { venueId: "C6", xVal: 185, yVal: 160 },
    { venueId: "C7", xVal: 262, yVal: 160 },
    // SDG Section (Top Right Quadrant)
    { venueId: "S1", xVal: 260, yVal: 683 },
    { venueId: "S2", xVal: 166, yVal: 683 },
    { venueId: "S3", xVal: 72, yVal: 683 },
    { venueId: "S4", xVal: 72, yVal: 585 },
    { venueId: "S5", xVal: 166, yVal: 585 },
    { venueId: "S6", xVal: 485, yVal: 449 },
    { venueId: "S7", xVal: 607, yVal: 449 },
    { venueId: "S8", xVal: 607, yVal: 541 },
    { venueId: "S9", xVal: 607, yVal: 633 },
    { venueId: "S10", xVal: 485, yVal: 633 },
    { venueId: "S11", xVal: 835, yVal: 449 },
    { venueId: "S12", xVal: 709, yVal: 449 },
    { venueId: "S13", xVal: 709, yVal: 541 },
    { venueId: "S14", xVal: 709, yVal: 633 },
    { venueId: "S15", xVal: 835, yVal: 633 },
    { venueId: "S16", xVal: 607, yVal: 325 },
    { venueId: "S17", xVal: 709, yVal: 325 },
    // WAGGGS Section (Middle Left)
    { venueId: "WA1", xVal: 108, yVal: 325 },
    { venueId: "WA2", xVal: 262, yVal: 325 },
    { venueId: "WA3", xVal: 108, yVal: 449 },
    { venueId: "WA4", xVal: 262, yVal: 449 },
    // WOSM Section (Bottom Right Quadrant)
    { venueId: "WO1", xVal: 492, yVal: 62 },
    { venueId: "WO2", xVal: 599, yVal: 62 },
    { venueId: "WO3", xVal: 706, yVal: 62 },
    { venueId: "WO4", xVal: 813, yVal: 62 },
    { venueId: "WO5", xVal: 920, yVal: 62 },
    { venueId: "WO6", xVal: 1027, yVal: 62 },
    { venueId: "WO7", xVal: 1134, yVal: 62 },
    { venueId: "WO8", xVal: 1134, yVal: 160 },
    { venueId: "WO9", xVal: 1134, yVal: 252 },
    { venueId: "WO10", xVal: 1134, yVal: 344 },
    { venueId: "WO11", xVal: 1134, yVal: 436 },
    { venueId: "WO12", xVal: 1134, yVal: 528 },
  ];
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("/api/getAllVenueDetail");
        if (!response.ok) {
          toast.error("Failed to fetch venue details.");
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        const combinedData = result.map((venue) => {
          const position = venuePositions.find(
            (pos) => pos.venueId === venue.venueId
          );
          return {
            ...venue,
            xVal: position?.xVal || 0,
            yVal: position?.yVal || 0,
          };
        });
        setVenueData(combinedData);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching venue details.");
        console.error("Error fetching venues:", error);
      }
    };
    // Initial fetch
    fetchVenues();
    // Set up polling every 5 seconds
    const intervalId = setInterval(fetchVenues, 5000);
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  const getVenueColor = (venue) => {
    return venue.isAvailable ? "green" : "red";
  };
  return (
    <div className="p-4 min-h-screen flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Venue Occupancy Chart
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Auto-refreshes every 5 seconds
        </p>
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            <p className="text-gray-600">Loading venue data...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto">
            {/* Mobile-only Stats */}
            <div className="block md:hidden mb-4">
              <Stats venueData={venueData} />
            </div>
            <div className="relative bg-gray-200 rounded-lg overflow-auto">
              <div className="w-[1280px] min-h-[800px] relative">
                {/* ... venue blocks and legend ... */}
                {venueData.map((venue) => (
                  <SingleBlock
                    key={venue.venueId}
                    venue={venue.venueName}
                    xVal={venue.xVal}
                    yVal={venue.yVal}
                    color={getVenueColor(venue)}
                  />
                ))}
                <Legend />
              </div>
            </div>
          </div>
          {/* Desktop-only Stats */}
          <div className="hidden md:block w-80 shrink-0">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Venue Statistics
              </h3>
              <Stats venueData={venueData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
