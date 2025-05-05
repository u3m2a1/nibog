import { format } from "date-fns";

// Define the event interface for creating events
export interface Event {
  id?: number;
  title: string;
  description: string;
  city_id: number;
  venue_id: number;
  event_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  games: EventGame[];
}

// Define the event game interface for creating events
export interface EventGame {
  game_id: number;
  custom_title?: string;
  custom_description?: string;
  custom_price?: number;
  start_time: string;
  end_time: string;
  slot_price: number;
  max_participants: number;
  created_at?: string;
  updated_at?: string;
}

// Define the event interface for fetching events
export interface EventListItem {
  event_id: number;
  event_title: string;
  event_description: string;
  event_date: string;
  event_status: string;
  event_created_at: string;
  event_updated_at: string;
  city_id: number;
  city_name: string;
  state: string;
  city_is_active: boolean;
  city_created_at: string;
  city_updated_at: string;
  venue_id: number;
  venue_name: string;
  venue_address: string;
  venue_capacity: number;
  venue_is_active: boolean;
  venue_created_at: string;
  venue_updated_at: string;
  games: EventGameListItem[];
}

// Define the event game interface for fetching events
export interface EventGameListItem {
  game_id: number;
  game_title: string;
  game_description: string;
  min_age: number;
  max_age: number;
  game_duration_minutes: number;
  categories: string[];
  custom_title: string;
  custom_description: string;
  custom_price: number;
  start_time: string;
  end_time: string;
  slot_price: number;
  max_participants: number;
}

/**
 * Create a new event
 * @param eventData The event data to create
 * @returns The created event
 */
export async function createEvent(eventData: Event): Promise<Event> {
  console.log("Creating event:", eventData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    console.log(`Create event response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Created event:", data);

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

/**
 * Format event data from the form to the API format
 * @param formData The form data
 * @returns The formatted event data for the API
 */
export function formatEventDataForAPI(formData: {
  title: string;
  description: string;
  venueId: string;
  date: string;
  status: string;
  games: Array<{
    templateId: string;
    customTitle?: string;
    customDescription?: string;
    customPrice?: number;
    slots: Array<{
      id: string;
      startTime: string;
      endTime: string;
      price: number;
      maxParticipants: number;
    }>;
  }>;
  cityId?: number;
}): Event {
  // Get current date and time for created_at and updated_at
  const now = new Date();
  const formattedNow = now.toISOString();

  // Format games data
  const formattedGames: EventGame[] = [];

  // Process each game and its slots
  formData.games.forEach(game => {
    game.slots.forEach(slot => {
      formattedGames.push({
        game_id: parseInt(game.templateId),
        custom_title: game.customTitle,
        custom_description: game.customDescription,
        custom_price: game.customPrice,
        start_time: slot.startTime + ":00", // Add seconds
        end_time: slot.endTime + ":00", // Add seconds
        slot_price: slot.price,
        max_participants: slot.maxParticipants,
        created_at: formattedNow,
        updated_at: formattedNow
      });
    });
  });

  // Create the formatted event data
  const formattedEvent: Event = {
    title: formData.title,
    description: formData.description,
    city_id: formData.cityId || 0, // This will need to be set correctly
    venue_id: parseInt(formData.venueId),
    event_date: formData.date,
    status: formData.status === "draft" ? "Draft" : "Published",
    created_at: formattedNow,
    updated_at: formattedNow,
    games: formattedGames
  };

  return formattedEvent;
}

/**
 * Get all events
 * @returns A list of all events
 */
export async function getAllEvents(): Promise<EventListItem[]> {
  console.log("Fetching all events");

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Get all events response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} events`);

    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

/**
 * Get an event by ID
 * @param id Event ID to retrieve
 * @returns Promise with the event data
 */
export async function getEventById(id: number): Promise<EventListItem> {
  console.log(`Fetching event with ID: ${id}`);

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    throw new Error("Invalid event ID. ID must be a positive number.");
  }

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(id) }),
    });

    console.log(`Get event response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Retrieved event:", data);

    // The API returns an array with a single event, so we need to extract it
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (!Array.isArray(data)) {
      return data;
    }

    throw new Error("Event not found");
  } catch (error) {
    console.error(`Error fetching event with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete an event by ID
 * @param id Event ID to delete
 * @returns Promise with success status
 */
export async function deleteEvent(id: number): Promise<{ success: boolean } | Array<{ success: boolean }>> {
  console.log(`Attempting to delete event with ID: ${id}`);

  // Ensure id is a number
  const numericId = Number(id);

  if (!numericId || isNaN(numericId) || numericId <= 0) {
    console.error(`Invalid event ID: ${id}, converted to: ${numericId}`);
    throw new Error("Invalid event ID. ID must be a positive number.");
  }

  try {
    // Use our internal API route to avoid CORS issues
    console.log(`Sending POST request to /api/events/delete with ID: ${numericId}`);
    const requestBody = { id: numericId };
    console.log(`Request body: ${JSON.stringify(requestBody)}`);

    const response = await fetch('/api/events/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Delete event response status: ${response.status}`);
    console.log(`Response headers: ${JSON.stringify(Object.fromEntries([...response.headers]))}`);
    console.log(`Response ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      try {
        // Try to parse the error response as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API returned error status: ${response.status}`);
      } catch (parseError) {
        // If parsing fails, throw a generic error
        throw new Error(`Failed to delete event. API returned status: ${response.status}`);
      }
    }

    // Try to parse the response
    try {
      const data = await response.json();
      console.log("Delete event response:", data);

      // If the response is an array with a success property, return it directly
      if (Array.isArray(data) && data[0]?.success === true) {
        return data;
      }

      // If the response has a success property, return it directly
      if (data && data.success === true) {
        return data;
      }

      // Default to success if we got a 200 response
      return { success: true };
    } catch (parseError) {
      console.error("Error parsing delete response:", parseError);
      // If we can't parse the response but got a 200 status, consider it a success
      return { success: true };
    }
  } catch (error) {
    console.error(`Error deleting event with ID ${id}:`, error);
    throw error;
  }
}
