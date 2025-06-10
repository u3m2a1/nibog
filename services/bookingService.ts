// Booking service for handling booking-related API calls

export interface Booking {
  booking_id: number;
  booking_ref: string;
  booking_status: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  terms_accepted: boolean;
  booking_is_active: boolean;
  booking_created_at: string;
  booking_updated_at: string;
  cancelled_at: string | null;
  completed_at: string | null;
  parent_id: number;
  parent_name: string;
  parent_email: string;
  parent_additional_phone: string;
  parent_is_active: boolean;
  parent_created_at: string;
  parent_updated_at: string;
  child_id: number;
  child_full_name: string;
  child_date_of_birth: string;
  child_school_name: string;
  child_gender: string;
  child_is_active: boolean;
  child_created_at: string;
  child_updated_at: string;
  game_name: string;
  game_description: string;
  game_min_age: number;
  game_max_age: number;
  game_duration_minutes: number;
  game_categories: string[];
  game_is_active: boolean;
  game_created_at: string;
  game_updated_at: string;
  event_title: string;
  event_description: string;
  event_event_date: string;
  event_status: string;
  event_created_at: string;
  event_updated_at: string;
  user_full_name: string;
  user_email: string;
  user_phone: string;
  user_city_id: number;
  user_accepted_terms: boolean;
  user_terms_accepted_at: string | null;
  user_is_active: boolean;
  user_is_locked: boolean;
  user_locked_until: string | null;
  user_deactivated_at: string | null;
  user_created_at: string;
  user_updated_at: string;
  user_last_login_at: string | null;
  city_name: string;
  city_state: string;
  city_is_active: boolean;
  city_created_at: string;
  city_updated_at: string;
  venue_name: string;
  venue_address: string;
  venue_capacity: number;
  venue_is_active: boolean;
  venue_created_at: string;
  venue_updated_at: string;
}

/**
 * Get all bookings with error handling and timeout
 * @returns Promise with array of bookings
 */
export async function getAllBookings(): Promise<Booking[]> {
  try {
    // Use our internal API route to avoid CORS issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('/api/bookings/get-all', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return [];
      }

      return data;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error("Request timed out. The server took too long to respond.");
      }
      throw fetchError;
    }
  } catch (error: any) {
    throw error;
  }
}

/**
 * Update booking status
 * @param bookingId Booking ID
 * @param status New status
 * @returns Promise with updated booking data
 */
export async function updateBookingStatus(bookingId: number, status: string): Promise<any> {
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/bookings/update-status', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
        status,
        transactionId: `TXN_${Date.now()}` // Generate a transaction ID
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Get booking by ID
 * @param bookingId Booking ID
 * @returns Promise with booking data
 */
export async function getBookingById(bookingId: string | number): Promise<Booking> {
  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    // Use our internal API route to avoid CORS issues
    const response = await fetch(`/api/bookings/get/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If it's a 404, the booking doesn't exist
      if (response.status === 404) {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }

      // For other errors, throw immediately without fallback to prevent loops
      throw new Error(`Failed to fetch booking: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Handle timeout errors
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - the booking service is taking too long to respond');
    }

    // Re-throw the error without fallback to prevent infinite loops
    throw error;
  }
}

/**
 * Create a new booking
 * @param bookingData The booking data to create
 * @returns Promise with the created booking data
 */
export async function createBooking(bookingData: {
  parent: {
    user_id: number;
    parent_name: string;
    email: string;
    additional_phone: string;
  };
  children: {
    full_name: string;
    date_of_birth: string;
    school_name: string;
    gender: string;
  };
  booking: {
    user_id: number;
    event_id: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    terms_accepted: boolean;
  };
  booking_games: {
    game_id: number;
    child_index: number;
    game_price: number;
  };
}): Promise<any> {
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/bookings/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
}


