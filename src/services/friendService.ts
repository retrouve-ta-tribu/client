import authService from './authService';

// Mock data for friends
const mockFriends = [
  { id: '1', firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@example.com', picture: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', firstName: 'Jean', lastName: 'Martin', email: 'jean.martin@example.com', picture: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '3', firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@example.com', picture: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '4', firstName: 'Thomas', lastName: 'Petit', email: 'thomas.petit@example.com', picture: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: '5', firstName: 'Camille', lastName: 'Dubois', email: 'camille.dubois@example.com', picture: 'https://randomuser.me/api/portraits/women/3.jpg' },
];

export interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
}

class FriendService {
  private static instance: FriendService;
  private baseUrl: string;

  private constructor() {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('VITE_API_URL environment variable is not defined');
    }
    this.baseUrl = `${apiUrl}/api`;
  }

  public static getInstance(): FriendService {
    if (!FriendService.instance) {
      FriendService.instance = new FriendService();
    }
    return FriendService.instance;
  }

  public getFriends(): Friend[] {
    return mockFriends;
  }

  public getFriendById(id: string): Friend | undefined {
    return mockFriends.find(friend => friend.id === id);
  }

  public async addFriend(email: string): Promise<void> {
    // Get the current user's Google ID from the auth service
    const googleId = authService.state.profile?.id;
    
    if (!googleId) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/${googleId}/friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add friend');
      }

      return response.json();
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  }

  public async removeFriend(friendId: string): Promise<void> {
    // Get the current user's Google ID from the auth service
    const googleId = authService.state.profile?.id;
    
    if (!googleId) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/${googleId}/friends`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove friend');
      }

      return response.json();
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }
}

export default FriendService.getInstance(); 