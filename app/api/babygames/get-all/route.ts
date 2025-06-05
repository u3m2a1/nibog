import { NextResponse } from 'next/server';
import { BABY_GAME_API } from '@/config/api';

// Simple in-memory cache to prevent excessive API calls
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export async function GET() {
  try {
    console.log("Server API route: Fetching all baby games...");

    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("Server API route: Returning cached baby games data");
      return NextResponse.json(cachedData, { status: 200 });
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = BABY_GAME_API.GET_ALL;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`Server API route: Get all baby games response status: ${response.status}`);

    if (!response.ok) {
      // If the first attempt fails, try with the webhook-test URL
      console.log("Server API route: First attempt failed, trying with webhook-test URL");
      
      const alternativeUrl = apiUrl.replace("webhook/v1", "webhook-test/v1");
      console.log("Server API route: Trying alternative URL:", alternativeUrl);
      
      const alternativeResponse = await fetch(alternativeUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      
      console.log(`Server API route: Alternative response status: ${alternativeResponse.status}`);
      
      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        console.error(`Server API route: Error response from alternative attempt: ${errorText}`);
        return NextResponse.json(
          { error: `API returned error status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }
      
      // Get the response data from successful alternative attempt
      const responseText = await alternativeResponse.text();
      console.log(`Server API route: Raw response from alternative attempt: ${responseText}`);
      
      try {
        const responseData = JSON.parse(responseText);
        // Cache the successful response
        cachedData = responseData;
        cacheTimestamp = Date.now();
        console.log("Server API route: Cached baby games data");
        return NextResponse.json(responseData, { status: 200 });
      } catch (parseError) {
        console.error("Server API route: Error parsing alternative response:", parseError);
        return NextResponse.json(
          { 
            error: "Failed to parse API response", 
            rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
          },
          { status: 500 }
        );
      }
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);
    
    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log(`Server API route: Retrieved ${responseData.length} baby games`);

      // Cache the successful response
      cachedData = responseData;
      cacheTimestamp = Date.now();
      console.log("Server API route: Cached baby games data");

      return NextResponse.json(responseData, { status: 200 });
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
  } catch (error: any) {
    console.error("Server API route: Error fetching baby games:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch baby games" },
      { status: 500 }
    );
  }
}
