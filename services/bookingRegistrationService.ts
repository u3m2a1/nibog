// Booking registration service for handling booking API calls
import { BOOKING_API } from '@/config/api';

export interface BookingRegistrationData {
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
}

export interface BookingRegistrationResponse {
  booking_game_id: number;
  booking_id: number;
  child_id: number;
  game_id: number;
  game_price: string;
  attendance_status: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Register a booking
 * @param bookingData The booking data to register
 * @returns Promise with the booking registration response
 */
export async function registerBooking(bookingData: BookingRegistrationData): Promise<BookingRegistrationResponse[]> {
  console.log("Registering booking:", bookingData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/bookings/register', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    console.log(`Register booking response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      try {
        // Try to parse the error response as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API returned error status: ${response.status}`);
      } catch (parseError) {
        // If parsing fails, throw a generic error
        throw new Error(`Failed to register booking. API returned status: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log("Booking registration response:", data);

    return data;
  } catch (error) {
    console.error("Error registering booking:", error);
    throw error;
  }
}

/**
 * Format booking data from the form to the API format
 * @param formData The form data
 * @returns The formatted booking data for the API
 */
export function formatBookingDataForAPI(formData: {
  userId: number;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childDob: Date;
  schoolName: string;
  gender: string;
  eventId: number;
  gameId: number;
  gamePrice: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  termsAccepted: boolean;
}): BookingRegistrationData {
  // Format the date of birth to YYYY-MM-DD
  const dob = formData.childDob.toISOString().split('T')[0];

  // Create the formatted booking data
  const formattedBooking: BookingRegistrationData = {
    parent: {
      user_id: formData.userId,
      parent_name: formData.parentName,
      email: formData.email,
      additional_phone: formData.phone,
    },
    children: {
      full_name: formData.childName,
      date_of_birth: dob,
      school_name: formData.schoolName,
      gender: formData.gender,
    },
    booking: {
      user_id: formData.userId,
      event_id: formData.eventId,
      total_amount: formData.totalAmount,
      payment_method: formData.paymentMethod,
      payment_status: formData.paymentStatus,
      terms_accepted: formData.termsAccepted,
    },
    booking_games: {
      game_id: formData.gameId,
      child_index: 0, // Default to 0 for single child
      game_price: formData.gamePrice,
    },
  };

  return formattedBooking;
}
