import { googleLogout, useGoogleLogin } from '@react-oauth/google';

export interface AuthUser {
    access_token: string;
    // Add other user properties
}

export interface AuthProfile {
    picture: string;
    name: string;
    email: string;
    // Add other profile properties
}

export interface AuthState {
    user: AuthUser | null;
    profile: AuthProfile | null;
    error: Error | null;
    isLoading: boolean;
}

type Listener = () => void;

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
            console.log('Google login success:', googleResponse);
            
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
        console.log('Logging out...');
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

            const profile = await response.json();
            this.setState({ profile });
            console.log('Profile fetched:', profile);
        } catch (err) {
            console.error('Profile fetch error:', err);
            localStorage.removeItem('google_user');
            this.setState({
                user: null,
                profile: null,
                error: err as Error
            });
            throw err; // Re-throw to handle in calling functions
        } finally {
            this.setState({ isLoading: false });
        }
    }

    public get isAuthenticated(): boolean {
        return !!this._state.profile;
    }
}

export default AuthService.getInstance(); 