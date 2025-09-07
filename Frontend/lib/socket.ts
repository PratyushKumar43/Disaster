import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://your-backend-domain.com' 
        : 'http://localhost:5001');

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000
      // Auth removed - sockets now work without authentication
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Authentication removed - sockets now work without auth
    });

    // Auth-related socket events removed

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.scheduleReconnect();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after', this.maxReconnectAttempts, 'attempts');
    });

    // Real-time event listeners
    this.setupInventoryListeners();
    this.setupTransactionListeners();
    this.setupNotificationListeners();
  }

  private setupInventoryListeners(): void {
    if (!this.socket) return;

    this.socket.on('inventoryCreated', (data) => {
      console.log('New inventory item created:', data);
      this.notifySubscribers('inventoryCreated', data);
    });

    this.socket.on('inventoryUpdated', (data) => {
      console.log('Inventory item updated:', data);
      this.notifySubscribers('inventoryUpdated', data);
    });

    this.socket.on('inventoryDeleted', (data) => {
      console.log('Inventory item deleted:', data);
      this.notifySubscribers('inventoryDeleted', data);
    });

    this.socket.on('lowStockAlert', (data) => {
      console.log('Low stock alert:', data);
      this.notifySubscribers('lowStockAlert', data);
    });

    this.socket.on('criticalStockAlert', (data) => {
      console.log('Critical stock alert:', data);
      this.notifySubscribers('criticalStockAlert', data);
    });

    this.socket.on('expiringItemsAlert', (data) => {
      console.log('Expiring items alert:', data);
      this.notifySubscribers('expiringItemsAlert', data);
    });
  }

  private setupTransactionListeners(): void {
    if (!this.socket) return;

    this.socket.on('transactionCreated', (data) => {
      console.log('New transaction created:', data);
      this.notifySubscribers('transactionCreated', data);
    });

    this.socket.on('transactionUpdated', (data) => {
      console.log('Transaction updated:', data);
      this.notifySubscribers('transactionUpdated', data);
    });

    this.socket.on('transactionStatusChanged', (data) => {
      console.log('Transaction status changed:', data);
      this.notifySubscribers('transactionStatusChanged', data);
    });

    this.socket.on('transactionApprovalRequired', (data) => {
      console.log('Transaction approval required:', data);
      this.notifySubscribers('transactionApprovalRequired', data);
    });
  }

  private setupNotificationListeners(): void {
    if (!this.socket) return;

    this.socket.on('notification', (data) => {
      console.log('New notification:', data);
      this.notifySubscribers('notification', data);
    });

    this.socket.on('emergencyAlert', (data) => {
      console.log('Emergency alert:', data);
      this.notifySubscribers('emergencyAlert', data);
    });

    this.socket.on('systemMaintenance', (data) => {
      console.log('System maintenance notice:', data);
      this.notifySubscribers('systemMaintenance', data);
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  // Event subscription management
  private subscribers: Map<string, Set<Function>> = new Map();

  subscribe(eventName: string, callback: Function): () => void {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Set());
    }
    
    this.subscribers.get(eventName)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventSubscribers = this.subscribers.get(eventName);
      if (eventSubscribers) {
        eventSubscribers.delete(callback);
        if (eventSubscribers.size === 0) {
          this.subscribers.delete(eventName);
        }
      }
    };
  }

  private notifySubscribers(eventName: string, data: any): void {
    const eventSubscribers = this.subscribers.get(eventName);
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event subscriber:', error);
        }
      });
    }
  }

  // Public methods
  joinDepartment(departmentId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('joinDepartment', departmentId);
      console.log('Joined department room:', departmentId);
    }
  }

  leaveDepartment(departmentId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leaveDepartment', departmentId);
      console.log('Left department room:', departmentId);
    }
  }

  subscribeToInventory(filters?: any): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribeToInventory', filters);
      console.log('Subscribed to inventory updates with filters:', filters);
    }
  }

  subscribeToTransactions(filters?: any): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribeToTransactions', filters);
      console.log('Subscribed to transaction updates with filters:', filters);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected manually');
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Utility methods for real-time updates
  emitInventoryUpdate(data: any): void {
    if (this.socket?.connected) {
      this.socket.emit('inventoryUpdate', data);
    }
  }

  emitTransactionUpdate(data: any): void {
    if (this.socket?.connected) {
      this.socket.emit('transactionUpdate', data);
    }
  }

  requestRealTimeData(type: 'inventory' | 'transactions' | 'departments', filters?: any): void {
    if (this.socket?.connected) {
      this.socket.emit('requestRealTimeData', { type, filters });
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

// React hook for easy socket usage
export const useSocket = () => {
  const connect = () => socketService.connect();
  const disconnect = () => socketService.disconnect();
  const subscribe = (eventName: string, callback: Function) => socketService.subscribe(eventName, callback);
  const isConnected = () => socketService.isSocketConnected();
  const joinDepartment = (departmentId: string) => socketService.joinDepartment(departmentId);
  const leaveDepartment = (departmentId: string) => socketService.leaveDepartment(departmentId);
  const subscribeToInventory = (filters?: any) => socketService.subscribeToInventory(filters);
  const subscribeToTransactions = (filters?: any) => socketService.subscribeToTransactions(filters);

  return {
    connect,
    disconnect,
    subscribe,
    isConnected,
    joinDepartment,
    leaveDepartment,
    subscribeToInventory,
    subscribeToTransactions,
    socket: socketService.getSocket()
  };
};

export default socketService;
