import axios from 'axios';

// Use the correct URL based on the environment
// When using the proxy in package.json, we can use a relative URL in development
// In production, use the environment variable with the full backend URL
let API_URL;

if (process.env.NODE_ENV === 'production') {
  // In production, always use the environment variable
  API_URL = process.env.REACT_APP_API_URL;
  if (!API_URL) {
    console.warn('REACT_APP_API_URL is not set in production environment. Using default /api path.');
    API_URL = '/api';
  }
} else {
  // In development, use the environment variable or fall back to the proxy
  API_URL = process.env.REACT_APP_API_URL || '/api';
}

// Log the API URL for debugging
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', API_URL);

// Add a default timeout and error handling to axios
axios.defaults.timeout = 10000; // 10 seconds
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
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

// Helper function to get image URL
export const getProfileImageUrl = (id) => `${API_URL}/profiles/${id}/image`;

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
export const getMemoryImageUrl = (id) => `${API_URL}/memories/${id}/image`;