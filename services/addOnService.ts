// Add-on service for handling add-on-related API calls

export interface AddOnVariant {
  id?: number;
  addon_id?: number;
  name: string;
  price_modifier: number;
  sku: string;
  stock_quantity: number;
}

export interface AddOn {
  id: number;
  name: string;
  description: string;
  price: string;
  category: "meal" | "merchandise" | "service" | "other";
  is_active: boolean;
  has_variants: boolean;
  stock_quantity: number;
  sku: string;
  bundle_min_quantity: number;
  bundle_discount_percentage: string;
  created_at: string;
  updated_at: string;
  images: string[];
  variants: AddOnVariant[];
}

export interface CreateAddOnRequest {
  name: string;
  description: string;
  price: number;
  category: "meal" | "merchandise" | "service" | "other";
  images: string[];
  isActive: boolean;
  hasVariants: boolean;
  stock_quantity: number;
  sku: string;
  bundleDiscount?: {
    minQuantity: number;
    discountPercentage: number;
  };
  variants?: {
    name: string;
    price_modifier: number;
    sku: string;
    stock_quantity: number;
  }[];
}

export interface UpdateAddOnRequest {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "meal" | "merchandise" | "service" | "other";
  images: string[];
  isActive: boolean;
  hasVariants: boolean;
  stock_quantity: number;
  sku: string;
  bundleDiscount: {
    minQuantity: number;
    discountPercentage: number;
  };
  variants?: {
    name: string;
    price_modifier: number;
    sku: string;
    stock_quantity: number;
  }[];
}

/**
 * Get all add-ons
 * @returns Promise with array of add-ons
 */
export async function getAllAddOns(): Promise<AddOn[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('/api/add-ons/get-all', {
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
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. The server took too long to respond.");
    }
    throw error;
  }
}

/**
 * Get add-on by ID
 * @param addOnId Add-on ID
 * @returns Promise with add-on data
 */
export async function getAddOnById(addOnId: string | number): Promise<AddOn> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('/api/add-ons/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(addOnId) }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Add-on with ID ${addOnId} not found`);
      }
      throw new Error(`Failed to fetch add-on: ${response.status}`);
    }

    const data = await response.json();
    
    // API returns array, get first item
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    throw new Error(`Add-on with ID ${addOnId} not found`);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - the add-on service is taking too long to respond');
    }
    throw error;
  }
}

/**
 * Create a new add-on
 * @param addOnData The add-on data to create
 * @returns Promise with the created add-on data
 */
export async function createAddOn(addOnData: any): Promise<any> {
  try {
    const response = await fetch('/api/add-ons/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addOnData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned error status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Update an add-on
 * @param addOnData The add-on data to update
 * @returns Promise with the updated add-on data
 */
export async function updateAddOn(addOnData: UpdateAddOnRequest): Promise<AddOn> {
  try {
    const response = await fetch('/api/add-ons/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addOnData),
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    
    // API returns array, get first item
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Delete an add-on
 * @param addOnId Add-on ID to delete
 * @returns Promise with success status
 */
export async function deleteAddOn(addOnId: number): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/add-ons/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: addOnId }),
    });

    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    
    // API returns array, get first item
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return data;
  } catch (error: any) {
    throw error;
  }
}
