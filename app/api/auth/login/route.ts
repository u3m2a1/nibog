import { NextResponse } from 'next/server';
import { USER_AUTH_API } from '@/config/api';
import { generateToken } from '@/utils/jwt';

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
    
    // Check if we got the expected response structure
    if (!responseData || !Array.isArray(responseData) || !responseData[0] || !responseData[0].object) {
      console.error("Unexpected API response format:", responseData);
      return NextResponse.json(
        { error: "Unexpected response from server" },
        { status: 500 }
      );
    }

    // Get the user data from the response
    const userData = responseData[0].object;
    
    // Generate our own JWT token since the external API doesn't provide one
    // This fixes the "No token found in response" issue
    const token = generateToken({
      userId: userData.user_id,
      email: userData.email,
      fullName: userData.full_name
    });
    
    // Add the token to the user data for the client
    userData.token = token;
    
    // Create a new response with the updated user data and token
    const jsonResponse = NextResponse.json(responseData);
    jsonResponse.headers.set('authorization', `Bearer ${token}`);
    return jsonResponse;

  } catch (error) {
    console.error("Server API route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
