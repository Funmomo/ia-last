import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

const AdoptionRequests = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdoptionRequests();
  }, []);

  const fetchAdoptionRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('https://localhost:5001/api/Adoption', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Validate response data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Ensure we have an array of adoptions
      const adoptionData = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched adoptions:', adoptionData);
      
      setAdoptions(adoptionData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching adoptions:', err);
      setError(err.message || 'Failed to fetch adoption requests');
      setLoading(false);
      setAdoptions([]); // Reset adoptions to empty array on error
    }
  };

  const updateAdoptionStatus = async (requestId, newStatus) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get current adoption details first
      const currentAdoption = await axios.get(`https://localhost:5001/api/Adoption/${requestId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!currentAdoption.data) {
        throw new Error('Failed to fetch current adoption details');
      }

      // Update the adoption with new status
      await axios.put(`https://localhost:5001/api/Adoption/${requestId}`, 
        {
          ...currentAdoption.data,
          status: newStatus
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchAdoptionRequests(); // Refresh the list
    } catch (err) {
      console.error('Error updating adoption status:', err);
      setError(err.message || 'Failed to update adoption status');
    }
  };

  const deleteAdoption = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this adoption request?')) {
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`https://localhost:5001/api/Adoption/${requestId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await fetchAdoptionRequests(); // Refresh the list
    } catch (err) {
      console.error('Error deleting adoption request:', err);
      setError(err.message || 'Failed to delete adoption request');
    }
  };

  const viewAdoptionDetails = async (requestId) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`https://localhost:5001/api/Adoption/${requestId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No details found for this adoption request');
      }

      // For now, just show the details in an alert
      // You might want to replace this with a modal or detailed view component
      alert(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('Error fetching adoption details:', err);
      setError(err.message || 'Failed to fetch adoption details');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return `${styles['status-badge']} ${styles['status-pending']}`;
      case 'approved': return `${styles['status-badge']} ${styles['status-approved']}`;
      case 'rejected': return `${styles['status-badge']} ${styles['status-rejected']}`;
      default: return styles['status-badge'];
    }
  };

  if (loading) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Manage Adoption Requests</h2>
        <div className={styles['loading']}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles['admin-section']}>
      <h2 className={styles['admin-section-title']}>Manage Adoption Requests</h2>
      
      {error && (
        <div className={styles['error-message']}>
          {error}
          <button 
            onClick={fetchAdoptionRequests}
            className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
          >
            Retry
          </button>
        </div>
      )}

      {!error && (!Array.isArray(adoptions) || adoptions.length === 0) && (
        <div className={styles['no-data']}>
          No adoption requests found.
        </div>
      )}

      {Array.isArray(adoptions) && adoptions.length > 0 && (
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Pet Name</th>
              <th>Adopter</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adoptions.map(adoption => (
              <tr key={adoption.id || adoption.requestId}>
                <td>#{adoption.id || adoption.requestId}</td>
                <td>{adoption.petName}</td>
                <td>{adoption.adopterName}</td>
                <td>{new Date(adoption.submittedDate).toLocaleDateString()}</td>
                <td>
                  <span className={getStatusBadgeClass(adoption.status)}>
                    {adoption.status}
                  </span>
                </td>
                <td>
                  <div className={styles['action-buttons']}>
                    {adoption.status?.toLowerCase() === 'pending' && (
                      <>
                        <button 
                          className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
                          onClick={() => updateAdoptionStatus(adoption.id || adoption.requestId, 'Approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                          onClick={() => updateAdoptionStatus(adoption.id || adoption.requestId, 'Rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-secondary']}`}
                      onClick={() => viewAdoptionDetails(adoption.id || adoption.requestId)}
                    >
                      View Details
                    </button>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                      onClick={() => deleteAdoption(adoption.id || adoption.requestId)}
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

export default AdoptionRequests; 