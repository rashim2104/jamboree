"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import venueCordsData from '../../public/image/data/venueCords.json';

const ORDERED_THEMES = [
  "SDG",
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
    // Filter venues based on parentTheme instead of ID prefix
    const venues = venueData.filter((v) => {
      const venueConfig = venueCordsData.find(
        (coord) => coord.venueId === v.venueId
      );
      return venueConfig?.parentTheme === theme;
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

function SingleBlock({ venue, xVal, yVal, width, height, color }) {
  const getColors = (color) => {
    const colorMap = {
      red: { bg: '#FEE2E2', border: '#EF4444' },
      orange: { bg: '#FFEDD5', border: '#F97316' },
      yellow: { bg: '#FEF3C7', border: '#EAB308' },
      green: { bg: '#DCFCE7', border: '#22C55E' },
    };
    return colorMap[color] || colorMap.green;
  };

  const colors = getColors(color);

  return (
    <div
      className={`absolute rounded-lg flex items-center justify-center shadow-md 
      transition-all duration-300 hover:scale-105 hover:shadow-lg 
      cursor-pointer group`}
      style={{
        top: `${yVal}px`,
        left: `${xVal}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: colors.bg,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: colors.border
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
  
  useEffect(() => {
    const venueCoordinates = venueCordsData.filter(coord => coord.display);
    console.log('Available venue coordinates:', venueCoordinates);

    const fetchVenues = async () => {
      try {
        const response = await fetch("/api/getAllVenueDetail");
        if (!response.ok) {
          toast.error("Failed to fetch venue details.");
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        const venues = result.data;
        
        // Filter and combine data only for venues that should be displayed
        const combinedData = venues
          .filter(venue => {
            const coordsEntry = venueCoordinates.find(
              coord => coord.venueId === venue.venueId
            );
            return coordsEntry && coordsEntry.display;
          })
          .map((venue) => {
            const position = venueCoordinates.find(
              (pos) => pos.venueId === venue.venueId
            );
            
            return {
              ...venue,
              xVal: position?.xValue,
              yVal: position?.yValue,
              width: position?.width,
              height: position?.height,
            };
          });

        console.log('Final filtered and mapped data:', combinedData);
        setVenueData(combinedData);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching venue details.");
        console.error("Error fetching venues:", error);
      }
    };

    fetchVenues();
    const intervalId = setInterval(fetchVenues, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const getVenueColor = (venue) => {
      if (!venue.isAvailable) return "red";
      if (venue.currentValue > 10) return "orange";
      if (venue.currentValue > 0) return "yellow";
      return "green";
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
                {venueData.map((venue) => (
                  <SingleBlock
                    key={venue.venueId}
                    venue={venue.venueName}
                    xVal={venue.xVal || 0}
                    yVal={venue.yVal || 0}
                    width={venue.width || 62}
                    height={venue.height || 62}
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
