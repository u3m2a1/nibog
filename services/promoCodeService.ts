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

    const data = await response.json();
    console.log("Promo code creation response:", data);

    if (!response.ok) {
      throw new Error(data.error || `API returned error status: ${response.status}`);
    }

    return data;
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
