import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

// This component is for debugging API responses
const APITester = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [endpoint, setEndpoint] = useState('/api/Admin/users');
  const [useHttps, setUseHttps] = useState(true);
  const [serverPort, setServerPort] = useState('5001');
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setApiResponse(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const protocol = useHttps ? 'https' : 'http';
      const baseUrl = `${protocol}://localhost:${serverPort}`;
      const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
      
      console.log(`Making request to: ${fullUrl}`);
      const response = await axios.get(fullUrl, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response);
      setApiResponse(response.data);
    } catch (err) {
      console.error('API Error:', err);
      let errorMessage = err.message || 'Error fetching data';
      
      // Add more specific error information for token issues
      if (err.response?.status === 401) {
        const tokenData = parseJwt(localStorage.getItem('token'));
        if (tokenData) {
          const expDate = new Date(tokenData.exp * 1000);
          const now = new Date();
          
          if (expDate < now) {
            errorMessage = `Token expired at ${expDate.toLocaleString()}. Current time: ${now.toLocaleString()}`;
          } else {
            errorMessage = `Unauthorized (401). Token valid until ${expDate.toLocaleString()}, but request failed.`;
            
            // Check for issuer/audience mismatch
            if (tokenData.iss && tokenData.aud) {
              const protocol = useHttps ? 'https' : 'http';
              const baseUrl = `${protocol}://localhost:${serverPort}`;
              
              if (tokenData.iss !== tokenData.aud || 
                 (tokenData.iss !== baseUrl && !tokenData.iss.includes(baseUrl))) {
                errorMessage += ` Possible token mismatch: Token was issued for ${tokenData.iss} but request went to ${baseUrl}`;
              }
            }
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Parse JWT token
  const parseJwt = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT token:', e);
      return null;
    }
  };
  
  // Format JSON for display
  const formatJson = (json) => {
    return JSON.stringify(json, null, 2);
  };
  
  return (
    <div className={styles['admin-section']}>
      <h2 className={styles['admin-section-title']}>API Tester</h2>
      
      <div className={styles['admin-controls']} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '10px' }}>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className={styles['admin-input']}
            style={{ flex: 1 }}
            placeholder="API endpoint (e.g., /api/Admin/users)"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
            <label style={{ marginRight: '5px' }}>Protocol:</label>
            <select 
              value={useHttps ? 'https' : 'http'} 
              onChange={(e) => setUseHttps(e.target.value === 'https')}
              className={styles['admin-input']}
            >
              <option value="https">HTTPS</option>
              <option value="http">HTTP</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '5px' }}>Port:</label>
            <input
              type="text"
              value={serverPort}
              onChange={(e) => setServerPort(e.target.value)}
              className={styles['admin-input']}
              style={{ width: '60px' }}
            />
          </div>
          
          <button 
            onClick={fetchData}
            className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
            disabled={loading}
            style={{ marginLeft: 'auto' }}
          >
            {loading ? 'Loading...' : 'Test API'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className={styles['error-message']} style={{ padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      {apiResponse && (
        <div>
          <h3>Response Structure Analysis:</h3>
          <div>
            <h4>User ID Properties:</h4>
            {Array.isArray(apiResponse) ? (
              apiResponse.length > 0 ? (
                <ul>
                  {apiResponse.map((item, index) => (
                    <li key={index}>
                      Item {index}: 
                      <ul>
                        <li>id: {JSON.stringify(item.id)}</li>
                        <li>userId: {JSON.stringify(item.userId)}</li>
                        <li>All keys: {Object.keys(item).join(', ')}</li>
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Empty array returned</p>
              )
            ) : (
              <ul>
                <li>id: {JSON.stringify(apiResponse.id)}</li>
                <li>userId: {JSON.stringify(apiResponse.userId)}</li>
                <li>All keys: {Object.keys(apiResponse).join(', ')}</li>
              </ul>
            )}
          </div>
          
          <h3>Raw Response:</h3>
          <pre style={{ 
            backgroundColor: '#f4f4f4', 
            padding: '10px', 
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {formatJson(apiResponse)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default APITester; 