import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../Styles/AdopterNavigation.module.css';

const AdopterNavigation = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Update active tab based on current path
    const path = location.pathname;
    if (path.includes('/shelters')) {
      setActiveTab('shelters');
    } else if (path.includes('/pets')) {
      setActiveTab('pets');
    } else if (path === '/adopter') {
      setActiveTab('all');
    }
  }, [location.pathname]);

  return (
    <div className={styles.adopterNav}>
      <div className={styles.navTabs}>
        <Link 
          to="/adopter" 
          className={`${styles.navTab} ${activeTab === 'all' ? styles.active : ''}`}
        >
          Home
        </Link>
        <Link 
          to="/adopter/pets" 
          className={`${styles.navTab} ${activeTab === 'pets' ? styles.active : ''}`}
        >
          Available Pets
        </Link>
        <Link 
          to="/adopter/shelters" 
          className={`${styles.navTab} ${activeTab === 'shelters' ? styles.active : ''}`}
        >
          Shelters
        </Link>
      </div>
    </div>
  );
};

export default AdopterNavigation; 