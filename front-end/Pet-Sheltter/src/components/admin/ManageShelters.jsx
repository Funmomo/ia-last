import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

// Enum for shelter status
const ShelterStatus = {
  Pending: 0,
  Active: 1,
  Suspended: 2,
  Inactive: 3
};

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

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const shelterData = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched shelters:', shelterData);
      
      setShelters(shelterData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching shelters:', err);
      setError(err.message || 'Failed to fetch shelters');
      setLoading(false);
      setShelters([]);
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

      await axios.post('https://localhost:5001/api/Shelter', 
        {
          ...newShelter,
          status: ShelterStatus.Pending // Set initial status as Pending
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setNewShelter({ name: '', address: '', phone: '', email: '' });
      await fetchShelters();
    } catch (err) {
      console.error('Error creating shelter:', err);
      setError(err.message || 'Failed to create shelter');
    }
  };

  const updateShelterStatus = async (shelterId, currentStatus) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Determine new status
      let newStatus;
      if (currentStatus === ShelterStatus.Pending || currentStatus === ShelterStatus.Inactive) {
        newStatus = ShelterStatus.Active;
      } else if (currentStatus === ShelterStatus.Active) {
        newStatus = ShelterStatus.Inactive;
      } else {
        return; // Don't update if status is Suspended
      }

      // Update shelter status using the dedicated endpoint
      await axios.put(`https://localhost:5001/api/Shelter/${shelterId}/status`,
        {
          status: newStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchShelters();
    } catch (err) {
      console.error('Error updating shelter status:', err);
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
      
      await fetchShelters();
    } catch (err) {
      console.error('Error deleting shelter:', err);
      setError(err.message || 'Failed to delete shelter');
    }
  };

  // Helper function to get status text
  const getStatusText = (status) => {
    switch (status) {
      case ShelterStatus.Pending:
        return 'Pending';
      case ShelterStatus.Active:
        return 'Active';
      case ShelterStatus.Suspended:
        return 'Suspended';
      case ShelterStatus.Inactive:
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  // Helper function to get status button text
  const getStatusButtonText = (status) => {
    if (status === ShelterStatus.Pending || status === ShelterStatus.Inactive) {
      return 'Activate';
    } else if (status === ShelterStatus.Active) {
      return 'Deactivate';
    }
    return 'No Action';
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
                <td>
                  <span className={`${styles['status-badge']} ${styles[`status-${getStatusText(shelter.status).toLowerCase()}`]}`}>
                    {getStatusText(shelter.status)}
                  </span>
                </td>
                <td>
                  <div className={styles['action-buttons']}>
                    {shelter.status !== ShelterStatus.Suspended && (
                      <button
                        onClick={() => updateShelterStatus(shelter.id, shelter.status)}
                        className={`${styles['admin-btn']} ${shelter.status === ShelterStatus.Active ? styles['admin-btn-warning'] : styles['admin-btn-success']}`}
                      >
                        {getStatusButtonText(shelter.status)}
                      </button>
                    )}
                    <button
                      onClick={() => deleteShelter(shelter.id)}
                      className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
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