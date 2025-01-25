"use client";

import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";

export default function CheckPatrol() {
  const [showScanner, setShowScanner] = useState(false);
  const [patrolData, setPatrolData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let html5QrcodeScanner;

    if (showScanner) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 2, qrbox: { width: 250, height: 250 } },
        false
      );

      html5QrcodeScanner.render(async (decodedText) => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
          const response = await fetch("/api/exitPatrol", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patrolId: decodedText }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setPatrolData(data.data);
            setShowScanner(false);
            html5QrcodeScanner.clear().catch(console.error);
          } else {
            toast.error(data.message || "Failed to process QR code");
          }
        } catch (error) {
          toast.error("Error processing patrol data");
          console.error("Error:", error);
        } finally {
          setTimeout(() => {
            setIsProcessing(false);
          }, 2000);
        }
      });
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
      }
      setIsProcessing(false);
    };
  }, [showScanner, isProcessing]);

  const handleReset = () => {
    setPatrolData(null);
    setShowScanner(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Patrol Exit Check
      </h1>

      {!patrolData && !showScanner && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowScanner(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Scan Patrol QR Code
          </button>
        </div>
      )}

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Scan Patrol QR Code</h3>
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

      {patrolData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Patrol Details
              </h2>
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-600">Patrol ID</span>
                  <span className="font-medium">{patrolData.patrolId}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Venues Visited</span>
                  <span className="font-medium">{patrolData.totalVenues}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Pavilion Visits</span>
                  <span className="font-medium">
                    {patrolData.totalPavilionVisits}
                  </span>
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Completed Pavilions
              </h2>
              <div className="space-y-2">
                {patrolData.pavilionStatus.completed.map((pavilion, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-green-50 p-2 rounded"
                  >
                    <span>{pavilion.pavilion}</span>
                    <span className="font-medium">
                      Visits: {pavilion.visits}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {patrolData.pavilionStatus.missing.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
              <h2 className="text-xl font-semibold mb-4 text-red-600">
                Missing Requirements
              </h2>
              <div className="space-y-2">
                {patrolData.pavilionStatus.missing.map((pavilion, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-red-50 p-2 rounded"
                  >
                    <span>{pavilion.pavilion}</span>
                    <span>
                      Visited: {pavilion.visited}/{pavilion.required} (Missing:{" "}
                      {pavilion.remaining})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              onClick={handleReset}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Check Another Patrol
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
