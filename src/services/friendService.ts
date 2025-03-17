import authService from './authService';

/**
 * Represents a friend's information in the system
 * @property id - The unique identifier of the friend
 * @property firstName - The first name of the friend
 * @property lastName - The last name of the friend
 * @property displayName - The display name of the friend
 * @property email - The email address of the friend
 * @property picture - The URL to the friend's profile picture
 * @property googleId - The Google ID of the friend
 */
export interface Friend {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email: string;
  picture: string;
  googleId?: string;
}

/**
 * Response structure for user data from the API
 * @property id - The unique identifier of the user
 * @property googleId - The Google ID of the user
 * @property email - The email address of the user
 * @property displayName - The display name of the user
 * @property picture - The URL to the user's profile picture
 * @property friends - The friends of the user (ids)
 */
interface UserResponse {
  id: string;
  googleId: string;
  email: string;
  displayName: string;
  picture: string;
  friends: string[]; // Array of friend IDs
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

  public async getUserById(googleId: string): Promise<UserResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${googleId}`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  public async getFriends(): Promise<Friend[]> {
    // Get the current user's Google ID from the auth service
    const googleId = authService.state.profile?.id;

    try {
      // Get the current user with their friends list
      const currentUser = await this.getUserById(googleId);
      
      if (!currentUser || !currentUser.friends || currentUser.friends.length === 0) {
        return [];
      }

      // Fetch details for each friend
      const friendsPromises = currentUser.friends.map(async (friendId) => {
        try {
          const friendData = await this.getUserById(friendId);
          if (!friendData) return null;
          
          return {
            id: friendData.id,
            googleId: friendData.googleId,
            displayName: friendData.displayName,
            email: friendData.email,
            picture: friendData.picture || 'https://via.placeholder.com/150',
          };
        } catch (error) {
          console.error(`Error fetching friend ${friendId}:`, error);
          return null;
        }
      });

      const friendsResults = await Promise.all(friendsPromises);
      // Filter out any null results (failed fetches)
      return friendsResults.filter(friend => friend !== null) as Friend[];
      
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
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
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to remove friend: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }
}

export default FriendService.getInstance(); 