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

const PendingShelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingShelters();
  }, []);

  const fetchPendingShelters = async () => {
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

      // Filter only pending shelters
      const pendingShelters = Array.isArray(response.data) 
        ? response.data.filter(shelter => shelter.status === ShelterStatus.Pending)
        : [];
      
      setShelters(pendingShelters);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pending shelters:', err);
      setError(err.message || 'Failed to fetch pending shelters');
      setLoading(false);
      setShelters([]);
    }
  };

  const handleShelterApproval = async (shelterId, approved) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const newStatus = approved ? ShelterStatus.Active : ShelterStatus.Inactive;

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
      
      await fetchPendingShelters();
    } catch (err) {
      console.error('Error updating shelter status:', err);
      setError(err.message || 'Failed to update shelter status');
    }
  };

  if (loading) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Pending Shelter Approvals</h2>
        <div className={styles['loading']}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles['admin-section']}>
      <h2 className={styles['admin-section-title']}>Pending Shelter Approvals</h2>

      {error && (
        <div className={styles['error-message']}>
          {error}
          <button 
            onClick={fetchPendingShelters}
            className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
          >
            Retry
          </button>
        </div>
      )}

      {!error && (!Array.isArray(shelters) || shelters.length === 0) && (
        <div className={styles['no-data']}>
          No pending shelters found.
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
                  <div className={styles['action-buttons']}>
                    <button
                      onClick={() => handleShelterApproval(shelter.id, true)}
                      className={`${styles['admin-btn']} ${styles['admin-btn-success']}`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleShelterApproval(shelter.id, false)}
                      className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                    >
                      Decline
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

export default PendingShelters; 