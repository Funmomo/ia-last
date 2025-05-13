import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Styles/Messaging.module.css';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markMessageAsDelivered,
  initializeSignalRConnection,
  createConversation
} from '../services/messageService';
import { getShelters, getAdopters, getAllUsers } from '../services/userService';

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
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Get user info from localStorage
  const userId = localStorage.getItem('userId') || 'current-user-id';
  const userRole = parseInt(localStorage.getItem('userRole') || '2');

  useEffect(() => {
    // Set up SignalR connection
    const setupSignalR = async () => {
      const connection = await initializeSignalRConnection();
      
      if (connection) {
        // Handle receiving messages
        window.messageReceived = (message) => {
          if (selectedConversation && message.conversationId === selectedConversation.conversationId) {
            setMessages(prevMessages => [...prevMessages, message]);
            markMessageAsDelivered(message.id);
          } else {
            // Update unread count in conversation list
            setConversations(prevConversations => 
              prevConversations.map(conv => 
                conv.conversationId === message.conversationId 
                  ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
                  : conv
              )
            );
          }
        };

        // Handle message delivery status
        window.messageDelivered = (messageId) => {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId ? { ...msg, isDelivered: true } : msg
            )
          );
        };
      }
    };

    setupSignalR();
    loadConversations();

    // Cleanup function
    return () => {
      window.messageReceived = null;
      window.messageDelivered = null;
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
      
      // Mark unread messages as delivered
      data.forEach(message => {
        if (!message.isDelivered && message.receiverId === userId) {
          markMessageAsDelivered(message.id);
        }
      });
      
      // Clear unread count for this conversation
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.conversationId === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      let users = [];
      
      // Based on user role, load either shelters or adopters
      if (userRole === 2) {
        users = await getShelters(); // Adopters can message shelters
      } else {
        users = await getAdopters(); // Shelters can message adopters
      }
      
      // If no users found, try the general users endpoint as fallback
      if (!users || users.length === 0) {
        console.log('No users found via role-specific endpoint, trying fallback...');
        const allUsers = await getAllUsers();
        
        // Filter users based on role (exclude current user)
        if (allUsers && allUsers.length > 0) {
          users = allUsers.filter(user => 
            user.id !== userId && 
            ((userRole === 2 && user.role === 1) || (userRole === 1 && user.role === 2))
          );
        }
      }
      
      // If still no users, create some mock data for testing
      if (!users || users.length === 0) {
        console.log('Creating mock users for testing...');
        users = [
          { id: 'test1', username: 'Shelter 1', email: 'shelter1@example.com', role: 1 },
          { id: 'test2', username: 'Adopter 1', email: 'adopter1@example.com', role: 2 },
          { id: 'test3', username: 'Shelter 2', email: 'shelter2@example.com', role: 1 }
        ].filter(user => 
          (userRole === 2 && user.role === 1) || (userRole === 1 && user.role === 2)
        );
      }
      
      setAvailableUsers(users);
      setLoadingUsers(false);
    } catch (error) {
      console.error('Error loading available users:', error);
      // Set mock data in case of error
      const mockUsers = [
        { id: 'test1', username: 'Shelter 1', email: 'shelter1@example.com', role: 1 },
        { id: 'test2', username: 'Adopter 1', email: 'adopter1@example.com', role: 2 },
        { id: 'test3', username: 'Shelter 2', email: 'shelter2@example.com', role: 1 }
      ].filter(user => 
        (userRole === 2 && user.role === 1) || (userRole === 1 && user.role === 2)
      );
      
      setAvailableUsers(mockUsers);
      setLoadingUsers(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.conversationId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const message = await sendMessage(
        selectedConversation.conversationId,
        selectedConversation.otherUser.id,
        newMessage.trim()
      );
      
      setMessages(prevMessages => [...prevMessages, message]);
      setNewMessage('');
      messageInputRef.current.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateConversation = async () => {
    if (!selectedUser) return;
    
    try {
      const newConversation = await createConversation(selectedUser.id);
      
      // Add the new conversation to the list
      const conversationData = {
        conversationId: newConversation.conversationId,
        otherUser: selectedUser,
        lastMessage: newConversation.message,
        unreadCount: 0
      };
      
      setConversations(prev => [conversationData, ...prev]);
      setSelectedConversation(conversationData);
      setMessages([newConversation.message]);
      setShowNewChatModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error creating conversation:', error);
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
                  messages.map((message, index) => (
                    <div 
                      key={message.id || index} 
                      className={`${styles.messageItem} ${message.senderId === userId ? styles.sent : styles.received}`}
                    >
                      {message.content}
                      <div className={styles.messageTime}>
                        {formatTime(message.sentAt)}
                        {message.senderId === userId && (
                          <span className={styles.messageStatus}>
                            {message.isDelivered ? ' • Delivered' : ' • Sending...'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
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