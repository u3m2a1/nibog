import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://ai.alviongs.com/webhook/v1/nibog/events/participants-for-certificates?event_id=${eventId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n participants error:', errorText);
      throw new Error(`Failed to fetch participants: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Get participants error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
