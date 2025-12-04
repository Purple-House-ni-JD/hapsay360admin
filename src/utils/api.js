/**
 * API utility for making authenticated requests
 * Automatically adds the JWT token from localStorage to the Authorization header
 */

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

/**
 * Get the stored JWT token from localStorage
 */
const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Make an authenticated API request
 * Automatically includes the Authorization header with the JWT token
 * 
 * @param {string} endpoint - API endpoint (e.g., "users/count" or "/users/count")
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} Fetch response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${apiBaseUrl}${cleanEndpoint}`;

  // Merge headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token might be expired or invalid
  if (response.status === 401) {
    // Optionally clear token and redirect to login
    localStorage.removeItem("token");
    // You might want to redirect to login page here
    // window.location.href = "/";
    throw new Error("Unauthorized: Please login again");
  }

  return response;
};

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: "GET" }),
  
  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),
  
  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
  
  patch: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  
  // File upload helper
  uploadFile: async (endpoint, file, options = {}) => {
    const token = getToken();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    const url = `${apiBaseUrl}${cleanEndpoint}`;
    
    const formData = new FormData();
    formData.append("file", file);
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      ...options,
    });
    
    if (response.status === 401) {
      localStorage.removeItem("token");
      throw new Error("Unauthorized: Please login again");
    }
    
    return response;
  },
  
  // Multiple files upload helper
  uploadFiles: async (endpoint, files, options = {}) => {
    const token = getToken();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    const url = `${apiBaseUrl}${cleanEndpoint}`;
    
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      ...options,
    });
    
    if (response.status === 401) {
      localStorage.removeItem("token");
      throw new Error("Unauthorized: Please login again");
    }
    
    return response;
  },
};

export default api;

