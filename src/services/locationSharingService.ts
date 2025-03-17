import socketService, { RoomEvents } from './socketService';
import geolocationService from './geolocationService';
import {UserPosition, ChatMessage} from "./types.ts";

export enum LocationEvents {
  LocationUpdate = 'LocationUpdate',
  ChatMessage = 'ChatMessage'
}

interface IncomingPositionBroadcastData {
  type: LocationEvents;
  position: UserPosition;
}

interface IncomingChatBroadcastData {
  type: LocationEvents;
  message: ChatMessage;
}

type BroadcastData = IncomingPositionBroadcastData | IncomingChatBroadcastData;

/**
 * A real time location sharing service using socketService to transmit geolocationService data
 */
class LocationSharingService {
  private groupId: string | null = null;
  private userId: string | null = null;
  private intervalId: number | null = null;
  private positions: Map<string, UserPosition> = new Map();
  private messages: ChatMessage[] = [];
  private locationUpdateListeners: Set<(positions: UserPosition[]) => void> = new Set();
  private chatMessageListeners: Set<(messages: ChatMessage[]) => void> = new Set();
  
  /**
   * Check if socket is connected
   * @returns True if socket is connected, false otherwise
   */
  isSocketConnected(): boolean {
    return socketService.isConnected();
  }
  
  /**
   * Connect to socket server
   * @returns Promise that resolves when connected
   */
  async connectSocket(): Promise<void> {
    return socketService.connect();
  }
  
  /**
   * Start sharing location in a group
   * @param groupId The ID of the group to share location in
   * @param userId The ID of the user sharing their location
   */
  async startSharing(groupId: string, userId: string): Promise<void> {
    // Stop any existing sharing
    this.stopSharing();
    
    this.groupId = groupId;
    this.userId = userId;
    
    // Connect to socket if not already connected
    if (!socketService.isConnected()) {
      await socketService.connect();
    }
    
    // Join the room for this group
    socketService.joinRoom(groupId);
    
    // Set up listener for location updates and chat messages from other users
    socketService.addListener<BroadcastData>(RoomEvents.Broadcast, this.handleBroadcast);
    
    // Start tracking location and broadcasting updates
    await geolocationService.startTracking(userId, (position) => {
      this.broadcastLocation(position);
    });
    
    // Set up interval to broadcast location periodically
    this.intervalId = window.setInterval(() => {
      const position = geolocationService.getLastPosition();
      if (position) {
        this.broadcastLocation(position);
      }
    }, 1000);
  }
  
  /**
   * Stop sharing location
   */
  stopSharing(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    geolocationService.stopTracking();
    
    if (this.groupId) {
      socketService.removeListener(RoomEvents.Broadcast, this.handleBroadcast);
      socketService.leaveRoom(this.groupId);
      this.groupId = null;
    }
    
    this.userId = null;
    this.positions.clear();
    this.messages = [];
    this.notifyLocationListeners();
    this.notifyChatListeners();
  }
  
  /**
   * Handle location update from another user
   * @param data The location message
   */
  private handleBroadcast = (data: BroadcastData): void => {
    if (data.type === LocationEvents.LocationUpdate) {
      const position = (data as IncomingPositionBroadcastData).position;
      this.positions.set(position.userId, position);

      // Clean up old positions (older than 60 seconds)
      const now = Date.now();
      for (const [userId, pos] of this.positions.entries()) {
        if (now - pos.timestamp > 60000) {
          this.positions.delete(userId);
        }
      }

      this.notifyLocationListeners();
    } else if (data.type === LocationEvents.ChatMessage) {
      const message = (data as IncomingChatBroadcastData).message;
      this.messages.push(message);
      this.notifyChatListeners();
    }
  };
  
  /**
   * Broadcast location to the group
   * @param position The position to broadcast
   */
  private broadcastLocation(position: UserPosition): void {
    if (!this.groupId || !this.userId) {
      return;
    }

    const message = {
      type: LocationEvents.LocationUpdate,
      position,
    };
    
    socketService.broadcast(this.groupId, message);
  }
  
  sendMessage(content: string, userName?: string, userPicture?: string): void {
    if (!this.groupId || !this.userId) return;

    const message: ChatMessage = {
      userId: this.userId,
      content,
      timestamp: Date.now(),
      userName,
      userPicture
    };

    const broadcastData = {
      type: LocationEvents.ChatMessage,
      message
    };

    socketService.broadcast(this.groupId, broadcastData);
    
    this.notifyChatListeners();
  }
  
  /**
   * Add a listener for location updates
   * @param callback The callback to call when locations are updated
   */
  addLocationUpdateListener(callback: (positions: UserPosition[]) => void): void {
    this.locationUpdateListeners.add(callback);
  }
  
  /**
   * Remove a listener for location updates
   * @param callback The callback to remove
   */
  removeLocationUpdateListener(callback: (positions: UserPosition[]) => void): void {
    this.locationUpdateListeners.delete(callback);
  }
  
  addChatMessageListener(callback: (messages: ChatMessage[]) => void): void {
    this.chatMessageListeners.add(callback);
    callback(this.messages); // Send current messages immediately
  }
  
  removeChatMessageListener(callback: (messages: ChatMessage[]) => void): void {
    this.chatMessageListeners.delete(callback);
  }
  
  /**
   * Notify all listeners of location updates
   */
  private notifyLocationListeners(): void {
    const positions = Array.from(this.positions.values());
    this.locationUpdateListeners.forEach(callback => {
      callback(positions);
    });
  }
  
  private notifyChatListeners(): void {
    this.chatMessageListeners.forEach(callback => {
      callback(this.messages);
    });
  }
  
  /**
   * Get all current positions
   * @returns Array of all current positions
   */
  getAllPositions(): UserPosition[] {
    return Array.from(this.positions.values());
  }

  getAllMessages(): ChatMessage[] {
    return [...this.messages];
  }
}

// Create a singleton instance
const locationSharingService = new LocationSharingService();
export default locationSharingService; 