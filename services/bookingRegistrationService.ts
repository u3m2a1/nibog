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
  console.log("=== BOOKING REGISTRATION (TEST MODE) ===");
  console.log("Booking data to be registered:", JSON.stringify(bookingData, null, 2));
  console.log("=== SKIPPING API CALL FOR PHONEPE TESTING ===");

  // Generate a mock booking ID for testing
  const mockBookingId = Math.floor(Math.random() * 10000) + 1000;

  console.log(`Generated mock booking ID: ${mockBookingId}`);

  // Return mock response data to simulate successful booking creation
  const mockResponse: BookingRegistrationResponse[] = [
    {
      booking_game_id: Math.floor(Math.random() * 10000) + 1000,
      booking_id: mockBookingId,
      child_id: Math.floor(Math.random() * 10000) + 1000,
      game_id: bookingData.booking_games.game_id,
      game_price: bookingData.booking_games.game_price.toString(),
      attendance_status: "registered",
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  console.log("Mock booking registration response:", JSON.stringify(mockResponse, null, 2));
  console.log("=== PROCEEDING TO PHONEPE PAYMENT INITIATION ===");

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return mockResponse;
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
