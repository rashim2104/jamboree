"use client";

import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";

export default function ReadyForLifeExit() {
  const [showScanner, setShowScanner] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPatrol, setProcessingPatrol] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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
        setProcessingPatrol(decodedText);
        
        try {
          const response = await fetch("/api/exit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              patrolData: decodedText,
              venueId: "faclty_cubk6jamd29s7145qmn0" // Ready for Life venue ID
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            html5QrcodeScanner.clear().catch(console.error);
            setShowSuccessDialog(true);
            toast.success("Ready for Life visit recorded successfully!");
          } else {
            toast.error(data.message || "Failed to process QR code");
          }
        } catch (error) {
          toast.error("Error processing patrol data");
          console.error("Error:", error);
        } finally {
          setProcessingPatrol(null);
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
    setSuccess(false);
    setShowScanner(false);
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setShowScanner(false);
    setSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Ready for Life - Exit Check
      </h1>

      {!success && !showScanner && (
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
              <h3 className="text-lg font-semibold">
                {processingPatrol ? 'Processing Patrol...' : 'Scan Patrol QR Code'}
              </h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>
            {processingPatrol ? (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Processing patrol data...</p>
              </div>
            ) : (
              <div id="qr-reader" className="w-full"></div>
            )}
          </div>
        </div>
      )}

      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                Visit Recorded Successfully!
              </h3>
              <p className="text-gray-500 mb-6">
                The patrol has completed Ready for Life venue.
              </p>
              <button
                onClick={handleCloseSuccessDialog}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              Visit Recorded Successfully!
            </h2>
            <p className="text-green-600">
              The patrol has been marked as completed for Ready for Life.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Check Another Patrol
          </button>
        </div>
      )}
    </div>
  );
}
