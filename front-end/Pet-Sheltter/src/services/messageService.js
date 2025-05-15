import api from './api';
import * as signalR from '@microsoft/signalr';

// SignalR connection
let connection = null;
let connectionPromise = null;

// Local storage keys
const CONVERSATIONS_STORAGE_KEY = 'pet_shelter_conversations';
const MESSAGES_STORAGE_KEY_PREFIX = 'pet_shelter_messages_';

// API configuration
const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SIGNALR_BASE_URL =
    import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5000/chatHub';

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

// Add message validation helper
const isValidMessage = (message) => {
    return message &&
        typeof message === 'object' &&
        message.id &&
        message.senderId &&
        message.content &&
        message.conversationId;
};

// Update addMessageToStorage to validate messages
const addMessageToStorage = (message) => {
    if (!isValidMessage(message)) {
        console.error('Attempted to store invalid message:', message);
        return;
    }

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

        if (!isValidMessage(message)) {
            console.error('Received invalid message:', message);
            return;
        }

        // Store the message in local storage
        addMessageToStorage(message);

        // This will be handled by the component
        if (window.messageReceived) {
            window.messageReceived(message);
        }
    });

    connection.on('MessageDelivered', (messageId) => {
        console.log('Message delivered:', messageId);

        if (!messageId) {
            console.error('Received invalid messageId:', messageId);
            return;
        }

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
export const initializeSignalRConnection = async() => {
    // If there's an existing connection attempt, return it
    if (connectionPromise) {
        return connectionPromise;
    }

    // If there's an existing connection and it's connected, return it
    if (connection ? .state === signalR.HubConnectionState.Connected) {
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
    connectionPromise = new Promise(async(resolve, reject) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Try HTTPS first, then fall back to HTTP
            const urls = [
                SIGNALR_BASE_URL.replace('http://', 'https://').replace(':5000', ':5001'),
                SIGNALR_BASE_URL
            ];

            let lastError = null;
            for (const url of urls) {
                try {
                    connection = new signalR.HubConnectionBuilder()
                        .withUrl(url, {
                            accessTokenFactory: () => token,
                            skipNegotiation: true,
                            transport: signalR.HttpTransportType.WebSockets
                        })
                        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
                        .configureLogging(signalR.LogLevel.Information)
                        .build();

                    setupSignalRCallbacks();

                    await connection.start();
                    console.log('SignalR Connected to:', url);

                    connectionPromise = null;
                    resolve(connection);
                    return;
                } catch (err) {
                    console.warn(`Failed to connect to ${url}:`, err);
                    lastError = err;
                    // Continue to try the next URL
                }
            }

            // If we get here, all connection attempts failed
            throw lastError || new Error('Failed to connect to SignalR hub');
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

// Get conversations for the current user
export const getConversations = async() => {
    try {
        const response = await api.get('/chat/conversations');
        return response.data;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        if (error.response ? .status === 401) {
            // Token might be invalid, redirect to login
            window.location.href = '/login';
        }
        return [];
    }
};

// Get messages for a specific conversation
export const getMessages = async(conversationId) => {
    try {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
};

// Get chat history with a specific user
export const getChatHistory = async(otherUserId) => {
    try {
        const response = await api.get(`/chat/history/${otherUserId}`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
};

// Create a new conversation
export const createConversation = async(receiverId) => {
    try {
        const response = await api.post('/chat/conversations', { receiverId });
        return response.data;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
};

// Send a message
export const sendMessage = async(conversationId, receiverId, content) => {
    try {
        const response = await api.post('/chat/messages', {
            conversationId,
            receiverId,
            content
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Mark message as delivered
export const markMessageAsDelivered = async(messageId) => {
    try {
        const response = await api.put(`/chat/messages/${messageId}/delivered`);
        return response.data;
    } catch (error) {
        console.error('Error marking message as delivered:', error);
        return null;
    }
};