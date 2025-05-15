import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../Styles/Admin.module.css';

// Import admin components
import ManageUsers from '../components/admin/ManageUsers';
import ManageShelters from '../components/admin/ManageShelters';
import PendingShelters from '../components/admin/PendingShelters';
import ManageCategories from '../components/admin/ManageCategories';
import AdoptionRequests from '../components/admin/AdoptionRequests';
import SupportIssues from '../components/admin/SupportIssues';
import Dashboard from '../components/admin/Dashboard';

const SheltersManagement = () => {
  return (
    <>
      <PendingShelters />
      <ManageShelters />
    </>
  );
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState({
    username: 'Admin User',
    email: 'admin@example.com'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set initial active tab based on the current path
    const path = window.location.pathname;
    if (path.includes('/admin/users')) {
      setActiveTab('users');
    } else if (path.includes('/admin/shelters')) {
      setActiveTab('shelters');
    } else if (path.includes('/admin/categories')) {
      setActiveTab('categories');
    } else if (path.includes('/admin/adoptions')) {
      setActiveTab('adoptions');
    } else {
      setActiveTab('dashboard');
      // Redirect to dashboard if no specific path
      if (path === '/admin' || path === '/admin/') {
        navigate('/admin/dashboard');
      }
    }

    // Fetch current user data from API
    fetchCurrentUser();
  }, [navigate]);

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First try to get the current user profile from the API
      const response = await axios.get('https://localhost:5001/api/Profile/me', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        console.log('Current user data:', response.data);
        setUserData({
          username: response.data.username || 'Admin User',
          email: response.data.email || 'admin@example.com'
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      
      // Fallback: Try to get data from localStorage
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          setUserData({
            username: parsedUser.username || 'Admin User',
            email: parsedUser.email || 'admin@example.com'
          });
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear user data and token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear all cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className={styles['admin-container']}>
      <aside className={styles['admin-sidebar']}>
        <div className={styles['admin-logo']}>
          <h2>Admin Panel</h2>
        </div>
        
        <div className={styles['admin-profile']}>
          <div className={styles['profile-avatar']}>
            <span>{userData.username.charAt(0).toUpperCase()}</span>
          </div>
          <div className={styles['profile-info']}>
            <h3>{userData.username}</h3>
            <p>{userData.email}</p>
          </div>
        </div>
        
        <nav className={styles['admin-nav']}>
          <Link 
            to="/admin/dashboard" 
            className={`${styles['nav-item']} ${activeTab === 'dashboard' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className={styles['nav-icon'] + ' ' + styles['dashboard-icon']}></i>
            Dashboard
          </Link>
          <Link 
            to="/admin/users" 
            className={`${styles['nav-item']} ${activeTab === 'users' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className={styles['nav-icon'] + ' ' + styles['users-icon']}></i>
            Manage Users
          </Link>
          <Link 
            to="/admin/shelters" 
            className={`${styles['nav-item']} ${activeTab === 'shelters' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('shelters')}
          >
            <i className={styles['nav-icon'] + ' ' + styles['shelters-icon']}></i>
            Manage Shelters
          </Link>
          <Link 
            to="/admin/categories" 
            className={`${styles['nav-item']} ${activeTab === 'categories' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <i className={styles['nav-icon'] + ' ' + styles['categories-icon']}></i>
            Pet Categories
          </Link>
          <Link 
            to="/admin/adoptions" 
            className={`${styles['nav-item']} ${activeTab === 'adoptions' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('adoptions')}
          >
            <i className={styles['nav-icon'] + ' ' + styles['adoptions-icon']}></i>
            Adoption Requests
          </Link>
          <Link 
            to="/admin/support" 
            className={`${styles['nav-item']} ${activeTab === 'support' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <i className={styles['nav-icon'] + ' ' + styles['support-icon']}></i>
            Support Issues
          </Link>
        </nav>
        
        <div className={styles['admin-footer']}>
          <button 
            className={styles['logout-btn']}
            onClick={handleLogout}
          >
            <i className={styles['logout-icon']}></i>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles['admin-main']}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="shelters" element={<SheltersManagement />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="adoptions" element={<AdoptionRequests />} />
          <Route path="support" element={<SupportIssues />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin; 