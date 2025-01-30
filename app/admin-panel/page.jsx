"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [patrolData, setPatrolData] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("SDG");
  const [venueStats, setVenueStats] = useState({});

  const THEMES = ["SDG", "WAGGGS", "CLAP", "WOSM", "Be Prepared"];
  const DISPLAY_THEMES = ["SDG", "WAGGGS", "CLAP", "WOSM"];  // New constant for display
  const THEME_COLORS = {
    SDG: "text-blue-600",
    WAGGGS: "text-pink-600",
    CLAP: "text-orange-600",
    WOSM: "text-purple-600"
  };

  // Calculate statistics for venues
  const calculateStats = (data, venues) => {
    const stats = {};
    venues.forEach(venue => {
      stats[venue.venueId] = {
        count: data.filter(patrol => 
          patrol.visitedVenues.includes(venue.venueId)
        ).length,
        name: venue.venueName,
        theme: venue.parentTheme
      };
    });
    return stats;
  };

  // New helper functions for statistics
  const getThemeStats = (theme) => {
    return Object.values(venueStats)
      .filter(venue => venue.theme === theme)
      .reduce((acc, venue) => acc + venue.count, 0);
  };

  const getTotalVisits = () => {
    return Object.values(venueStats)
      .reduce((acc, venue) => acc + venue.count, 0);
  };

  // New helper functions for theme completion
  const hasCompletedTheme = (patrol, theme, venues) => {
    const themeVenues = venues.filter(venue => venue.parentTheme === theme)
                             .map(venue => venue.venueId);
    return themeVenues.every(venueId => 
      patrol.visitedVenues.includes(venueId)
    );
  };

  const getThemeCompletionCount = (theme) => {
    if (!Array.isArray(patrolData) || !venueStats) return 0;
    return patrolData.filter(patrol => 
      hasCompletedTheme(patrol, theme, Object.entries(venueStats).map(([id, data]) => ({
        venueId: id,
        parentTheme: data.theme
      })))
    ).length;
  };

  const getTotalCompletionCount = () => {
    if (!Array.isArray(patrolData)) return 0;
    return patrolData.filter(patrol => 
      THEMES.every(theme => 
        hasCompletedTheme(patrol, theme, Object.entries(venueStats).map(([id, data]) => ({
          venueId: id,
          parentTheme: data.theme
        })))
      )
    ).length;
  };

  // New utility functions to handle date and filtering
  const convertToIST = (utcDateStr) => {
    const date = new Date(utcDateStr);
    return date.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  };

  const filterTodayEntries = (entries) => {
    if (!Array.isArray(entries)) return [];
    
    const today = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset from UTC in milliseconds
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.lastUpdated);
      const istDate = new Date(entryDate.getTime() + istOffset);
      return istDate.toDateString() === today.toDateString();
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patrolResponse, venueResponse] = await Promise.all([
          fetch("/api/getAllPatrol"),
          fetch("/api/getVenues")
        ]);
        
        if (!patrolResponse.ok || !venueResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const patrolResult = await patrolResponse.json();
        const venueData = await venueResponse.json();

        // Validate that patrolResult is an array
        if (!Array.isArray(patrolResult)) {
          toast.error("Invalid patrol data received");
          return;
        }

        // Filter today's entries only
        const todayEntries = filterTodayEntries(patrolResult);
        setPatrolData(todayEntries);
        setVenueStats(calculateStats(todayEntries, venueData));
      } catch (error) {
        toast.error("Failed to fetch data. Retrying...");
      }
    };

    if (isAdmin) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

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
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const isAuth = sessionStorage.getItem("isAdmin") === "true";
        setIsAdmin(isAuth);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdmin ? (
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
      ) : (
        <div className="p-6">
          {/* Summary Statistics - only show first 4 theme stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {DISPLAY_THEMES.map(theme => (
              <div key={theme} className="bg-white rounded-lg shadow p-4">
                <h3 className={`text-lg font-semibold ${THEME_COLORS[theme]}`}>
                  {theme}
                </h3>
                <p className="text-3xl font-bold">{getThemeCompletionCount(theme)}</p>
                <p className="text-sm text-gray-500">Completed All Venues</p>
              </div>
            ))}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-green-600">Total Complete</h3>
              <p className="text-3xl font-bold">{getTotalCompletionCount()}</p>
              <p className="text-sm text-gray-500">All Themes Completed</p>
            </div>
          </div>

          {/* Theme Navigation */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4 p-4">
                {DISPLAY_THEMES.map(theme => (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedTheme === theme
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Venue Details */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedTheme} Venues
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({getThemeCompletionCount(selectedTheme)} patrols completed all venues)
                </span>
              </h2>
            </div>
            <div className="p-4">
              <div className="grid gap-4">
                {Object.entries(venueStats)
                  .filter(([_, data]) => data.theme === selectedTheme)
                  .map(([venueId, data]) => (
                    <div
                      key={venueId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-gray-800">{data.name}</h3>
                      </div>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.count}
                        </div>
                        <div className="ml-2 text-sm text-gray-500">visits</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            Last updated: {convertToIST(new Date().toISOString())}
          </div>
        </div>
      )}
    </div>
  );
}
