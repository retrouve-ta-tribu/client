import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import userService from './userService';

export interface AuthUser {
    access_token: string;
    // Add other user properties
}

export interface AuthProfile {
    googleId: string;
    name: string;
    email: string;
    picture: string;
    access_token: string;
}

export interface AuthState {
    user: AuthUser | null;
    profile: AuthProfile | null;
    error: Error | null;
    isLoading: boolean;
}

type Listener = () => void;

interface GoogleProfile extends AuthProfile {
    id: string;  // Add Google ID
    email: string;  // Add email
}

class AuthService {
    private static instance: AuthService;
    private listeners: Set<Listener> = new Set();
    
    private _state: AuthState = {
        user: null,
        profile: null,
        error: null,
        isLoading: true
    };

    private constructor() {
        // Initialize state will be handled by init()
        this.logOut = this.logOut.bind(this);
        this.init();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
            // Initialize the service when instance is created
        }
        return AuthService.instance;
    }

    private setState(newState: Partial<AuthState>) {
        this._state = { ...this._state, ...newState };
        this.notifyListeners();
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }

    public subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    public get state(): AuthState {
        return this._state;
    }

    private async init(): Promise<void> {
        try {
            await this.checkStoredUser();
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.setState({ error: error as Error });
        } finally {
            this.setState({ isLoading: false });
        }
    }

    private async checkStoredUser(): Promise<void> {
        const storedUser = localStorage.getItem('google_user');
        if (!storedUser) {
            this.setState({ isLoading: false });
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            this.setState({ user: parsedUser });
            
            // Validate token by fetching profile
            await this.fetchProfile();
            
            if (!this._state.profile) {
                // If profile fetch failed, clear invalid data
                throw new Error('Failed to validate stored session');
            }
        } catch (error) {
            // Clear invalid session data
            console.error('Invalid stored session:', error);
            localStorage.removeItem('google_user');
            this.setState({
                user: null,
                profile: null,
                error: error as Error
            });
            throw error;
        }
    }

    public getGoogleLogin() {
        return useGoogleLogin({
            onSuccess: async (response) => {
                await this.login(response);
            },
            onError: (error) => {
                console.error('Login Failed:', error);
                this.setState({ error });
            }
        });
    }

    public async login(googleResponse: any): Promise<void> {
        try {
            this.setState({ isLoading: true });
            
            localStorage.setItem('google_user', JSON.stringify(googleResponse));
            this.setState({ user: googleResponse });
            
            await this.fetchProfile();
        } catch (error) {
            console.error('Login error:', error);
            this.setState({
                error: error as Error,
                user: null,
                profile: null
            });
        } finally {
            this.setState({ isLoading: false });
        }
    }

    public logOut = (): void => {
        googleLogout();
        localStorage.removeItem('google_user');
        this.setState({
            user: null,
            profile: null,
            error: null
        });
    }

    private async fetchProfile(): Promise<void> {
        if (!this._state.user) return;

        try {
            this.setState({ isLoading: true });
            const response = await fetch(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${this._state.user.access_token}`,
                {
                    headers: {
                        Authorization: `Bearer ${this._state.user.access_token}`,
                        Accept: 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const googleProfile = await response.json() as GoogleProfile;
            
            // Check if user exists in our backend
            try {
                const existingUser = await userService.getUserByGoogleId(googleProfile.id);
                
                if (!existingUser) {
                    // Only create if user doesn't exist
                    await userService.createUser({
                        googleId: googleProfile.id,
                        email: googleProfile.email,
                        displayName: googleProfile.name,
                        picture: googleProfile.picture,
                        friends: []
                    });
                }
            } catch (error) {
                console.error('Failed to check/create user in backend:', error);
                // Continue anyway as the Google auth was successful
            }

            this.setState({ profile: googleProfile });
        } catch (err) {
            console.error('Profile fetch error:', err);
            localStorage.removeItem('google_user');
            this.setState({
                user: null,
                profile: null,
                error: err as Error
            });
            throw err;
        } finally {
            this.setState({ isLoading: false });
        }
    }

    public get isAuthenticated(): boolean {
        return !!this._state.profile;
    }
}

export default AuthService.getInstance(); 