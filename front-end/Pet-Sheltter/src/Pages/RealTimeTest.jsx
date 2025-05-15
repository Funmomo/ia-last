import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  initializeSignalRConnection, 
  resetSignalRConnection, 
  sendMessage,
  cleanupSignalRResources 
} from '../services/messageService';

const RealTimeTest = () => {
  const [status, setStatus] = useState('Disconnected');
  const [connectionId, setConnectionId] = useState('');
  const [logs, setLogs] = useState([]);
  const testUserId = localStorage.getItem('userId') || '';
  const [testReceiverId, setTestReceiverId] = useState('');
  const [testConversationId, setTestConversationId] = useState('');
  const [testMessage, setTestMessage] = useState('Test message from real-time tester');
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Setup event handlers for SignalR
    window.messageReceived = (message) => {
      addLog(`💬 Received message: ${JSON.stringify(message)}`);
    };

    window.messageDelivered = (messageId) => {
      addLog(`✓✓ Message delivered: ${messageId}`);
    };

    // Connect on component mount
    connectSignalR();

    // Clean up
    return () => {
      window.messageReceived = null;
      window.messageDelivered = null;
      cleanupSignalRResources();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when logs change
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, `[${timestamp}] ${message}`]);
  };

  const connectSignalR = async () => {
    try {
      addLog('Connecting to SignalR...');
      setStatus('Connecting');
      
      const connection = await initializeSignalRConnection();
      
      if (connection) {
        setStatus('Connected');
        setConnectionId(connection.connectionId || 'Unknown');
        addLog(`Connected successfully! Connection ID: ${connection.connectionId}`);
      }
    } catch (error) {
      setStatus('Error');
      addLog(`❌ Error connecting: ${error.message}`);
    }
  };

  const resetConnection = async () => {
    try {
      addLog('Resetting SignalR connection...');
      setStatus('Reconnecting');
      
      const connection = await resetSignalRConnection();
      
      if (connection) {
        setStatus('Connected');
        setConnectionId(connection.connectionId || 'Unknown');
        addLog(`Reset successful! New Connection ID: ${connection.connectionId}`);
      }
    } catch (error) {
      setStatus('Error');
      addLog(`❌ Error reconnecting: ${error.message}`);
    }
  };

  const sendTestMessage = async () => {
    if (!testConversationId || !testReceiverId || !testMessage) {
      addLog('❌ Error: All fields are required');
      return;
    }

    try {
      addLog(`Sending test message to ${testReceiverId} in conversation ${testConversationId}...`);
      
      const result = await sendMessage(testConversationId, testReceiverId, testMessage);
      
      if (result) {
        addLog(`✓ Message sent successfully: ${JSON.stringify(result)}`);
      } else {
        addLog('❌ Error: No result returned from sendMessage');
      }
    } catch (error) {
      addLog(`❌ Error sending message: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>SignalR Connection Tester</h1>
        <Link to="/messages" style={{ textDecoration: 'none', padding: '8px 16px', background: '#007bff', color: 'white', borderRadius: '4px' }}>
          Back to Messaging
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', flex: '1', marginRight: '10px' }}>
          <h3>Connection Status</h3>
          <p>Status: <span style={{ 
            fontWeight: 'bold', 
            color: status === 'Connected' ? 'green' : status === 'Error' ? 'red' : 'orange' 
          }}>{status}</span></p>
          <p>Connection ID: {connectionId || 'None'}</p>
          <p>Your User ID: {testUserId}</p>
          <div>
            <button 
              onClick={connectSignalR} 
              style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px', cursor: 'pointer' }}
              disabled={status === 'Connected' || status === 'Connecting'}
            >
              Connect
            </button>
            <button 
              onClick={resetConnection} 
              style={{ padding: '8px 16px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Reset Connection
            </button>
          </div>
        </div>

        <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', flex: '1' }}>
          <h3>Send Test Message</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Conversation ID:</label>
            <input 
              type="text" 
              value={testConversationId} 
              onChange={(e) => setTestConversationId(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Enter conversation ID"
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Receiver ID:</label>
            <input 
              type="text" 
              value={testReceiverId} 
              onChange={(e) => setTestReceiverId(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Enter receiver ID"
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Message:</label>
            <input 
              type="text" 
              value={testMessage} 
              onChange={(e) => setTestMessage(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Enter test message"
            />
          </div>
          <button 
            onClick={sendTestMessage} 
            style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            disabled={status !== 'Connected'}
          >
            Send Message
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Event Logs</h3>
          <button
            onClick={clearLogs}
            style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear Logs
          </button>
        </div>
        <div style={{ 
          height: '400px', 
          overflowY: 'auto', 
          padding: '10px', 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          backgroundColor: '#f8f9fa'
        }}>
          {logs.length === 0 ? (
            <p style={{ color: '#6c757d', textAlign: 'center', marginTop: '180px' }}>No events logged yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>{log}</div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default RealTimeTest; 