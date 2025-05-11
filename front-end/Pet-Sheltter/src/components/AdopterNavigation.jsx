import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../Styles/AdopterNavigation.module.css';

const AdopterNavigation = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize based on current path
    if (location.pathname.includes('/shelters')) {
      return 'shelters';
    } else if (location.pathname.includes('/pets')) {
      return 'pets';
    } else {
      return 'all'; // Default
    }
  });

  return (
    <div className={styles.adopterNav}>
      <div className={styles.navTabs}>
        <Link 
          to="/adopter" 
          className={`${styles.navTab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </Link>
        <Link 
          to="/adopter/pets" 
          className={`${styles.navTab} ${activeTab === 'pets' ? styles.active : ''}`}
          onClick={() => setActiveTab('pets')}
        >
          Pets
        </Link>
        <Link 
          to="/adopter/shelters" 
          className={`${styles.navTab} ${activeTab === 'shelters' ? styles.active : ''}`}
          onClick={() => setActiveTab('shelters')}
        >
          Shelters
        </Link>
      </div>
    </div>
  );
};

export default AdopterNavigation; 