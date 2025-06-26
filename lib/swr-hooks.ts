"use client"

import useSWR from 'swr'
import { EventListItem } from '@/types'
import { getAllEvents as fetchAllEvents } from '@/services/eventService'
import { getAllPayments as fetchAllPayments } from '@/services/paymentService'
import { fetchEventsWithGames } from '@/services/eventGameService'

// Global fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  
  // If the status code is not in the range 200-299, throw an error
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    throw error
  }
  
  return res.json()
}

// Transform API response to EventListItem format expected by UI
function transformEventsData(apiEvents: any[]): EventListItem[] {
  return apiEvents.map((event: any) => {
    // Calculate age range from games if available
    let minAgeMonths = 6; // default
    let maxAgeMonths = 84; // default
    let price = 799; // default
    let totalSpots = 20; // default
    let spotsLeft = 15; // default

    // Extract information from games if available
    if (event.games && event.games.length > 0) {
      const prices = event.games.map((game: any) => game.custom_price || game.slot_price || 799);
      price = Math.min(...prices); // Use lowest price

      const maxParticipants = event.games.map((game: any) => game.max_participants || 20);
      totalSpots = Math.max(...maxParticipants); // Use highest capacity
      spotsLeft = Math.floor(totalSpots * 0.75); // Assume 75% availability
    }

    // Format date and time
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const formattedTime = "9:00 AM - 8:00 PM"; // Default time range

    return {
      id: event.event_id?.toString() || Math.random().toString(),
      title: event.event_title || 'Baby Game Event',
      description: event.event_description || 'Fun baby games event',
      minAgeMonths,
      maxAgeMonths,
      date: formattedDate,
      time: formattedTime,
      venue: event.venue?.venue_name || 'Indoor Stadium',
      city: event.city?.city_name || 'Unknown City',
      price,
      image: '/images/baby-crawling.jpg', // Default image
      spotsLeft,
      totalSpots,
      isOlympics: true, // Default to Olympics event
    };
  });
}

/**
 * Hook to fetch all events with SWR caching and revalidation
 * @param initialData Optional initial data
 * @returns Events data and loading/error states
 */
export function useEvents(initialData?: EventListItem[]) {
  const { data, error, isLoading, mutate } = useSWR<EventListItem[]>(
    'api/events',
    // Use the comprehensive events API that includes games, cities, and venues
    async () => {
      try {
        const apiEvents = await fetchEventsWithGames();
        return transformEventsData(apiEvents);
      } catch (err) {
        console.error('Failed to fetch events with games, falling back to basic events:', err);
        // Fallback to basic events API if comprehensive API fails
        const basicEvents = await fetchAllEvents();
        // Transform basic events to expected format (they have different structure)
        return basicEvents.map((event: any) => ({
          id: event.event_id?.toString() || Math.random().toString(),
          title: event.event_title || 'Baby Game Event',
          description: event.event_description || 'Fun baby games event',
          minAgeMonths: 6,
          maxAgeMonths: 84,
          date: new Date(event.event_date).toISOString().split('T')[0],
          time: "9:00 AM - 8:00 PM",
          venue: event.venue_name || 'Indoor Stadium',
          city: event.city_name || 'Unknown City',
          price: 799,
          image: '/images/baby-crawling.jpg',
          spotsLeft: 15,
          totalSpots: 20,
          isOlympics: true,
        }));
      }
    },
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  return {
    events: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

/**
 * Hook to fetch all payments with SWR caching and revalidation
 */
export function usePayments() {
  const { data, error, isLoading, mutate } = useSWR(
    'api/payments',
    // Use the existing getAllPayments function to maintain compatibility
    () => fetchAllPayments(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  return {
    payments: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

/**
 * Generic hook to fetch data from any API endpoint with SWR
 * @param url API endpoint URL
 * @param options SWR options
 */
export function useApi<T>(url: string | null, options = {}) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      ...options,
    }
  )

  return {
    data,
    isLoading,
    isError: !!error,
    mutate,
  }
}
