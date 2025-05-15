import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../Styles/DashboardNavigation.module.css';

const DashboardNavigation = () => {
  return (
    <nav className={styles.dashboardNav}>
      <div className={styles.navLinks}>
        <NavLink 
          to="/staff" 
          end
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/staff/pets" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          Manage Pets
        </NavLink>
        <NavLink 
          to="/staff/shelters" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          Manage Shelters
        </NavLink>
        <NavLink 
          to="/staff/applications" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          Applications
        </NavLink>
      </div>
    </nav>
  );
};

export default DashboardNavigation; 