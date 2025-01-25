export async function POST(request) {
  try {
    const body = await request.json();
    const { venueId, qrData } = body;

    // Dummy validation - replace with your actual validation logic
    const isValidQR = qrData && qrData.startsWith("venue-");

    if (!isValidQR) {
      return new Response(JSON.stringify({ error: "Invalid QR code" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
