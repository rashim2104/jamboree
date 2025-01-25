"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Html5QrcodeScanner } from "html5-qrcode";
import { set } from "mongoose";

async function getVenueDetails(id) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/getVenueDetail/${id}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      toast.error("Failed to fetch venue.");
    }
    return response.json();
  } catch (error) {
    toast.error("Failed sending request,");
    console.error("Error:", error);
    return null;
  }
}

export default function VenuePage({ params }) {
  const [venue, setVenue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [participants, setParticipants] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Add this new state
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: usernameInput,
          password: passwordInput,
          venueId: id,
        }),
      });

      const result = await response.json();
      if (response.status === 400) {
        toast.error(result.message);
        return;
      }

      if (response.ok && result.success) {
        setIsVolunteer(true);
        // Store both general volunteer status and venue-specific token
        sessionStorage.setItem("isVolunteer", "true");
        sessionStorage.setItem(`venue_token_${id}`, result.venueToken);
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
    setIsVolunteer(false);
    // Clear both general and venue-specific tokens
    sessionStorage.removeItem("isVolunteer");
    sessionStorage.removeItem(`venue_token_${id}`);
    toast.success("Logged out successfully!");
    setUsernameInput("");
    setPasswordInput("");
  };

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        // Check both general volunteer status and venue-specific token
        const isAuth = sessionStorage.getItem("isVolunteer") === "true" &&
                      sessionStorage.getItem(`venue_token_${id}`) !== null;
        setIsVolunteer(isAuth);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [id]); // Add id to dependencies

  useEffect(() => {
    const fetchData = async () => {
      const data = await getVenueDetails(id);
      setVenue(data);
    };
    if (isVolunteer) {
      fetchData();
    }
  }, [id, isVolunteer]);

  useEffect(() => {
    let html5QrcodeScanner;

    if (showScanner) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 2, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      html5QrcodeScanner.render(
        async (decodedText) => {
          // Prevent multiple simultaneous scans
          if (isProcessing) {
            return;
          }

          setIsProcessing(true); // Lock processing

          try {
            const response = await fetch("/api/patrolAttendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                venueId: id,
                patrolId: decodedText,
              }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
              toast.success(`${data.message} (${data.pavilion} - Visit #${data.visitCount})`);
              const updatedVenue = await getVenueDetails(id);
              setVenue(updatedVenue);
              setShowScanner(false); // Close scanner on success
              html5QrcodeScanner.clear().catch(console.error);
            } else {
              // Handle different error types
              switch(data.errorType) {
                case 'VALIDATION_ERROR':
                  toast.error('Invalid QR code format');
                  break;
                case 'NOT_FOUND':
                  toast.error(data.message);
                  break;
                case 'DUPLICATE_VISIT':
                  toast.error(data.message);
                  break;
                case 'LIMIT_REACHED':
                  toast.error(data.message);
                  break;
                case 'CONFIG_ERROR':
                  toast.error('System configuration error. Please contact support.');
                  break;
                default:
                  toast.error(data.message || 'Failed to process QR code');
              }
            }
          } catch (error) {
            toast.error('Network error while scanning QR code. Please try again.');
            console.error("Error:", error);
          } finally {
            // Always unlock processing after completion or error
            setTimeout(() => {
              setIsProcessing(false);
            }, 2000); // Add 2 second delay before allowing next scan
          }
        },
        (errorMessage) => {
          console.log("QR Scanner Error:", errorMessage);
        }
      );
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
      }
      setIsProcessing(false); // Reset processing state on cleanup
    };
  }, [showScanner, id, isProcessing]); // Add isProcessing to dependencies

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

  if (!isVolunteer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-lg rounded-xl p-8 w-96 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Volunteer Login
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

  if (!venue) return <div>Loading...</div>;

  const handleBlock = async () => {
    try {
      const response = await fetch("/api/venueBlocker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: id,
          participants: parseInt(participants),
        }),
      });
      if (response.status === 201) {
        toast.error(
          "Participants count is exceeding the capacity of the venue."
        );
        return;
      }
      if (response.ok) {
        const updatedVenue = await getVenueDetails(id);
        setVenue(updatedVenue);
        setShowModal(false);
        setParticipants("");
        toast.success("Venue Blocked Successfully!");
      } else {
        toast.error("Failed to block the venue.");
      }
    } catch (error) {
      toast.error("Error blocking the venue.");
      console.error("Error:", error);
    }
  };

  const handleUnblock = async () => {
    try {
      const response = await fetch("/api/venueUnblocker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId: id }),
      });
      if (response.ok) {
        toast.success("Venue Unblocked Successfully!");
        const updatedVenue = await getVenueDetails(id);
        setVenue(updatedVenue);
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to unblock the venue: ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      toast.error("Error unblocking the venue.");
      console.error("Error:", error);
    }
  };

  // Format the last updated date
  const lastUpdated = new Date(venue.lastUpdated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="max-w-6xl mx-auto mb-4 flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        {venue.venueName}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Venue Details
          </h2>
          <div className="space-y-4">
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Venue ID</span>
              <span className="font-medium text-gray-800">{venue.venueId}</span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Theme</span>
              <span className="font-medium text-gray-800">
                {venue.parentTheme}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Capacity</span>
              <span className="font-medium text-gray-800">
                {venue.capacity}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  venue.isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {venue.isAvailable ? "Available" : "Not Available"}
              </span>
            </p>
          </div>
        </div>
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Attendance Information
          </h2>
          <div className="space-y-4">
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Total Attendees</span>
              <span className="font-medium text-gray-800">
                {venue.totalAttendees}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium text-gray-800">{lastUpdated}</span>
            </p>
          </div>
        </div>
        {venue.attendees && venue.attendees.length > 0 && (
          <div className="col-span-full border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Scheduled Attendance
            </h2>
            <div className="space-y-3">
              {venue.attendees.map((attendance, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-gray-600">
                    {new Date(attendance.date).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-gray-800">
                    Count: {attendance.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-center gap-4">
        {venue.isAvailable ? (
          <>
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Block Venue
            </button>
            <button
              onClick={() => setShowScanner(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Scan QR Code
            </button>
          </>
        ) : (
          <button
            onClick={handleUnblock}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Unblock Venue
          </button>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Enter Number of Participants
            </h3>
            <input
              type="number"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="border p-2 mb-4 w-full"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Scan QR Code</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div id="qr-reader" className="w-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}
