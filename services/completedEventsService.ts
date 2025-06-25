export interface CompletedEvent {
  event_id: number
  event_name: string
  city_name: string
  venue_name: string
  event_date: string
  games: Array<{
    id: number
    name: string
  }>
  registrations: string
  attendance_count: string
  attendance_percentage: string
  revenue: string
}

export const fetchCompletedEvents = async (): Promise<CompletedEvent[]> => {
  try {
    const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/complete/event')
    
    if (!response.ok) {
      throw new Error('Failed to fetch completed events')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching completed events:', error)
    throw error
  }
}