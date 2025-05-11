import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import AdopterNavigation from '../components/AdopterNavigation';
import PetCard from '../components/PetCard';
import styles from '../Styles/Adaptor.module.css';

const API_BASE_URL = 'https://localhost:5001'; // Updated to use HTTPS

// Component for Pets view
const PetsView = ({ pets, loading, error, onRetry }) => {
  if (loading) {
    return <div className={styles.loading}>Loading pets...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h3>Error Loading Pets</h3>
        <p>{error}</p>
        <button className={styles.retryButton} onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Available Pets</h1>
      <div className={styles.searchSection}>
        {/* Add search/filter functionality later */}
      </div>
      <div className={styles.petGrid}>
        {pets.length === 0 ? (
          <div className={styles.noPets}>No pets available at the moment.</div>
        ) : (
          pets.map(pet => (
            <PetCard key={pet.id} pet={pet} />
          ))
        )}
      </div>
    </div>
  );
};

// Component for Shelters view
const SheltersView = () => {
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading shelters...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h3>Error Loading Shelters</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Shelters</h1>
      <div className={styles.shelterGrid}>
        {shelters.length === 0 ? (
          <div className={styles.noShelters}>No shelters available at the moment.</div>
        ) : (
          shelters.map(shelter => (
            <div key={shelter.id} className={styles.shelterCard}>
              <h3>{shelter.name}</h3>
              <p>{shelter.location}</p>
              <p>{shelter.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Adaptor component
const Adaptor = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      console.log('Fetching pets from:', `${API_BASE_URL}/api/Pet`);
      const response = await fetch(`${API_BASE_URL}/api/Pet`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch pets: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server');
      }

      const data = await response.json();
      console.log('Received pets data:', data);
      setPets(data);
    } catch (err) {
      console.error('Error fetching pets:', err);
      let errorMessage = err.message;
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the pet server. Please ensure the backend is running and try again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchPets();
  };

  return (
    <div className={styles.container}>
      <Navigation />
      <div className={styles.content}>
        <AdopterNavigation />
        <Routes>
          <Route path="/" element={<PetsView pets={pets} loading={loading} error={error} onRetry={handleRetry} />} />
          <Route path="/pets" element={<PetsView pets={pets} loading={loading} error={error} onRetry={handleRetry} />} />
          <Route path="/shelters" element={<SheltersView />} />
        </Routes>
      </div>
    </div>
  );
};

export default Adaptor;
