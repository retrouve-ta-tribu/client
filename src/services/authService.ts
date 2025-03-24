import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import userService from './userService';

export interface AuthUser {
    access_token: string;
    // Add other user properties
}

export interface AuthProfile {
    id: string;
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

    /**
     * Get the singleton instance of the AuthService
     * @returns The singleton instance of the AuthService
     */
    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
            // Initialize the service when instance is created
        }
        return AuthService.instance;
    }

    /**
     * Set the state of the AuthService
     * @param newState - The new state of the AuthService
     */
    private setState(newState: Partial<AuthState>) {
        this._state = { ...this._state, ...newState };
        this.notifyListeners();
    }

    /**
     * Notify listeners of the AuthService
     */
    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }

    /**
     * Subscribe to the AuthService
     * @param listener - The listener to subscribe to
     * @returns A function to unsubscribe from the AuthService
     */
    public subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Get the state of the AuthService
     * @returns The state of the AuthService
     */
    public get state(): AuthState {
        return this._state;
    }

    /**
     * Initialize the AuthService
     */
    private async init(): Promise<void> {
        try {
            await this.checkStoredUser();
        } catch (error) {
            console.error('Erreur d\'initialisation de l\'authentification:', error);
            this.setState({ error: error as Error });
        } finally {
            this.setState({ isLoading: false });
        }
    }

    /**
     * Check if a user is stored in localStorage
     */
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
                throw new Error('Impossible de valider la session stockée');
            }
        } catch (error) {
            // Clear invalid session data
            console.error('Session stockée invalide:', error);
            localStorage.removeItem('google_user');
            this.setState({
                user: null,
                profile: null,
                error: error as Error
            });
            throw error;
        }
    }

    /**
     * Get the Google login component
     * @returns The Google login component
     */
    public getGoogleLogin() {
        return useGoogleLogin({
            onSuccess: async (response) => {
                await this.login(response);
            },
            onError: (error) => {
                console.error('Échec de la connexion:', error);
                this.setState({ error: new Error(error.error_description || 'Échec de la connexion') });
            }
        });
    }

    /**
     * Login with Google
     * @param googleResponse - The Google response
     */
    public async login(googleResponse: any): Promise<void> {
        try {
            this.setState({ isLoading: true });
            
            localStorage.setItem('google_user', JSON.stringify(googleResponse));
            this.setState({ user: googleResponse });
            
            await this.fetchProfile();
        } catch (error) {
            console.error('Erreur de connexion:', error);
            this.setState({
                error: error as Error,
                user: null,
                profile: null
            });
        } finally {
            this.setState({ isLoading: false });
        }
    }

    /**
     * Log out the user
     */
    public logOut = (): void => {
        googleLogout();
        localStorage.removeItem('google_user');
        this.setState({
            user: null,
            profile: null,
            error: null
        });
    }

    /**
     * Fetch the user profile
     */
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
                throw new Error('Impossible de récupérer le profil utilisateur');
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
                console.error('Impossible de vérifier/créer l\'utilisateur:', error);
                // Continue anyway as the Google auth was successful
            }

            this.setState({ profile: googleProfile });
        } catch (err) {
            console.error('Erreur lors de la récupération du profil:', err);
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

    /**
     * Get the authentication status
     * @returns True if the user is authenticated, false otherwise
     */
    public get isAuthenticated(): boolean {
        return !!this._state.profile;
    }
}

export default AuthService.getInstance();