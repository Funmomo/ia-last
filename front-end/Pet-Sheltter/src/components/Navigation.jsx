import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../Styles/Navigation.module.css';
import SupportIssueButton from './SupportIssueButton';

const Navigation = () => {
  const navigate = useNavigate();
  const userRole = parseInt(localStorage.getItem('userRole'));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <Link to={userRole === 1 ? "/staff" : "/adopter"} className={styles.logo}>
        Pet Shelter
      </Link>
      <div className={styles.navLinks}>
        {userRole === 2 ? (
          <>
            <Link to="/adopter/applications" className={styles.navLink}>
              My Applications
            </Link>
            <SupportIssueButton />
          </>
        ) : (
          <>
            <Link to="/staff" className={styles.navLink}>
              Dashboard
            </Link>
            <Link to="/staff/pets" className={styles.navLink}>
              Manage Pets
            </Link>
            <Link to="/staff/applications" className={styles.navLink}>
              Applications
            </Link>
            <Link to="/messages" className={styles.navLink}>
              Messages
            </Link>
          </>
        )}
        
        {/* Profile dropdown */}
        <div className={styles.profileContainer} ref={dropdownRef}>
          <button 
            className={styles.profileButton} 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className={styles.profileAvatar}>
              {/* Default avatar with first letter of email or username */}
              {localStorage.getItem('userEmail')?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>
          
          {dropdownOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {localStorage.getItem('userEmail') || 'User'}
                  </span>
                  <span className={styles.userRole}>
                    {userRole === 1 ? 'Staff' : 'Adopter'}
                  </span>
                </div>
              </div>
              
              <div className={styles.dropdownMenu}>
                <Link to="/profile" className={styles.dropdownItem}>
                  <span className={styles.dropdownIcon}>
                    <i className="fas fa-user"></i>
                  </span>
                  My Profile
                </Link>
                
                {userRole === 2 && (
                  <Link to="/adopter/mypets" className={styles.dropdownItem}>
                    <span className={styles.dropdownIcon}>
                      <i className="fas fa-paw"></i>
                    </span>
                    My Pets
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className={styles.logoutButton}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 