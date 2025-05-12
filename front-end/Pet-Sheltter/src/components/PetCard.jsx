import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Styles/PetCard.module.css';

const PetCard = ({ pet }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/adopter/pet/${pet.id}`);
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
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.label}>Type:</span>
            <span>{pet.type || 'Unknown'}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Breed:</span>
            <span>{pet.breed || 'Unknown'}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Age:</span>
            <span>{pet.age ? `${pet.age} years` : 'Unknown'}</span>
          </div>
        </div>
        
        <div className={styles.shelterInfo}>
          <h3 className={styles.shelterName}>
            {pet.shelter || 'Unknown Shelter'}
          </h3>
        </div>

        <p className={styles.description}>
          {pet.description || 'No description available'}
        </p>

        <button className={styles.viewButton} onClick={handleViewDetails}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default PetCard; 