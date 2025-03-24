import { io, Socket } from 'socket.io-client';
import { Event } from 'sprunk-engine'

export enum RoomEvents {
  Join = "Join",
  Leave = "Leave",
  Broadcast = "Broadcast"
}

/**
 * SocketService is a singleton class that manages the socket connection and provides methods to join and leave rooms, broadcast messages, and listen for events.
 */
export class SocketService {
  public onConnected: Event<void> = new Event<void>();
  /*
    * Event triggered when the socket is disconnected.
   */
  public onDisconnected: Event<boolean> = new Event<boolean>();
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private connected: boolean = false;
  private serverUrl: string;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the socket server
   * @returns Promise that resolves when connected
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      this.socket = io(this.serverUrl, {
        reconnectionDelayMax: 10000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server with ID:', this.socket?.id);
        this.connected = true;
        this.onConnected.emit();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
        //Only need to reconnect if socket.io will not do it automatically
        this.onDisconnected.emit(!this.socket!.active);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        this.connected = false;
        this.onDisconnected.emit(!this.socket!.active);
      });

      // Set up listener for broadcast events
      this.socket.on(RoomEvents.Broadcast, (data) => {
        this.notifyListeners(RoomEvents.Broadcast, data);
      });
    });
  }

  /**
   * Disconnect from the socket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      //This is intentional, as the socket is disconnected. We do not need to reconnect.
      this.onDisconnected.emit(false);
    }
  }

  /**
   * Join a room
   * @param roomName The name of the room to join
   */
  joinRoom(roomName: string): void {
    if (!this.socket || !this.connected) {
      console.log("Socket not connected");
    }
    this.socket!.emit(RoomEvents.Join, roomName);
  }

  /**
   * Leave a room
   * @param roomName The name of the room to leave
   */
  leaveRoom(roomName: string): void {
    if (!this.socket || !this.connected) {
      console.log("Socket not connected");
    }
    this.socket!.emit(RoomEvents.Leave, roomName);
  }

  /**
   * Broadcast a message to a room
   * @param roomName The name of the room to broadcast to
   * @param content The content to broadcast
   */
  broadcast<T>(roomName: string, content: T): void {
    if (!this.socket || !this.connected) {
      console.log("Socket not connected");
    }
    this.socket!.emit(RoomEvents.Broadcast, {
      room: roomName,
      content
    });
  }

  /**
   * Add a listener for a specific event
   * @param event The event to listen for
   * @param callback The callback to call when the event is received
   */
  addListener<T>(event: RoomEvents, callback: (data: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as (data: unknown) => void);
  }

  /**
   * Remove a listener for a specific event
   * @param event The event to stop listening for
   * @param callback The callback to remove
   */
  removeListener<T>(event: RoomEvents, callback: (data: T) => void): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.delete(callback as (data: unknown) => void);
    }
  }

  /**
   * Notify all listeners of an event
   * @param event The event that occurred
   * @param data The data associated with the event
   */
  private notifyListeners<T>(event: string, data: T): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => {
        callback(data);
      });
    }
  }

  /**
   * Get the socket ID
   * @returns The socket ID or null if not connected
   */
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  /**
   * Check if the socket is connected
   * @returns True if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connected;
  }
}

// Create a singleton instance
const socketService = new SocketService(import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001');
export default socketService; 