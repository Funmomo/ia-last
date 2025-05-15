import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../Styles/Admin.module.css';

const SupportIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status mapping
  const statusMap = {
    'open': 'New',
    'in progress': 'In Progress',
    'closed': 'Solved'
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('https://localhost:5001/api/SupportIssue', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setIssues(response.data);
    } catch (err) {
      console.error('Error fetching support issues:', err);
      setError(err.response?.data || 'Failed to fetch support issues');
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      await axios.put(`https://localhost:5001/api/SupportIssue/${issueId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh the issues list
      await fetchIssues();
    } catch (err) {
      console.error('Error updating issue status:', err);
      setError(err.response?.data || 'Failed to update issue status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open':
        return styles['status-new'];
      case 'in progress':
        return styles['status-progress'];
      case 'closed':
        return styles['status-solved'];
      default:
        return '';
    }
  };

  if (loading) {
    return <div className={styles['loading']}>Loading support issues...</div>;
  }

  if (error) {
    return (
      <div className={styles['error-message']}>
        {error}
        <button 
          onClick={fetchIssues}
          className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles['admin-section']}>
      <h2 className={styles['admin-section-title']}>Support Issues</h2>
      
      {issues.length === 0 ? (
        <div className={styles['no-data']}>
          No support issues found.
        </div>
      ) : (
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue.id}>
                <td>{new Date(issue.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles['details-primary']}>
                    {issue.reporter?.email || 'Unknown User'}
                  </div>
                  <div className={styles['details-secondary']}>
                    ID: {issue.reportID}
                  </div>
                </td>
                <td>
                  <div className={styles['issue-content']}>
                    <div className={styles['issue-title']}>
                      {issue.title || 'No Title'}
                    </div>
                    <div className={styles['issue-description']}>
                      {issue.description}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles['status-badge']} ${getStatusBadgeClass(issue.status)}`}>
                    {statusMap[issue.status] || 'Unknown'}
                  </span>
                </td>
                <td>
                  <div className={styles['action-buttons']}>
                    {issue.status === 'open' && (
                      <button
                        onClick={() => updateIssueStatus(issue.id, 'in progress')}
                        className={`${styles['admin-btn']} ${styles['admin-btn-primary']}`}
                      >
                        Start Progress
                      </button>
                    )}
                    {issue.status === 'in progress' && (
                      <button
                        onClick={() => updateIssueStatus(issue.id, 'closed')}
                        className={`${styles['admin-btn']} ${styles['admin-btn-success']}`}
                      >
                        Mark as Solved
                      </button>
                    )}
                    {issue.status === 'closed' && (
                      <button
                        onClick={() => updateIssueStatus(issue.id, 'in progress')}
                        className={`${styles['admin-btn']} ${styles['admin-btn-warning']}`}
                      >
                        Reopen
                      </button>
                    )}
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

export default SupportIssues; 