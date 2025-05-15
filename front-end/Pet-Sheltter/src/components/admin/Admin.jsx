import React from 'react';
import styles from '../../Styles/Admin.module.css';
import ManageShelters from './ManageShelters';
import PendingShelters from './PendingShelters';

const Admin = () => {
  return (
    <div className={styles['admin-container']}>
      <div className={styles['admin-main']}>
        <PendingShelters />
        <ManageShelters />
      </div>
    </div>
  );
};

export default Admin; 