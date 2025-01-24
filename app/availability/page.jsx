"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const getStats = (prefix) => {
    const venues = venueData.filter((v) => v.venueId.startsWith(prefix));
    return {
      total: venues.length,
      available: venues.filter((v) => v.isAvailable).length,
    };
  };

  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <StatsCard title="CLAP Venues" {...getStats("C")} />
      <StatsCard title="SDG Venues" {...getStats("S")} />
      <StatsCard title="WAGGGS Venues" {...getStats("WA")} />
      <StatsCard title="WOSM Venues" {...getStats("WO")} />
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
    { venueId: "C1", xVal: 100, yVal: 50 },
    { venueId: "C2", xVal: 250, yVal: 50 },
    { venueId: "C3", xVal: 100, yVal: 150 },
    { venueId: "C4", xVal: 250, yVal: 150 },
    { venueId: "C5", xVal: 100, yVal: 250 },
    { venueId: "C6", xVal: 250, yVal: 250 },
    { venueId: "C7", xVal: 175, yVal: 350 },

    // SDG Section (Top Right Quadrant)
    { venueId: "S1", xVal: 900, yVal: 50 },
    { venueId: "S2", xVal: 1000, yVal: 50 },
    { venueId: "S3", xVal: 1100, yVal: 50 },
    { venueId: "S4", xVal: 1200, yVal: 50 },
    { venueId: "S5", xVal: 1300, yVal: 50 },
    { venueId: "S6", xVal: 900, yVal: 150 },
    { venueId: "S7", xVal: 1000, yVal: 150 },
    { venueId: "S8", xVal: 1100, yVal: 150 },
    { venueId: "S9", xVal: 1200, yVal: 150 },
    { venueId: "S10", xVal: 1300, yVal: 150 },
    { venueId: "S11", xVal: 900, yVal: 250 },
    { venueId: "S12", xVal: 1000, yVal: 250 },
    { venueId: "S13", xVal: 1100, yVal: 250 },
    { venueId: "S14", xVal: 1200, yVal: 250 },
    { venueId: "S15", xVal: 1300, yVal: 250 },
    { venueId: "S16", xVal: 1000, yVal: 350 },
    { venueId: "S17", xVal: 1200, yVal: 350 },

    // WAGGGS Section (Middle Left)
    { venueId: "WA1", xVal: 100, yVal: 530 },
    { venueId: "WA2", xVal: 250, yVal: 530 },
    { venueId: "WA3", xVal: 100, yVal: 625 },
    { venueId: "WA4", xVal: 250, yVal: 625 },

    // WOSM Section (Bottom Right Quadrant)
    { venueId: "WO1", xVal: 900, yVal: 530 },
    { venueId: "WO2", xVal: 1000, yVal: 530 },
    { venueId: "WO3", xVal: 1100, yVal: 530 },
    { venueId: "WO4", xVal: 1200, yVal: 530 },
    { venueId: "WO5", xVal: 1300, yVal: 530 },
    { venueId: "WO6", xVal: 1400, yVal: 530 },
    { venueId: "WO7", xVal: 900, yVal: 625 },
    { venueId: "WO8", xVal: 1000, yVal: 625 },
    { venueId: "WO9", xVal: 1100, yVal: 625 },
    { venueId: "WO10", xVal: 1200, yVal: 625 },
    { venueId: "WO11", xVal: 1300, yVal: 625 },
    { venueId: "WO12", xVal: 1400, yVal: 625 },
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

  return (
    <div className="p-4 h-screen flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Venue Occupancy Chart
      </h2>
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            <p className="text-gray-600">Loading venue data...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <Stats venueData={venueData} />
          <div className="flex-1 relative bg-gray-200 rounded-lg overflow-hidden">
            {/* CLAP Label (below C blocks) */}
            <h1
              className="absolute text-lg font-bold text-gray-800"
              style={{
                top: `${44 * 8}px`, // Positioning below C blocks
                left: `${18 * 8}px`, // Centered under CLAP blocks
              }}
            >
              CLAP
            </h1>

            {/* WAGGGS Label (above WA blocks) */}
            <h1
              className="absolute text-xl font-bold text-gray-800"
              style={{
                top: `${49 * 8}px`, // Positioning above WAGGGS blocks
                left: `${16 * 8}px`, // Centered above WAGGGS blocks
              }}
            >
              WAGGGS
            </h1>

            {/* SDG Label (below S blocks) */}
            <h1
              className="absolute text-xl font-bold text-gray-800"
              style={{
                top: `${44 * 8}px`, // Positioning below SDG blocks
                left: `${111 * 8}px`, // Centered under SDG blocks
              }}
            >
              SDG
            </h1>

            {/* WOSM Label (above WO blocks) */}
            <h1
              className="absolute text-xl font-bold text-gray-800"
              style={{
                top: `${49 * 8}px`, // Positioning above WOSM blocks
                left: `${114 * 8}px`, // Centered above WOSM blocks
              }}
            >
              WOSM
            </h1>

            {venueData.map((venue) => (
              <SingleBlock
                key={venue.venueId}
                venue={venue.venueName}
                xVal={venue.xVal * 0.8} // Scale down by 20%
                yVal={venue.yVal * 0.8} // Scale down by 20%
                color={venue.isAvailable ? "green" : "red"}
              />
            ))}
            <Legend />
          </div>
        </div>
      )}
    </div>
  );
}
