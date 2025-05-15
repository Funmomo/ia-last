import React, { useState, useEffect } from 'react';
import messageService from '../../services/messageService';
import userService from '../../services/userService';
import './NewConversation.css';

const NewConversation = ({ onConversationCreated, onClose }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            // Filter out the current user
            const filteredUsers = response.filter(user => 
                user.id !== localStorage.getItem('userId')
            );
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartConversation = async (userId) => {
        try {
            const conversation = await messageService.createConversation(userId);
            onConversationCreated(conversation);
            onClose();
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="new-conversation-container">
            <div className="new-conversation-header">
                <h3>New Conversation</h3>
                <button className="close-button" onClick={onClose}>&times;</button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="users-list">
                {loading ? (
                    <div className="loading">Loading users...</div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <div key={user.id} className="user-item">
                            <div className="user-info">
                                <span className="username">{user.username}</span>
                                <span className="role">{user.role === 1 ? 'Shelter Staff' : 'Adopter'}</span>
                            </div>
                            <button
                                className="start-chat-button"
                                onClick={() => handleStartConversation(user.id)}
                            >
                                Start Chat
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="no-results">No users found</div>
                )}
            </div>
        </div>
    );
};

export default NewConversation; 