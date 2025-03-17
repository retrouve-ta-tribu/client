import socketService, { RoomEvents } from './socketService';
import { ChatMessage } from "./types";

export enum ChatEvents {
    Message = 'ChatMessage',
    Typing = 'UserTyping',
    StoppedTyping = 'UserStoppedTyping'
}

interface IncomingChatBroadcastData {
    type: ChatEvents;
    message?: ChatMessage;
    typingData?: {
        userId: string;
        userName: string;
    };
}

class MessageChatService {
    private static instance: MessageChatService;
    private groupId: string | null = null;
    private userId: string | null = null;
    private messages: ChatMessage[] = [];
    private messageListeners: Set<(messages: ChatMessage[]) => void> = new Set();
    private typingUsers: Map<string, string> = new Map(); // userId -> userName
    private typingListeners: Set<(typingUsers: string[]) => void> = new Set();

    private constructor() {}

    public static getInstance(): MessageChatService {
        if (!MessageChatService.instance) {
            MessageChatService.instance = new MessageChatService();
        }
        return MessageChatService.instance;
    }

    isSocketConnected(): boolean {
        return socketService.isConnected();
    }

    async connectSocket(): Promise<void> {
        return socketService.connect();
    }

    async joinChat(groupId: string, userId: string): Promise<void> {
        // Leave any existing chat
        this.leaveChat();
        
        this.groupId = groupId;
        this.userId = userId;
        
        // Connect to socket if not already connected
        if (!socketService.isConnected()) {
            await socketService.connect();
        }
        
        // Join the room for this group
        socketService.joinRoom(groupId);
        
        // Set up listener for chat messages
        socketService.addListener<IncomingChatBroadcastData>(RoomEvents.Broadcast, this.handleMessage);
    }

    leaveChat(): void {
        if (this.groupId) {
            this.setTyping(false);            
            socketService.removeListener(RoomEvents.Broadcast, this.handleMessage);
            socketService.leaveRoom(this.groupId);
            this.groupId = null;
        }
        
        this.userId = null;
        this.messages = [];
        this.typingUsers.clear();
        this.notifyListeners();
        this.notifyTypingListeners();
    }

    private handleMessage = (data: IncomingChatBroadcastData): void => {
        if (data.type === ChatEvents.Message) {
            this.messages.push(data.message!);
            this.notifyListeners();
        } else if (data.type === ChatEvents.Typing && data.typingData) {
            this.typingUsers.set(data.typingData.userId, data.typingData.userName);
            this.notifyTypingListeners();
        } else if (data.type === ChatEvents.StoppedTyping && data.typingData) {
            this.typingUsers.delete(data.typingData.userId);
            this.notifyTypingListeners();
        }
    };

    sendMessage(content: string, userName?: string): void {
        if (!this.groupId || !this.userId || !content.trim()) return;

        const message: ChatMessage = {
            userId: this.userId,
            content: content.trim(),
            timestamp: Date.now(),
            userName,
        };

        const broadcastData = {
            type: ChatEvents.Message,
            message
        };

        socketService.broadcast(this.groupId, broadcastData);
        
            this.notifyListeners();
    }

    addMessageListener(callback: (messages: ChatMessage[]) => void): void {
        this.messageListeners.add(callback);
        callback(this.messages); // Send current messages immediately
    }

    removeMessageListener(callback: (messages: ChatMessage[]) => void): void {
        this.messageListeners.delete(callback);
    }

    private notifyListeners(): void {
        this.messageListeners.forEach(callback => {
            callback(this.messages);
        });
    }

    getAllMessages(): ChatMessage[] {
        return [...this.messages];
    }

    setTyping(isTyping: boolean, userName?: string): void {
        if (!this.groupId || !this.userId) return;

        const broadcastData = {
            type: isTyping ? ChatEvents.Typing : ChatEvents.StoppedTyping,
            typingData: {
                userId: this.userId,
                userName: userName || 'Unknown'
            }
        };

        socketService.broadcast(this.groupId, broadcastData);
    }

    addTypingListener(callback: (typingUsers: string[]) => void): void {
        this.typingListeners.add(callback);
        callback(Array.from(this.typingUsers.values()));
    }

    removeTypingListener(callback: (typingUsers: string[]) => void): void {
        this.typingListeners.delete(callback);
    }

    private notifyTypingListeners(): void {
        const typingUserNames = Array.from(this.typingUsers.values());
        this.typingListeners.forEach(callback => {
            callback(typingUserNames);
        });
    }
}

export default MessageChatService.getInstance(); 