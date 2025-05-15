import axios from 'axios';

const API_URL = 'https://localhost:5001/api';

class MessageService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor to add auth token
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    // Get all conversations for current user
    async getConversations() {
        try {
            const response = await this.axiosInstance.get('/chat/conversations');
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    // Get messages for a specific conversation
    async getMessages(conversationId) {
        try {
            if (!conversationId) {
                console.warn('No conversation ID provided to getMessages');
                return [];
            }
            console.log('Fetching messages for conversation:', conversationId);
            const response = await this.axiosInstance.get(`/chat/conversations/${conversationId}/messages`);
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', {
                conversationId,
                error: error.response ? .data || error.message
            });
            return [];
        }
    }

    // Create a new conversation
    async createConversation(participantId) {
        try {
            const response = await this.axiosInstance.post('/chat/conversations', {
                participantId: participantId
            });
            return response.data;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    // Send a message
    async sendMessage(conversationId, receiverId, content) {
        try {
            const response = await this.axiosInstance.post('/chat/messages', {
                conversationId,
                receiverId,
                content
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    // Mark message as delivered
    async markMessageAsDelivered(messageId) {
        try {
            const response = await this.axiosInstance.put(`/chat/messages/${messageId}/delivered`);
            return response.data;
        } catch (error) {
            console.error('Error marking message as delivered:', error);
            throw error;
        }
    }
}

export default new MessageService();