"use client";

import { useState, useEffect } from "react";

function SingleBlock({ venue, xVal, yVal, color }) {
  return (
    <div
      className={`absolute w-[4.8rem] h-[4.8rem] bg-${color}-500 rounded-md flex items-center justify-center`}
      style={{
        top: `${yVal * 10}px`,
        left: `${xVal * 10}px`,
      }}
    >
      <h1 className="text-black text-s font-semibold text-center w-full leading-tight overf">
        {venue}
      </h1>
    </div>
  );
}

export default function OccupancyChart() {
  const [venueData, setVenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const venuePositions = [
    //Clap
    { venueId: "C1", xVal: 10, yVal: 5 },
    { venueId: "C2", xVal: 25, yVal: 5 },
    { venueId: "C3", xVal: 10, yVal: 15 },
    { venueId: "C4", xVal: 25, yVal: 15 },
    { venueId: "C5", xVal: 10, yVal: 25 },
    { venueId: "C6", xVal: 25, yVal: 25 },
    { venueId: "C7", xVal: 17, yVal: 35 },

    //SDG (6 Venues in 2 Rows) - Top Right Quadrant
    { venueId: "S1", xVal: 85, yVal: 5 },
    { venueId: "S2", xVal: 95, yVal: 5 },
    { venueId: "S3", xVal: 105, yVal: 5 },
    { venueId: "S4", xVal: 115, yVal: 5 },
    { venueId: "S5", xVal: 125, yVal: 5 },
    { venueId: "S6", xVal: 85, yVal: 15 },
    { venueId: "S7", xVal: 95, yVal: 15 },
    { venueId: "S8", xVal: 105, yVal: 15 },
    { venueId: "S9", xVal: 115, yVal: 15 },
    { venueId: "S10", xVal: 125, yVal: 15 },
    { venueId: "S11", xVal: 85, yVal: 25 },
    { venueId: "S12", xVal: 95, yVal: 25 },
    { venueId: "S13", xVal: 105, yVal: 25 },
    { venueId: "S14", xVal: 115, yVal: 25 },
    { venueId: "S15", xVal: 125, yVal: 25 },
    { venueId: "S16", xVal: 95, yVal: 35 },
    { venueId: "S17", xVal: 115, yVal: 35 },

    // WAGGGS (4 Venues in 2x2 grid)
    { venueId: "WA1", xVal: 10, yVal: 55 },
    { venueId: "WA2", xVal: 25, yVal: 55 },
    { venueId: "WA3", xVal: 10, yVal: 65 },
    { venueId: "WA4", xVal: 25, yVal: 65 },

    // WOSM (12 Venues in 2 Rows) - Bottom Right Quadrant
    { venueId: "WO1", xVal: 85, yVal: 55 },
    { venueId: "WO2", xVal: 95, yVal: 55 },
    { venueId: "WO3", xVal: 105, yVal: 55 },
    { venueId: "WO4", xVal: 115, yVal: 55 },
    { venueId: "WO5", xVal: 125, yVal: 55 },
    { venueId: "WO6", xVal: 135, yVal: 55 },
    { venueId: "WO7", xVal: 85, yVal: 65 },
    { venueId: "WO8", xVal: 95, yVal: 65 },
    { venueId: "WO9", xVal: 105, yVal: 65 },
    { venueId: "WO10", xVal: 115, yVal: 65 },
    { venueId: "WO11", xVal: 125, yVal: 65 },
    { venueId: "WO12", xVal: 135, yVal: 65 },
  ];

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/getAllVenueDetail");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // Combine venue data with positions
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
      } catch (error) {
        console.error("Error fetching venues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Occupancy Chart</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="relative w-full h-[100vh] bg-gray-200 rounded-lg">
          {/* CLAP Label (below C blocks) */}
          <h1
            className="absolute text-xl font-bold text-gray-800"
            style={{
              top: `${46 * 10}px`, // Positioning below C blocks
              left: `${18 * 10}px`, // Centered under CLAP blocks
            }}
          >
            CLAP
          </h1>

          {/* WAGGGS Label (above WA blocks) */}
          <h1
            className="absolute text-xl font-bold text-gray-800"
            style={{
              top: `${50 * 10}px`, // Positioning above WAGGGS blocks
              left: `${16 * 10}px`, // Centered above WAGGGS blocks
            }}
          >
            WAGGGS
          </h1>

          {/* SDG Label (below S blocks) */}
          <h1
            className="absolute text-xl font-bold text-gray-800"
            style={{
              top: `${46 * 10}px`, // Positioning below SDG blocks
              left: `${107 * 10}px`, // Centered under SDG blocks
            }}
          >
            SDG
          </h1>

          {/* WOSM Label (above WO blocks) */}
          <h1
            className="absolute text-xl font-bold text-gray-800"
            style={{
              top: `${50 * 10}px`, // Positioning above WOSM blocks
              left: `${110 * 10}px`, // Centered above WOSM blocks
            }}
          >
            WOSM
          </h1>

          {venueData.map((venue) => (
            <SingleBlock
              key={venue.venueId}
              venue={venue.venueName}
              xVal={venue.xVal}
              yVal={venue.yVal}
              color={venue.isAvailable ? "green" : "red"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
