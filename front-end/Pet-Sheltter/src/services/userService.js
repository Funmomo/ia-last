import api from './api';

// Get all users (for creating new conversations)
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get shelters (for adopters to message)
export const getShelters = async () => {
  try {
    // This needs to match your backend endpoint - adjust as needed
    const response = await api.get('/users/role/1'); // Assuming role 1 is for shelter staff
    return response.data || [];
  } catch (error) {
    console.error('Error fetching shelters:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

// Get adopters (for shelters to message)
export const getAdopters = async () => {
  try {
    // This needs to match your backend endpoint - adjust as needed
    const response = await api.get('/users/role/2'); // Assuming role 2 is for adopters
    return response.data || [];
  } catch (error) {
    console.error('Error fetching adopters:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

// Fallback method to get users if specific role endpoints don't exist
export const getAllUsers = async () => {
  try {
    // Fallback to getting all users if specific role endpoints aren't available
    const response = await api.get('/users/all');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}; 