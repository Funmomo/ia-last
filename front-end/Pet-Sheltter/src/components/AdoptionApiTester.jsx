import React, { useState, useEffect } from 'react';
import styles from '../Styles/AdoptionApiTester.module.css';
import { getRequestTemplate } from '../utils/adoptionRequestTemplates';

const AdoptionApiTester = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [endpoint, setEndpoint] = useState('/api/Adoption');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('{}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [idParam, setIdParam] = useState('');
  const [userId, setUserId] = useState('');
  const [shelterId, setShelterId] = useState('');

  // Update request body template when endpoint or method changes
  useEffect(() => {
    setRequestBody(getRequestTemplate(endpoint, method));
  }, [endpoint, method]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset form when opening
      setResponse(null);
      setError(null);
    }
  };

  const updateEndpoint = (type) => {
    switch (type) {
      case 'base':
        setEndpoint('/api/Adoption');
        break;
      case 'id':
        setEndpoint(`/api/Adoption/${idParam}`);
        break;
      case 'user':
        setEndpoint(`/api/Adoption/user/${userId}`);
        break;
      case 'shelter':
        setEndpoint(`/api/Adoption/shelter/${shelterId}`);
        break;
      default:
        setEndpoint('/api/Adoption');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      let options = {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      // Add request body for POST and PUT requests
      if (method === 'POST' || method === 'PUT') {
        options.body = requestBody;
      }

      const response = await fetch(`https://localhost:5001${endpoint}`, options);

      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }

      // For DELETE, there might not be content
      if (response.status === 204) {
        setResponse({ status: response.status, message: 'Resource deleted successfully' });
      } else {
        const data = await response.json();
        setResponse({ status: response.status, data });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className={styles.apiTesterButton} 
        onClick={toggleModal}
        title="Test Adoption APIs"
      >
        <span className={styles.apiIcon}>API</span>
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Adoption API Tester</h2>
              <button className={styles.closeButton} onClick={toggleModal}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>API Endpoint Type:</label>
                <div className={styles.endpointSelector}>
                  <button 
                    className={endpoint === '/api/Adoption' ? styles.activeEndpoint : ''} 
                    onClick={() => updateEndpoint('base')}
                  >
                    Base
                  </button>
                  <button 
                    className={endpoint.includes('/api/Adoption/') && !endpoint.includes('/user/') && !endpoint.includes('/shelter/') ? styles.activeEndpoint : ''} 
                    onClick={() => updateEndpoint('id')}
                  >
                    By ID
                  </button>
                  <button 
                    className={endpoint.includes('/user/') ? styles.activeEndpoint : ''} 
                    onClick={() => updateEndpoint('user')}
                  >
                    By User
                  </button>
                  <button 
                    className={endpoint.includes('/shelter/') ? styles.activeEndpoint : ''} 
                    onClick={() => updateEndpoint('shelter')}
                  >
                    By Shelter
                  </button>
                </div>
              </div>

              {endpoint.includes('/api/Adoption/') && !endpoint.includes('/user/') && !endpoint.includes('/shelter/') && (
                <div className={styles.formGroup}>
                  <label>Adoption Request ID:</label>
                  <input 
                    type="text" 
                    value={idParam} 
                    onChange={(e) => {
                      setIdParam(e.target.value);
                      updateEndpoint('id');
                    }} 
                    placeholder="Enter adoption request ID"
                  />
                </div>
              )}

              {endpoint.includes('/user/') && (
                <div className={styles.formGroup}>
                  <label>User ID:</label>
                  <input 
                    type="text" 
                    value={userId} 
                    onChange={(e) => {
                      setUserId(e.target.value);
                      updateEndpoint('user');
                    }} 
                    placeholder="Enter user ID"
                  />
                </div>
              )}

              {endpoint.includes('/shelter/') && (
                <div className={styles.formGroup}>
                  <label>Shelter ID:</label>
                  <input 
                    type="text" 
                    value={shelterId} 
                    onChange={(e) => {
                      setShelterId(e.target.value);
                      updateEndpoint('shelter');
                    }} 
                    placeholder="Enter shelter ID"
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Current Endpoint:</label>
                <div className={styles.endpoint}>{endpoint}</div>
              </div>

              <div className={styles.formGroup}>
                <label>HTTP Method:</label>
                <div className={styles.methodSelector}>
                  <button 
                    className={method === 'GET' ? styles.activeMethod : ''} 
                    onClick={() => setMethod('GET')}
                  >
                    GET
                  </button>
                  <button 
                    className={method === 'POST' ? styles.activeMethod : ''} 
                    onClick={() => setMethod('POST')}
                    disabled={endpoint !== '/api/Adoption'}
                  >
                    POST
                  </button>
                  <button 
                    className={method === 'PUT' ? styles.activeMethod : ''} 
                    onClick={() => setMethod('PUT')}
                    disabled={!endpoint.includes('/api/Adoption/') || endpoint.includes('/user/') || endpoint.includes('/shelter/')}
                  >
                    PUT
                  </button>
                  <button 
                    className={method === 'DELETE' ? styles.activeMethod : ''} 
                    onClick={() => setMethod('DELETE')}
                    disabled={!endpoint.includes('/api/Adoption/') || endpoint.includes('/user/') || endpoint.includes('/shelter/')}
                  >
                    DELETE
                  </button>
                </div>
              </div>

              {(method === 'POST' || method === 'PUT') && (
                <div className={styles.formGroup}>
                  <label>Request Body (JSON):</label>
                  <textarea 
                    value={requestBody} 
                    onChange={(e) => setRequestBody(e.target.value)} 
                    rows={8}
                    placeholder="Enter JSON request body"
                  />
                </div>
              )}

              <button 
                className={styles.sendButton} 
                onClick={fetchData}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>

              {error && (
                <div className={styles.errorBox}>
                  <h3>Error</h3>
                  <p>{error}</p>
                </div>
              )}

              {response && (
                <div className={styles.responseBox}>
                  <h3>Response (Status: {response.status})</h3>
                  <pre>{JSON.stringify(response.data || response.message, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdoptionApiTester; 