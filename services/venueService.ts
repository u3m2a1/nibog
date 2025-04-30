import { VENUE_API } from "@/config/api";

export interface Venue {
  id?: number;
  venue_name: string;
  city_id: number;
  address: string;
  capacity: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all venues
 * @returns Promise with array of venues
 */
export const getAllVenues = async (): Promise<Venue[]> => {
  try {
    console.log("Fetching all venues...");

    const response = await fetch(VENUE_API.GET_ALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Get all venues response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Error fetching venues: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} venues from API`);

    if (!Array.isArray(data)) {
      console.warn("API did not return an array for venues:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching venues:", error);
    throw error;
  }
};

/**
 * Get venue by ID
 * @param id Venue ID
 * @returns Promise with venue data
 */
export const getVenueById = async (id: number): Promise<Venue> => {
  try {
    if (!id || isNaN(id) || id <= 0) {
      throw new Error(`Invalid venue ID: ${id}. ID must be a positive number.`);
    }

    console.log(`Fetching venue with ID: ${id}`);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log(`Get venue response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error fetching venue: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Venue data retrieved:", data);

    // The API route already handles the array vs object response format
    return data;
  } catch (error) {
    console.error(`Error fetching venue with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new venue
 * @param venueData Venue data to create
 * @returns Promise with created venue data
 */
export const createVenue = async (venueData: Omit<Venue, "id" | "created_at" | "updated_at">): Promise<Venue> => {
  try {
    console.log("Creating venue with data:", venueData);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(venueData),
    });

    console.log(`Create venue response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error creating venue: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Venue created successfully:", data);

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }

    throw new Error("Failed to create venue: Invalid response format");
  } catch (error) {
    console.error("Error creating venue:", error);
    throw error;
  }
};

/**
 * Update an existing venue
 * @param venueData Venue data to update
 * @returns Promise with updated venue data
 */
export const updateVenue = async (venueData: Venue): Promise<Venue> => {
  try {
    if (!venueData || !venueData.id || isNaN(Number(venueData.id)) || Number(venueData.id) <= 0) {
      throw new Error(`Invalid venue data: Missing or invalid ID. ID must be a positive number.`);
    }

    console.log("Updating venue with data:", venueData);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/update', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(venueData),
    });

    console.log(`Update venue response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error updating venue: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Venue updated successfully:", data);

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }

    throw new Error("Failed to update venue: Invalid response format");
  } catch (error) {
    console.error("Error updating venue:", error);
    throw error;
  }
};

/**
 * Delete a venue by ID
 * @param id Venue ID to delete
 * @returns Promise with success status
 */
export const deleteVenue = async (id: number): Promise<{ success: boolean }> => {
  try {
    console.log(`Attempting to delete venue with ID: ${id}`);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/delete', {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log(`Delete venue response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error deleting venue: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Venue deleted successfully:", data);

    if (Array.isArray(data) && data.length > 0 && data[0].success) {
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    console.error(`Error deleting venue with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get venues by city ID
 * @param cityId City ID
 * @returns Promise with array of venues
 */
export const getVenuesByCity = async (cityId: number): Promise<Venue[]> => {
  try {
    if (!cityId || isNaN(cityId) || cityId <= 0) {
      throw new Error(`Invalid city ID: ${cityId}. ID must be a positive number.`);
    }

    console.log(`Fetching venues for city ID: ${cityId}`);

    // Use our internal API route to avoid CORS issues
    // Use POST method with request body as specified in the API documentation
    const response = await fetch('/api/venues/get-by-city', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ city_id: cityId }),
    });

    console.log(`Get venues by city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error fetching venues by city: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} venues for city ID ${cityId}`);

    if (!Array.isArray(data)) {
      console.warn("API did not return an array for venues by city:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error(`Error fetching venues for city ID ${cityId}:`, error);
    throw error;
  }
};

/**
 * Get all venues with city details
 * @returns Promise with array of venues with city details
 */
export const getAllVenuesWithCity = async (): Promise<any[]> => {
  try {
    console.log("Fetching all venues with city details...");

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/venues/getall-with-city', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Get all venues with city response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Error fetching venues with city: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If we can't parse the error as JSON, use the status code
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} venues with city details from API`);

    if (!Array.isArray(data)) {
      console.warn("API did not return an array for venues with city:", data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching venues with city:", error);
    throw error;
  }
};
