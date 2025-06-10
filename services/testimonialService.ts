// Testimonial type definition
export interface Testimonial {
  id: number;
  name: string;
  city: string;
  event_id: number;
  rating: number;
  testimonial: string;
  submitted_at: string;
  status: string;
}

/**
 * Get all testimonials
 * @returns Promise with array of testimonials
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    console.log("Fetching all testimonials from database");

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/testimonials/get-all', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log(`Get all testimonials response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to fetch testimonials: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Testimonials retrieved successfully:", data);

    // Ensure we return an array
    if (!Array.isArray(data)) {
      console.warn("API returned non-array data:", data);
      return [];
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    throw error;
  }
}

/**
 * Get testimonial by ID
 * @param testimonialId Testimonial ID
 * @returns Promise with testimonial data
 */
export async function getTestimonialById(testimonialId: string | number): Promise<Testimonial> {
  try {
    console.log(`Fetching testimonial with ID: ${testimonialId}`);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/testimonials/get', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: Number(testimonialId) }),
    });

    console.log(`Get testimonial by ID response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Testimonial retrieved successfully:", data);

    // The API returns an array, so we take the first item
    return Array.isArray(data) ? data[0] : data;
  } catch (error: any) {
    console.error(`Error fetching testimonial ${testimonialId}:`, error);
    throw error;
  }
}

/**
 * Create a new testimonial
 * @param testimonialData The testimonial data to create
 * @returns Promise with the created testimonial data
 */
export async function createTestimonial(testimonialData: {
  name: string;
  city: string;
  event_id: number;
  rating: number;
  testimonial: string;
  date: string;
  status: string;
}): Promise<Testimonial> {
  try {
    console.log("Creating testimonial with data:", testimonialData);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/testimonials/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testimonialData),
    });

    console.log(`Create testimonial response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Testimonial created successfully:", data);

    // The API returns an array, so we take the first item
    return Array.isArray(data) ? data[0] : data;
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    throw error;
  }
}

/**
 * Update a testimonial
 * @param testimonialData The testimonial data to update
 * @returns Promise with the updated testimonial data
 */
export async function updateTestimonial(testimonialData: {
  id: number;
  name: string;
  city: string;
  event_id: number;
  rating: number;
  testimonial: string;
  date: string;
  status: string;
}): Promise<Testimonial> {
  try {
    console.log("Updating testimonial with data:", testimonialData);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/testimonials/update', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testimonialData),
    });

    console.log(`Update testimonial response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Testimonial updated successfully:", data);

    // The API returns an array, so we take the first item
    return Array.isArray(data) ? data[0] : data;
  } catch (error: any) {
    console.error("Error updating testimonial:", error);
    throw error;
  }
}

/**
 * Delete a testimonial
 * @param testimonialId Testimonial ID to delete
 * @returns Promise with deletion result
 */
export async function deleteTestimonial(testimonialId: number): Promise<{ success: boolean }> {
  try {
    console.log(`Deleting testimonial with ID: ${testimonialId}`);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/testimonials/delete', {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: testimonialId }),
    });

    console.log(`Delete testimonial response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`API returned error status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Testimonial deleted successfully:", data);

    // The API returns an array with success status
    return Array.isArray(data) ? data[0] : data;
  } catch (error: any) {
    console.error(`Error deleting testimonial ${testimonialId}:`, error);
    throw error;
  }
}

/**
 * Update testimonial status (approve/reject)
 * @param testimonialId Testimonial ID
 * @param status New status
 * @returns Promise with updated testimonial data
 */
export async function updateTestimonialStatus(testimonialId: number, status: string): Promise<Testimonial> {
  try {
    console.log(`Updating testimonial ${testimonialId} status to ${status}`);

    // First get the current testimonial data
    const currentTestimonial = await getTestimonialById(testimonialId);
    
    // Update with new status
    const updatedData = {
      ...currentTestimonial,
      status: status
    };

    return await updateTestimonial(updatedData);
  } catch (error: any) {
    console.error(`Error updating testimonial ${testimonialId} status:`, error);
    throw error;
  }
}
