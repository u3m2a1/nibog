// Event service for managing events

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
  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
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
 * Get a single event with complete games/slots information by ID
 * @param id The event ID
 * @returns The event data with games and slots
 */
export async function getEventWithGames(id: string | number): Promise<any> {
  console.log(`Getting event with games for ID: ${id}`);

  if (!id || (typeof id === 'string' && id.trim() === '')) {
    throw new Error("Event ID is required");
  }

  try {
    // Use our internal API route to get event with complete games information
    // Add cache busting to ensure fresh data
    const response = await fetch('/api/events/get-with-games', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(id) }),
      cache: "no-store", // Disable caching to get fresh data
    });

    console.log(`Get event with games response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Retrieved event with games:", data);

    return data;
  } catch (error) {
    console.error("Error getting event with games:", error);
    throw error;
  }
}

/**
 * Create a new event game slot
 * @param slotData The slot data to create
 * @returns Promise with the created slot data
 */
export async function createEventGameSlot(slotData: {
  event_id: number;
  game_id: number;
  custom_title?: string;
  custom_description?: string;
  custom_price?: number;
  start_time: string;
  end_time: string;
  slot_price?: number;
  max_participants: number;
}): Promise<any> {
  console.log(`Creating event game slot:`, slotData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/event-game-slots/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    });

    console.log(`Create event game slot response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Created event game slot:", data);

    return data;
  } catch (error) {
    console.error("Error creating event game slot:", error);
    throw error;
  }
}

/**
 * Update an existing event game slot
 * @param slotData The slot data to update
 * @returns Promise with the updated slot data
 */
export async function updateEventGameSlot(slotData: {
  id: number;
  event_id: number;
  game_id: number;
  custom_title?: string;
  custom_description?: string;
  custom_price?: number;
  start_time: string;
  end_time: string;
  slot_price?: number;
  max_participants: number;
  status?: string;
}): Promise<any> {
  console.log(`Updating event game slot:`, slotData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/event-game-slots/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    });

    console.log(`Update event game slot response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Updated event game slot:", data);

    return data;
  } catch (error) {
    console.error("Error updating event game slot:", error);
    throw error;
  }
}

/**
 * Delete an event game slot
 * @param id The slot ID to delete
 * @returns Promise with the deletion result
 */
export async function deleteEventGameSlot(id: number): Promise<any> {
  console.log(`Deleting event game slot with ID: ${id}`);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/event-game-slots/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log(`Delete event game slot response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Deleted event game slot:", data);

    return data;
  } catch (error) {
    console.error("Error deleting event game slot:", error);
    throw error;
  }
}

/**
 * Get slot status
 * @param slotId The slot ID to get status for
 * @returns Promise with the slot status
 */
export async function getSlotStatus(slotId: string): Promise<string> {
  console.log(`Getting status for slot: ${slotId}`);

  try {
    const response = await fetch(`/api/event-game-slots/status?slotId=${slotId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`Failed to get slot status, defaulting to active`);
      return 'active';
    }

    const data = await response.json();
    return data.status || 'active';
  } catch (error) {
    console.error("Error getting slot status:", error);
    return 'active'; // Default to active on error
  }
}

/**
 * Update slot status
 * @param slotId The slot ID to update
 * @param status The new status
 * @returns Promise with the update result
 */
export async function updateSlotStatus(slotId: string, status: string): Promise<any> {
  console.log(`Updating slot ${slotId} status to: ${status}`);

  try {
    const response = await fetch('/api/event-game-slots/status', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slotId, status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Slot status updated:", data);

    return data;
  } catch (error) {
    console.error("Error updating slot status:", error);
    throw error;
  }
}

/**
 * Get all slot statuses for an event
 * @returns Promise with all slot statuses
 */
export async function getAllSlotStatuses(): Promise<Record<string, string>> {
  console.log("Getting all slot statuses");

  try {
    const response = await fetch('/api/event-game-slots/status', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Failed to get slot statuses, returning empty object");
      return {};
    }

    const data = await response.json();
    return data || {};
  } catch (error) {
    console.error("Error getting slot statuses:", error);
    return {}; // Return empty object on error
  }
}

/**
 * Update an existing event
 * @param eventData The event data to update
 * @returns Promise with the updated event or success status
 */
export async function updateEvent(eventData: Event): Promise<Event | { success: boolean }> {
  console.log("Updating event:", eventData);

  // Ensure the event has an ID
  if (!eventData.id) {
    console.error("Cannot update event without an ID");
    throw new Error("Event ID is required for updates");
  }

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/events/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    console.log(`Update event response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Updated event response:", data);

    // The API might return a success object or the updated event
    if (Array.isArray(data) && data[0]?.success === true) {
      return { success: true };
    } else if (data?.success === true) {
      return { success: true };
    }

    // If it's the updated event data, return it
    return eventData;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

/**
 * Format event data for updating
 * @param eventId The event ID to update
 * @param formData The form data
 * @returns The formatted event data for the API
 */
export function formatEventDataForUpdate(
  eventId: number,
  formData: {
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
  }
): Event {
  // Get current date and time for updated_at
  const now = new Date();
  const formattedNow = now.toISOString();

  // Format games data
  const formattedGames: EventGame[] = [];

  // Process each game and its slots
  formData.games.forEach(game => {
    game.slots.forEach(slot => {
      formattedGames.push({
        game_id: parseInt(game.templateId),
        custom_title: game.customTitle || "",
        custom_description: game.customDescription || "",
        custom_price: typeof game.customPrice === 'number' ? game.customPrice : 0,
        start_time: slot.startTime + ":00", // Add seconds
        end_time: slot.endTime + ":00", // Add seconds
        slot_price: typeof slot.price === 'number' ? slot.price : 0,
        max_participants: typeof slot.maxParticipants === 'number' ? slot.maxParticipants : 10,
        updated_at: formattedNow
      });
    });
  });

  // Create the formatted event data
  const formattedEvent: Event = {
    id: eventId,
    title: formData.title,
    description: formData.description,
    city_id: formData.cityId || 0,
    venue_id: parseInt(formData.venueId),
    event_date: formData.date,
    status: formData.status === "draft" ? "Draft" : "Published",
    updated_at: formattedNow,
    games: formattedGames
  };

  return formattedEvent;
}

/**
 * Get upcoming events by city ID
 * @param cityId City ID to retrieve events for
 * @returns Promise with array of upcoming events for the specified city
 */
export async function getEventsByCityId(cityId: number): Promise<EventListItem[]> {
  if (!cityId || isNaN(Number(cityId)) || Number(cityId) <= 0) {
    throw new Error("Invalid city ID. ID must be a positive number.");
  }

  try {
    console.log(`Fetching upcoming events for city ID: ${cityId}`);
    
    // Use the upcoming events API endpoint
    const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/events/upcoming-events-by-cityid', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city_id: Number(cityId) }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from upcoming events API:', errorText);
      throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    }

    const events = await response.json();
    
    if (!Array.isArray(events)) {
      console.error('Unexpected API response format:', events);
      throw new Error('Invalid response format: expected an array of events');
    }

    console.log(`Found ${events.length} upcoming events for city ${cityId}`);
    
    // Convert the raw API response to match the expected EventListItem format
    const formattedEvents: EventListItem[] = events.map((event: any) => ({
      event_id: event.id,
      event_title: event.title,
      event_description: event.description || '',
      event_date: event.event_date,
      event_status: event.status || 'Published',
      event_created_at: event.created_at || new Date().toISOString(),
      event_updated_at: event.updated_at || new Date().toISOString(),
      city_id: event.city_id,
      city_name: '', // Will be filled in if needed by UI
      state: '',
      city_is_active: true,
      city_created_at: new Date().toISOString(),
      city_updated_at: new Date().toISOString(),
      venue_id: event.venue_id || 0,
      venue_name: '', // Will be filled in if needed by UI
      venue_address: '',
      venue_capacity: 0,
      venue_is_active: true,
      venue_created_at: new Date().toISOString(),
      venue_updated_at: new Date().toISOString(),
      games: [] // Initialize with empty games array, will be populated separately if needed
    }));

    return formattedEvents;
  } catch (error) {
    console.error('Error in getEventsByCityId:', error);
    throw error;
  }
}

/**
 * Get games by child's age and event ID
 * @param eventId The event ID to fetch games for
 * @param childAge The child's age in months
 * @returns Promise with array of games suitable for the child's age in the specified event
 */
export async function getGamesByAgeAndEvent(eventId: number, childAge: number): Promise<any[]> {
  if (!eventId || isNaN(Number(eventId)) || Number(eventId) <= 0) {
    throw new Error("Invalid event ID. ID must be a positive number.");
  }

  if (childAge === null || childAge === undefined || isNaN(Number(childAge)) || Number(childAge) < 0) {
    throw new Error("Invalid child age. Age must be a non-negative number.");
  }

  try {
    console.log(`Fetching games for event ID: ${eventId} and child age: ${childAge} months`);
    
    // Use the games by age and event API endpoint
    const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/events/get-games-by-ageandevent', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        event_id: Number(eventId),
        child_age: Number(childAge)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from games API:', errorText);
      throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
    }

    const games = await response.json();
    
    if (!Array.isArray(games)) {
      console.error('Unexpected API response format:', games);
      throw new Error('Invalid response format: expected an array of games');
    }

    console.log(`Found ${games.length} games for event ${eventId} and age ${childAge} months`);
    return games;
  } catch (error) {
    console.error('Error in getGamesByAgeAndEvent:', error);
    throw error;
  }
}

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
