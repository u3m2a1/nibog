import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("Server API route: Starting promo code creation request");

    // Parse the request body
    const requestData = await request.json();
    console.log("Server API route: Received request body:", JSON.stringify(requestData, null, 2));

    // Validate required fields
    const requiredFields = ['promo_code', 'type', 'value', 'valid_from', 'valid_to', 'usage_limit', 'minimum_purchase_amount'];
    const missingFields = requiredFields.filter(field => !requestData[field]);

    if (missingFields.length > 0) {
      console.error("Server API route: Missing required fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate date formats
    try {
      new Date(requestData.valid_from).toISOString();
      new Date(requestData.valid_to).toISOString();
    } catch (dateError) {
      console.error("Server API route: Invalid date format:", dateError);
      return NextResponse.json(
        { error: "Invalid date format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)" },
        { status: 400 }
      );
    }

    // Prepare the payload for the external API
    // Note: The external API might auto-generate the ID, so we don't include it in creation
    const payload = {
      promo_code: requestData.promo_code,
      type: requestData.type,
      value: requestData.value,
      valid_from: requestData.valid_from,
      valid_to: requestData.valid_to,
      usage_limit: requestData.usage_limit,
      minimum_purchase_amount: requestData.minimum_purchase_amount,
      maximum_discount_amount: requestData.maximum_discount_amount || null,
      description: requestData.description || "",
      events: requestData.events || []
    };

    console.log("Server API route: Prepared payload:", JSON.stringify(payload, null, 2));

    // Validate payload structure
    if (!payload.events || payload.events.length === 0) {
      console.warn("Server API route: No events provided in payload");
    } else {
      payload.events.forEach((event, index) => {
        console.log(`Server API route: Event ${index + 1}: ID=${event.id}, Games=[${event.games_id.join(', ')}]`);
      });
    }

    // Call the external API
    const apiUrl = "https://ai.alviongs.com/webhook/v1/nibog/promocode/create";
    console.log("Server API route: Calling API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`Server API route: Promo code creation response status: ${response.status}`);

    // Get the response data
    const responseText = await response.text();
    console.log(`Server API route: Raw response: ${responseText}`);

    if (!response.ok) {
      console.error(`Server API route: Error response: ${responseText}`);
      return NextResponse.json(
        { 
          error: `API returned error status: ${response.status}`,
          details: responseText 
        },
        { status: response.status }
      );
    }

    try {
      // Try to parse the response as JSON
      const responseData = JSON.parse(responseText);
      console.log("Server API route: Promo code creation response:", responseData);

      return NextResponse.json({
        success: true,
        message: "Promo code created successfully",
        data: responseData
      }, { status: 200 });

    } catch (parseError) {
      console.error("Server API route: Error parsing response:", parseError);
      
      // If parsing fails but status is OK, consider it a success
      if (response.status >= 200 && response.status < 300) {
        return NextResponse.json({
          success: true,
          message: "Promo code created successfully",
          data: { raw_response: responseText }
        }, { status: 200 });
      }

      return NextResponse.json(
        {
          error: "Failed to parse API response",
          rawResponse: responseText.substring(0, 500)
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Server API route: Error creating promo code:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to create promo code",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
