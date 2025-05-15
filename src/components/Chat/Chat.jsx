import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import messageService from '../../services/messageService';
import NewConversation from './NewConversation';
import './Chat.css';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connection, setConnection] = useState(null);
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const messagesEndRef = useRef(null);

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    };

    // Initialize SignalR connection
    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:5001/chatHub', {
                accessTokenFactory: () => localStorage.getItem('token')
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    // Start SignalR connection
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('SignalR Connected');
                    
                    // Handle receiving messages
                    connection.on('ReceiveMessage', (message) => {
                        if (currentConversation?.id === message.conversationId) {
                            setMessages(prev => [...prev, message]);
                            messageService.markMessageAsDelivered(message.id);
                        }
                        // Refresh conversations to update last message
                        loadConversations();
                    });

                    // Handle message delivery status
                    connection.on('MessageDelivered', (messageId) => {
                        setMessages(prev => prev.map(msg => 
                            msg.id === messageId ? { ...msg, isDelivered: true } : msg
                        ));
                    });

                    // Handle new conversation created
                    connection.on('ConversationCreated', (conversation) => {
                        setConversations(prev => [conversation, ...prev]);
                    });

                    // Handle user connection status
                    connection.on('UserConnected', (user) => {
                        console.log('User connected:', user);
                        // You can update the UI to show the user's online status
                    });

                    connection.on('UserDisconnected', (user) => {
                        console.log('User disconnected:', user);
                        // You can update the UI to show the user's offline status
                    });
                })
                .catch(error => console.error('SignalR Connection Error:', error));

            return () => {
                connection.stop();
            };
        }
    }, [connection, currentConversation]);

    // Load conversations
    useEffect(() => {
        loadConversations();
    }, []);

    // Load messages when conversation changes
    useEffect(() => {
        if (currentConversation) {
            loadMessages(currentConversation.id);
        }
    }, [currentConversation]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversations = async () => {
        try {
            const data = await messageService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const loadMessages = async (conversationId) => {
        try {
            const data = await messageService.getMessages(conversationId);
            setMessages(data);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) {
            return;
        }
        
        if (!currentConversation?.id) {
            showToast('Please select a conversation first');
            return;
        }

        try {
            const receiverId = currentConversation.participant2?.id;
            if (!receiverId) {
                showToast('Invalid receiver ID');
                return;
            }

            const message = await messageService.sendMessage(
                currentConversation.id,
                receiverId,
                newMessage.trim()
            );
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            loadConversations();
        } catch (error) {
            showToast('Failed to send message: ' + error.message);
        }
    };

    const handleNewConversation = (conversation) => {
        setConversations(prev => [conversation, ...prev]);
        setCurrentConversation(conversation);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            {toast.show && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
            <div className="chat-container">
                <div className="conversations-list">
                    <div className="conversations-header">
                        <h2>Conversations</h2>
                        <button 
                            className="new-conversation-button"
                            onClick={() => setShowNewConversation(true)}
                        >
                            New Chat
                        </button>
                    </div>
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
                            onClick={() => setCurrentConversation(conv)}
                        >
                            <div className="conversation-info">
                                <span className="username">{conv.participant2.username}</span>
                                {conv.lastMessage && (
                                    <p className="last-message">{conv.lastMessage.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chat-main">
                    {currentConversation ? (
                        <>
                            <div className="chat-header">
                                <h3>{currentConversation.participant2.username}</h3>
                            </div>
                            
                            <div className="messages-container">
                                {messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`message ${message.senderId === localStorage.getItem('userId') ? 'sent' : 'received'}`}
                                    >
                                        <div className="message-content">
                                            {message.content}
                                            <span className="message-time">
                                                {new Date(message.sentAt).toLocaleTimeString()}
                                            </span>
                                            {message.senderId === localStorage.getItem('userId') && (
                                                <span className="delivery-status">
                                                    {message.isDelivered ? '✓✓' : '✓'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="message-input" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                />
                                <button type="submit">Send</button>
                            </form>
                        </>
                    ) : (
                        <div className="no-conversation">
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>

            {showNewConversation && (
                <>
                    <div className="overlay" onClick={() => setShowNewConversation(false)} />
                    <NewConversation
                        onConversationCreated={handleNewConversation}
                        onClose={() => setShowNewConversation(false)}
                    />
                </>
            )}
        </>
    );
};

export default Chat; 