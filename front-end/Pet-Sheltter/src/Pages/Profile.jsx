import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import styles from '../Styles/Profile.module.css';

const API_BASE_URL = 'https://localhost:5001'; // Using HTTPS

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [userStatus, setUserStatus] = useState('Online');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  const connectionId = localStorage.getItem('connectionId') || crypto.randomUUID();

  useEffect(() => {
    // Store connection ID for future use
    if (!localStorage.getItem('connectionId')) {
      localStorage.setItem('connectionId', connectionId);
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);

        console.log('Starting profile data initialization...');
        
        // Fetch profile data
        console.log('Fetching profile data...');
        await fetchProfile();
        console.log('Profile data fetched successfully');
        
        // Get online users
        console.log('Fetching online users...');
        try {
          await fetchOnlineUsers();
          console.log('Online users fetched successfully');
        } catch (onlineUsersError) {
          console.error('Error fetching online users:', onlineUsersError);
          // Continue with other operations even if this fails
        }
        
        // Connect user to the system
        console.log('Connecting user to the system...');
        try {
          await connectUser();
          console.log('User connected successfully');
        } catch (connectError) {
          console.error('Error connecting user:', connectError);
          // Continue even if this fails
        }

        // Fetch user's adoption requests
        console.log('Fetching adoption requests...');
        try {
          await fetchAdoptionRequests();
          console.log('Adoption requests fetched successfully');
        } catch (adoptionRequestsError) {
          console.error('Error fetching adoption requests:', adoptionRequestsError);
          // Continue even if this fails
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing profile:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfileData();

    // Cleanup: disconnect user when component unmounts
    return () => {
      disconnectUser().catch(console.error);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('userEmail');
      
      // Attempt to fetch user data from backend if there's a user endpoint
      try {
        const response = await fetch(`${API_BASE_URL}/api/Profile/me`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setProfile(userData);
          setFormData({
            username: userData.username || '',
            email: userData.email || '',
          });
          return;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch profile: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
        // Only fall back to localStorage if it's a network error
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          console.log('Network error, falling back to localStorage');
          const userInfo = {
            username: localStorage.getItem('username') || '',
            email: email || '',
            role: localStorage.getItem('userRole') || '0',
          };
          setProfile(userInfo);
          setFormData({
            username: userInfo.username || '',
            email: userInfo.email || '',
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      throw err;
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/User/online`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch online users: ${response.status}`);
      }

      const data = await response.json();
      setOnlineUsers(data);
    } catch (err) {
      console.error('Error fetching online users:', err);
      throw err;
    }
  };

  const connectUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const userInfo = {
        connectionId: connectionId,
        username: localStorage.getItem('userEmail') || 'Anonymous User',
        status: userStatus,
        lastSeen: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/api/User/connect`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userInfo)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to connect user: ${response.status}`);
      }
    } catch (err) {
      console.error('Error connecting user:', err);
      throw err;
    }
  };

  const disconnectUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/User/disconnect`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(connectionId)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to disconnect user: ${response.status}`);
      }
    } catch (err) {
      console.error('Error disconnecting user:', err);
      // Don't throw here to avoid issues during unmount
    }
  };

  const updateUserStatus = async (status) => {
    try {
      const token = localStorage.getItem('token');
      
      const statusUpdate = {
        connectionId: connectionId,
        status: status
      };

      const response = await fetch(`${API_BASE_URL}/api/User/status`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusUpdate)
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      setUserStatus(status);
      setFormData(prev => ({ ...prev, status }));
    } catch (err) {
      console.error('Error updating user status:', err);
      throw err;
    }
  };

  const fetchAdoptionRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        console.log('User not authenticated, skipping adoption requests fetch');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Adoption/user/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch adoption requests: ${response.status}`);
      }

      const data = await response.json();
      setAdoptionRequests(data);
    } catch (err) {
      console.error('Error fetching adoption requests:', err);
      throw err;
    }
  };

  const getAdoptionStatusText = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Interview Scheduled';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 0: return styles.statusPending;
      case 1: return styles.statusInterview;
      case 2: return styles.statusApproved;
      case 3: return styles.statusRejected;
      case 4: return styles.statusCancelled;
      default: return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Make API call to update profile in the database
      const response = await fetch(`${API_BASE_URL}/api/Profile/me`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }

      // Update local storage after successful API call
      localStorage.setItem('username', formData.username);

      // Update the profile state
      setProfile({
        ...profile,
        username: formData.username,
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          <div className={styles.loading}>Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          <div className={styles.error}>
            <h3>Error Loading Your Profile</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navigation />
      <div className={styles.content}>
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <h1 className={styles.title}>My Profile</h1>
          </div>

          {isEditing ? (
            <form className={styles.profileForm} onSubmit={handleSubmit}>
              <div className={styles.formGroupContainer}>
                <div className={styles.formGroup}>
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.profileInfo}>
              <div className={styles.infoSection}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Username</span>
                    <span className={styles.infoValue}>
                      {profile?.username}
                    </span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{profile?.email}</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Account Type</span>
                    <span className={styles.infoValue}>
                      {parseInt(profile?.role || 0) === 1 ? 'Staff' : 'Adopter'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.editButtonContainer}>
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* Adoption Requests Section */}
          <div className={styles.adoptionRequestsSection}>
            <h2 className={styles.sectionTitle}>My Adoption Requests</h2>
            
            {adoptionRequests.length > 0 ? (
              <div className={styles.requestsContainer}>
                {adoptionRequests.map(request => (
                  <div key={request.id} className={styles.requestCard}>
                    <div className={styles.requestHeader}>
                      <h3>{request.pet?.name || `Pet #${request.petId}`}</h3>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
                        {getAdoptionStatusText(request.status)}
                      </span>
                    </div>
                    <div className={styles.requestDetails}>
                      <p>
                        <strong>Shelter:</strong> {request.shelter?.name || `Shelter #${request.shelterId}`}
                      </p>
                      <p>
                        <strong>Request Date:</strong> {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Last Updated:</strong> {new Date(request.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noRequests}>
                <p>You haven't submitted any adoption requests yet.</p>
                <p>Visit the <a href="/adopter/pets">Pets page</a> to find your new friend!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 