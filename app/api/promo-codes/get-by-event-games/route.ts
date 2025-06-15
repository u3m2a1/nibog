import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, game_ids } = body

    console.log('Get promo codes by event-games API called with:', { event_id, game_ids })

    // Validate required fields
    if (!event_id || !game_ids || !Array.isArray(game_ids) || game_ids.length === 0) {
      return NextResponse.json(
        { error: 'event_id and game_ids array are required' },
        { status: 400 }
      )
    }

    // Call n8n webhook for get-by-event-games
    const n8nWebhookUrl = 'https://ai.alviongs.com/webhook/v1/nibog/promocode/get-by-event-games'
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_id: parseInt(event_id),
        game_ids: game_ids.map((id: any) => parseInt(id))
      }),
    })

    console.log('N8N response status:', n8nResponse.status)

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch promo codes from n8n' },
        { status: 500 }
      )
    }

    const promoCodesData = await n8nResponse.json()
    console.log('Promo codes data from n8n:', promoCodesData)

    // Return the promo codes data
    return NextResponse.json(promoCodesData)

  } catch (error) {
    console.error('Error in get-by-event-games API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
