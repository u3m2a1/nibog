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
    console.log("Fetching all bookings...");

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
      console.log(`Get all bookings response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`API returned error status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Retrieved ${data.length} bookings`);

      if (!Array.isArray(data)) {
        console.warn("API did not return an array for bookings:", data);
        return [];
      }

      return data;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("Fetch request timed out");
        throw new Error("Request timed out. The server took too long to respond.");
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
}

/**
 * Update booking status
 * @param bookingId Booking ID
 * @param status New status
 * @returns Promise with updated booking data
 */
export async function updateBookingStatus(bookingId: number, status: string): Promise<Booking> {
  try {
    console.log(`Updating booking ${bookingId} status to ${status}`);

    // For now, just simulate the API call
    // In a real implementation, you would call the API to update the booking status
    return {
      booking_id: bookingId,
      booking_status: status,
      // Add other required fields with placeholder values
      booking_ref: "",
      total_amount: "",
      payment_method: "",
      payment_status: "",
      terms_accepted: false,
      booking_is_active: true,
      booking_created_at: new Date().toISOString(),
      booking_updated_at: new Date().toISOString(),
      cancelled_at: null,
      completed_at: null,
      parent_id: 0,
      parent_name: "",
      parent_email: "",
      parent_additional_phone: "",
      parent_is_active: true,
      parent_created_at: "",
      parent_updated_at: "",
      child_id: 0,
      child_full_name: "",
      child_date_of_birth: "",
      child_school_name: "",
      child_gender: "",
      child_is_active: true,
      child_created_at: "",
      child_updated_at: "",
      game_name: "",
      game_description: "",
      game_min_age: 0,
      game_max_age: 0,
      game_duration_minutes: 0,
      game_categories: [],
      game_is_active: true,
      game_created_at: "",
      game_updated_at: "",
      event_title: "",
      event_description: "",
      event_event_date: "",
      event_status: "",
      event_created_at: "",
      event_updated_at: "",
      user_full_name: "",
      user_email: "",
      user_phone: "",
      user_city_id: 0,
      user_accepted_terms: false,
      user_terms_accepted_at: null,
      user_is_active: true,
      user_is_locked: false,
      user_locked_until: null,
      user_deactivated_at: null,
      user_created_at: "",
      user_updated_at: "",
      user_last_login_at: null,
      city_name: "",
      city_state: "",
      city_is_active: true,
      city_created_at: "",
      city_updated_at: "",
      venue_name: "",
      venue_address: "",
      venue_capacity: 0,
      venue_is_active: true,
      venue_created_at: "",
      venue_updated_at: ""
    };
  } catch (error: any) {
    console.error(`Error updating booking ${bookingId} status:`, error);
    throw error;
  }
}
