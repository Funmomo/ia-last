using Microsoft.VisualStudio.TestTools.UnitTesting;
using RealtimeAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace RealtimeAPI.Tests
{
    [TestClass]
    public class AdoptionRequestTests
    {
        [TestMethod]
        public void AdoptionRequest_Deserialization_Test()
        {
            // Arrange
            string complexJson = @"[
              {
                ""id"": 0,
                ""petId"": 0,
                ""pet"": {
                  ""id"": 0,
                  ""shelterId"": 0,
                  ""shelter"": {
                    ""id"": 0,
                    ""name"": ""string"",
                    ""address"": ""string"",
                    ""phone"": ""string"",
                    ""email"": ""string"",
                    ""status"": 0,
                    ""createdAt"": ""2025-05-14T17:14:53.295Z"",
                    ""updatedAt"": ""2025-05-14T17:14:53.295Z"",
                    ""pets"": [
                      ""string""
                    ],
                    ""adoptionRequests"": [
                      ""string""
                    ]
                  },
                  ""categoryId"": 0,
                  ""category"": {
                    ""id"": 0,
                    ""name"": ""string"",
                    ""pets"": [
                      ""string""
                    ]
                  },
                  ""name"": ""string"",
                  ""age"": 0,
                  ""breed"": ""string"",
                  ""medicalHistory"": ""string"",
                  ""description"": ""string"",
                  ""status"": 0,
                  ""imageUrl"": ""string"",
                  ""gender"": 0,
                  ""addedAt"": ""2025-05-14T17:14:53.295Z"",
                  ""updatedAt"": ""2025-05-14T17:14:53.295Z"",
                  ""adoptionRequests"": [
                    ""string""
                  ]
                },
                ""adopterId"": ""string"",
                ""adopter"": {
                  ""id"": ""string"",
                  ""username"": ""string"",
                  ""email"": ""string"",
                  ""passwordHash"": ""string"",
                  ""role"": 0,
                  ""shelterId"": 0,
                  ""connectionId"": ""string"",
                  ""status"": ""string"",
                  ""adoptionRequests"": [
                    ""string""
                  ],
                  ""sentMessages"": [
                    {
                      ""id"": 0,
                      ""senderId"": ""string"",
                      ""sender"": ""string"",
                      ""receiverId"": ""string"",
                      ""receiver"": ""string"",
                      ""content"": ""string"",
                      ""sentAt"": ""2025-05-14T17:14:53.295Z"",
                      ""isDelivered"": true,
                      ""deliveredAt"": ""2025-05-14T17:14:53.295Z"",
                      ""conversationId"": 0,
                      ""conversation"": {
                        ""id"": 0,
                        ""participant1Id"": ""string"",
                        ""participant1"": ""string"",
                        ""participant2Id"": ""string"",
                        ""participant2"": ""string"",
                        ""createdAt"": ""2025-05-14T17:14:53.295Z"",
                        ""messages"": [
                          ""string""
                        ]
                      }
                    }
                  ],
                  ""receivedMessages"": [
                    {
                      ""id"": 0,
                      ""senderId"": ""string"",
                      ""sender"": ""string"",
                      ""receiverId"": ""string"",
                      ""receiver"": ""string"",
                      ""content"": ""string"",
                      ""sentAt"": ""2025-05-14T17:14:53.295Z"",
                      ""isDelivered"": true,
                      ""deliveredAt"": ""2025-05-14T17:14:53.295Z"",
                      ""conversationId"": 0,
                      ""conversation"": {
                        ""id"": 0,
                        ""participant1Id"": ""string"",
                        ""participant1"": ""string"",
                        ""participant2Id"": ""string"",
                        ""participant2"": ""string"",
                        ""createdAt"": ""2025-05-14T17:14:53.295Z"",
                        ""messages"": [
                          ""string""
                        ]
                      }
                    }
                  ],
                  ""sentCommunications"": [
                    {
                      ""id"": 0,
                      ""adoptionRequestId"": 0,
                      ""adoptionRequest"": ""string"",
                      ""senderId"": ""string"",
                      ""sender"": ""string"",
                      ""receiverId"": ""string"",
                      ""receiver"": ""string"",
                      ""sentAt"": ""2025-05-14T17:14:53.295Z""
                    }
                  ],
                  ""receivedCommunications"": [
                    {
                      ""id"": 0,
                      ""adoptionRequestId"": 0,
                      ""adoptionRequest"": ""string"",
                      ""senderId"": ""string"",
                      ""sender"": ""string"",
                      ""receiverId"": ""string"",
                      ""receiver"": ""string"",
                      ""sentAt"": ""2025-05-14T17:14:53.295Z""
                    }
                  ],
                  ""reportedIssues"": [
                    {
                      ""id"": 0,
                      ""reportID"": ""string"",
                      ""reporter"": ""string"",
                      ""title"": ""string"",
                      ""description"": ""string"",
                      ""status"": ""string"",
                      ""createdAt"": ""2025-05-14T17:14:53.295Z"",
                      ""updatedAt"": ""2025-05-14T17:14:53.295Z""
                    }
                  ]
                },
                ""shelterId"": 0,
                ""shelter"": {
                  ""id"": 0,
                  ""name"": ""string"",
                  ""address"": ""string"",
                  ""phone"": ""string"",
                  ""email"": ""string"",
                  ""status"": 0,
                  ""createdAt"": ""2025-05-14T17:14:53.295Z"",
                  ""updatedAt"": ""2025-05-14T17:14:53.295Z"",
                  ""pets"": [
                    ""string""
                  ],
                  ""adoptionRequests"": [
                    ""string""
                  ]
                },
                ""status"": 0,
                ""requestDate"": ""2025-05-14T17:14:53.295Z"",
                ""updatedAt"": ""2025-05-14T17:14:53.295Z"",
                ""communications"": [
                  {
                    ""id"": 0,
                    ""adoptionRequestId"": 0,
                    ""adoptionRequest"": ""string"",
                    ""senderId"": ""string"",
                    ""sender"": ""string"",
                    ""receiverId"": ""string"",
                    ""receiver"": ""string"",
                    ""sentAt"": ""2025-05-14T17:14:53.295Z""
                  }
                ],
                ""interviewSchedules"": [
                  {
                    ""id"": 0,
                    ""adoptionRequestId"": 0,
                    ""adoptionRequest"": ""string"",
                    ""interviewDate"": ""2025-05-14T17:14:53.295Z"",
                    ""status"": 0,
                    ""notes"": ""string"",
                    ""createdAt"": ""2025-05-14T17:14:53.295Z"",
                    ""updatedAt"": ""2025-05-14T17:14:53.295Z""
                  }
                ]
              }
            ]";

            // Act
            var adoptionRequests = JsonConvert.DeserializeObject<List<AdoptionRequest>>(complexJson);
            var request = adoptionRequests.FirstOrDefault();

            // Assert
            Assert.IsNotNull(request, "Adoption request should not be null");
            
            // Verify primary fields
            Assert.AreEqual(0, request.Id);
            Assert.AreEqual(0, request.PetId);
            Assert.AreEqual(0, request.ShelterId);
            Assert.AreEqual(0, request.Status);
            Assert.AreEqual("string", request.AdopterId);
            
            // Verify pet info
            Assert.IsNotNull(request.Pet);
            Assert.AreEqual(0, request.Pet.Id);
            Assert.AreEqual("string", request.Pet.Name);
            Assert.AreEqual("string", request.Pet.Breed);
            Assert.AreEqual(0, request.Pet.Age);
            
            // Verify shelter info
            Assert.IsNotNull(request.Shelter);
            Assert.AreEqual(0, request.Shelter.Id);
            Assert.AreEqual("string", request.Shelter.Name);
            Assert.AreEqual("string", request.Shelter.Email);
            
            // Verify adopter info
            Assert.IsNotNull(request.Adopter);
            Assert.AreEqual("string", request.Adopter.Id);
            Assert.AreEqual("string", request.Adopter.Username);
            Assert.AreEqual("string", request.Adopter.Email);
            
            // Verify collections
            Assert.IsNotNull(request.Communications);
            Assert.IsTrue(request.Communications.Any());
            
            Assert.IsNotNull(request.InterviewSchedules);
            Assert.IsTrue(request.InterviewSchedules.Any());
        }
        
        [TestMethod]
        public void AdoptionRequest_Creation_Test()
        {
            // Arrange
            var pet = new Pet
            {
                Id = 1,
                Name = "Max",
                Age = 3,
                Breed = "Labrador",
                Description = "Friendly dog",
                Status = 0,
                ImageUrl = "http://example.com/max.jpg"
            };
            
            var shelter = new Shelter
            {
                Id = 1,
                Name = "Happy Paws",
                Address = "123 Pet Street",
                Phone = "123-456-7890",
                Email = "contact@happypaws.com"
            };
            
            var adopter = new User
            {
                Id = "user123",
                Username = "johndoe",
                Email = "john@example.com"
            };
            
            // Act
            var request = new AdoptionRequest
            {
                PetId = pet.Id,
                Pet = pet,
                ShelterId = shelter.Id,
                Shelter = shelter,
                AdopterId = adopter.Id,
                Adopter = adopter,
                Status = (int)AdoptionRequestStatus.Pending,
                RequestDate = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            // Assert
            Assert.AreEqual(pet.Id, request.PetId);
            Assert.AreEqual(shelter.Id, request.ShelterId);
            Assert.AreEqual(adopter.Id, request.AdopterId);
            Assert.AreEqual(AdoptionRequestStatus.Pending, (AdoptionRequestStatus)request.Status);
            
            // Try serializing and deserializing to verify JSON roundtrip
            var serialized = JsonConvert.SerializeObject(request);
            var deserialized = JsonConvert.DeserializeObject<AdoptionRequest>(serialized);
            
            Assert.IsNotNull(deserialized);
            Assert.AreEqual(request.PetId, deserialized.PetId);
            Assert.AreEqual(request.ShelterId, deserialized.ShelterId);
            Assert.AreEqual(request.AdopterId, deserialized.AdopterId);
            Assert.AreEqual(request.Status, deserialized.Status);
        }
        
        [TestMethod]
        public void AdoptionRequest_Enum_Test()
        {
            // Test each enum value
            Assert.AreEqual(0, (int)AdoptionRequestStatus.Pending);
            Assert.AreEqual(1, (int)AdoptionRequestStatus.InterviewScheduled);
            Assert.AreEqual(2, (int)AdoptionRequestStatus.Approved);
            Assert.AreEqual(3, (int)AdoptionRequestStatus.Rejected);
            Assert.AreEqual(4, (int)AdoptionRequestStatus.Cancelled);
            
            // Test conversion from int to enum
            var status = (AdoptionRequestStatus)2;
            Assert.AreEqual(AdoptionRequestStatus.Approved, status);
            
            // Test conversion from enum to int
            int statusValue = (int)AdoptionRequestStatus.Rejected;
            Assert.AreEqual(3, statusValue);
        }
    }
} 