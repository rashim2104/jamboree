"use client";
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";

export default function AddPatrol() {
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedIds, setScannedIds] = useState([]);
  const scannerRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (showScanner && !hasInitialized.current) {
      // Clear any existing instance first
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }

      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10, // Increased FPS for better detection
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false, // Allow image flip
          videoConstraints: {
            facingMode: "environment",
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          },
        },
        false
      );

      scannerRef.current = html5QrcodeScanner;
      hasInitialized.current = true;

      html5QrcodeScanner.render(async (decodedText) => {
        if (isProcessing) return;

        // Check if ID was already scanned
        if (scannedIds.includes(decodedText)) {
          toast.error("This patrol has already been scanned");
          return;
        }

        setIsProcessing(true);

        try {
          const response = await fetch("/api/addPatrol", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patrolId: decodedText }),
          });

          const data = await response.json();

          if (response.ok) {
            // Add the ID to scanned list on success
            setScannedIds((prev) => [...prev, decodedText]);
            toast.success("Patrol registered successfully!");
            // Add the new API call to update XLS
            try {
              // console.log("inside the xsl update");
              const xlsResponse = await fetch("/api/updateXLS", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
              });

              if (xlsResponse.ok) {
                console.log("XLS updated successfully");
              } else {
                console.error("Failed to update XLS");
              }
            } catch (xlsError) {
              console.error("Error updating XLS:", xlsError);
            }

            // Removed setShowScanner(false) and html5QrcodeScanner.clear()
          } else {
            switch (response.status) {
              case 409:
                toast.error("This patrol is already registered");
                break;
              case 400:
                toast.error("Invalid QR code format");
                break;
              default:
                toast.error(data.message || "Failed to register patrol");
            }
          }
        } catch (error) {
          toast.error("Error registering patrol");
          console.error("Error:", error);
        } finally {
          setTimeout(() => {
            setIsProcessing(false);
          }, 2000);
        }
      });
    }

    return () => {
      if (scannerRef.current && !showScanner) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
        hasInitialized.current = false;
      }
    };
  }, [showScanner, isProcessing, scannedIds]);

  const handleCloseScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
      hasInitialized.current = false;
    }
    setShowScanner(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
        Register Patrol
      </h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
        <h2 className="font-semibold mb-2">Important Notes:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            If the scanner gets stuck or gives any trouble, please reload the
            page manually once.
          </li>
          <li>
            Make sure you have good lighting for better QR code detection.
          </li>
          <li>
            Hold the QR code steady and ensure it's clearly visible in the
            scanner frame.
          </li>
          <li>Each patrol QR code can only be scanned once.</li>
          <li>
            If you experience camera issues, check your browser permissions.
          </li>
        </ul>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowScanner(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>◱</span>
          Scan Patrol QR Code
        </button>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Scan Patrol QR Code</h3>
              <button
                onClick={handleCloseScanner}
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
