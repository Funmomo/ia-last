import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [petStatistics, setPetStatistics] = useState({});
  const [adoptionStatistics, setAdoptionStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchPetDetails = async (petId, token) => {
    try {
      const response = await axios.get(`https://localhost:5001/api/Pet/${petId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      console.error(`Error fetching pet details for ID ${petId}:`, err);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch pets data for statistics
      const petsResponse = await axios.get('https://localhost:5001/api/Pet', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (petsResponse.data) {
        // Calculate statistics by pet type
        const statistics = petsResponse.data.reduce((acc, pet) => {
          acc[pet.type] = (acc[pet.type] || 0) + 1;
          return acc;
        }, {});
        setPetStatistics(statistics);
      }

      // Fetch users data
      const usersResponse = await axios.get('https://localhost:5001/api/Admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const usersMap = usersResponse.data ? 
        usersResponse.data.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {}) : {};

      // Fetch adoption requests
      const adoptionsResponse = await axios.get('https://localhost:5001/api/Adoption', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (adoptionsResponse.data) {
        // Calculate adoption statistics
        const adoptStats = adoptionsResponse.data.reduce((acc, adoption) => {
          acc.total++;
          if (adoption.status === 0) acc.pending++;
          else if (adoption.status === 1) acc.approved++;
          else if (adoption.status === 2) acc.rejected++;
          return acc;
        }, { total: 0, pending: 0, approved: 0, rejected: 0 });
        setAdoptionStatistics(adoptStats);

        // Get recent activities and fetch pet details for each
        const recentAdoptions = adoptionsResponse.data
          .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
          .slice(0, 5);

        // Fetch pet details for each adoption
        const activitiesWithDetails = await Promise.all(
          recentAdoptions.map(async (adoption) => {
            const petDetails = await fetchPetDetails(adoption.petId, token);
            return {
              type: 'ADOPTION_REQUEST',
              date: new Date(adoption.dateCreated),
              status: adoption.status,
              petId: adoption.petId,
              userId: adoption.userId,
              pet: petDetails,
              user: usersMap[adoption.userId]
            };
          })
        );

        setRecentActivities(activitiesWithDetails);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 0: return styles['status-pending'];
      case 1: return styles['status-active'];
      case 2: return styles['status-suspended'];
      default: return styles['status-inactive'];
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityMessage = (activity) => {
    const petName = activity.pet ? activity.pet.name : 'Unknown Pet';
    const userName = activity.user ? activity.user.username : 'Unknown User';
    
    switch (activity.type) {
      case 'ADOPTION_REQUEST':
        let status = 'submitted';
        if (activity.status === 1) status = 'approved';
        else if (activity.status === 2) status = 'rejected';
        return `Adoption request ${status} for ${petName} by ${userName}`;
      default:
        return 'Unknown activity';
    }
  };

  if (loading) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Dashboard</h2>
        <div className={styles['loading']}>Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className={styles['dashboard-container']}>
      {/* Pet Type Statistics */}
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Pet Type Statistics</h2>
        <div className={styles['stats-container']}>
          {Object.entries(petStatistics).map(([type, count]) => (
            <div key={type} className={`${styles['stat-card']} ${styles['stat-card-blue']}`}>
              <h3 className={styles['stat-title']}>{type}</h3>
              <p className={styles['stat-value']}>{count}</p>
              <span className={styles['stat-label']}>total pets</span>
            </div>
          ))}
        </div>
      </div>

      {/* Adoption Statistics */}
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Adoption Statistics</h2>
        <div className={styles['stats-container']}>
          <div className={`${styles['stat-card']} ${styles['stat-card-purple']}`}>
            <h3 className={styles['stat-title']}>Total Requests</h3>
            <p className={styles['stat-value']}>{adoptionStatistics.total}</p>
          </div>
          <div className={`${styles['stat-card']} ${styles['stat-card-blue']}`}>
            <h3 className={styles['stat-title']}>Pending</h3>
            <p className={styles['stat-value']}>{adoptionStatistics.pending}</p>
          </div>
          <div className={`${styles['stat-card']} ${styles['stat-card-green']}`}>
            <h3 className={styles['stat-title']}>Approved</h3>
            <p className={styles['stat-value']}>{adoptionStatistics.approved}</p>
          </div>
          <div className={`${styles['stat-card']} ${styles['stat-card-orange']}`}>
            <h3 className={styles['stat-title']}>Rejected</h3>
            <p className={styles['stat-value']}>{adoptionStatistics.rejected}</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Recent Activities</h2>
        {error && (
          <div className={styles['error-message']}>
            {error}
            <button 
              onClick={fetchDashboardData}
              className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
            >
              Retry
            </button>
          </div>
        )}
        {recentActivities.length === 0 ? (
          <div className={styles['no-data']}>No recent activities found.</div>
        ) : (
          <div className={styles['activities-list']}>
            {recentActivities.map((activity, index) => (
              <div key={index} className={styles['activity-item']}>
                <div className={styles['activity-icon']}></div>
                <div className={styles['activity-content']}>
                  <p className={styles['activity-message']}>
                    {getActivityMessage(activity)}
                  </p>
                  <div className={styles['activity-details']}>
                    <span className={styles['activity-date']}>
                      {formatDate(activity.date)}
                    </span>
                    <span className={styles['activity-pet']}>
                      Pet: {activity.pet ? activity.pet.name : 'Unknown'} (ID: {activity.petId})
                    </span>
                    <span className={styles['activity-user']}>
                      Adopter: {activity.user ? activity.user.username : 'Unknown'} (ID: {activity.userId})
                    </span>
                  </div>
                </div>
                <div className={`${styles['status-badge']} ${getStatusBadgeClass(activity.status)}`}>
                  {activity.status === 0 ? 'Pending' : activity.status === 1 ? 'Approved' : 'Rejected'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 