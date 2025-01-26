"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { venueMappings } from "@/public/image/data/venueInfo";
import { pavillionLimits } from "@/public/image/data/pavillionLimit";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("People");

  const [patrolData, setPatrolData] = useState([]);
  const ORDERED_THEMES = [
    "People",
    "Prosperity",
    "Planet",
    "Peace and Partnership",
    "WAGGGS",
    "CLAP",
    "WOSM",
  ];

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

  // Helper function to get venue codes by pavilion
  const getVenueCodesByPavilion = (pavilionName) => {
    return venueMappings
      .filter(mapping => {
        const [code, details] = Object.entries(mapping)[0];
        return details.pavilion === pavilionName;
      })
      .map(mapping => Object.keys(mapping)[0]);
  };

  // Helper function to check if patrol has completed a pavilion
  const hasCompletedPavilion = (patrol, pavilionName) => {
    const pavilionData = patrol.visitedPavilions.find(p => p.pavilion === pavilionName);
    const requiredCount = pavillionLimits.find(limit => Object.keys(limit)[0] === pavilionName);
    
    if (!pavilionData || !requiredCount) return false;
    return pavilionData.visitedCount >= requiredCount[pavilionName];
  };

  // Modified calculate unique patrol count for a theme
  const getUniquePatrolCount = (pavilionName) => {
    return patrolData.filter(patrol => hasCompletedPavilion(patrol, pavilionName)).length;
  };

  // Helper function to get venue count
  const getVenueVisitCount = (venueCode) => {
    return patrolData.filter(patrol => 
      patrol.visitedVenues.includes(venueCode)
    ).length;
  };

  // Modified helper function to get venues for a theme with completion status
  const getVenuesForTheme = (theme) => {
    return venueMappings
      .filter(mapping => {
        const [_, details] = Object.entries(mapping)[0];
        return details.pavilion === theme;
      })
      .map(mapping => {
        const [code, details] = Object.entries(mapping)[0];
        const visitCount = getVenueVisitCount(code);
        const requiredCount = pavillionLimits.find(limit => Object.keys(limit)[0] === theme);
        return {
          code,
          name: details.name,
          visitCount,
          pavilionRequired: requiredCount[theme]
        };
      });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/getAllPatrol");
        const result = await response.json();
        setPatrolData(result);
      } catch (error) {
        toast.error("Error fetching patrol data. Please try again later.");
      }
    }

    if (isAdmin) {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Changed from 3000 to 5000
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
            <h3 className="text-sm font-medium text-gray-500">People Patrols</h3>
            <p className="text-2xl font-bold text-purple-600">
              {getUniquePatrolCount("People")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Prosperity Patrols</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {getUniquePatrolCount("Prosperity")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Planet Patrols</h3>
            <p className="text-2xl font-bold text-green-600">
              {getUniquePatrolCount("Planet")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Peace & Partnership Patrols</h3>
            <p className="text-2xl font-bold text-blue-600">
              {getUniquePatrolCount("Peace and Partnership")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">WAGGGS Patrols</h3>
            <p className="text-2xl font-bold text-pink-600">
              {getUniquePatrolCount("WAGGGS")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">CLAP Patrols</h3>
            <p className="text-2xl font-bold text-orange-600">
              {getUniquePatrolCount("CLAP")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">WOSM Patrols</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {getUniquePatrolCount("WOSM")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Total Patrols</h3>
            <p className="text-2xl font-bold text-gray-800">
              {patrolData.length}
            </p>
          </div>
        </div>

        {/* Refresh Rate Info */}
        <div className="text-center py-2 bg-blue-50 text-sm text-blue-600">
          Data refreshes automatically every 5 seconds
        </div>

        {/* Theme Navigation */}
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

        {/* Venue Details */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {selectedTheme} Venues
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Completed Patrols: {getUniquePatrolCount(selectedTheme)})
              </span>
              <span className="ml-2 text-sm font-normal text-gray-500">
                Required Visits: {pavillionLimits.find(limit => Object.keys(limit)[0] === selectedTheme)?.[selectedTheme]}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {getVenuesForTheme(selectedTheme).map(({ code, name, visitCount, pavilionRequired }) => (
              <div
                key={code}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-700">{code}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-gray-600">{name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      visitCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {visitCount} {visitCount === 1 ? 'patrol' : 'patrols'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
