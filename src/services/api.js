import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Profile related API calls
export const getProfiles = async () => {
  const response = await axios.get(`${API_URL}/profiles`);
  return response.data;
};

export const getProfile = async (id) => {
  const response = await axios.get(`${API_URL}/profiles/${id}`);
  return response.data;
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