import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import styles from '../Styles/Admin.module.css';

// Import admin components
import ManageUsers from '../components/admin/ManageUsers';
import ManageShelters from '../components/admin/ManageShelters';
import ManageCategories from '../components/admin/ManageCategories';
import AdoptionRequests from '../components/admin/AdoptionRequests';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  return (
    <div className={styles['admin-container']}>
      <aside className={styles['admin-sidebar']}>
        <div className={styles['admin-logo']}>
          <h2>Admin Panel</h2>
        </div>
        <nav className={styles['admin-nav']}>
          <Link 
            to="/admin/users" 
            className={`${styles['nav-item']} ${activeTab === 'users' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </Link>
          <Link 
            to="/admin/shelters" 
            className={`${styles['nav-item']} ${activeTab === 'shelters' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('shelters')}
          >
            Manage Shelters
          </Link>
          <Link 
            to="/admin/categories" 
            className={`${styles['nav-item']} ${activeTab === 'categories' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Pet Categories
          </Link>
          <Link 
            to="/admin/adoptions" 
            className={`${styles['nav-item']} ${activeTab === 'adoptions' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('adoptions')}
          >
            Adoption Requests
          </Link>
        </nav>
      </aside>

      <main className={styles['admin-main']}>
        <Routes>
          <Route path="users" element={<ManageUsers />} />
          <Route path="shelters" element={<ManageShelters />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="adoptions" element={<AdoptionRequests />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin; 