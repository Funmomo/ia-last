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
    fetchAdoptions();
    
    // Add additional styles to document
    const styleEl = document.createElement('style');
    styleEl.textContent = additionalStyles;
    document.head.appendChild(styleEl);
    
    return () => {
      // Clean up styles when component unmounts
      document.head.removeChild(styleEl);
    };
  }, []);

  const fetchPetDetails = async (petId, token) => {
    try {
      const response = await axios.get(`https://localhost:5001/api/Pet/${petId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      console.error(`Error fetching pet details for ID ${petId}:`, err);
      return null;
    }
  };

  const fetchAdoptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch adoption requests
      const adoptionsResponse = await axios.get('https://localhost:5001/api/Adoption', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!adoptionsResponse.data) {
        throw new Error('No adoption data received');
      }

      console.log('Adoption data received:', adoptionsResponse.data);

      // Fetch pet details for each adoption
      const adoptionsWithDetails = await Promise.all(
        adoptionsResponse.data.map(async (adoption) => {
          const petDetails = await fetchPetDetails(adoption.petId, token);
          return {
            ...adoption,
            pet: petDetails
          };
        })
      );

      setAdoptions(adoptionsWithDetails);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching adoptions:', err);
      setError(err.message || 'Failed to fetch adoption requests');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (adoptionId, newStatus) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(`https://localhost:5001/api/Adoption/${adoptionId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh the adoptions list
      await fetchAdoptions();
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
      
      await fetchAdoptions();
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

  const formatDate = (dateString) => {
    console.log('Formatting date string:', dateString);
    // Check if dateString is in ISO format
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // If it's a timestamp
    if (typeof dateString === 'number') {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }

    return 'Date format not recognized';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 0: return styles['status-pending'];
      case 1: return styles['status-active'];
      case 2: return styles['status-suspended'];
      default: return styles['status-inactive'];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Adoption Requests</h2>
        <div className={styles['loading']}>Loading adoption requests...</div>
      </div>
    );
  }

  return (
    <div className={styles['admin-section']}>
      <h2 className={styles['admin-section-title']}>Adoption Requests</h2>
      
      {error && (
        <div className={styles['error-message']}>
          {error}
          <button 
            onClick={fetchAdoptions}
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
              <th>Date</th>
              <th>Pet Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adoptions.map(adoption => (
              <tr key={adoption.id}>
                <td>{formatDate(adoption.requestDate)}</td>
                <td className={styles['details-cell']}>
                  <div className={styles['details-primary']}>
                    {adoption.pet ? adoption.pet.name : 'Unknown Pet'}
                  </div>
                  <div className={styles['details-secondary']}>
                    ID: {adoption.petId}
                  </div>
                </td>
                <td>
                  <span className={`${styles['status-badge']} ${getStatusBadgeClass(adoption.status)}`}>
                    {getStatusText(adoption.status)}
                  </span>
                </td>
                <td>
                  <div className={styles['action-buttons']}>
                    {adoption.status === 0 && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(adoption.id, 1)}
                          className={`${styles['admin-btn']} ${styles['admin-btn-success']}`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(adoption.id, 2)}
                          className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
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