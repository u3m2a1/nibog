import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promo_code, event_id, game_ids, amount } = body

    console.log('Promo code preview validation API called with:', { promo_code, event_id, game_ids, amount })

    // Validate required fields
    if (!promo_code || !event_id || !game_ids || !Array.isArray(game_ids) || game_ids.length === 0 || !amount) {
      return NextResponse.json(
        { error: 'promo_code, event_id, game_ids array, and amount are required' },
        { status: 400 }
      )
    }

    // Call n8n webhook for preview validation
    const n8nWebhookUrl = 'https://ai.alviongs.com/webhook/v1/nibog/promocode/preview-validation'
    
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

    console.log('N8N preview validation response status:', n8nResponse.status)

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N preview validation error:', errorText)
      return NextResponse.json(
        { 
          is_valid: false,
          discount_amount: 0,
          final_amount: parseFloat(amount),
          message: 'Failed to validate promo code'
        },
        { status: 200 }
      )
    }

    const validationResult = await n8nResponse.json()
    console.log('Preview validation result from n8n:', validationResult)

    // Return the validation result
    return NextResponse.json(validationResult)

  } catch (error) {
    console.error('Error in preview validation API:', error)
    return NextResponse.json(
      { 
        is_valid: false,
        discount_amount: 0,
        final_amount: parseFloat(request.body?.amount || 0),
        message: 'Internal server error'
      },
      { status: 200 }
    )
  }
}
