import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import AdopterNavigation from '../components/AdopterNavigation';
import PetCard from '../components/PetCard';
import styles from '../Styles/Adaptor.module.css';

const API_BASE_URL = 'https://localhost:5001';

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
    <div className={styles.petsSection}>
      <div className={styles.petGrid}>
        {pets.length === 0 ? (
          <div className={styles.noPets}>No pets available at the moment.</div>
        ) : (
          pets.map(pet => {
            // Create a simplified pet object with only shelter name
            const simplifiedPet = {
              ...pet,
              shelter: pet.shelter?.shelterName || pet.shelter?.name || 'Unknown Shelter'
            };
            
            return (
              <PetCard 
                key={pet.id} 
                pet={simplifiedPet}
              />
            );
          })
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        console.log('Fetching shelters from:', `${API_BASE_URL}/api/Shelter`);
        const response = await fetch(`${API_BASE_URL}/api/Shelter`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Failed to fetch shelters: ${response.status}`);
        }

        const data = await response.json();
        console.log('Shelter data received:', data); // Log the actual data structure

        setShelters(data);
      } catch (err) {
        console.error('Error in fetchShelters:', err);
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
        <button 
          className={styles.retryButton}
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchShelters();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.shelterGrid}>
      {(!shelters || shelters.length === 0) ? (
        <div className={styles.noShelters}>No shelters available at the moment.</div>
      ) : (
        shelters.map(shelter => {
          console.log('Rendering shelter:', shelter); // Log each shelter object
          return (
            <div key={shelter.id} className={styles.shelterCard}>
              <div className={styles.shelterContent}>
                <h3 className={styles.shelterName}>
                  {shelter.shelterName || shelter.name || 'Unnamed Shelter'}
                </h3>
                <p className={styles.shelterAddress}>
                  {shelter.address || 'Address not available'}
                </p>
                <button 
                  className={styles.knowMoreButton}
                  onClick={() => {
                    console.log('Navigating to shelter:', shelter.id);
                    navigate(`/shelter/${shelter.id}`);
                  }}
                >
                  Know More
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// Main Adaptor component
const Adaptor = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <div className={styles.mainContent}>
          <Routes>
            <Route path="/" element={
              <div>
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Our Shelters</h2>
                  <SheltersView />
                </section>
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Available Pets</h2>
                  <PetsView pets={pets} loading={loading} error={error} onRetry={handleRetry} />
                </section>
              </div>
            } />
            <Route path="/pets" element={<PetsView pets={pets} loading={loading} error={error} onRetry={handleRetry} />} />
            <Route path="/shelters" element={<SheltersView />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Adaptor;
