class SocketService {
    constructor(socket) {
      if (!socket) {
        throw new Error("Socket instance required to initialize SocketService.");
      }
      this.socket = socket;
      this.listeners = new Map();
    }
  
    connect() {
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
      }
    }
  
    on(event, callback) {
      if (this.socket) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        this.socket.on(event, callback);
      } else {
        console.warn(`Socket is not available. Can't listen to event: ${event}`);
      }
    }
  
    off(event, callback) {
      if (this.socket && this.listeners.has(event)) {
        const index = this.listeners.get(event).indexOf(callback);
        if (index !== -1) {
          this.listeners.get(event).splice(index, 1);
          this.socket.off(event, callback);
        }
      }
    }
  
    emit(event, data) {
      if (this.socket) {
        this.socket.emit(event, data);
      } else {
        console.warn(`Socket is not available. Can't emit event: ${event}`);
      }
    }
  
    removeAllListeners() {
      if (this.socket) {
        for (const [event, callbacks] of this.listeners.entries()) {
          callbacks.forEach(callback => this.socket.off(event, callback));
        }
        this.listeners.clear();
      }
    }
  }
  
  export default SocketService;
  