import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../Styles/PetCard.module.css';

const PetCard = ({ pet }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/adopter/pet/${pet.id}`);
  };

  // Get the pet's category name (type)
  const getPetType = () => {
    if (pet.category && pet.category.name) {
      return pet.category.name;
    } else if (pet.categoryId) {
      return `Category ${pet.categoryId}`;
    } else {
      return 'Unknown';
    }
  };

  // Get the pet's gender
  const getPetGender = () => {
    switch (pet.gender) {
      case 0: return 'Male';
      case 1: return 'Female';
      default: return 'Unknown';
    }
  };

  // Get the shelter name
  const getShelterName = () => {
    if (pet.shelter) {
      // If shelter is a full object with a name property
      if (pet.shelter.name) {
        return pet.shelter.name;
      }
      // If shelter is just a string itself
      if (typeof pet.shelter === 'string') {
        return pet.shelter;
      }
    }
    // Try to get a name from the shelterId
    if (pet.shelterId) {
      return `Shelter #${pet.shelterId}`;
    }
    return 'Unknown Shelter';
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
            <span>{getPetType()}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Breed:</span>
            <span>{pet.breed || 'Unknown'}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Age:</span>
            <span>{pet.age ? `${pet.age} years` : 'Unknown'}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>Gender:</span>
            <span>{getPetGender()}</span>
          </div>
        </div>
        
        <div className={styles.shelterInfo}>
          <h3 className={styles.shelterName}>
            {getShelterName()}
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