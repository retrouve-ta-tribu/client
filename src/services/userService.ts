interface CreateUserDto {
    googleId: string;
    email: string;
    displayName: string;
    picture: string;
    friends: string[];
}

interface User extends CreateUserDto {
    id: string;
    // Add any other fields returned by the API
}

class UserService {
    private static instance: UserService;
    private baseUrl: string = 'http://localhost:8000/api';

    private constructor() {}

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