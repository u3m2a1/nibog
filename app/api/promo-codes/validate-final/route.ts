import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promo_code, event_id, game_ids, amount } = body

    console.log('Promo code final validation API called with:', { promo_code, event_id, game_ids, amount })

    // Validate required fields
    if (!promo_code || !event_id || !game_ids || !Array.isArray(game_ids) || game_ids.length === 0 || !amount) {
      return NextResponse.json(
        { error: 'promo_code, event_id, game_ids array, and amount are required' },
        { status: 400 }
      )
    }

    // Call n8n webhook for final validation (with usage increment)
    const n8nWebhookUrl = 'https://ai.alviongs.com/webhook/v1/nibog/promocode/validate'
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promo_code: promo_code.trim(),
        event_id: parseInt(event_id),
        game_ids: game_ids.map((id: any) => parseInt(id)),
        total_amount: parseFloat(amount)
      }),
    })

    console.log('N8N final validation response status:', n8nResponse.status)

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N final validation error:', errorText)
      return NextResponse.json(
        { error: 'Failed to validate promo code' },
        { status: 400 }
      )
    }

    const validationResult = await n8nResponse.json()
    console.log('Final validation result from n8n:', validationResult)

    // Return the validation result
    return NextResponse.json(validationResult)

  } catch (error) {
    console.error('Error in final validation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
