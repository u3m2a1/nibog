import { NextResponse } from 'next/server';
import { USER_AUTH_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const loginData = await request.json();

    console.log("Server API route: User login attempt");

    // Validate required fields
    if (!loginData.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!loginData.password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Ensure device_info is present
    if (!loginData.device_info) {
      // Create a basic device_info object if not provided
      loginData.device_info = {
        device_id: "web-client",
        os: "Unknown",
        os_version: "Unknown",
        browser: "Unknown",
        ip_address: "0.0.0.0"
      };
    }

    // Forward the request to the external API
    const apiUrl = USER_AUTH_API.LOGIN;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
      cache: "no-store",
    });

    console.log(`Server API route: Login response status: ${response.status}`);

    // Handle API response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      return NextResponse.json(
        { error: `Login failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse the response
    const responseData = await response.json();

    // Check if the response is an empty array (login failed)
    if (Array.isArray(responseData) && responseData.length === 0) {
      console.log("Server API route: Login failed - empty array response");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return the successful response
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Server API route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
