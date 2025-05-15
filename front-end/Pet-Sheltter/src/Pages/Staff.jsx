import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import DashboardNavigation from '../components/DashboardNavigation';
import styles from '../Styles/Staff.module.css';
import PetDetails from './PetDetails';
import ShelterDetails from './ShelterDetails';

const API_BASE_URL = 'https://localhost:5001';

// Loading Component
const LoadingSpinner = () => (
  <div className={styles.loading}>Loading...</div>
);

// Error Component
const ErrorDisplay = ({ message, onRetry }) => (
  <div className={styles.error}>
    <h3>Error</h3>
    <p>{message}</p>
    {onRetry && (
      <button className={styles.retryButton} onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

// Dashboard View Component
const DashboardView = () => {
  const [pets, setPets] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Fetch both pets and shelters
      const [petsResponse, sheltersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/Pet`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/Shelter`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!petsResponse.ok || !sheltersResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [petsData, sheltersData] = await Promise.all([
        petsResponse.json(),
        sheltersResponse.json()
      ]);

      setPets(petsData);
      setShelters(sheltersData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchData} />;

  return (
    <div className={styles.dashboard}>
      {/* Shelters Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Partner Shelters</h2>
        </div>
        <div className={styles.shelterGrid}>
          {shelters.map(shelter => (
            <div key={shelter.id} className={styles.shelterCard}>
              <div className={styles.shelterContent}>
                <h3 className={styles.shelterName}>{shelter.name}</h3>
                <p className={styles.shelterAddress}>{shelter.address}</p>
                <button
                  className={styles.viewButton}
                  onClick={() => navigate(`/staff/shelter/${shelter.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pets Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Pets</h2>
        </div>
        <div className={styles.petsGrid}>
          {pets.slice(0, 6).map(pet => (
            <div key={pet.id} className={styles.petCard}>
              <img 
                src={pet.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                alt={pet.name}
                className={styles.petImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
              <div className={styles.petInfo}>
                <h3 className={styles.petName}>{pet.name}</h3>
                <p className={styles.petBreed}>{pet.breed}</p>
                <p className={styles.petAge}>{pet.age} years old</p>
                <button 
                  className={styles.viewButton}
                  onClick={() => navigate(`/staff/pet/${pet.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Auth Check Component
const AuthCheck = () => {
  const userRole = parseInt(localStorage.getItem('userRole'));
  
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== 1) {
    return <Navigate to="/" replace />;
  }
  
  return null;
};

// Manage Pets Component
const ManagePets = () => {
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Fetch both pets and categories
      const [petsResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/Pet`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/Category`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!petsResponse.ok || !categoriesResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [petsData, categoriesData] = await Promise.all([
        petsResponse.json(),
        categoriesResponse.json()
      ]);

      setPets(petsData);
      setCategories(categoriesData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (petId, newStatus) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      // First get the current pet data
      const getPetResponse = await fetch(`${API_BASE_URL}/api/Pet/${petId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!getPetResponse.ok) {
        throw new Error(`Failed to fetch pet: ${getPetResponse.status}`);
      }

      const petData = await getPetResponse.json();

      // Update the pet with new status
      const response = await fetch(`${API_BASE_URL}/api/Pet/${petId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...petData,
          status: parseInt(newStatus)
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update pet status: ${response.status}`);
      }

      // Refresh the pets list
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) {
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/Pet/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete pet: ${response.status}`);
      }

      // Refresh the pets list
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchData} />;

  return (
    <div className={styles.pageContent}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Manage Pets</h2>
        <button 
          className={styles.addButton}
          onClick={() => navigate('/staff/pet/add')}
        >
          Add New Pet
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Breed</th>
              <th>Age</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pets.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyMessage}>No pets found</td>
              </tr>
            ) : (
              pets.map(pet => (
                <tr key={pet.id}>
                  <td>
                    <img 
                      src={pet.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'} 
                      alt={pet.name}
                      className={styles.tableImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                      }}
                    />
                  </td>
                  <td>{pet.name}</td>
                  <td>{pet.category?.name || 'N/A'}</td>
                  <td>{pet.breed || 'N/A'}</td>
                  <td>{pet.age ? `${pet.age} years` : 'N/A'}</td>
                  <td>
                    <select
                      value={pet.status}
                      onChange={(e) => handleStatusChange(pet.id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value={0}>Available</option>
                      <option value={1}>Pending</option>
                      <option value={2}>Adopted</option>
                      <option value={3}>Not Available</option>
                    </select>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editButton}
                        onClick={() => navigate(`/staff/pet/edit/${pet.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(pet.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Manage Shelters Component
const ManageShelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchShelters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/Shelter`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shelters');
      }

      const data = await response.json();
      setShelters(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShelters();
  }, [fetchShelters]);

  const handleDelete = async (shelterId) => {
    if (!window.confirm('Are you sure you want to delete this shelter? This will also delete all associated pets.')) {
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/Shelter/${shelterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete shelter: ${response.status}`);
      }

      // Refresh the shelters list
      await fetchShelters();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchShelters} />;

  return (
    <div className={styles.pageContent}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Manage Shelters</h2>
        <button 
          className={styles.addButton}
          onClick={() => navigate('/staff/shelter/add')}
        >
          Add New Shelter
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Pets Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shelters.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyMessage}>No shelters found</td>
              </tr>
            ) : (
              shelters.map(shelter => (
                <tr key={shelter.id}>
                  <td>{shelter.name}</td>
                  <td>{shelter.address || 'N/A'}</td>
                  <td>{shelter.phone || 'N/A'}</td>
                  <td>{shelter.email || 'N/A'}</td>
                  <td>{shelter.petsCount || 0}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.viewButton}
                        onClick={() => navigate(`/staff/shelter/${shelter.id}`)}
                      >
                        View
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={() => navigate(`/staff/shelter/edit/${shelter.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(shelter.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Applications Component
const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/Adoption/simple`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      // First get the current application data
      const getApplicationResponse = await fetch(`${API_BASE_URL}/api/Adoption/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!getApplicationResponse.ok) {
        throw new Error(`Failed to fetch application: ${getApplicationResponse.status}`);
      }

      const applicationData = await getApplicationResponse.json();

      // Update the application with new status
      const response = await fetch(`${API_BASE_URL}/api/Adoption/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...applicationData,
          status: parseInt(newStatus)
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update application status: ${response.status}`);
      }

      // Refresh the applications list
      await fetchApplications();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchApplications} />;

  return (
    <div className={styles.pageContent}>
      <h2 className={styles.sectionTitle}>Adoption Applications</h2>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Pet</th>
              <th>Application Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.emptyMessage}>No applications found</td>
              </tr>
            ) : (
              applications.map(app => (
                <tr key={app.id}>
                  <td>{app.userName}</td>
                  <td>{app.petName}</td>
                  <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value={0}>Pending</option>
                      <option value={1}>Approved</option>
                      <option value={2}>Rejected</option>
                    </select>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.viewButton}
                        onClick={() => window.alert(`Application Details:\nApplicant: ${app.userName}\nPet: ${app.petName}\nDate: ${new Date(app.applicationDate).toLocaleDateString()}\nStatus: ${
                          app.status === 0 ? 'Pending' : 
                          app.status === 1 ? 'Approved' : 
                          'Rejected'
                        }`)}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Staff Component
const Staff = () => {
  return (
    <div className={styles.container}>
      <AuthCheck />
      <Navigation />
      <div className={styles.content}>
        <div className={styles.mainContent}>
          <Routes>
            <Route path="/" element={
              <>
                <DashboardNavigation />
                <DashboardView />
              </>
            } />
            <Route path="pets" element={
              <>
                <DashboardNavigation />
                <ManagePets />
              </>
            } />
            <Route path="shelters" element={
              <>
                <DashboardNavigation />
                <ManageShelters />
              </>
            } />
            <Route path="applications" element={
              <>
                <DashboardNavigation />
                <Applications />
              </>
            } />
            <Route path="pet/:id" element={<PetDetails />} />
            <Route path="shelter/:id" element={<ShelterDetails />} />
            <Route path="*" element={<Navigate to="/staff" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Staff;
