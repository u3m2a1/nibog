import { NextResponse } from 'next/server';
import { EVENT_API } from '@/config/api';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const eventData = await request.json();

    console.log("Server API route: Creating event:", eventData);

    // Validate required fields
    if (!eventData.title) {
      return NextResponse.json(
        { error: "Event title is required" },
        { status: 400 }
      );
    }

    if (!eventData.venue_id) {
      return NextResponse.json(
        { error: "Venue ID is required" },
        { status: 400 }
      );
    }

    if (!eventData.event_date) {
      return NextResponse.json(
        { error: "Event date is required" },
        { status: 400 }
      );
    }

    if (!eventData.games || !Array.isArray(eventData.games) || eventData.games.length === 0) {
      return NextResponse.json(
        { error: "At least one game is required" },
        { status: 400 }
      );
    }

    // Forward the request to the external API with the correct URL
    const apiUrl = EVENT_API.CREATE;
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
      cache: "no-store",
    });

    console.log(`Server API route: Create event response status: ${response.status}`);

    if (!response.ok) {
      // If the first attempt fails, try with a different URL format
      console.log("Server API route: First attempt failed, trying with alternative URL format");

      // Try with webhook instead of webhook-test as a fallback
      const alternativeUrl = "https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/create";
      console.log("Server API route: Trying alternative URL:", alternativeUrl);

      const alternativeResponse = await fetch(alternativeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
        cache: "no-store",
      });

      console.log(`Server API route: Alternative create event response status: ${alternativeResponse.status}`);

      if (!alternativeResponse.ok) {
        const errorText = await alternativeResponse.text();
        console.error("Server API route: Error response from alternative URL:", errorText);
        return NextResponse.json(
          { error: `Failed to create event. API returned status: ${alternativeResponse.status}` },
          { status: alternativeResponse.status }
        );
      }

      // Get the response data from the alternative URL
      const responseText = await alternativeResponse.text();
      console.log(`Server API route: Raw response from alternative URL: ${responseText}`);

      try {
        // Try to parse the response as JSON
        const responseData = JSON.parse(responseText);
        console.log("Server API route: Created event:", responseData);

        return NextResponse.json(responseData, { status: 201 });
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
    }

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Created event:", responseData);

      return NextResponse.json(responseData, { status: 201 });
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
    console.error("Server API route: Error creating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
