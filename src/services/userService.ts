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
interface User extends CreateUserDto {
    id: string;
    // Add any other fields returned by the API
}

class UserService {
    private static instance: UserService;
    private baseUrl: string;

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

    public async getUserByGoogleId(googleId: string): Promise<User | null> {
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
                throw new Error(`Failed to create user: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
}

export default UserService.getInstance(); 