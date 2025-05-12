import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Styles/PetCard.module.css';

const API_BASE_URL = 'https://localhost:5001'; // Using HTTPS

const PetCard = ({ pet }) => {
  const [shelterData, setShelterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShelterData = async () => {
      if (!pet.shelterId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/Shelter/${pet.shelterId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch shelter data: ${response.status}`);
        }

        const data = await response.json();
        setShelterData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shelter data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchShelterData();
  }, [pet.shelterId]);

  const handleViewDetails = () => {
    navigate(`/pet/${pet.id}`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={pet.imageUrl || 'https://via.placeholder.com/300x200?text=Pet+Image'} 
          alt={pet.name} 
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h2 className={styles.name}>{pet.name}</h2>
        <p className={styles.description}>{pet.description}</p>
        
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.icon}>
              <i className="fas fa-paw"></i>
            </span>
            <span>Breed: {pet.breed}</span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.icon}>
              <i className="fas fa-birthday-cake"></i>
            </span>
            <span>Age: {pet.age} years</span>
          </div>
        </div>
        
        <div className={styles.shelterInfo}>
          <h3 className={styles.shelterTitle}>Shelter Information</h3>
          {loading ? (
            <p>Loading shelter information...</p>
          ) : error ? (
            <p className={styles.error}>Error loading shelter details: {error}</p>
          ) : (
            <div className={styles.shelterDetails}>
              <div className={styles.detailItem}>
                <span className={styles.icon}>
                  <i className="fas fa-home"></i>
                </span>
                <span>{shelterData?.name || 'Pet Shelter'}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.icon}>
                  <i className="fas fa-map-marker-alt"></i>
                </span>
                <span>{shelterData?.location || 'Location not available'}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.icon}>
                  <i className="fas fa-phone"></i>
                </span>
                <span>{shelterData?.phone || 'Phone not available'}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.icon}>
                  <i className="fas fa-envelope"></i>
                </span>
                <span>{shelterData?.email || 'Email not available'}</span>
              </div>
            </div>
          )}
        </div>

        <button className={styles.viewButton} onClick={handleViewDetails}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default PetCard; 