// API Base URL
export const API_BASE_URL = "https://ai.alviongs.com/webhook/v1/nibog";

// City API endpoints - Exactly as specified in the API documentation
export const CITY_API = {
  CREATE: `${API_BASE_URL}/city/create`,     // POST
  UPDATE: `${API_BASE_URL}/city/update`,     // POST
  GET: `${API_BASE_URL}/city/get`,           // GET with body (non-standard but specified in docs)
  GET_ALL: `${API_BASE_URL}/city/get-all`,   // GET
  DELETE: `${API_BASE_URL}/city/delete`,     // DELETE with body
};

// Venue API endpoints
export const VENUE_API = {
  CREATE: `${API_BASE_URL}/venues/create`,
  UPDATE: `${API_BASE_URL}/venues/update`,
  GET: `${API_BASE_URL}/venues/get`,
  GET_ALL: `${API_BASE_URL}/venues/get-all`,
  GET_BY_CITY: `${API_BASE_URL}/venues/get-by-city`,
  GET_ALL_WITH_CITY: `${API_BASE_URL}/venues/getall-with-city`,
  DELETE: `${API_BASE_URL}/venues/delete`,
};

// Baby Game API endpoints
export const BABY_GAME_API = {
  CREATE: `${API_BASE_URL}/babygame/create`,
  UPDATE: `${API_BASE_URL}/babygame/update`,
  GET: `${API_BASE_URL}/babygame/get`,
  GET_ALL: `${API_BASE_URL}/babygame/get-all`,
  DELETE: `${API_BASE_URL}/babygame/delete`,
};
