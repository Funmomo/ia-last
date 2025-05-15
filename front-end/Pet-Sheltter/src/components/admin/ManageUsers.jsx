import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

const EditUserModal = ({ user, onClose, onSave }) => {
  console.log('User data in modal:', user);

  const [formData, setFormData] = useState({
    userId: user.userId || user.id || '',
    username: user.username || '',
    email: user.email || '',
    role: parseInt(user.role) || 2,
  });

  console.log('Initial form data:', formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    onSave(formData);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h3 className={styles['modal-title']}>Edit User</h3>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className={styles['modal-form']}>
          <input
            type="hidden"
            name="userId"
            value={formData.userId}
          />
          <div className={styles['form-control']}>
            <label className={styles['form-label']}>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={styles['form-input']}
              required
            />
          </div>
          <div className={styles['form-control']}>
            <label className={styles['form-label']}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles['form-input']}
              required
            />
          </div>
          <div className={styles['form-control']}>
            <label className={styles['form-label']}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles['form-input']}
              required
            >
              <option value={1}>Shelter Staff</option>
              <option value={2}>Adopter</option>
            </select>
          </div>
          <div className={styles['modal-footer']}>
            <button 
              type="button" 
              onClick={onClose}
              className={`${styles['modal-btn']} ${styles['modal-btn-cancel']}`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={`${styles['modal-btn']} ${styles['modal-btn-save']}`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchUsername, setSearchUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [editingUser, setEditingUser] = useState(null);

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

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const userData = Array.isArray(response.data) 
        ? response.data.filter(user => user.role !== 0)
        : [];
      
      console.log('Raw user data from API:', userData);

      const processedUsers = userData.map(user => {
        console.log('Processing user:', user);
        return {
          ...user,
          userId: user.userId || user.id
        };
      });

      console.log('Processed users:', processedUsers);
      
      setUsers(processedUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setLoading(false);
      setUsers([]);
    }
  };

  const searchUsersByUsername = async (username) => {
    if (!username.trim()) {
      return fetchUsers();
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

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const userData = Array.isArray(response.data) 
        ? response.data.filter(user => user.role !== 0)
        : [response.data].filter(user => user && user.role !== 0);

      const processedUsers = userData.map(user => ({
        ...user,
        userId: user.userId || user.id
      }));
      
      setUsers(processedUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err.message || 'Failed to search users');
      setLoading(false);
      setUsers([]);
    }
  };

  const filterUsersByRole = async (role) => {
    if (!role) {
      return fetchUsers();
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

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const userData = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean);
      const processedUsers = userData.map(user => ({
        ...user,
        userId: user.userId || user.id
      }));

      setUsers(processedUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error filtering users by role:', err);
      setError(err.message || 'Failed to filter users');
      setLoading(false);
      setUsers([]);
    }
  };

  const editUser = (userId) => {
    console.log('Editing user with userId:', userId);
    const userToEdit = users.find(user => user.userId === userId);
    console.log('Found user to edit:', userToEdit);
    if (userToEdit) {
      setEditingUser(userToEdit);
    } else {
      setError('User not found');
    }
  };

  const handleSaveUser = async (formData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Updating user with data:', formData);

      if (!formData.userId) {
        console.error('Missing userId in formData');
        throw new Error('Invalid user ID - No userId found');
      }

      const updatedData = {
        userId: formData.userId,
        username: formData.username,
        email: formData.email,
        role: parseInt(formData.role)
      };

      console.log('Making API call with data:', updatedData);

      const response = await axios.put(`https://localhost:5001/api/Admin/users/${formData.userId}`, 
        updatedData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API response:', response);

      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update user');
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

      if (!userId) {
        throw new Error('Invalid user ID');
      }

      await axios.delete(`https://localhost:5001/api/Admin/users/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (selectedRole) {
        await filterUsersByRole(selectedRole);
      } else if (searchUsername) {
        await searchUsersByUsername(searchUsername);
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchUsername(value);
    
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    window.searchTimeout = setTimeout(() => {
      searchUsersByUsername(value);
    }, 500);
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    filterUsersByRole(role);
  };

  const getRoleText = (role) => {
    switch (parseInt(role)) {
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.userId || `user-${Math.random()}`}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{getRoleText(user.role)}</td>
                <td>
                  <div className={styles['action-buttons']}>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
                      onClick={() => editUser(user.userId)}
                    >
                      Edit
                    </button>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                      onClick={() => deleteUser(user.userId)}
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

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default ManageUsers; 