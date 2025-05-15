import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('https://localhost:5001/api/Category', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Validate response data
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Ensure we have an array of categories
      const categoryData = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched categories:', categoryData);
      
      setCategories(categoryData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      setLoading(false);
      setCategories([]); // Reset categories to empty array on error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post('https://localhost:5001/api/Category', newCategory, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNewCategory({ name: '', description: '' });
      await fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.message || 'Failed to create category');
    }
  };

  const updateCategory = async (categoryId, updatedData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(`https://localhost:5001/api/Category/${categoryId}`, updatedData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`https://localhost:5001/api/Category/${categoryId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className={styles['admin-section']}>
        <h2 className={styles['admin-section-title']}>Manage Pet Categories</h2>
        <div className={styles['loading']}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles['admin-section']}>
      <h2 className={styles['admin-section-title']}>Manage Pet Categories</h2>

      {error && (
        <div className={styles['error-message']}>
          {error}
          <button 
            onClick={fetchCategories}
            className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
          >
            Retry
          </button>
        </div>
      )}

      {/* Add New Category Form */}
      <form onSubmit={createCategory} className={styles['admin-form']}>
        <div className={styles['form-group']}>
          <input
            type="text"
            name="name"
            value={newCategory.name}
            onChange={handleInputChange}
            placeholder="Category Name (e.g., Dogs, Cats)"
            required
            className={styles['admin-input']}
          />
          <input
            type="text"
            name="description"
            value={newCategory.description}
            onChange={handleInputChange}
            placeholder="Description"
            required
            className={styles['admin-input']}
          />
          <button type="submit" className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}>
            Add Category
          </button>
        </div>
      </form>

      {!error && categories.length === 0 && (
        <div className={styles['no-data']}>
          No categories found.
        </div>
      )}

      {categories.length > 0 && (
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id || category.categoryId}>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>
                  <div className={styles['action-buttons']}>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
                      onClick={() => {
                        const newName = prompt('Enter new category name:', category.name);
                        if (newName) {
                          updateCategory(category.id || category.categoryId, { 
                            ...category, 
                            name: newName 
                          });
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className={`${styles['admin-btn']} ${styles['admin-btn-danger']}`}
                      onClick={() => deleteCategory(category.id || category.categoryId)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageCategories; 