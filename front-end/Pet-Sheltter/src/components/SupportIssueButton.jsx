import React, { useState } from 'react';
import styles from '../Styles/Adaptor.module.css';
import SupportIssueModal from './SupportIssueModal';

const SupportIssueButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        className={styles.supportButton}
        onClick={() => setIsModalOpen(true)}
        style={{ color: 'var(--accent-color)' }}
      >
        Have a PROBLEM?
      </button>
      
      {isModalOpen && (
        <SupportIssueModal 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default SupportIssueButton; 