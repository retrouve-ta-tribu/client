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

class AuthService {
    private static instance: AuthService;
    
    public user: AuthUser | null = null;
    public profile: AuthProfile | null = null;
    public error: Error | null = null;
    public isLoading: boolean = false;
    public onLoginSuccess: ((profile: AuthProfile) => void) | null = null;

    private constructor() {
        // Check for stored user on initialization
        this.checkStoredUser();
        // Bind methods to preserve this context
        this.logOut = this.logOut.bind(this);
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private checkStoredUser(): void {
        const storedUser = localStorage.getItem('google_user');
        if (storedUser) {
            this.user = JSON.parse(storedUser);
            this.fetchProfile();
        }
    }

    public getGoogleLogin() {
        return useGoogleLogin({
            onSuccess: async (response) => {
                await this.login(response);
                if (this.profile && this.onLoginSuccess) {
                    this.onLoginSuccess(this.profile);
                }
            },
            onError: (error) => {
                console.error('Login Failed:', error);
                this.error = error;
            }
        });
    }

    public async login(googleResponse: any): Promise<void> {
        try {
            this.isLoading = true;
            console.log('Google login success:', googleResponse);
            
            this.user = googleResponse;
            localStorage.setItem('google_user', JSON.stringify(googleResponse));
            
            await this.fetchProfile();
        } catch (error) {
            console.error('Login error:', error);
            this.error = error as Error;
            this.user = null;
            this.profile = null;
        } finally {
            this.isLoading = false;
        }
    }

    // Using arrow function to preserve this context
    public logOut = (): void => {
        console.log('Logging out...');
        googleLogout();
        localStorage.removeItem('google_user');
        this.user = null;
        this.profile = null;
        this.error = null;
    }

    private async fetchProfile(): Promise<void> {
        if (!this.user) return;

        try {
            this.isLoading = true;
            const response = await fetch(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${this.user.access_token}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.user.access_token}`,
                        Accept: 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            this.profile = await response.json();
            console.log('Profile fetched:', this.profile);
        } catch (err) {
            console.error('Profile fetch error:', err);
            localStorage.removeItem('google_user');
            this.user = null;
            this.profile = null;
            this.error = err as Error;
        } finally {
            this.isLoading = false;
        }
    }

    public get isAuthenticated(): boolean {
        return !!this.profile;
    }
}

export default AuthService.getInstance(); 