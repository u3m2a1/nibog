import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promo_code_id } = body

    console.log('Promo code rollback API called with:', { promo_code_id })

    // Validate required fields
    if (!promo_code_id) {
      return NextResponse.json(
        { error: 'promo_code_id is required' },
        { status: 400 }
      )
    }

    // Call n8n webhook for rollback
    const n8nWebhookUrl = 'https://ai.alviongs.com/webhook/v1/nibog/promocode/rollback-usage'
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: parseInt(promo_code_id)
      }),
    })

    console.log('N8N rollback response status:', n8nResponse.status)

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('N8N rollback error:', errorText)
      return NextResponse.json(
        { error: 'Failed to rollback promo code usage' },
        { status: 500 }
      )
    }

    const rollbackResult = await n8nResponse.json()
    console.log('Rollback result from n8n:', rollbackResult)

    // Return the rollback result
    return NextResponse.json(rollbackResult)

  } catch (error) {
    console.error('Error in rollback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
