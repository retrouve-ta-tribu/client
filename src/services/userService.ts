import authService from './authService';

/**
 * Data required to create a new user
 * @property googleId - Google account unique identifier
 * @property email - User's email address
 * @property displayName - User's display name
 * @property picture - URL to user's profile picture
 * @property friends - Array of friend IDs
 */
interface CreateUserDto {
    googleId: string;
    email: string;
    displayName: string;
    picture: string;
    friends: string[];
}

/**
 * Represents a user's complete information in the system
 * @property id - Unique identifier in our system
 * @extends CreateUserDto - Includes all properties from CreateUserDto
 */
export interface User extends CreateUserDto {
    id: string;
    firstName?: string;
    lastName?: string;
}

class UserService {
    private static instance: UserService;
    private baseUrl: string;
    private allUsers: User[] = [];
    private lastFetchTime: number = 0;
    private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    private constructor() {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) {
            throw new Error('VITE_API_URL environment variable is not defined');
        }
        this.baseUrl = `${apiUrl}/api`;
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    /**
     * Fetches a user by their Google ID
     * @param googleId - The Google ID of the user to fetch
     * @returns A promise that resolves to the user object or null if the user is not found
     */
    public async getUserByGoogleId(googleId: string): Promise<User | null> {
        try {
            const response = await fetch(`${this.baseUrl}/users/${googleId}`);
            
            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error(`Impossible de récupérer l'utilisateur: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Creates a new user in the system
     * @param userData - The data required to create a new user
     * @returns A promise that resolves to the created user object
     */
    public async createUser(userData: CreateUserDto): Promise<User> {
        try {
            const response = await fetch(`${this.baseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error(`Impossible de créer l'utilisateur: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            throw error;
        }
    }

    /**
     * Fetches the friends of the current user
     * @returns A promise that resolves to an array of User objects
     */
    public async getFriends(): Promise<User[]> {
        const googleId = authService.state.profile?.id!;

        try {
            const currentUser = await this.getUserByGoogleId(googleId);
            
            if (!currentUser || !currentUser.friends || currentUser.friends.length === 0) {
                return [];
            }

            const friendsPromises = currentUser.friends.map(async (friendId) => {
                try {
                    const friendData = await this.getUserByGoogleId(friendId);
                    if (!friendData) return null;
                    
                    return {
                        ...friendData,
                        picture: friendData.picture || 'https://via.placeholder.com/150',
                    };
                } catch (error) {
                    console.error(`Error fetching friend ${friendId}:`, error);
                    return null;
                }
            });

            const friendsResults = await Promise.all(friendsPromises);
            return friendsResults.filter((friend): friend is User => friend !== null);
            
        } catch (error) {
            console.error('Error fetching friends:', error);
            return [];
        }
    }

    /**
     * Adds a friend to the current user's friends list
     * @param email - The email address of the friend to add
     * @returns A promise that resolves when the friend is added
     */
    public async addFriend(email: string): Promise<void> {
        const googleId = authService.state.profile?.id;
        
        if (!googleId) {
            throw new Error('Utilisateur non authentifié');
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
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'un ami:', error);
            throw error;
        }
    }

    /**
     * Removes a friend from the current user's friends list
     * @param friendId - The ID of the friend to remove
     * @returns A promise that resolves when the friend is removed
     */
    public async removeFriend(friendId: string): Promise<void> {
        const googleId = authService.state.profile?.id;
        
        if (!googleId) {
            throw new Error('Utilisateur non authentifié');
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
            console.error('Erreur lors de la suppression d\'un ami:', error);
            throw error;
        }
    }

    /**
     * Fetches all users from the system
     * @returns A promise that resolves to an array of User objects
     */
    public async getAllUsers(): Promise<User[]> {
        const now = Date.now();
        if (this.allUsers.length > 0 && now - this.lastFetchTime < UserService.CACHE_DURATION) {
            return this.allUsers;
        }

        try {
            const response = await fetch(`${this.baseUrl}/users`);
            
            if (!response.ok) {
                throw new Error(`Impossible de récupérer les utilisateurs: ${response.statusText}`);
            }

            const users = await response.json();
            const currentUserId = authService.state.profile?.id;
            
            this.allUsers = users
                .filter((user: User) => user.googleId !== currentUserId)
                .map((user: User) => ({
                    ...user,
                    picture: user.picture || 'https://via.placeholder.com/150',
                }));
            this.lastFetchTime = now;
            
            return this.allUsers;
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw error;
        }
    }

    /**
     * Searches for users based on a query
     * @param query - The search query
     * @returns An array of User objects that match the query
     */
    public searchUsers(query: string): User[] {
        const lowerQuery = query.toLowerCase();
        const currentUserId = authService.state.profile?.id;
        
        return this.allUsers.filter(user => {
            if (user.googleId === currentUserId) {
                return false;
            }
            
            const displayName = user.displayName?.toLowerCase() || '';
            const email = user.email.toLowerCase();
            return displayName.includes(lowerQuery) || email.includes(lowerQuery);
        });
    }
}

export default UserService.getInstance();