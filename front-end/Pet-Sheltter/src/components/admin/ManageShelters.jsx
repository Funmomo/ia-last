import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

// Enum for shelter status
const ShelterStatus = {
  Pending: 0,
  Active: 1,
  Suspended: 2,
  Inactive: 3
};

const ManageShelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [editingShelter, setEditingShelter] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('https://localhost:5001/api/Shelter', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const shelterData = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched shelters:', shelterData);
      
      setShelters(shelterData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching shelters:', err);
      setError(err.message || 'Failed to fetch shelters');
      setLoading(false);
      setShelters([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post('https://localhost:5001/api/Shelter', 
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setFormData({ name: '', address: '', phone: '', email: '' });
      await fetchShelters();
    } catch (err) {
      console.error('Error creating shelter:', err);
      setError(err.message || 'Failed to create shelter');
    }
  };

  const updateShelter = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(`https://localhost:5001/api/Shelter/${editingShelter.id}`,
        editingShelter,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setShowEditModal(false);
      setEditingShelter(null);
      await fetchShelters();
    } catch (err) {
      console.error('Error updating shelter:', err);
      setError(err.message || 'Failed to update shelter');
    }
  };

  const deleteShelter = async (shelterId) => {
    if (!window.confirm('Are you sure you want to delete this shelter?')) return;
    
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`https://localhost:5001/api/Shelter/${shelterId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await fetchShelters();
    } catch (err) {
      console.error('Error deleting shelter:', err);
      setError(err.message || 'Failed to delete shelter');
    }
  };

  const openEditModal = (shelter) => {
    setEditingShelter({ ...shelter });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Manage Shelters</h2>
        <div className={styles['loading']}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles['admin-section']}>
      <h2 className={styles['admin-section-title']}>Manage Shelters</h2>

      {error && (
        <div className={styles['error-message']}>
          {error}
          <button 
            onClick={fetchShelters}
            className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
          >
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles['shelter-form-container']}>
        <div className={styles['shelter-form-grid']}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Shelter Name"
            className={styles['shelter-input']}
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className={styles['shelter-input']}
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className={styles['shelter-input']}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={styles['shelter-input']}
          />
        </div>
        
        <div className={styles['shelter-form-actions']}>
          <button type="submit" className={styles['add-shelter-btn']}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Shelter
          </button>
        </div>
      </form>

      {!error && (!Array.isArray(shelters) || shelters.length === 0) && (
        <div className={styles['no-data']}>
          No shelters found.
        </div>
      )}

      {Array.isArray(shelters) && shelters.length > 0 && (
        <div className={styles['shelter-grid']}>
          {shelters.map(shelter => (
            <div key={shelter.id || shelter.shelterId} className={styles['shelter-card']}>
              <div className={styles['card-header']}>
                <h3 className={styles['card-title']}>{shelter.name}</h3>
                <span className={`${styles['card-status']} ${styles['status-active']}`}>Active</span>
              </div>
              <div className={styles['card-content']}>
                <p>{shelter.address}</p>
                <p>Phone: {shelter.phone}</p>
                <p>Email: {shelter.email}</p>
              </div>
              <div className={styles['card-footer']}>
                <div className={styles['card-stats']}>
                  <span className={styles['stat-item']}>15 Pets</span>
                </div>
                <div className={styles['card-actions']}>
                  <button
                    onClick={() => openEditModal(shelter)}
                    className={`${styles['card-btn']} ${styles['btn-edit']}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteShelter(shelter.id)}
                    className={`${styles['card-btn']} ${styles['btn-delete']}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditModal && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <div className={styles['modal-header']}>
              <h3 className={styles['modal-title']}>Edit Shelter</h3>
              <button 
                className={styles['modal-close']}
                onClick={() => {
                  setShowEditModal(false);
                  setEditingShelter(null);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={updateShelter} className={styles['modal-form']}>
              <div className={styles['form-control']}>
                <label className={styles['form-label']}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingShelter.name}
                  onChange={handleChange}
                  required
                  className={styles['form-input']}
                />
              </div>
              <div className={styles['form-control']}>
                <label className={styles['form-label']}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={editingShelter.address}
                  onChange={handleChange}
                  required
                  className={styles['form-input']}
                />
              </div>
              <div className={styles['form-control']}>
                <label className={styles['form-label']}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editingShelter.phone}
                  onChange={handleChange}
                  required
                  className={styles['form-input']}
                />
              </div>
              <div className={styles['form-control']}>
                <label className={styles['form-label']}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingShelter.email}
                  onChange={handleChange}
                  required
                  className={styles['form-input']}
                />
              </div>
              <div className={styles['modal-footer']}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingShelter(null);
                  }}
                  className={`${styles['modal-btn']} ${styles['modal-btn-cancel']}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles['modal-btn']} ${styles['modal-btn-save']}`}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShelters; 