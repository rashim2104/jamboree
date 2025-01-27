import { credentials } from "../../../public/image/data/creds";
import crypto from 'crypto';
import connectMongoDB from "@/util/connectMongoDB";

export async function POST(request) {
  try {
    const { email, password, venueId, source } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email and password are required",
          errorType: "VALIDATION_ERROR"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await connectMongoDB();

    let user;

    // Handle admin panel login
    if (source === 'admin-panel') {
      // Check for email starting with "admin"
      const lowerEmail = email.toLowerCase();
      const lowerPassword = password.toLowerCase();
      user = credentials.find(
        (cred) => cred.email.toLowerCase().startsWith('admin') && 
                  cred.email.toLowerCase() === lowerEmail && 
                  cred.password.toLowerCase() === lowerPassword &&
                  cred.role === 'admin'
      );

      if (!user) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid admin credentials",
            errorType: "VALIDATION_ERROR"
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    } 
    // Handle venue-specific login
    else if (venueId) {
      // Find user with matching venueId prefix
      const lowerEmail = email.toLowerCase();
      const lowerPassword = password.toLowerCase();
      user = credentials.find(
        (cred) => 
          cred.email.toLowerCase().startsWith(venueId.toLowerCase()) && 
          cred.email.toLowerCase() === lowerEmail && 
          cred.password.toLowerCase() === lowerPassword &&
          cred.role === 'volunteer'
      );

      // Check if any credentials exist for this venue
      if (!credentials.some((cred) => cred.email.toLowerCase().startsWith(venueId.toLowerCase()))) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No valid credentials found for this venue",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // If email doesn't match venue ID pattern
      if (email && !lowerEmail.startsWith(venueId.toLowerCase())) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid credentials for this venue",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Return success response if user is found
    if (user) {
      // Generate venue-specific token
      const venueToken = crypto.randomBytes(32).toString('hex');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          role: user.role,
          message: `Successfully logged in as ${user.role}`,
          venueToken: venueToken // Send venue token in response
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid credentials",
          errorType: "VALIDATION_ERROR"
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal Server Error",
        errorType: "SERVER_ERROR"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ success: false, message: "Method not allowed" }),
    { status: 405, headers: { "Content-Type": "application/json" } }
  );
}
