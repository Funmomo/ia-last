import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

// Add additional styles for the new status badges
const additionalStyles = `
  .status-interview {
    background-color: #17a2b8;
    color: white;
  }
  .status-cancelled {
    background-color: #6c757d;
    color: white;
  }
`;

const AdoptionRequests = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status mapping to match backend enum
  const statusMap = {
    0: 'Pending',
    1: 'Interview Scheduled',
    2: 'Approved',
    3: 'Rejected',
    4: 'Cancelled'
  };

  useEffect(() => {
    fetchAdoptionRequests();
    
    // Add additional styles to document
    const styleEl = document.createElement('style');
    styleEl.textContent = additionalStyles;
    document.head.appendChild(styleEl);
    
    return () => {
      // Clean up styles when component unmounts
      document.head.removeChild(styleEl);
    };
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

  const updateAdoptionStatus = async (requestId, newStatusCode) => {
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
          status: newStatusCode
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

  const getStatusBadgeClass = (statusCode) => {
    const status = statusMap[statusCode] || 'Unknown';
    switch (status.toLowerCase()) {
      case 'pending': return `${styles['status-badge']} ${styles['status-pending']}`;
      case 'approved': return `${styles['status-badge']} ${styles['status-approved']}`;
      case 'rejected': return `${styles['status-badge']} ${styles['status-rejected']}`;
      case 'interview scheduled': return `${styles['status-badge']} ${styles['status-interview']}`;
      case 'cancelled': return `${styles['status-badge']} ${styles['status-cancelled']}`;
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
              <th>Request Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adoptions.map(adoption => (
              <tr key={adoption.id}>
                <td>#{adoption.id}</td>
                <td>{adoption.pet?.name || 'Unknown Pet'}</td>
                <td>{adoption.adopter?.userName || 'Unknown User'}</td>
                <td>{new Date(adoption.requestDate).toLocaleDateString()}</td>
                <td>
                  <span className={getStatusBadgeClass(adoption.status)}>
                    {statusMap[adoption.status] || 'Unknown'}
                  </span>
                </td>
                <td>
                  <div className={styles['action-buttons']}>
                    {adoption.status === 0 && ( // Pending status code is 0
                      <>
                        <button 
                          className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
                          onClick={() => updateAdoptionStatus(adoption.id, 2)} // 2 is Approved
                        >
                          Approve
                        </button>
                        <button 
                          className={`${styles['admin-btn']} ${styles['admin-btn-secondary']}`}
                          onClick={() => updateAdoptionStatus(adoption.id, 1)} // 1 is Interview Scheduled
                        >
                          Schedule Interview
                        </button>
                        <button 
                          className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                          onClick={() => updateAdoptionStatus(adoption.id, 3)} // 3 is Rejected
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {adoption.status === 1 && ( // Interview Scheduled
                      <>
                        <button 
                          className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
                          onClick={() => updateAdoptionStatus(adoption.id, 2)} // 2 is Approved
                        >
                          Approve
                        </button>
                        <button 
                          className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                          onClick={() => updateAdoptionStatus(adoption.id, 3)} // 3 is Rejected
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-secondary']}`}
                      onClick={() => viewAdoptionDetails(adoption.id)}
                    >
                      View Details
                    </button>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                      onClick={() => deleteAdoption(adoption.id)}
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