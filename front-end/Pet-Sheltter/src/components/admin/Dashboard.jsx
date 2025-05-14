import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShelters: 0,
    totalPets: 0,
    totalAdoptions: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Get users count
      const usersResponse = await axios.get('https://localhost:5001/api/Admin/users', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Get shelters count
      const sheltersResponse = await axios.get('https://localhost:5001/api/Shelter', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Get pets count - replace with your actual pets API endpoint
      const petsResponse = await axios.get('https://localhost:5001/api/Pets', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(() => ({ data: [] })); // Fallback if endpoint doesn't exist
      
      // Get adoptions count - replace with your actual adoptions API endpoint
      const adoptionsResponse = await axios.get('https://localhost:5001/api/AdoptionRequests', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(() => ({ data: [] })); // Fallback if endpoint doesn't exist
      
      // Calculate total counts
      const totalUsers = Array.isArray(usersResponse.data) ? usersResponse.data.length : 0;
      const totalShelters = Array.isArray(sheltersResponse.data) ? sheltersResponse.data.length : 0;
      const totalPets = Array.isArray(petsResponse.data) ? petsResponse.data.length : 0;
      const totalAdoptions = Array.isArray(adoptionsResponse.data) ? adoptionsResponse.data.length : 0;
      
      setStats({
        totalUsers,
        totalShelters,
        totalPets,
        totalAdoptions,
        loading: false,
        error: null
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch dashboard data'
      }));
    }
  };

  if (stats.loading) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Dashboard</h2>
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Dashboard</h2>
        <div className={styles['error-message']}>
          {stats.error}
          <button 
            onClick={fetchDashboardData}
            className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Dashboard Overview</h2>
        
        {/* Stats Cards */}
        <div className={styles['stats-container']}>
          <div className={`${styles['stat-card']} ${styles['stat-card-purple']}`}>
            <div className={styles['stat-title']}>Total Users</div>
            <div className={styles['stat-value']}>{stats.totalUsers}</div>
            <div className={`${styles['stat-change']} ${styles['positive']}`}>
              Active Accounts
            </div>
          </div>
          
          <div className={`${styles['stat-card']} ${styles['stat-card-blue']}`}>
            <div className={styles['stat-title']}>Shelters</div>
            <div className={styles['stat-value']}>{stats.totalShelters}</div>
            <div className={`${styles['stat-change']} ${styles['positive']}`}>
              Registered Shelters
            </div>
          </div>
          
          <div className={`${styles['stat-card']} ${styles['stat-card-green']}`}>
            <div className={styles['stat-title']}>Pets</div>
            <div className={styles['stat-value']}>{stats.totalPets}</div>
            <div className={`${styles['stat-change']} ${styles['positive']}`}>
              Available for Adoption
            </div>
          </div>
          
          <div className={`${styles['stat-card']} ${styles['stat-card-orange']}`}>
            <div className={styles['stat-title']}>Adoption Requests</div>
            <div className={styles['stat-value']}>{stats.totalAdoptions}</div>
            <div className={`${styles['stat-change']} ${styles['positive']}`}>
              Total Requests
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className={styles['chart-container']}>
        <div className={styles['chart-card']}>
          <div className={styles['chart-header']}>
            <h3 className={styles['chart-title']}>Visit And Adoption Statistics</h3>
            <div className={styles['chart-filters']}>
              <button className={`${styles['chart-filter']} ${styles['active']}`}>Weekly</button>
              <button className={styles['chart-filter']}>Monthly</button>
              <button className={styles['chart-filter']}>Yearly</button>
            </div>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Activity chart will be displayed here</p>
          </div>
        </div>
        
        <div className={styles['chart-card']}>
          <div className={styles['chart-header']}>
            <h3 className={styles['chart-title']}>Pet Categories</h3>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Pet categories distribution will be displayed here</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Recent Activities</h2>
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Activity</th>
              <th>User</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>New user registered</td>
              <td>john.doe</td>
              <td>Today, 10:30 AM</td>
              <td><span className={styles['status-badge'] + ' ' + styles['status-approved']}>Completed</span></td>
            </tr>
            <tr>
              <td>Adoption request submitted</td>
              <td>sarah.smith</td>
              <td>Yesterday, 2:15 PM</td>
              <td><span className={styles['status-badge'] + ' ' + styles['status-pending']}>Pending</span></td>
            </tr>
            <tr>
              <td>New pet added</td>
              <td>petshelter1</td>
              <td>Yesterday, 11:45 AM</td>
              <td><span className={styles['status-badge'] + ' ' + styles['status-approved']}>Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard; 