import React, { useState, useRef } from 'react';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markMessageAsDelivered,
  initializeSignalRConnection,
  createConversation
} from '../services/messageService';

const MessageApiTester = () => {
  // State for SignalR connection
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [connectionId, setConnectionId] = useState('');
  const connectionRef = useRef(null);
  
  // State for API responses
  const [apiResponse, setApiResponse] = useState('');
  const [eventLog, setEventLog] = useState([]);
  
  // Test inputs
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [receiverId, setReceiverId] = useState('');
  const [messageContent, setMessageContent] = useState('Test message');
  const [conversationId, setConversationId] = useState('');
  const [messageId, setMessageId] = useState('');

  // Initialize SignalR
  const initializeSignalR = async () => {
    try {
      setConnectionStatus('Connecting...');
      addToLog('Initializing SignalR connection...');
      
      const connection = await initializeSignalRConnection();
      connectionRef.current = connection;
      
      if (connection) {
        setConnectionStatus('Connected');
        setConnectionId(connection.connectionId || 'Unknown');
        addToLog(`Connected to SignalR! Connection ID: ${connection.connectionId || 'Unknown'}`);

        // Set up event handlers
        connection.on('ReceiveMessage', (message) => {
          addToLog(`Received message: ${JSON.stringify(message)}`);
        });

        connection.on('MessageDelivered', (messageId) => {
          addToLog(`Message delivered: ${messageId}`);
        });

        connection.on('UserConnected', (user) => {
          addToLog(`User connected: ${JSON.stringify(user)}`);
        });

        connection.on('UserDisconnected', (user) => {
          addToLog(`User disconnected: ${JSON.stringify(user)}`);
        });

        connection.onclose(() => {
          addToLog('SignalR connection closed');
          setConnectionStatus('Disconnected');
        });

        connection.onreconnecting((error) => {
          addToLog(`Reconnecting... Error: ${error ? error.message : 'Unknown'}`);
          setConnectionStatus('Reconnecting');
        });

        connection.onreconnected((newConnectionId) => {
          addToLog(`Reconnected with ID: ${newConnectionId}`);
          setConnectionStatus('Connected');
          setConnectionId(newConnectionId);
        });
      }
    } catch (error) {
      addToLog(`Error connecting to SignalR: ${error.message}`);
      setConnectionStatus('Error: ' + error.message);
    }
  };

  // Helper function to add to event log
  const addToLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Test API methods
  const testGetConversations = async () => {
    try {
      addToLog('Testing getConversations...');
      const conversations = await getConversations();
      setApiResponse(JSON.stringify(conversations, null, 2));
      addToLog(`Got ${conversations.length} conversations`);
      
      // If we have conversations, set the first one as active
      if (conversations && conversations.length > 0) {
        setConversationId(conversations[0].id || conversations[0].conversationId);
      }
    } catch (error) {
      addToLog(`Error getting conversations: ${error.message}`);
      setApiResponse(`Error: ${error.message}`);
    }
  };

  const testGetMessages = async () => {
    if (!conversationId) {
      addToLog('Error: No conversation ID provided');
      return;
    }

    try {
      addToLog(`Testing getMessages for conversation ${conversationId}...`);
      const messages = await getMessages(conversationId);
      setApiResponse(JSON.stringify(messages, null, 2));
      addToLog(`Got ${messages.length} messages`);
      
      // If we have messages, set the last one's ID
      if (messages && messages.length > 0) {
        setMessageId(messages[messages.length - 1].id);
      }
    } catch (error) {
      addToLog(`Error getting messages: ${error.message}`);
      setApiResponse(`Error: ${error.message}`);
    }
  };

  const testSendMessage = async () => {
    if (!conversationId || !receiverId || !messageContent) {
      addToLog('Error: Missing required fields (conversationId, receiverId, or content)');
      return;
    }

    try {
      addToLog(`Testing sendMessage to ${receiverId} in conversation ${conversationId}...`);
      const message = await sendMessage(conversationId, receiverId, messageContent);
      setApiResponse(JSON.stringify(message, null, 2));
      addToLog('Message sent successfully');
      
      if (message && message.id) {
        setMessageId(message.id);
      }
    } catch (error) {
      addToLog(`Error sending message: ${error.message}`);
      setApiResponse(`Error: ${error.message}`);
    }
  };

  const testMarkMessageAsDelivered = async () => {
    if (!messageId) {
      addToLog('Error: No message ID provided');
      return;
    }

    try {
      addToLog(`Testing markMessageAsDelivered for message ${messageId}...`);
      const result = await markMessageAsDelivered(messageId);
      setApiResponse(JSON.stringify(result, null, 2));
      addToLog('Message marked as delivered');
    } catch (error) {
      addToLog(`Error marking message as delivered: ${error.message}`);
      setApiResponse(`Error: ${error.message}`);
    }
  };

  const testCreateConversation = async () => {
    if (!receiverId) {
      addToLog('Error: No receiver ID provided');
      return;
    }

    try {
      addToLog(`Testing createConversation with user ${receiverId}...`);
      const conversation = await createConversation(receiverId);
      setApiResponse(JSON.stringify(conversation, null, 2));
      addToLog('Conversation created successfully');
      
      if (conversation && conversation.id) {
        setConversationId(conversation.id);
      }
    } catch (error) {
      addToLog(`Error creating conversation: ${error.message}`);
      setApiResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Message API Tester</h1>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Left column - Controls */}
        <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
          <h2>Connection</h2>
          <div style={{ marginBottom: '15px' }}>
            <div>Status: <span style={{ 
              fontWeight: 'bold', 
              color: connectionStatus === 'Connected' ? 'green' : 
                     connectionStatus === 'Reconnecting' ? 'orange' : 'red'
            }}>{connectionStatus}</span></div>
            {connectionId && <div>Connection ID: {connectionId}</div>}
            <button 
              onClick={initializeSignalR} 
              style={{ 
                padding: '8px 15px', 
                marginTop: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Connect to SignalR
            </button>
          </div>

          <h2>Test Parameters</h2>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Current User ID:</label>
            <input 
              type="text" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Receiver ID:</label>
            <input 
              type="text" 
              value={receiverId} 
              onChange={(e) => setReceiverId(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Conversation ID:</label>
            <input 
              type="text" 
              value={conversationId} 
              onChange={(e) => setConversationId(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Message ID:</label>
            <input 
              type="text" 
              value={messageId} 
              onChange={(e) => setMessageId(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Message Content:</label>
            <textarea 
              value={messageContent} 
              onChange={(e) => setMessageContent(e.target.value)}
              rows="3"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          
          <h2>API Tests</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              onClick={testGetConversations}
              style={{ padding: '8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Get Conversations
            </button>
            
            <button 
              onClick={testGetMessages}
              style={{ padding: '8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Get Messages
            </button>
            
            <button 
              onClick={testSendMessage}
              style={{ padding: '8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Send Message
            </button>
            
            <button 
              onClick={testMarkMessageAsDelivered}
              style={{ padding: '8px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Mark As Delivered
            </button>
            
            <button 
              onClick={testCreateConversation}
              style={{ gridColumn: '1 / span 2', padding: '8px', backgroundColor: '#673AB7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Create Conversation
            </button>
          </div>
        </div>
        
        {/* Right column - Response and Logs */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ border: '1px solid #ddd', borderRadius: '5px', flex: 1 }}>
            <div style={{ padding: '10px', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              API Response
            </div>
            <pre style={{ 
              margin: 0, 
              padding: '15px', 
              maxHeight: '300px', 
              overflowY: 'auto',
              backgroundColor: '#f8f8f8',
              fontSize: '14px'
            }}>
              {apiResponse || 'No response yet'}
            </pre>
          </div>
          
          <div style={{ border: '1px solid #ddd', borderRadius: '5px', flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '10px', 
              borderBottom: '1px solid #ddd', 
              backgroundColor: '#f5f5f5', 
              fontWeight: 'bold' 
            }}>
              <span>Event Log</span>
              <button 
                onClick={() => setEventLog([])}
                style={{ 
                  padding: '3px 8px', 
                  backgroundColor: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Clear
              </button>
            </div>
            <div style={{ 
              height: '300px', 
              overflowY: 'auto',
              padding: '10px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              {eventLog.length === 0 ? (
                <div style={{ color: '#666', padding: '10px' }}>No events logged yet</div>
              ) : (
                eventLog.map((log, index) => (
                  <div key={index} style={{ 
                    padding: '5px 0',
                    borderBottom: '1px solid #eee',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f5f5f5' }}>
        <h3>Testing Instructions:</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li>Click <strong>Connect to SignalR</strong> to establish a real-time connection</li>
          <li>Click <strong>Get Conversations</strong> to list your conversations (will auto-fill the first conversation ID)</li>
          <li>Enter a <strong>Receiver ID</strong> (the user you want to message)</li>
          <li>To create a new conversation, enter a recipient ID and click <strong>Create Conversation</strong></li>
          <li>To view messages in a conversation, ensure Conversation ID is filled and click <strong>Get Messages</strong></li>
          <li>To send a message, fill in Conversation ID, Receiver ID, Message Content and click <strong>Send Message</strong></li>
          <li>To mark a message as delivered, fill in Message ID and click <strong>Mark As Delivered</strong></li>
        </ol>
        <p><strong>Note:</strong> Real-time events will appear in the Event Log when they occur</p>
      </div>
    </div>
  );
};

export default MessageApiTester; 