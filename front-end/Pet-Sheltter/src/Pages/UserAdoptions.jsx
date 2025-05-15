import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../components/Navigation';
import styles from '../Styles/Adaptor.module.css';

const UserAdoptions = () => {
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
    const fetchUserAdoptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found');
        }

        const response = await axios.get(`https://localhost:5001/api/Adoption/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setAdoptions(response.data);
      } catch (err) {
        console.error('Error fetching adoptions:', err);
        setError(err.response?.data || 'Failed to fetch your adoptions');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAdoptions();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 0: // Pending
        return '#f59e0b';
      case 1: // Interview Scheduled
        return '#3b82f6';
      case 2: // Approved
        return '#10b981';
      case 3: // Rejected
        return '#ef4444';
      case 4: // Cancelled
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    return statusMap[status] || 'Unknown';
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.loading}>Loading your adoptions...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.error}>
              <h3>Error Loading Adoptions</h3>
              <p>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>My Adoptions</h1>
          
          {adoptions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>🐾</div>
              <h2>No Adoptions Yet</h2>
              <p>You haven't made any adoption requests yet. Start by browsing our available pets!</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {adoptions.map((adoption) => (
                <div key={adoption.id} className={styles.card}>
                  <div className={styles.cardContent}>
                    <h2 className={styles.cardTitle}>
                      {adoption.petName || 'Pet Name Not Available'}
                    </h2>
                    
                    <div className={styles.adoptionDetails}>
                      <div className={styles.statusBadge} 
                           style={{ backgroundColor: getStatusColor(adoption.status) }}>
                        {getStatusText(adoption.status)}
                      </div>
                      
                      <p className={styles.adoptionDate}>
                        Requested on: {new Date(adoption.requestDate).toLocaleDateString()}
                      </p>
                      
                      {adoption.responseDate && (
                        <p className={styles.responseDate}>
                          Responded on: {new Date(adoption.responseDate).toLocaleDateString()}
                        </p>
                      )}
                      
                      {adoption.notes && (
                        <div className={styles.notes}>
                          <h3>Notes:</h3>
                          <p>{adoption.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserAdoptions; 