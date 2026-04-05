const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Used for serving static images from the backend (`/uploads/...`)
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export { API_BASE, API_ORIGIN };

