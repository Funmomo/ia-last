# API Documentation

## Base URL
```
https://localhost:5001/api
```

## Authentication

All endpoints (except login and register) require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "Adopter"
}
```

Response:
```json
{
  "id": "user123",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "Adopter",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

Response:
```json
{
  "id": "user123",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "Adopter",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Users

### Get All Users (Admin only)
```http
GET /users
```

Response:
```json
[
  {
    "id": "user123",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Adopter",
    "shelterId": null
  },
  {
    "id": "user456",
    "username": "shelter_staff",
    "email": "staff@shelter.com",
    "role": "ShelterStaff",
    "shelterId": 1
  }
]
```

### Get User by ID
```http
GET /users/{id}
```

Response:
```json
{
  "id": "user123",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "Adopter",
  "shelterId": null,
  "status": "Online"
}
```

### Update User Profile
```http
PUT /users/{id}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

## Shelters

### Create Shelter (Admin only)
```http
POST /shelters
Content-Type: application/json

{
  "name": "Happy Paws Shelter",
  "address": "123 Pet Street, City",
  "phone": "+1234567890",
  "email": "info@happypaws.com"
}
```

Response:
```json
{
  "id": 1,
  "name": "Happy Paws Shelter",
  "address": "123 Pet Street, City",
  "phone": "+1234567890",
  "email": "info@happypaws.com"
}
```

### Get Shelter Details
```http
GET /shelters/{id}
```

Response:
```json
{
  "id": 1,
  "name": "Happy Paws Shelter",
  "address": "123 Pet Street, City",
  "phone": "+1234567890",
  "email": "info@happypaws.com",
  "staffCount": 5,
  "petCount": 12
}
```

### Get Shelter Pets
```http
GET /shelters/{id}/pets
```

Response:
```json
[
  {
    "id": 1,
    "name": "Max",
    "species": "Dog",
    "breed": "Labrador",
    "age": 2,
    "gender": "Male",
    "description": "Friendly and energetic",
    "imageUrl": "https://example.com/max.jpg",
    "categoryId": 1
  }
]
```

## Pets

### Create Pet (Admin/ShelterStaff)
```http
POST /pets
Content-Type: application/json

{
  "name": "Bella",
  "species": "Cat",
  "breed": "Siamese",
  "age": 1,
  "gender": "Female",
  "description": "Calm and affectionate",
  "imageUrl": "https://example.com/bella.jpg",
  "shelterId": 1,
  "categoryId": 2
}
```

### Search Pets
```http
GET /pets/search?species=Dog&breed=Labrador&ageMin=1&ageMax=3
```

Response:
```json
[
  {
    "id": 1,
    "name": "Max",
    "species": "Dog",
    "breed": "Labrador",
    "age": 2,
    "gender": "Male",
    "description": "Friendly and energetic",
    "imageUrl": "https://example.com/max.jpg",
    "shelter": {
      "id": 1,
      "name": "Happy Paws Shelter"
    }
  }
]
```

### Get Pet Details
```http
GET /pets/{id}
```

Response:
```json
{
  "id": 1,
  "name": "Max",
  "species": "Dog",
  "breed": "Labrador",
  "age": 2,
  "gender": "Male",
  "description": "Friendly and energetic",
  "imageUrl": "https://example.com/max.jpg",
  "shelter": {
    "id": 1,
    "name": "Happy Paws Shelter"
  },
  "category": {
    "id": 1,
    "name": "Dogs"
  },
  "adoptionStatus": "Available"
}
```

## Adoption Requests

### Submit Request (Adopter)
```http
POST /adoption-requests
Content-Type: application/json

{
  "petId": 1,
  "shelterId": 1,
  "message": "I would love to adopt Max!"
}
```

### Get User's Adoption Requests
```http
GET /adoption-requests/my-requests
```

Response:
```json
[
  {
    "id": 1,
    "pet": {
      "id": 1,
      "name": "Max",
      "species": "Dog",
      "breed": "Labrador"
    },
    "shelter": {
      "id": 1,
      "name": "Happy Paws Shelter"
    },
    "status": "Pending",
    "requestDate": "2024-03-20T10:00:00Z",
    "message": "I would love to adopt Max!"
  }
]
```

### Update Request Status (Admin/ShelterStaff)
```http
PUT /adoption-requests/{id}/status
Content-Type: application/json

{
  "status": "Approved",
  "responseMessage": "Your application has been approved!"
}
```

## Real-Time Chat

### Connect to Chat Hub
```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub", {
        accessTokenFactory: () => "your-jwt-token"
    })
    .withAutomaticReconnect()
    .build();
```

### Send Private Message
```javascript
await connection.invoke("SendPrivateMessage", "recipientId", "Hello!");
```

### Join Group Chat
```javascript
await connection.invoke("JoinGroup", "shelter-1");
```

### Send Group Message
```javascript
await connection.invoke("SendMessageToGroup", "shelter-1", "Hello everyone!");
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
``` 