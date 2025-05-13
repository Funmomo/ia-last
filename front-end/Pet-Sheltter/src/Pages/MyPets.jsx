import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import styles from '../Styles/Adaptor.module.css';

const API_BASE_URL = 'https://localhost:5001'; // Using HTTPS

const MyPets = () => {
  const [myPets, setMyPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyPets = async () => {
      try {
        // Get user ID from local storage
        const token = localStorage.getItem('token');
        
        // Fetch user's pets from the API
        const response = await fetch(`${API_BASE_URL}/api/Pet/mypets`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch my pets: ${response.status}`);
        }

        const data = await response.json();
        setMyPets(data);
      } catch (err) {
        console.error('Error fetching my pets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPets();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          <div className={styles.loading}>Loading your pets...</div>
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
            <h3>Error Loading Your Pets</h3>
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
        <h1 className={styles.title}>My Pets</h1>
        
        {myPets.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🐾</div>
            <h2>You don't have any pets yet</h2>
            <p>Once you adopt a pet, they will appear here.</p>
            <button 
              className={styles.actionButton}
              onClick={() => window.location.href = '/adopter'}
            >
              Find a Pet to Adopt
            </button>
          </div>
        ) : (
          <div className={styles.petGrid}>
            {myPets.map(pet => (
              <div key={pet.id} className={styles.shelterCard}>
                <h3>{pet.name}</h3>
                <p>Status: {pet.status}</p>
                <p>Adoption Date: {new Date(pet.adoptionDate).toLocaleDateString()}</p>
                <button className={styles.viewButton}>View Details</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPets; 