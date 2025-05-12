import api from './api';
import * as signalR from '@microsoft/signalr';

// SignalR connection
let connection = null;
let connectionPromise = null;

// Local storage keys
const CONVERSATIONS_STORAGE_KEY = 'pet_shelter_conversations';
const MESSAGES_STORAGE_KEY_PREFIX = 'pet_shelter_messages_';

// Get data from local storage
const getStoredConversations = () => {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving conversations from storage:', error);
    return [];
  }
};

// Get messages from local storage
const getStoredMessages = (conversationId) => {
  try {
    const key = `${MESSAGES_STORAGE_KEY_PREFIX}${conversationId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving messages from storage:', error);
    return [];
  }
};

// Save conversations to local storage
const saveConversationsToStorage = (conversations) => {
  try {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations to storage:', error);
  }
};

// Save messages to local storage
const saveMessagesToStorage = (conversationId, messages) => {
  try {
    const key = `${MESSAGES_STORAGE_KEY_PREFIX}${conversationId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages to storage:', error);
  }
};

// Add a message to local storage
const addMessageToStorage = (message) => {
  if (!message || !message.conversationId) return;
  
  const conversationId = message.conversationId;
  const messages = getStoredMessages(conversationId);
  
  // Check if message already exists
  const exists = messages.some(m => m.id === message.id);
  if (!exists) {
    messages.push(message);
    saveMessagesToStorage(conversationId, messages);
    
    // Also update the last message in conversations
    updateConversationLastMessage(conversationId, message);
  }
};

// Update the last message in conversations list
const updateConversationLastMessage = (conversationId, message) => {
  const conversations = getStoredConversations();
  const index = conversations.findIndex(c => c.conversationId === conversationId);
  
  if (index >= 0) {
    conversations[index].lastMessage = {
      content: message.content,
      sentAt: message.sentAt,
      isDelivered: message.isDelivered,
      deliveredAt: message.deliveredAt
    };
    saveConversationsToStorage(conversations);
  }
};

const setupSignalRCallbacks = () => {
  if (!connection) return;

  // Set up event handlers
  connection.on('ReceiveMessage', (message) => {
    console.log('Received message:', message);
    
    // Store the message in local storage
    addMessageToStorage(message);
    
    // This will be handled by the component
    if (window.messageReceived) {
      window.messageReceived(message);
    }
  });

  connection.on('MessageDelivered', (messageId) => {
    console.log('Message delivered:', messageId);
    
    // Update message status in storage
    updateMessageDeliveryStatus(messageId);
    
    // This will be handled by the component
    if (window.messageDelivered) {
      window.messageDelivered(messageId);
    }
  });

  connection.onclose(() => {
    console.log('SignalR Connection closed');
    connectionPromise = null;
  });

  connection.onreconnecting((error) => {
    console.log('SignalR Reconnecting:', error);
  });

  connection.onreconnected((connectionId) => {
    console.log('SignalR Reconnected:', connectionId);
  });
};

// Initialize SignalR connection
export const initializeSignalRConnection = async () => {
  // If there's an existing connection attempt, return it
  if (connectionPromise) {
    return connectionPromise;
  }

  // If there's an existing connection and it's connected, return it
  if (connection?.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  // If there's an existing connection but it's in a bad state, stop it
  if (connection) {
    try {
      await connection.stop();
    } catch (err) {
      console.warn('Error stopping existing connection:', err);
    }
    connection = null;
  }

  // Create a new connection promise
  connectionPromise = new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      connection = new signalR.HubConnectionBuilder()
        .withUrl('https://localhost:5001/chatHub', {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // Retry after 0s, 2s, 5s, 10s, 20s
        .configureLogging(signalR.LogLevel.Information)
        .build();

      setupSignalRCallbacks();
      
      await connection.start();
      console.log('SignalR Connected');
      
      connectionPromise = null;
      resolve(connection);
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      connection = null;
      connectionPromise = null;
      reject(err);
    }
  });

  return connectionPromise;
};

// Update message delivery status in local storage
const updateMessageDeliveryStatus = (messageId) => {
  try {
    // Look through all conversations
    const conversations = getStoredConversations();
    
    for (const conversation of conversations) {
      const messages = getStoredMessages(conversation.conversationId);
      const messageIndex = messages.findIndex(m => m.id === messageId);
      
      if (messageIndex >= 0) {
        messages[messageIndex].isDelivered = true;
        messages[messageIndex].deliveredAt = new Date().toISOString();
        saveMessagesToStorage(conversation.conversationId, messages);
        break;
      }
    }
  } catch (error) {
    console.error('Error updating message delivery status:', error);
  }
};

// Get all conversations for the current user
export const getConversations = async () => {
  try {
    // First try to get from API
    const response = await api.get('/chat/conversations');
    const apiConversations = response.data || [];
    
    // Store the updated conversations
    if (apiConversations.length > 0) {
      saveConversationsToStorage(apiConversations);
      return apiConversations;
    }
    
    // If API returns empty, use local storage
    return getStoredConversations();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    // Return from local storage as fallback
    return getStoredConversations();
  }
};

// Get messages for a specific conversation
export const getMessages = async (conversationId) => {
  try {
    // First try to get from API
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    const apiMessages = response.data || [];
    
    // Store the updated messages
    if (apiMessages.length > 0) {
      saveMessagesToStorage(conversationId, apiMessages);
      return apiMessages;
    }
    
    // If API returns empty, use local storage
    return getStoredMessages(conversationId);
  } catch (error) {
    console.error('Error fetching messages:', error);
    // Return from local storage as fallback
    return getStoredMessages(conversationId);
  }
};

// Get chat history with a specific user
export const getChatHistory = async (otherUserId) => {
  try {
    const response = await api.get(`/chat/history/${otherUserId}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

// Create a new conversation
export const createConversation = async (receiverId, receiverUsername) => {
  try {
    const response = await api.post('/chat/conversations', { receiverId });
    
    // If successful, store in local storage
    if (response.data) {
      const newConversation = response.data;
      const conversations = getStoredConversations();
      
      // Add user display name to conversation
      newConversation.otherUser = {
        ...newConversation.otherUser,
        username: receiverUsername || newConversation.otherUser.username
      };
      
      conversations.push(newConversation);
      saveConversationsToStorage(conversations);
      
      return newConversation;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    
    // Create a mock response for testing
    const senderUsername = localStorage.getItem('username') || 'You';
    const mockConversationId = Math.floor(Math.random() * 1000) + 1;
    const mockResponse = {
      conversationId: mockConversationId,
      otherUser: {
        id: receiverId,
        username: receiverUsername || 'User'
      }
    };
    
    const conversations = getStoredConversations();
    conversations.push(mockResponse);
    saveConversationsToStorage(conversations);
    
    return mockResponse;
  }
};

// Send a message via REST API
export const sendMessage = async (conversationId, receiverId, content, receiverUsername) => {
  const senderUsername = localStorage.getItem('username') || 'You';
  
  try {
    // First try to send via SignalR
    const signalRSuccess = await sendMessageViaSignalR(conversationId, receiverId, content);
    if (signalRSuccess) {
      return;
    }

    // If SignalR fails, fall back to REST API
    const response = await api.post('/chat/messages', {
      conversationId: parseInt(conversationId),
      receiverId,
      content
    });
    
    // Add username information to the message
    const messageWithUsername = {
      ...response.data,
      senderUsername,
      receiverUsername: receiverUsername || 'User'
    };
    
    // Store in local storage
    addMessageToStorage(messageWithUsername);
    
    return messageWithUsername;
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Create a mock message for testing
    const mockMessage = {
      id: Math.floor(Math.random() * 10000) + 1,
      senderId: localStorage.getItem('userId') || 'current-user-id',
      senderUsername,
      receiverId,
      receiverUsername: receiverUsername || 'User',
      content,
      sentAt: new Date().toISOString(),
      conversationId,
      isDelivered: false
    };
    
    // Store in local storage
    addMessageToStorage(mockMessage);
    
    return mockMessage;
  }
};

// Send a message via SignalR
export const sendMessageViaSignalR = async (conversationId, receiverId, content) => {
  try {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      connection = await initializeSignalRConnection();
    }

    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }

    await connection.invoke('SendMessage', conversationId, receiverId, content);
    return true;
  } catch (error) {
    console.error('Error sending message via SignalR:', error);
    return false;
  }
};

// Mark a message as delivered
export const markMessageAsDelivered = async (messageId) => {
  try {
    // First try to mark via SignalR
    const signalRSuccess = await markMessageAsDeliveredViaSignalR(messageId);
    if (signalRSuccess) {
      return;
    }

    // If SignalR fails, fall back to REST API
    const response = await api.put(`/chat/messages/${messageId}/delivered`);
    
    // Update in local storage
    updateMessageDeliveryStatus(messageId);
    
    return response.data;
  } catch (error) {
    console.error('Error marking message as delivered:', error);
    
    // Update in local storage anyway
    updateMessageDeliveryStatus(messageId);
    
    return { id: messageId, isDelivered: true };
  }
};

// Mark a message as delivered via SignalR
export const markMessageAsDeliveredViaSignalR = async (messageId) => {
  try {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      connection = await initializeSignalRConnection();
    }

    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected');
    }

    await connection.invoke('MarkMessageAsDelivered', messageId);
    return true;
  } catch (error) {
    console.error('Error marking message as delivered via SignalR:', error);
    return false;
  }
}; 