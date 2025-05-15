import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Styles/Messaging.module.css';
import { getConversations, getMessages, markMessageAsDelivered, sendMessage } from '../services/messageService';
import { getShelters, getAdopters } from '../services/userService';
import * as signalR from '../services/signalRService';

const Messaging = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  const userRole = parseInt(localStorage.getItem('userRole') || '2');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const setupSignalR = async () => {
      try {
        // Set up message handlers before connecting
        window.messageReceived = handleMessageReceived;
        window.messageDelivered = handleMessageDelivered;

        // Start SignalR connection
        const connected = await signalR.startSignalRConnection();
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Error setting up SignalR:', error);
        setConnectionStatus('error');
      }
    };

    setupSignalR();
    loadConversations();

    // Cleanup function
    return () => {
      window.messageReceived = null;
      window.messageDelivered = null;
      signalR.stopSignalRConnection();
    };
  }, []);

  const handleMessageReceived = (message) => {
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages(prevMessages => [...prevMessages, message]);
      signalR.markMessageAsDelivered(message.id);
    } else {
      // Update unread count in conversation list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === message.conversationId 
            ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
            : conv
        )
      );
    }
  };

  const handleMessageDelivered = (messageId) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, isDelivered: true } : msg
      )
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await getMessages(conversationId);
      if (Array.isArray(data)) {
        setMessages(data);
        
        // Mark unread messages as delivered
        data.forEach(message => {
          if (!message.isDelivered && message.receiverId === userId) {
            markMessageAsDelivered(message.id);
          }
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const receiverId = selectedConversation.participant1Id === userId 
        ? selectedConversation.participant2Id 
        : selectedConversation.participant1Id;

      const message = await sendMessage(
        selectedConversation.id,
        receiverId,
        newMessage.trim()
      );

      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        messageInputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Function to get initials from a name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Handle opening the new chat modal
  const handleOpenNewChatModal = () => {
    setShowNewChatModal(true);
    setUserSearchTerm('');
    setSelectedUser(null);
    loadAvailableUsers();
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter available users based on search term
  const filteredUsers = availableUsers.filter(user => 
    user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Update message rendering to show failed state
  const renderMessage = (message) => (
    <div 
      key={message?.id} 
      className={`${styles.messageItem} ${message?.senderId === userId ? styles.sent : styles.received} ${message?.failed ? styles.failed : ''}`}
    >
      {message?.content}
      <div className={styles.messageTime}>
        {message?.sentAt && formatTime(message.sentAt)}
        {message?.senderId === userId && (
          <span className={styles.messageStatus}>
            {message?.failed ? ' • Failed' : message?.isDelivered ? ' • Delivered' : ' • Sending...'}
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.messagingContainer}>
      <div className={styles.messagingHeader}>
        <h1 className={styles.headerTitle}>Messages</h1>
        <div className={`${styles.connectionStatus} ${styles[connectionStatus]}`}>
          {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      <div className={styles.messagingContent}>
        {/* Conversations List */}
        <div className={styles.conversationsList}>
          <div className={styles.conversationsHeader}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filteredConversations.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateTitle}>No conversations yet</div>
              <p className={styles.emptyStateText}>
                Start a new conversation by clicking the button below
              </p>
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <div 
                key={conversation.conversationId} 
                className={`${styles.conversationItem} ${selectedConversation?.conversationId === conversation.conversationId ? styles.active : ''}`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className={styles.profilePic}>
                  {getInitials(conversation.otherUser.username)}
                </div>
                <div className={styles.conversationInfo}>
                  <div className={styles.conversationName}>
                    {conversation.otherUser.username}
                  </div>
                  <div className={styles.lastMessage}>
                    {conversation.lastMessage?.content}
                  </div>
                </div>
                <div>
                  <div className={styles.conversationTime}>
                    {conversation.lastMessage?.sentAt && formatTime(conversation.lastMessage.sentAt)}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className={styles.unreadBadge}>
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Chat Area */}
        <div className={styles.chatArea}>
          {selectedConversation ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.profilePic}>
                  {getInitials(selectedConversation.otherUser.username)}
                </div>
                <div className={styles.chatName}>
                  {selectedConversation.otherUser.username}
                </div>
              </div>
              
              <div className={styles.messagesList}>
                {messages.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateTitle}>No messages yet</div>
                    <p className={styles.emptyStateText}>
                      Send a message to start the conversation
                    </p>
                  </div>
                ) : (
                  messages.filter(message => message && typeof message === 'object')
                    .map(renderMessage)
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form className={styles.messageInputArea} onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className={styles.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  ref={messageInputRef}
                />
                <button 
                  type="submit" 
                  className={styles.sendButton}
                  disabled={!newMessage.trim()}
                >
                  →
                </button>
              </form>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>💬</div>
              <div className={styles.emptyStateTitle}>Select a conversation</div>
              <p className={styles.emptyStateText}>
                Choose a conversation from the sidebar or start a new one
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* New Chat Button */}
      <button 
        className={styles.newChatButton}
        onClick={handleOpenNewChatModal}
      >
        +
      </button>
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>New Conversation</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowNewChatModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Select a user to start a conversation with:</p>
              
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
              
              {loadingUsers ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                </div>
              ) : (
                <div className={styles.userList}>
                  {filteredUsers.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <div 
                        key={user.id} 
                        className={`${styles.userItem} ${selectedUser?.id === user.id ? styles.selected : ''}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className={styles.profilePic}>
                          {getInitials(user.username)}
                        </div>
                        <div className={styles.userName}>
                          {user.username}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button 
              className={styles.modalButton}
              disabled={!selectedUser}
              onClick={handleCreateConversation}
            >
              Start Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messaging; 