// Test script for complex adoption request data
const axios = require('axios');

// Base API URL
const API_URL = 'https://localhost:5001/api';
let authToken = '';

// Login to get authentication token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'your_test_username',
      password: 'your_test_password'
    });
    authToken = response.data.token;
    console.log('Successfully logged in');
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Function to get a full adoption request with all nested relationships
async function getFullAdoptionRequest(id) {
  try {
    const response = await axios.get(`${API_URL}/Adoption/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log('Successfully retrieved adoption request data');
    return response.data;
  } catch (error) {
    console.error('Failed to get adoption request:', error.response?.data || error.message);
    throw error;
  }
}

// Function to validate the adoption request data structure
function validateAdoptionRequestStructure(data) {
  // Define expected fields for each object type
  const requiredAdoptionFields = ['id', 'petId', 'pet', 'adopterId', 'adopter', 'shelterId', 'shelter', 'status', 'requestDate', 'updatedAt'];
  const requiredPetFields = ['id', 'shelterId', 'shelter', 'categoryId', 'category', 'name', 'age', 'breed', 'description', 'status', 'imageUrl'];
  const requiredUserFields = ['id', 'username', 'email', 'role'];
  const requiredShelterFields = ['id', 'name', 'address', 'phone', 'email', 'status'];
  
  // Validate adoption request fields
  const validationResults = {
    hasAllRequiredFields: true,
    missingFields: [],
    nestedValidation: {}
  };
  
  // Check adoption request fields
  requiredAdoptionFields.forEach(field => {
    if (data[field] === undefined) {
      validationResults.hasAllRequiredFields = false;
      validationResults.missingFields.push(field);
    }
  });
  
  // Check nested pet data
  if (data.pet) {
    validationResults.nestedValidation.pet = { hasAllRequiredFields: true, missingFields: [] };
    requiredPetFields.forEach(field => {
      if (data.pet[field] === undefined) {
        validationResults.nestedValidation.pet.hasAllRequiredFields = false;
        validationResults.nestedValidation.pet.missingFields.push(field);
      }
    });
  }
  
  // Check nested adopter data
  if (data.adopter) {
    validationResults.nestedValidation.adopter = { hasAllRequiredFields: true, missingFields: [] };
    requiredUserFields.forEach(field => {
      if (data.adopter[field] === undefined) {
        validationResults.nestedValidation.adopter.hasAllRequiredFields = false;
        validationResults.nestedValidation.adopter.missingFields.push(field);
      }
    });
  }
  
  // Check nested shelter data
  if (data.shelter) {
    validationResults.nestedValidation.shelter = { hasAllRequiredFields: true, missingFields: [] };
    requiredShelterFields.forEach(field => {
      if (data.shelter[field] === undefined) {
        validationResults.nestedValidation.shelter.hasAllRequiredFields = false;
        validationResults.nestedValidation.shelter.missingFields.push(field);
      }
    });
  }
  
  return validationResults;
}

// Main test function
async function testAdoptionRequestData() {
  try {
    await login();
    
    // Test with your provided complex data structure
    const mockData = [
      {
        "id": 0,
        "petId": 0,
        "pet": {
          "id": 0,
          "shelterId": 0,
          "shelter": {
            "id": 0,
            "name": "string",
            "address": "string",
            "phone": "string",
            "email": "string",
            "status": 0,
            "createdAt": "2025-05-14T17:14:53.295Z",
            "updatedAt": "2025-05-14T17:14:53.295Z",
            "pets": ["string"],
            "adoptionRequests": ["string"]
          },
          "categoryId": 0,
          "category": {
            "id": 0,
            "name": "string",
            "pets": ["string"]
          },
          "name": "string",
          "age": 0,
          "breed": "string",
          "medicalHistory": "string",
          "description": "string",
          "status": 0,
          "imageUrl": "string",
          "gender": 0,
          "addedAt": "2025-05-14T17:14:53.295Z",
          "updatedAt": "2025-05-14T17:14:53.295Z",
          "adoptionRequests": ["string"]
        },
        "adopterId": "string",
        "adopter": {
          "id": "string",
          "username": "string",
          "email": "string",
          "passwordHash": "string",
          "role": 0,
          "shelterId": 0,
          "connectionId": "string",
          "status": "string",
          "adoptionRequests": ["string"],
          "sentMessages": [
            {
              "id": 0,
              "senderId": "string",
              "sender": "string",
              "receiverId": "string",
              "receiver": "string",
              "content": "string",
              "sentAt": "2025-05-14T17:14:53.295Z",
              "isDelivered": true,
              "deliveredAt": "2025-05-14T17:14:53.295Z",
              "conversationId": 0,
              "conversation": {
                "id": 0,
                "participant1Id": "string",
                "participant1": "string",
                "participant2Id": "string",
                "participant2": "string",
                "createdAt": "2025-05-14T17:14:53.295Z",
                "messages": ["string"]
              }
            }
          ],
          "receivedMessages": [
            {
              "id": 0,
              "senderId": "string",
              "sender": "string",
              "receiverId": "string",
              "receiver": "string",
              "content": "string",
              "sentAt": "2025-05-14T17:14:53.295Z",
              "isDelivered": true,
              "deliveredAt": "2025-05-14T17:14:53.295Z",
              "conversationId": 0,
              "conversation": {
                "id": 0,
                "participant1Id": "string",
                "participant1": "string",
                "participant2Id": "string",
                "participant2": "string",
                "createdAt": "2025-05-14T17:14:53.295Z",
                "messages": ["string"]
              }
            }
          ],
          "sentCommunications": [
            {
              "id": 0,
              "adoptionRequestId": 0,
              "adoptionRequest": "string",
              "senderId": "string",
              "sender": "string",
              "receiverId": "string",
              "receiver": "string",
              "sentAt": "2025-05-14T17:14:53.295Z"
            }
          ],
          "receivedCommunications": [
            {
              "id": 0,
              "adoptionRequestId": 0,
              "adoptionRequest": "string",
              "senderId": "string",
              "sender": "string",
              "receiverId": "string",
              "receiver": "string",
              "sentAt": "2025-05-14T17:14:53.295Z"
            }
          ],
          "reportedIssues": [
            {
              "id": 0,
              "reportID": "string",
              "reporter": "string",
              "title": "string",
              "description": "string",
              "status": "string",
              "createdAt": "2025-05-14T17:14:53.295Z",
              "updatedAt": "2025-05-14T17:14:53.295Z"
            }
          ]
        },
        "shelterId": 0,
        "shelter": {
          "id": 0,
          "name": "string",
          "address": "string",
          "phone": "string",
          "email": "string",
          "status": 0,
          "createdAt": "2025-05-14T17:14:53.295Z",
          "updatedAt": "2025-05-14T17:14:53.295Z",
          "pets": ["string"],
          "adoptionRequests": ["string"]
        },
        "status": 0,
        "requestDate": "2025-05-14T17:14:53.295Z",
        "updatedAt": "2025-05-14T17:14:53.295Z",
        "communications": [
          {
            "id": 0,
            "adoptionRequestId": 0,
            "adoptionRequest": "string",
            "senderId": "string",
            "sender": "string",
            "receiverId": "string",
            "receiver": "string",
            "sentAt": "2025-05-14T17:14:53.295Z"
          }
        ],
        "interviewSchedules": [
          {
            "id": 0,
            "adoptionRequestId": 0,
            "adoptionRequest": "string",
            "interviewDate": "2025-05-14T17:14:53.295Z",
            "status": 0,
            "notes": "string",
            "createdAt": "2025-05-14T17:14:53.295Z",
            "updatedAt": "2025-05-14T17:14:53.295Z"
          }
        ]
      }
    ];
    
    // Validate the mock data structure
    console.log('Validating mock data structure...');
    const mockValidation = validateAdoptionRequestStructure(mockData[0]);
    console.log('Mock data validation results:', mockValidation);
    
    // Try to get an actual adoption request from the API to compare
    try {
      const actualData = await getFullAdoptionRequest(1); // Use ID 1 or other valid ID
      console.log('Validating actual API data structure...');
      const actualValidation = validateAdoptionRequestStructure(actualData);
      console.log('Actual data validation results:', actualValidation);
      
      // Compare expected structure with actual structure
      console.log('Data structure match analysis:');
      console.log('- Mock data has all required fields:', mockValidation.hasAllRequiredFields);
      console.log('- Actual data has all required fields:', actualValidation.hasAllRequiredFields);
      
      if (mockValidation.missingFields.length > 0) {
        console.log('- Mock data is missing fields:', mockValidation.missingFields);
      }
      
      if (actualValidation.missingFields.length > 0) {
        console.log('- Actual data is missing fields:', actualValidation.missingFields);
      }
    } catch (error) {
      console.log('Could not fetch actual data for comparison. Mock validation only.');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAdoptionRequestData().then(() => {
  console.log('Test completed');
}).catch(err => {
  console.error('Test failed with error:', err);
}); 