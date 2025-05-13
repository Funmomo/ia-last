import React, { useState, useEffect } from 'react';
import ShelterCard from '../components/ShelterCard';
import Navigation from '../components/Navigation';
import styles from '../Styles/Shelters.module.css';

const API_BASE_URL = 'https://localhost:5001';

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Shelter`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch shelters: ${response.status}`);
        }

        const data = await response.json();
        setShelters(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shelters:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          <div className={styles.loading}>Loading shelters...</div>
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
            <h3>Error Loading Shelters</h3>
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
        <h1 className={styles.title}>Pet Shelters</h1>
        <div className={styles.shelterGrid}>
          {shelters.map(shelter => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shelters; 