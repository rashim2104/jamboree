import { credentials } from "../../../public/image/data/creds";

export async function POST(request) {
  try {
    // Parse request body
    const { email, password } = await request.json();

    // Find the user
    const user = credentials.find(
      (cred) => cred.email === email && cred.password === password
    );

    // Return appropriate response
    if (user) {
      return new Response(JSON.stringify({ success: true, role: user.role }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid credentials" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal Server Error",
        error: error.message,
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
