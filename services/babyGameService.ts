import { BABY_GAME_API } from "@/config/api";

export interface BabyGame {
  id?: number;
  game_name: string;
  description?: string;
  game_description?: string; // For API request
  min_age?: number;
  min_age_months?: number; // For API request
  max_age?: number;
  max_age_months?: number; // For API request
  duration_minutes: number;
  categories: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new baby game
 * @param gameData The game data to create
 * @returns The created game
 */
export async function createBabyGame(gameData: BabyGame): Promise<BabyGame> {
  console.log("Creating baby game:", gameData);

  // Format the data for the API
  const apiData = {
    game_name: gameData.game_name,
    description: gameData.description || gameData.game_description, // Use description instead of game_description
    min_age: gameData.min_age || gameData.min_age_months, // Use min_age instead of min_age_months
    max_age: gameData.max_age || gameData.max_age_months, // Use max_age instead of max_age_months
    duration_minutes: gameData.duration_minutes,
    categories: gameData.categories,
    is_active: gameData.is_active
  };

  // Log the data to verify it's being sent correctly
  console.log("Original game data:", gameData);
  console.log("Formatted API data:", JSON.stringify(apiData, null, 2));

  try {
    const response = await fetch(BABY_GAME_API.CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });

    console.log(`Create baby game response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Created baby game:", data);

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error creating baby game:", error);
    throw error;
  }
}

/**
 * Get all baby games
 * @returns A list of all baby games
 */
export async function getAllBabyGames(): Promise<BabyGame[]> {
  console.log("🔄 [Service] Fetching all baby games...");

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`📡 [Service] Get all baby games response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Service] Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ [Service] Retrieved ${Array.isArray(data) ? data.length : 'non-array'} baby games:`, data);

    // Ensure we return an array
    if (!Array.isArray(data)) {
      console.warn(`⚠️ [Service] Expected array but got:`, typeof data, data);
      return [];
    }

    return data;
  } catch (error) {
    console.error("💥 [Service] Error fetching baby games:", error);
    throw error;
  }
}

/**
 * Get a baby game by ID
 * @param id The ID of the baby game to get
 * @returns The baby game with the specified ID
 */
export async function getBabyGameById(id: number): Promise<BabyGame> {
  console.log(`🔄 [Service] Fetching baby game with ID: ${id}`);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log(`📡 [Service] Get baby game response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Service] Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ [Service] Retrieved baby game:", data);

    // Return the first item if it's an array, otherwise return the data
    const gameData = Array.isArray(data) ? data[0] : data;

    if (!gameData) {
      throw new Error("No game data found");
    }

    return gameData;
  } catch (error) {
    console.error(`💥 [Service] Error fetching baby game with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Update a baby game
 * @param gameData The game data to update
 * @returns The updated game
 */
export async function updateBabyGame(gameData: BabyGame): Promise<BabyGame> {
  console.log("Updating baby game:", gameData);

  if (!gameData.id) {
    throw new Error("Game ID is required for update");
  }

  // Format the data for the API
  const apiData = {
    id: gameData.id,
    game_name: gameData.game_name,
    description: gameData.description || gameData.game_description,
    min_age: gameData.min_age || gameData.min_age_months,
    max_age: gameData.max_age || gameData.max_age_months,
    duration_minutes: gameData.duration_minutes,
    categories: gameData.categories,
    is_active: gameData.is_active
  };

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/update', {
      method: "POST", // Changed from PUT to POST as per API documentation
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });

    console.log(`Update baby game response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Updated baby game:", data);

    // Return the first item if it's an array, otherwise return the data
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error updating baby game:", error);
    throw error;
  }
}

/**
 * Delete a baby game
 * @param id The ID of the baby game to delete
 * @returns A success indicator
 */
export async function deleteBabyGame(id: number): Promise<{ success: boolean }> {
  console.log(`Deleting baby game with ID: ${id}`);

  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    throw new Error("Invalid game ID. ID must be a positive number.");
  }

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/babygames/delete', {
      method: "POST", // Changed from DELETE to POST as per API documentation
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(id) }),
    });

    console.log(`Delete baby game response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      try {
        // Try to parse the error response as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API returned error status: ${response.status}`);
      } catch (parseError) {
        // If parsing fails, throw a generic error
        throw new Error(`Failed to delete game. API returned status: ${response.status}`);
      }
    }

    // Try to parse the response
    try {
      const data = await response.json();
      console.log("Delete baby game response:", data);

      // Check if the response indicates success
      if (data && (data.success === true || (Array.isArray(data) && data[0]?.success === true))) {
        return { success: true };
      }

      return { success: true }; // Default to success if we got a 200 response
    } catch (parseError) {
      console.error("Error parsing delete response:", parseError);
      // If we can't parse the response but got a 200 status, consider it a success
      return { success: true };
    }
  } catch (error) {
    console.error(`Error deleting baby game with ID ${id}:`, error);
    throw error;
  }
}
