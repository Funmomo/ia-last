import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import styles from '../Styles/PetDetails.module.css';

const API_BASE_URL = 'https://localhost:5001';

const PetDetails = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Pet/${petId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch pet details: ${response.status}`);
        }

        const data = await response.json();
        setPet(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pet details:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPetDetails();
  }, [petId]);

  const handleAdopt = () => {
    // TODO: Implement adoption logic
    console.log('Adopting pet:', petId);
  };

  const handleBackToDashboard = () => {
    navigate('/adopter/pets');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          <div className={styles.loading}>Loading pet details...</div>
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
            <h3>Error Loading Pet Details</h3>
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

        <div className={styles.petDetails}>
          <div className={styles.imageSection}>
            <img 
              src={pet?.imageUrl || 'https://www.rescuedogvillage.com/wp-content/uploads/2023/02/image-placeholder-500x500-1.jpg'} 
              alt={pet?.name} 
              className={styles.mainImage}
            />
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.name}>{pet?.name}</h1>
            
            <div className={styles.mainInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Breed:</span>
                <span className={styles.value}>{pet?.breed}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Age:</span>
                <span className={styles.value}>{pet?.age} years</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Gender:</span>
                <span className={styles.value}>{pet?.gender}</span>
              </div>
            </div>

            <div className={styles.description}>
              <h2>About {pet?.name}</h2>
              <p>{pet?.description}</p>
            </div>

            <div className={styles.shelterInfo}>
              <h2>Shelter Information</h2>
              <div className={styles.infoItem}>
                <span className={styles.label}>Shelter:</span>
                <span className={styles.value}>{pet?.shelter?.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>{pet?.shelter?.location}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Contact:</span>
                <span className={styles.value}>{pet?.shelter?.phone}</span>
              </div>
            </div>

            <button className={styles.adoptButton} onClick={handleAdopt}>
              Adopt Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetails; 