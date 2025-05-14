import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

const ManageShelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newShelter, setNewShelter] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('https://localhost:5001/api/Shelter', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Validate response data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Ensure we have an array of shelters
      const shelterData = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched shelters:', shelterData);
      
      setShelters(shelterData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching shelters:', err);
      setError(err.message || 'Failed to fetch shelters');
      setLoading(false);
      setShelters([]); // Reset shelters to empty array on error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShelter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createShelter = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post('https://localhost:5001/api/Shelter', newShelter, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNewShelter({ name: '', address: '', phone: '', email: '' });
      await fetchShelters(); // Refresh the list
    } catch (err) {
      console.error('Error creating shelter:', err);
      setError(err.message || 'Failed to create shelter');
    }
  };

  const updateShelterStatus = async (shelterId, isActive) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get current shelter data first
      const currentShelter = await axios.get(`https://localhost:5001/api/Shelter/${shelterId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!currentShelter.data) {
        throw new Error('Failed to fetch current shelter details');
      }

      // Update the shelter with new status
      await axios.put(`https://localhost:5001/api/Shelter/${shelterId}`, 
        {
          ...currentShelter.data,
          isActive: !isActive
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchShelters(); // Refresh the list
    } catch (err) {
      console.error('Error updating shelter:', err);
      setError(err.message || 'Failed to update shelter status');
    }
  };

  const deleteShelter = async (shelterId) => {
    if (!window.confirm('Are you sure you want to delete this shelter?')) return;
    
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`https://localhost:5001/api/Shelter/${shelterId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await fetchShelters(); // Refresh the list
    } catch (err) {
      console.error('Error deleting shelter:', err);
      setError(err.message || 'Failed to delete shelter');
    }
  };

  if (loading) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Manage Shelters</h2>
        <div className={styles['loading']}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles['admin-section']}>
      <h2 className={styles['admin-section-title']}>Manage Shelters</h2>

      {error && (
        <div className={styles['error-message']}>
          {error}
          <button 
            onClick={fetchShelters}
            className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
          >
            Retry
          </button>
        </div>
      )}

      {/* Add New Shelter Form */}
      <form onSubmit={createShelter} className={styles['admin-form']}>
        <div className={styles['form-group']}>
          <input
            type="text"
            name="name"
            value={newShelter.name}
            onChange={handleInputChange}
            placeholder="Shelter Name"
            required
            className={styles['admin-input']}
          />
          <input
            type="text"
            name="address"
            value={newShelter.address}
            onChange={handleInputChange}
            placeholder="Address"
            required
            className={styles['admin-input']}
          />
          <input
            type="tel"
            name="phone"
            value={newShelter.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            required
            className={styles['admin-input']}
          />
          <input
            type="email"
            name="email"
            value={newShelter.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
            className={styles['admin-input']}
          />
          <button type="submit" className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}>
            Add Shelter
          </button>
        </div>
      </form>

      {!error && (!Array.isArray(shelters) || shelters.length === 0) && (
        <div className={styles['no-data']}>
          No shelters found.
        </div>
      )}

      {Array.isArray(shelters) && shelters.length > 0 && (
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shelters.map(shelter => (
              <tr key={shelter.id || shelter.shelterId}>
                <td>{shelter.name}</td>
                <td>{shelter.address}</td>
                <td>{shelter.phone}</td>
                <td>{shelter.email}</td>
                <td>{shelter.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <div className={styles['action-buttons']}>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
                      onClick={() => updateShelterStatus(shelter.id || shelter.shelterId, shelter.isActive)}
                    >
                      {shelter.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                      onClick={() => deleteShelter(shelter.id || shelter.shelterId)}
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

export default ManageShelters; 