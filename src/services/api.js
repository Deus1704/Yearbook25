import axios from 'axios';

// Use the correct URL based on the environment
// In production, use the deployed backend URL from .env.production
// In development, use the environment variable or default to the deployed URL
const API_URL = process.env.REACT_APP_API_URL || 'https://yearbook25-xb9a.onrender.com/api';

// Log the API URL for debugging
console.log('API URL:', API_URL);

// Add a default timeout and error handling to axios
axios.defaults.timeout = 15000; // 15 seconds to account for slower connections

// Add request interceptor for common headers
axios.interceptors.request.use(
  config => {
    // Add CORS headers
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';

    // Log the request for debugging
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);

    return config;
  },
  error => {
    console.error('Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => {
    // Log successful responses for debugging
    console.log(`API Success: ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);

    // Handle MongoDB data format if needed
    if (response.data && Array.isArray(response.data)) {
      // If it's an array, ensure each item has an id property (MongoDB uses _id)
      response.data.forEach(item => {
        if (item._id && !item.id) {
          item.id = item._id;
        }
      });
    } else if (response.data && response.data._id && !response.data.id) {
      // If it's a single object with _id but no id
      response.data.id = response.data._id;
    }
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      console.error(`Failed request: ${error.config.method.toUpperCase()} ${error.config.url}`);

      if (error.response.data && error.response.data.error) {
        console.error('Error details:', error.response.data.error);
      } else {
        // Try to log the raw response data for debugging
        console.error('Response data:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received from server. Please check your connection.');
      console.error(`Failed request: ${error.config.method.toUpperCase()} ${error.config.url}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      if (error.config) {
        console.error(`Failed request: ${error.config.method.toUpperCase()} ${error.config.url}`);
      }
    }
    return Promise.reject(error);
  }
);

// Profile related API calls
export const getProfiles = async () => {
  try {
    console.log('Fetching profiles from:', `${API_URL}/profiles`);
    const response = await axios.get(`${API_URL}/profiles`);
    console.log('Profiles fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching profiles:', error.message);
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - please check if the backend server is running');
    }
    throw error;
  }
};

export const getProfile = async (id) => {
  const response = await axios.get(`${API_URL}/profiles/${id}`);
  return response.data;
};

export const getProfileByUserId = async (userId) => {
  try {
    console.log('Fetching profile for user ID:', userId);
    const response = await axios.get(`${API_URL}/profiles/user/${userId}`);
    console.log('Profile found:', response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No profile found for user ID:', userId);
      return null; // User doesn't have a profile yet
    }
    console.error('Error fetching profile by user ID:', error.message);
    if (error.response && error.response.status === 500) {
      console.error('Server error details:', error.response.data);
    }
    throw error;
  }
};

export const addComment = async (profileId, comment) => {
  const response = await axios.post(`${API_URL}/profiles/${profileId}/comments`, comment);
  return response.data;
};

export const createProfile = async (profileData) => {
  const formData = new FormData();
  Object.keys(profileData).forEach(key => {
    formData.append(key, profileData[key]);
  });

  const response = await axios.post(`${API_URL}/profiles`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProfile = async (id, profileData) => {
  const formData = new FormData();
  Object.keys(profileData).forEach(key => {
    formData.append(key, profileData[key]);
  });

  const response = await axios.put(`${API_URL}/profiles/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Helper function to get profile image URL
export const getProfileImageUrl = (id, directUrl = null) => {
  // If a direct URL is provided (from Google Drive), use it
  if (directUrl) {
    return directUrl;
  }
  // Otherwise, use the API endpoint
  return `${API_URL}/profiles/${id}/image`;
};

// Confession related API calls
export const getConfessions = async () => {
  const response = await axios.get(`${API_URL}/confessions`);
  return response.data;
};

export const getConfession = async (id) => {
  const response = await axios.get(`${API_URL}/confessions/${id}`);
  return response.data;
};

export const addConfession = async (confession) => {
  const response = await axios.post(`${API_URL}/confessions`, confession);
  return response.data;
};

export const deleteConfession = async (id) => {
  const response = await axios.delete(`${API_URL}/confessions/${id}`);
  return response.data;
};

// Message related API calls (for general messages not tied to profiles)
export const getMessages = async () => {
  const response = await axios.get(`${API_URL}/messages`);
  return response.data;
};

export const getMessage = async (id) => {
  const response = await axios.get(`${API_URL}/messages/${id}`);
  return response.data;
};

export const addMessage = async (message) => {
  const response = await axios.post(`${API_URL}/messages`, message);
  return response.data;
};

export const deleteMessage = async (id) => {
  const response = await axios.delete(`${API_URL}/messages/${id}`);
  return response.data;
};

// Memory Images related API calls
export const getMemoryImages = async () => {
  const response = await axios.get(`${API_URL}/memories`);
  return response.data;
};

export const uploadMemoryImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await axios.post(`${API_URL}/memories`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadMultipleMemoryImages = async (imageFiles) => {
  const formData = new FormData();
  imageFiles.forEach((file, index) => {
    // Use 'image' as the field name for each file (matches what the server expects)
    formData.append('image', file);
    // Add optional name field
    formData.append(`name-${index}`, `Memory ${index + 1}`);
  });

  const response = await axios.post(`${API_URL}/memories/batch`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Helper function to get memory image URL
export const getMemoryImageUrl = (id, directUrl = null) => {
  // If a direct URL is provided (from Google Drive), use it
  if (directUrl) {
    return directUrl;
  }
  // Otherwise, use the API endpoint
  return `${API_URL}/memories/${id}/image`;
};