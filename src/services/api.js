import axios from 'axios';

// Use the correct URL based on the environment
// In production, use the deployed backend URL from .env.production
// In development, use the environment variable or default to the deployed URL
const API_URL = 'https://yearbook25-xb9a.onrender.com/api';

// Log the API URL for debugging
console.log('API URL:', API_URL);

// Add a default timeout and error handling to axios
axios.defaults.timeout = 15000; // 15 seconds to account for slower connections

// Add request interceptor for common headers
axios.interceptors.request.use(
  config => {
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
  try {
    console.log('Creating profile with data:', {
      name: profileData.name,
      designation: profileData.designation,
      user_id: profileData.user_id,
      email: profileData.email,
      hasImage: !!profileData.image
    });

    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (key === 'image' && profileData[key]) {
        console.log('Adding image to form data:', {
          name: profileData[key].name,
          type: profileData[key].type,
          size: profileData[key].size
        });
      }
      formData.append(key, profileData[key]);
    });

    const response = await axios.post(`${API_URL}/profiles`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Profile created successfully, response:', {
      id: response.data.id,
      name: response.data.name,
      image_url: response.data.image_url,
      image_id: response.data.image_id
    });

    return response.data;
  } catch (error) {
    console.error('Error in createProfile:', error);
    if (error.response && error.response.data) {
      console.error('Server error details:', error.response.data);
    }
    throw error;
  }
};

export const updateProfile = async (id, profileData) => {
  try {
    console.log(`Updating profile ID: ${id} with data:`, {
      name: profileData.name,
      designation: profileData.designation,
      user_id: profileData.user_id,
      email: profileData.email,
      hasImage: !!profileData.image
    });

    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (key === 'image' && profileData[key]) {
        console.log('Adding image to form data for update:', {
          name: profileData[key].name,
          type: profileData[key].type,
          size: profileData[key].size
        });
      }
      formData.append(key, profileData[key]);
    });

    const response = await axios.put(`${API_URL}/profiles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Profile updated successfully, response:', {
      id: response.data.id,
      name: response.data.name,
      image_url: response.data.image_url,
      image_id: response.data.image_id
    });

    return response.data;
  } catch (error) {
    console.error(`Error updating profile ID ${id}:`, error);
    if (error.response && error.response.data) {
      console.error('Server error details:', error.response.data);
    }
    throw error;
  }
};

// Helper function to get profile image URL
export const getProfileImageUrl = (id, directUrl = null) => {
  // If a direct URL is provided (from Google Drive), use it
  if (directUrl) {
    console.log(`Using direct URL for profile image ID ${id}:`, directUrl);
    return directUrl;
  }

  // Add cache-busting parameter to prevent browser caching issues
  const timestamp = new Date().getTime();
  const imageUrl = `${API_URL}/profiles/${id}/image?t=${timestamp}`;

  console.log(`Using API endpoint for profile image ID ${id}:`, imageUrl);
  return imageUrl;
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
  const url = `${API_URL}/memories`;
  const response = await axios.get(url);
  return response.data;
};

export const uploadMemoryImage = async (imageFile, uploadedBy = null) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  // Add the uploadedBy field if provided
  if (uploadedBy) {
    formData.append('uploadedBy', uploadedBy);
  }

  const response = await axios.post(`${API_URL}/memories`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadMultipleMemoryImages = async (imageFiles, uploadedBy = null) => {
  const formData = new FormData();

  // Add the uploadedBy field if provided
  if (uploadedBy) {
    formData.append('uploadedBy', uploadedBy);
  }

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

  // Otherwise, use the API endpoint with a cache-busting parameter
  // This helps prevent browser caching issues with the images
  const timestamp = new Date().getTime();
  return `${API_URL}/memories/${id}/image?t=${timestamp}`;
};

// Backup related API calls
export const getBackups = async () => {
  try {
    const response = await axios.get(`${API_URL}/backups`);
    return response.data;
  } catch (error) {
    console.error('Error fetching backups:', error.message);
    throw error;
  }
};

export const createBackup = async () => {
  try {
    const response = await axios.post(`${API_URL}/backups`);
    return response.data;
  } catch (error) {
    console.error('Error creating backup:', error.message);
    throw error;
  }
};

export const restoreFromBackup = async (fileId) => {
  try {
    const response = await axios.post(`${API_URL}/backups/restore/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error restoring from backup:', error.message);
    throw error;
  }
};

// Notification related API calls
export const getAdminNotifications = async (adminEmail) => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      params: { adminEmail }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin notifications:', error.message);
    throw error;
  }
};

export const getUnreadNotificationsCount = async (adminEmail) => {
  try {
    const response = await axios.get(`${API_URL}/notifications/unread/count`, {
      params: { adminEmail }
    });
    return response.data.count;
  } catch (error) {
    console.error('Error fetching unread notifications count:', error.message);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId, adminEmail) => {
  try {
    const response = await axios.put(`${API_URL}/notifications/${notificationId}/read`, {
      adminEmail
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (adminEmail) => {
  try {
    const response = await axios.put(`${API_URL}/notifications/read/all`, {
      adminEmail
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error.message);
    throw error;
  }
};

// Memory approval related API calls
export const getMemoryImagesForAdmin = async () => {
  try {
    const response = await axios.get(`${API_URL}/memories`, {
      params: { admin: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching memory images for admin:', error.message);
    throw error;
  }
};

export const getPendingMemoryImagesCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/memories/pending/count`);
    return response.data.count;
  } catch (error) {
    console.error('Error fetching pending memory images count:', error.message);
    throw error;
  }
};

export const getPendingMemoryImages = async () => {
  try {
    const response = await axios.get(`${API_URL}/memories/pending/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending memory images:', error.message);
    throw error;
  }
};

export const approveMemoryImage = async (id, adminEmail) => {
  try {
    const response = await axios.put(`${API_URL}/memories/${id}/approve`, {
      approved: true,
      adminEmail
    });
    return response.data;
  } catch (error) {
    console.error('Error approving memory image:', error.message);
    throw error;
  }
};

export const rejectMemoryImage = async (id, adminEmail) => {
  try {
    const response = await axios.put(`${API_URL}/memories/${id}/approve`, {
      approved: false,
      adminEmail
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting memory image:', error.message);
    throw error;
  }
};