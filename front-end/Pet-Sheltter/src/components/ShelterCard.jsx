import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Styles/ShelterCard.module.css';

const ShelterCard = ({ shelter }) => {
  const navigate = useNavigate();

  const handleViewPets = () => {
    navigate(`/shelter/${shelter.id}/pets`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.name}>{shelter.name}</h2>
          <button className={styles.viewButton} onClick={handleViewPets}>
            View Pets
          </button>
        </div>
        
        <p className={styles.description}>{shelter.description}</p>
        
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.label}>Location:</span>
            <span className={styles.value}>{shelter.location}</span>
          </div>
          
          <div className={styles.detailRow}>
            <div className={styles.detailItem}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.value}>{shelter.phone}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{shelter.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelterCard; 