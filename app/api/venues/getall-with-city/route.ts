import { NextResponse } from 'next/server';

// Simple in-memory cache to prevent excessive API calls
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export async function GET() {
  try {
    console.log("Server API route: Fetching all venues with city details...");

    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("Server API route: Returning cached venues data");
      return NextResponse.json(cachedData, { status: 200 });
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.alviongs.com/webhook/V1/nibog/venues/getall-with-city";
    console.log("Server API route: Calling API URL:", apiUrl);

    // Use no-store to prevent caching issues
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      next: { revalidate: 0 }
    });

    console.log(`Server API route: Get all venues with city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server API route: Error response: ${errorText}`);
      return NextResponse.json(
        { error: `API returned error status: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    let data;
    try {
      // Try to parse the response as JSON
      data = JSON.parse(responseText);
      console.log(`Server API route: Retrieved ${Array.isArray(data) ? data.length : 'non-array'} venues with city details`);

      // Log the data structure to help diagnose issues
      if (Array.isArray(data) && data.length > 0) {
        console.log("Server API route: First venue data structure:", JSON.stringify(data[0], null, 2));
      }

      // Ensure we have an array
      if (!Array.isArray(data)) {
        console.warn("Server API route: API did not return an array:", data);
        data = [];
      }

      // Normalize the data to ensure it has consistent structure
      if (Array.isArray(data)) {
        // Filter out empty objects
        data = data.filter(venue => {
          // Check if the venue object is empty or has no meaningful properties
          if (!venue || typeof venue !== 'object') return false;

          // Check if it's an empty object
          const keys = Object.keys(venue);
          if (keys.length === 0) {
            console.log("Server API route: Filtering out empty venue object");
            return false;
          }

          // Check if it has any meaningful properties
          const hasData = keys.some(key => {
            const value = venue[key];
            return value !== null && value !== undefined && value !== '';
          });

          if (!hasData) {
            console.log("Server API route: Filtering out venue with no meaningful data");
            return false;
          }

          return true;
        });

        // If after filtering we have no venues, return an empty array
        if (data.length === 0) {
          console.log("Server API route: No valid venues found after filtering");
          return NextResponse.json([], { status: 200 });
        }

        // Map the remaining venues to a normalized structure
        data = data.map(venue => {
          // Create a normalized venue object with all required fields
          return {
            venue_id: venue.venue_id || venue.id || 0,
            venue_name: venue.venue_name || venue.name || "Unknown Venue",
            address: venue.address || "No address provided",
            capacity: venue.capacity || 0,
            venue_is_active: venue.venue_is_active !== undefined ? venue.venue_is_active :
                            (venue.is_active !== undefined ? venue.is_active : false),
            venue_created_at: venue.venue_created_at || venue.created_at || new Date().toISOString(),
            venue_updated_at: venue.venue_updated_at || venue.updated_at || new Date().toISOString(),
            city_id: venue.city_id || 0,
            city_name: venue.city_name || "Unknown City",
            state: venue.state || "",
            city_is_active: venue.city_is_active !== undefined ? venue.city_is_active : true,
            city_created_at: venue.city_created_at || new Date().toISOString(),
            city_updated_at: venue.city_updated_at || new Date().toISOString()
          };
        });
      }
    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      // If parsing fails, return the error
      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        },
        { status: 500 }
      );
    }

    // Cache the successful response
    cachedData = data;
    cacheTimestamp = Date.now();
    console.log("Server API route: Cached venues data");

    // Return the response with the appropriate status
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Server API route: Error fetching venues with city:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venues with city" },
      { status: 500 }
    );
  }
}
