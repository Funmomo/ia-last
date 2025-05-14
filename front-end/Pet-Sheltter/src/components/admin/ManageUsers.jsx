import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchUsername, setSearchUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('https://localhost:5001/api/Admin/users', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Validate response data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Filter out admin users (role 0) and ensure we have an array
      const userData = Array.isArray(response.data) 
        ? response.data.filter(user => user.role !== 0)
        : [];
      
      console.log('Fetched users:', userData);
      
      setUsers(userData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setLoading(false);
      setUsers([]); // Reset users to empty array on error
    }
  };

  const searchUsersByUsername = async (username) => {
    if (!username.trim()) {
      return fetchUsers(); // If search is empty, fetch all users
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`https://localhost:5001/api/Admin/users/username/${username}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Validate response data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Ensure we have an array and filter out admin users
      const userData = Array.isArray(response.data) 
        ? response.data.filter(user => user.role !== 0)
        : [response.data].filter(user => user && user.role !== 0);
      
      setUsers(userData);
      setLoading(false);
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err.message || 'Failed to search users');
      setLoading(false);
      setUsers([]); // Reset users to empty array on error
    }
  };

  const filterUsersByRole = async (role) => {
    if (!role) {
      return fetchUsers(); // If no role selected, fetch all users
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`https://localhost:5001/api/Admin/users/role/${role}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Validate response data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Ensure we have an array
      const userData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
      setUsers(userData);
      setLoading(false);
    } catch (err) {
      console.error('Error filtering users by role:', err);
      setError(err.message || 'Failed to filter users');
      setLoading(false);
      setUsers([]); // Reset users to empty array on error
    }
  };

  // Handle search input changes with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchUsername(value);
    
    // Clear any existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Set new timeout for search
    window.searchTimeout = setTimeout(() => {
      searchUsersByUsername(value);
    }, 500); // Wait 500ms after user stops typing
  };

  // Handle role filter changes
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    filterUsersByRole(role);
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(`https://localhost:5001/api/Admin/users/${userId}/status`, 
        { status: newStatus },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh the list based on current filters
      if (selectedRole) {
        await filterUsersByRole(selectedRole);
      } else if (searchUsername) {
        await searchUsersByUsername(searchUsername);
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`https://localhost:5001/api/Admin/users/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh the list based on current filters
      if (selectedRole) {
        await filterUsersByRole(selectedRole);
      } else if (searchUsername) {
        await searchUsersByUsername(searchUsername);
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 1: return 'Shelter Staff';
      case 2: return 'Adopter';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Manage Users</h2>
        <div className={styles['loading']}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles['admin-section']}>
      <h2 className={styles['admin-section-title']}>Manage Users</h2>
      
      {/* Search and Filter Controls */}
      <div className={styles['admin-controls']}>
        <div className={styles['search-bar']}>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchUsername}
            onChange={handleSearchChange}
            className={styles['admin-input']}
          />
        </div>
        <div className={styles['role-filter']}>
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className={styles['admin-select']}
          >
            <option value="">All Roles</option>
            <option value="1">Shelter Staff</option>
            <option value="2">Adopter</option>
          </select>
        </div>
      </div>

      {error && (
        <div className={styles['error-message']}>
          {error}
          <button 
            onClick={() => {
              if (selectedRole) {
                filterUsersByRole(selectedRole);
              } else if (searchUsername) {
                searchUsersByUsername(searchUsername);
              } else {
                fetchUsers();
              }
            }}
            className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
          >
            Retry
          </button>
        </div>
      )}

      {!error && (!Array.isArray(users) || users.length === 0) && (
        <div className={styles['no-data']}>
          No users found.
        </div>
      )}

      {Array.isArray(users) && users.length > 0 && (
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id || user.userId}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{getRoleText(user.role)}</td>
                <td>{user.status || 'Active'}</td>
                <td>
                  <div className={styles['action-buttons']}>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
                      onClick={() => updateUserStatus(user.id || user.userId, user.status === 'active' ? 'inactive' : 'active')}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                      onClick={() => deleteUser(user.id || user.userId)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers; 