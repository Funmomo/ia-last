import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import PetCard from '../components/PetCard';
import ShelterCard from '../components/ShelterCard';
import styles from '../Styles/ShelterDetails.module.css';

const API_BASE_URL = 'https://localhost:5001';

const ShelterDetails = () => {
  const { shelterId } = useParams();
  const navigate = useNavigate();
  const [shelter, setShelter] = useState(null);
  const [shelterPets, setShelterPets] = useState([]);
  const [suggestedShelters, setSuggestedShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShelterData = async () => {
      try {
        // Fetch shelter details
        const shelterResponse = await fetch(`${API_BASE_URL}/api/Shelter/${shelterId}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!shelterResponse.ok) {
          throw new Error(`Failed to fetch shelter details: ${shelterResponse.status}`);
        }

        const shelterData = await shelterResponse.json();
        setShelter(shelterData);

        // Fetch shelter's pets
        const petsResponse = await fetch(`${API_BASE_URL}/api/Pet/shelter/${shelterId}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!petsResponse.ok) {
          throw new Error(`Failed to fetch shelter's pets: ${petsResponse.status}`);
        }

        const petsData = await petsResponse.json();
        setShelterPets(petsData);

        // Fetch suggested shelters (excluding current shelter)
        const suggestedResponse = await fetch(`${API_BASE_URL}/api/Shelter`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!suggestedResponse.ok) {
          throw new Error(`Failed to fetch suggested shelters: ${suggestedResponse.status}`);
        }

        const allShelters = await suggestedResponse.json();
        const filtered = allShelters
          .filter(s => s.id !== shelterId)
          .slice(0, 3); // Get only 3 suggested shelters
        setSuggestedShelters(filtered);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching shelter data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchShelterData();
  }, [shelterId]);

  const handleBackToDashboard = () => {
    navigate('/adopter/shelters');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          <div className={styles.loading}>Loading shelter details...</div>
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
            <h3>Error Loading Shelter Details</h3>
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
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>

        <div className={styles.shelterDetails}>
          <div className={styles.mainInfo}>
            <h1 className={styles.name}>{shelter?.name}</h1>
            
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>{shelter?.location}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Phone:</span>
                <span className={styles.value}>{shelter?.phone}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{shelter?.email}</span>
              </div>
            </div>

            <div className={styles.description}>
              <h2>About {shelter?.name}</h2>
              <p>{shelter?.description}</p>
            </div>
          </div>

          <div className={styles.petsSection}>
            <h2>Available Pets</h2>
            <div className={styles.petGrid}>
              {shelterPets.length === 0 ? (
                <p className={styles.noPets}>No pets available at this shelter.</p>
              ) : (
                shelterPets.map(pet => (
                  <PetCard key={pet.id} pet={pet} />
                ))
              )}
            </div>
          </div>

          <div className={styles.suggestedSection}>
            <h2>Other Shelters You Might Like</h2>
            <div className={styles.suggestedGrid}>
              {suggestedShelters.map(shelter => (
                <ShelterCard key={shelter.id} shelter={shelter} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelterDetails; 