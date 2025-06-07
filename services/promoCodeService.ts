// Promo Code service for handling promo code API calls

export interface PromoCodeEvent {
  id: number;
  games_id: number[];
}

export interface CreatePromoCodeRequest {
  promo_code: string;
  type: "percentage" | "fixed";
  value: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number;
  minimum_purchase_amount: number;
  maximum_discount_amount?: number;
  description?: string;
  events: PromoCodeEvent[];
}

export interface CreatePromoCodeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface UpdatePromoCodeRequest {
  id: number;
  promo_code: string;
  type: "percentage" | "fixed";
  value: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number;
  usage_count?: number;
  minimum_purchase_amount: number;
  maximum_discount_amount?: number;
  description?: string;
  applicable_events: number[];
  applicable_games: number[];
}

export interface UpdatePromoCodeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface DeletePromoCodeResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface PromoCodeDetail {
  id: number;
  promo_code: string;
  type: "percentage" | "fixed";
  value: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number;
  usage_count: number;
  minimum_purchase_amount: number;
  maximum_discount_amount?: number;
  description?: string;
  created_at: string;
  updated_at: string;
  promo_data?: {
    events: Array<{
      event_id: number;
      event_title: string;
      games: Array<{
        game_id: number;
        game_title: string;
      }>;
    }>;
    games: Array<{
      game_id: number;
      game_title: string;
    }>;
    promo_details: {
      id: number;
      promo_code: string;
      type: string;
      value: number;
      valid_from: string;
      valid_to: string;
      usage_limit: number;
      usage_count: number;
      minimum_purchase_amount: number;
      maximum_discount_amount?: number;
      description?: string;
    };
  };
}

/**
 * Create a new promo code
 * @param promoCodeData The promo code data to create
 * @returns Promise with the creation response
 */
export async function createPromoCode(promoCodeData: CreatePromoCodeRequest): Promise<CreatePromoCodeResponse> {
  console.log("Creating promo code:", promoCodeData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/promo-codes/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promoCodeData),
    });

    console.log(`Create promo code response status: ${response.status}`);

    let data;
    try {
      data = await response.json();
      console.log("Promo code creation response:", data);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      throw new Error(`Invalid response from server. Status: ${response.status}`);
    }

    // Check if the response indicates success
    if (response.ok || data.success) {
      return data;
    }

    // If we get here, there was an error
    const errorMessage = data.error || data.message || `API returned error status: ${response.status}`;
    throw new Error(errorMessage);
  } catch (error: any) {
    console.error("Error creating promo code:", error);
    throw error;
  }
}

/**
 * Transform form data to API format
 * @param formData Form data from the UI
 * @param selectedEvents Selected event IDs
 * @param selectedGames Selected game IDs in format "eventId-gameId"
 * @param applyToAll Whether to apply to all events
 * @returns Transformed data for API
 */
export function transformFormDataToAPI(
  formData: {
    code: string;
    discount: string;
    discountType: string;
    maxDiscount: string;
    minPurchase: string;
    validFrom: string;
    validTo: string;
    usageLimit: string;
    description: string;
  },
  selectedEvents: string[],
  selectedGames: string[],
  applyToAll: boolean,
  allEvents: Array<{id: string, name: string, games: Array<{id: string, name: string}>}>
): CreatePromoCodeRequest {
  
  // Transform dates to ISO format
  const validFromISO = new Date(formData.validFrom + 'T00:00:00Z').toISOString();
  const validToISO = new Date(formData.validTo + 'T23:59:59Z').toISOString();

  // Prepare events array
  let events: PromoCodeEvent[] = [];

  if (applyToAll) {
    // If apply to all, include all events with all their games
    events = allEvents.map(event => ({
      id: parseInt(event.id),
      games_id: event.games.map(game => parseInt(game.id))
    }));
  } else {
    // If specific events selected, map them with their selected games
    events = selectedEvents.map(eventId => {
      const event = allEvents.find(e => e.id === eventId);
      if (!event) return { id: parseInt(eventId), games_id: [] };

      // Get games for this event from selectedGames
      const eventGameIds = selectedGames
        .filter(gameId => gameId.startsWith(`${eventId}-`))
        .map(gameId => {
          const parts = gameId.split('-');
          // The second part should be the actual game_id from the API
          return parseInt(parts[1]);
        });

      return {
        id: parseInt(eventId),
        games_id: eventGameIds
      };
    });
  }

  const apiData: CreatePromoCodeRequest = {
    promo_code: formData.code,
    type: formData.discountType as "percentage" | "fixed",
    value: parseFloat(formData.discount),
    valid_from: validFromISO,
    valid_to: validToISO,
    usage_limit: parseInt(formData.usageLimit),
    minimum_purchase_amount: parseFloat(formData.minPurchase),
    maximum_discount_amount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
    description: formData.description || "",
    events: events
  };

  console.log("=== TRANSFORMATION DEBUG ===");
  console.log("Selected Events:", selectedEvents);
  console.log("Selected Games:", selectedGames);
  console.log("Apply to All:", applyToAll);
  console.log("All Events:", allEvents.map(e => ({ id: e.id, name: e.name, games: e.games })));
  console.log("Transformed Events:", events);
  console.log("Final API Data:", apiData);
  console.log("=============================");

  return apiData;
}

/**
 * Transform form data to update API format
 * @param formData Form data from the UI
 * @param selectedEvents Selected event IDs
 * @param selectedGames Selected game IDs in format "eventId-gameId"
 * @param applyToAll Whether to apply to all events
 * @param allEvents All available events
 * @returns Transformed data for update API
 */
export function transformFormDataToUpdateAPI(
  formData: {
    code: string;
    discount: string;
    discountType: string;
    maxDiscount: string;
    minPurchase: string;
    validFrom: string;
    validTo: string;
    usageLimit: string;
    description: string;
  },
  selectedEvents: string[],
  selectedGames: string[],
  applyToAll: boolean,
  allEvents: Array<{id: string, name: string, games: Array<{id: string, name: string}>}>,
  usageCount: number = 0
): Omit<UpdatePromoCodeRequest, 'id'> {

  // Transform dates to YYYY-MM-DD format (not ISO for update API)
  const validFrom = formData.validFrom;
  const validTo = formData.validTo;

  // Prepare applicable_events and applicable_games arrays
  let applicableEvents: number[] = [];
  let applicableGames: number[] = [];

  if (applyToAll) {
    // If apply to all, include all event IDs
    applicableEvents = allEvents.map(event => parseInt(event.id));
    // Include all game IDs
    applicableGames = allEvents.flatMap(event =>
      event.games.map(game => parseInt(game.id))
    );
  } else {
    // If specific events selected, use those
    applicableEvents = selectedEvents.map(eventId => parseInt(eventId));

    // Get games for selected events from selectedGames
    applicableGames = selectedGames.map(gameId => {
      const parts = gameId.split('-');
      // The second part should be the actual game_id from the API
      return parseInt(parts[1]);
    }).filter(gameId => !isNaN(gameId));
  }

  const updateData: Omit<UpdatePromoCodeRequest, 'id'> = {
    promo_code: formData.code,
    type: formData.discountType as "percentage" | "fixed",
    value: parseFloat(formData.discount),
    valid_from: validFrom,
    valid_to: validTo,
    usage_limit: parseInt(formData.usageLimit),
    usage_count: usageCount,
    minimum_purchase_amount: parseFloat(formData.minPurchase),
    maximum_discount_amount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
    description: formData.description || "",
    applicable_events: applicableEvents,
    applicable_games: applicableGames
  };

  console.log("=== UPDATE TRANSFORMATION DEBUG ===");
  console.log("Selected Events:", selectedEvents);
  console.log("Selected Games:", selectedGames);
  console.log("Apply to All:", applyToAll);
  console.log("Applicable Events:", applicableEvents);
  console.log("Applicable Games:", applicableGames);
  console.log("Final Update Data:", updateData);
  console.log("====================================");

  return updateData;
}

/**
 * Get promo code by ID
 * @param id Promo code ID
 * @returns Promo code details
 */
export async function getPromoCodeById(id: number): Promise<PromoCodeDetail> {
  console.log(`Fetching promo code with ID: ${id}`);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/promo-codes/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log(`Get promo code response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Retrieved promo code:", data);

    // The API returns an array with a single promo code, so we need to extract it
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (!Array.isArray(data)) {
      return data;
    }

    throw new Error("Promo code not found");
  } catch (error) {
    console.error("Error fetching promo code:", error);
    throw error;
  }
}

/**
 * Update promo code
 * @param promoCodeData Promo code data to update
 * @returns Update response
 */
export async function updatePromoCode(promoCodeData: UpdatePromoCodeRequest): Promise<UpdatePromoCodeResponse> {
  console.log("Updating promo code:", promoCodeData);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/promo-codes/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promoCodeData),
    });

    console.log(`Update promo code response status: ${response.status}`);

    let data;
    try {
      data = await response.json();
      console.log("Promo code update response:", data);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      throw new Error(`Invalid response from server. Status: ${response.status}`);
    }

    // Check if the response indicates success
    if (response.ok || data.success) {
      return data;
    }

    throw new Error(data.error || `Update failed with status: ${response.status}`);
  } catch (error) {
    console.error("Error updating promo code:", error);
    throw error;
  }
}

/**
 * Transform API data to form format for editing
 * @param apiData Promo code data from API
 * @returns Form data for editing
 */
export function transformAPIDataToForm(apiData: PromoCodeDetail) {
  // Format dates to YYYY-MM-DD format for date inputs
  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Extract events and games from promo_data if available
  let selectedEvents: string[] = [];
  let selectedGames: string[] = [];
  let applyToAll = false;

  if (apiData.promo_data?.events) {
    selectedEvents = apiData.promo_data.events.map(event => event.event_id.toString());

    // Extract games in the format "eventId-gameId"
    apiData.promo_data.events.forEach(event => {
      event.games.forEach(game => {
        selectedGames.push(`${event.event_id}-${game.game_id}`);
      });
    });
  }

  // If no specific events are selected, assume apply to all
  if (selectedEvents.length === 0) {
    applyToAll = true;
  }

  return {
    formData: {
      code: apiData.promo_code,
      discount: apiData.value.toString(),
      discountType: apiData.type,
      maxDiscount: apiData.maximum_discount_amount ? apiData.maximum_discount_amount.toString() : "",
      minPurchase: apiData.minimum_purchase_amount.toString(),
      validFrom: formatDateForInput(apiData.valid_from),
      validTo: formatDateForInput(apiData.valid_to),
      usageLimit: apiData.usage_limit.toString(),
      description: apiData.description || ""
    },
    selectedEvents,
    selectedGames,
    applyToAll,
    usageCount: apiData.usage_count || 0
  };
}

/**
 * Delete promo code by ID
 * @param id Promo code ID
 * @returns Delete response
 */
export async function deletePromoCode(id: number): Promise<DeletePromoCodeResponse> {
  console.log(`Deleting promo code with ID: ${id}`);

  try {
    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/promo-codes/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    console.log(`Delete promo code response status: ${response.status}`);

    let data;
    try {
      data = await response.json();
      console.log("Promo code delete response:", data);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      throw new Error(`Invalid response from server. Status: ${response.status}`);
    }

    // Check if the response indicates success
    if (response.ok || data.success) {
      return data;
    }

    throw new Error(data.error || `Delete failed with status: ${response.status}`);
  } catch (error) {
    console.error("Error deleting promo code:", error);
    throw error;
  }
}

/**
 * Validate promo code form data
 * @param formData Form data to validate
 * @returns Validation result
 */
export function validatePromoCodeForm(formData: {
  code: string;
  discount: string;
  discountType: string;
  minPurchase: string;
  validFrom: string;
  validTo: string;
  usageLimit: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required field validation
  if (!formData.code.trim()) errors.push("Promo code is required");
  if (!formData.discount.trim()) errors.push("Discount value is required");
  if (!formData.minPurchase.trim()) errors.push("Minimum purchase amount is required");
  if (!formData.validFrom) errors.push("Valid from date is required");
  if (!formData.validTo) errors.push("Valid to date is required");
  if (!formData.usageLimit.trim()) errors.push("Usage limit is required");

  // Numeric validation
  if (formData.discount && isNaN(parseFloat(formData.discount))) {
    errors.push("Discount value must be a valid number");
  }
  if (formData.minPurchase && isNaN(parseFloat(formData.minPurchase))) {
    errors.push("Minimum purchase amount must be a valid number");
  }
  if (formData.usageLimit && isNaN(parseInt(formData.usageLimit))) {
    errors.push("Usage limit must be a valid number");
  }

  // Date validation
  if (formData.validFrom && formData.validTo) {
    const fromDate = new Date(formData.validFrom);
    const toDate = new Date(formData.validTo);
    if (toDate <= fromDate) {
      errors.push("Valid to date must be after valid from date");
    }
  }

  // Percentage validation
  if (formData.discountType === "percentage" && formData.discount) {
    const discountValue = parseFloat(formData.discount);
    if (discountValue <= 0 || discountValue > 100) {
      errors.push("Percentage discount must be between 1 and 100");
    }
  }

  // Fixed amount validation
  if (formData.discountType === "fixed" && formData.discount) {
    const discountValue = parseFloat(formData.discount);
    if (discountValue <= 0) {
      errors.push("Fixed discount amount must be greater than 0");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
