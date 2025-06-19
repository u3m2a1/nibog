"use client"

import useSWR from 'swr'
import { EventListItem } from '@/types'
import { getAllEvents as fetchAllEvents } from '@/services/eventService'
import { getAllPayments as fetchAllPayments } from '@/services/paymentService'

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

/**
 * Hook to fetch all events with SWR caching and revalidation
 * @param initialData Optional initial data
 * @returns Events data and loading/error states
 */
export function useEvents(initialData?: EventListItem[]) {
  const { data, error, isLoading, mutate } = useSWR<EventListItem[]>(
    'api/events', 
    // Use the existing getAllEvents function to maintain compatibility
    () => fetchAllEvents(),
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
