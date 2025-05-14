import * as signalR from '@microsoft/signalr';

let connection = null;
let connectionPromise = null;

const ensureConnection = async () => {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = startSignalRConnection();
  return connectionPromise;
};

export const startSignalRConnection = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    if (connection?.state === signalR.HubConnectionState.Connected) {
      return true;
    }

    // Stop existing connection if any
    if (connection) {
      try {
        await connection.stop();
      } catch (err) {
        console.warn('Error stopping existing connection:', err);
      }
    }

    connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/chatHub', {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, null])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Handle connection events
    connection.onclose((error) => {
      console.log('SignalR Connection closed:', error);
      connectionPromise = null;
    });

    connection.onreconnecting((error) => {
      console.log('SignalR Reconnecting:', error);
    });

    connection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected:', connectionId);
    });

    // Handle received messages
    connection.on('ReceiveMessage', (message) => {
      console.log('Received message:', message);
      if (window.messageReceived) {
        window.messageReceived(message);
      }
    });

    // Handle message delivery confirmations
    connection.on('MessageDelivered', (messageId) => {
      console.log('Message delivered:', messageId);
      if (window.messageDelivered) {
        window.messageDelivered(messageId);
      }
    });

    await connection.start();
    console.log('SignalR Connected');
    connectionPromise = null;
    return true;
  } catch (err) {
    console.error('SignalR Connection Error:', err);
    connection = null;
    connectionPromise = null;
    return false;
  }
};

export const stopSignalRConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      connection = null;
      connectionPromise = null;
      console.log('SignalR Disconnected');
    } catch (err) {
      console.error('Error stopping SignalR:', err);
    }
  }
};

export const sendMessage = async (conversationId, receiverId, content) => {
  try {
    const conn = await ensureConnection();
    if (!conn) {
      throw new Error('Failed to establish SignalR connection');
    }

    await connection.invoke('SendMessage', conversationId, receiverId, content);
    return true;
  } catch (err) {
    console.error('Error sending message via SignalR:', err);
    // Try to reconnect on failure
    await startSignalRConnection();
    return false;
  }
};

export const markMessageAsDelivered = async (messageId) => {
  try {
    const conn = await ensureConnection();
    if (!conn) {
      throw new Error('Failed to establish SignalR connection');
    }

    await connection.invoke('MarkMessageAsDelivered', messageId);
    return true;
  } catch (err) {
    console.error('Error marking message as delivered:', err);
    // Try to reconnect on failure
    await startSignalRConnection();
    return false;
  }
};

export const getConnectionState = () => {
  return connection ? connection.state : 'disconnected';
}; 