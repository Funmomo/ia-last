/**
 * Adoption Request Templates for API Testing
 * 
 * These templates help users understand the structure of adoption requests
 * and provide valid data for testing the Adoption API endpoints.
 */

export const adoptionRequestTemplates = {
  // For creating a new adoption request (simplified version)
  createSimple: {
    petId: 1,
    // The rest is handled by the server automatically
  },
  
  // For creating a new adoption request (original version)
  create: {
    petId: 1,
    shelterId: 1,
    status: 0, // Pending
    // The AdopterId is automatically set on the server based on the current user
  },
  
  // For updating an existing adoption request status
  updateStatus: {
    status: 2  // Change this value for testing: 0 (Pending), 1 (Interview), 2 (Approved), 3 (Rejected), 4 (Cancelled)
  },
  
  // Full adoption request response object (for reference)
  response: {
    id: 1,
    petId: 1,
    petName: "Buddy",
    petImageUrl: "https://example.com/images/buddy.jpg",
    adopterId: "user-id-here",
    adopterName: "johndoe",
    shelterId: 1,
    shelterName: "Happy Paws Shelter",
    status: 0, // Pending
    requestDate: "2023-05-01T14:30:00",
    updatedAt: "2023-05-01T14:30:00"
  }
};

// Function to get a template string based on endpoint and method
export const getRequestTemplate = (endpoint, method) => {
  if (method === 'POST' && endpoint === '/api/Adoption/simple') {
    return JSON.stringify(adoptionRequestTemplates.createSimple, null, 2);
  } else if (method === 'POST' && endpoint === '/api/Adoption') {
    return JSON.stringify(adoptionRequestTemplates.create, null, 2);
  } else if (method === 'PUT' && endpoint.includes('/api/Adoption/')) {
    return JSON.stringify(adoptionRequestTemplates.updateStatus, null, 2);
  } else {
    // Default empty body
    return '{}';
  }
};

export default adoptionRequestTemplates; 