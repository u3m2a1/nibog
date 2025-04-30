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

// Venue API endpoints - Exactly as specified in the API documentation with correct case
export const VENUE_API = {
  CREATE: `${API_BASE_URL.replace('/v1/', '/V1/')}/venues/create`,
  UPDATE: `${API_BASE_URL.replace('/v1/', '/V1/')}/venues/update`,
  GET: `${API_BASE_URL.replace('/v1/', '/V1/')}/venues/get`,
  GET_ALL: `${API_BASE_URL.replace('/v1/', '/V1/')}/venues/get-all`,
  GET_BY_CITY: `${API_BASE_URL.replace('/v1/', '/V1/')}/venues/get-by-city`,
  GET_ALL_WITH_CITY: `${API_BASE_URL.replace('/v1/', '/V1/')}/venues/getall-with-city`,
  DELETE: `${API_BASE_URL.replace('/v1/', '/V1/')}/venues/delete`,
};

// Baby Game API endpoints
const BABY_GAME_BASE_URL = "https://ai.alviongs.com/webhook/V1/nibog";
export const BABY_GAME_API = {
  CREATE: `${BABY_GAME_BASE_URL}/babygame/create`,
  UPDATE: `${BABY_GAME_BASE_URL}/babygame/update`,
  GET: `${BABY_GAME_BASE_URL}/babygame/get`,
  GET_ALL: `${BABY_GAME_BASE_URL}/babygame/get-all`,
  DELETE: `${BABY_GAME_BASE_URL}/babygame/delete`,
};




