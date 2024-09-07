// WebSocketInstance.js
import { io } from 'socket.io-client';

class SocketIOInstance {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.roomId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userId, roomId) {
    console.log('UserID: ', userId)
    console.log('RoomID: ', roomId)
    this.userId = userId;
    this.roomId = roomId;
    const url = 'http://localhost:3000';
    console.log('Сокет: ',!this.socket)
    if (!this.socket) {
      console.log('Attempting to connect to Socket.IO...');

      this.socket = io(url, { withCredentials: true });

      this.socket.on('connect', () => {
        console.log('Socket.IO connected:', this.socket.id);
        this.socket.emit('joinRoom', { userId, roomId });
        this.reconnectAttempts = 0; 
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        this.handleReconnect();
      });

      this.socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
      });

      // Additional Event Handlers
      this.socket.on('userJoined', (data) => {
        console.log('User joined:', data.users);
        this.userListCallback && this.userListCallback(data.users);
      });

      this.socket.on('cardAdded', (data) => {
        console.log('Card added:', data.card.id);
        this.cardCallback && this.cardCallback(data.card);
      });

      this.socket.on('phaseStarted', (data) => {
        console.log('Phase started:', data.phase);
        this.phaseCallback && this.phaseCallback(data.phase);
      });

      this.socket.on('columnsUpdated', (data) => {
        console.log('Columns updated');
        this.columnCallback && this.columnCallback(data.columns);
      });
      this.socket.on('notification', (data) => {
        console.log(data.message);
      });
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
      setTimeout(() => this.connect(this.userId, this.roomId), 2000);
    } else {
      console.error('Max reconnect attempts reached. Unable to reconnect.');
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.connected) {
      console.log('Sending message:', message.type);
      this.socket.emit(message.type, message);
    } else {
      console.warn('Socket.IO is not connected. Message not sent:', message);
    }
  }

  startPhase(phase) {
    this.sendMessage({ type: 'startPhase', phase });
  }

  addCallbacks(userListCallback, cardCallback, phaseCallback, columnCallback) {
    this.userListCallback = userListCallback;
    this.cardCallback = cardCallback;
    this.phaseCallback = phaseCallback;
    this.columnCallback = columnCallback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket.IO disconnected manually');
    }
  }
}

const SocketIOInstanceSingleton = new SocketIOInstance();
export default SocketIOInstanceSingleton;
