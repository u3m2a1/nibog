import { NextResponse } from 'next/server';

// Simple in-memory cache to prevent excessive API calls
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export async function GET() {
  try {
    console.log("Server API route: Fetching all events with games...");

    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("Server API route: Returning cached events with games data");
      return NextResponse.json(cachedData, { status: 200 });
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/get-all";
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`Server API route: Get all events with games response status: ${response.status}`);

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

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log(`Server API route: Retrieved ${Array.isArray(responseData) ? responseData.length : 'non-array'} events with games`);

      // Ensure we have an array
      if (!Array.isArray(responseData)) {
        console.warn("Server API route: API did not return an array:", responseData);
        return NextResponse.json([], { status: 200 });
      }

      // Transform the data to a more usable format for the frontend
      const transformedData = responseData.map(event => ({
        event_id: event.event_id,
        event_title: event.event_title,
        event_description: event.event_description,
        event_date: event.event_date,
        event_status: event.event_status,
        city: {
          city_id: event.city_id,
          city_name: event.city_name,
          state: event.state,
          is_active: event.city_is_active
        },
        venue: {
          venue_id: event.venue_id,
          venue_name: event.venue_name,
          address: event.venue_address,
          capacity: event.venue_capacity,
          is_active: event.venue_is_active
        },
        games: event.games.map((game: any) => ({
          game_id: game.game_id,
          game_title: game.game_title,
          game_description: game.game_description,
          min_age: game.min_age,
          max_age: game.max_age,
          duration_minutes: game.game_duration_minutes,
          categories: game.categories,
          custom_title: game.custom_title,
          custom_description: game.custom_description,
          custom_price: game.custom_price,
          start_time: game.start_time,
          end_time: game.end_time,
          slot_price: game.slot_price,
          max_participants: game.max_participants
        }))
      }));

      // Cache the successful response
      cachedData = transformedData;
      cacheTimestamp = Date.now();
      console.log("Server API route: Cached events with games data");

      return NextResponse.json(transformedData, { status: 200 });
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
    console.error("Server API route: Error fetching events with games:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events with games" },
      { status: 500 }
    );
  }
}
