import React from 'react';
import styles from '../Styles/PetCard.module.css';

const PetCard = ({ pet }) => {
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
          <div className={styles.shelterDetails}>
            <div className={styles.detailItem}>
              <span className={styles.icon}>
                <i className="fas fa-home"></i>
              </span>
              <span>{pet.shelter?.name || 'Pet Shelter'}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.icon}>
                <i className="fas fa-map-marker-alt"></i>
              </span>
              <span>{pet.shelter?.location || 'Location not available'}</span>
            </div>
          </div>
        </div>

        <button className={styles.viewButton}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default PetCard; 