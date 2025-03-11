import { useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import authService from '../services/authService';

interface AuthUser {
    access_token: string;
    // Add other user properties
}

interface AuthProfile {
    picture: string;
    name: string;
    email: string;
    // Add other profile properties
}

class Auth {
    private setUser: (user: AuthUser | null) => void;
    private setProfile: (profile: AuthProfile | null) => void;
    private setError: (error: Error | null) => void;

    constructor(
        setUser: (user: AuthUser | null) => void,
        setProfile: (profile: AuthProfile | null) => void,
        setError: (error: Error | null) => void
    ) {
        this.setUser = setUser;
        this.setProfile = setProfile;
        this.setError = setError;
    }

    public login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            console.log('Google login success:', codeResponse);
            localStorage.setItem('google_user', JSON.stringify(codeResponse));
            this.setUser(codeResponse);
        },
        onError: (error) => {
            console.error('Google login error:', error);
            this.setError(error);
        }
    });

    public logOut = () => {
        console.log('Logging out...');
        googleLogout();
        localStorage.removeItem('google_user');
        this.setUser(null);
        this.setProfile(null);
        this.setError(null);
    };

    public async checkStoredUser() {
        const storedUser = localStorage.getItem('google_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            this.setUser(parsedUser);
        }
    }

    public async fetchProfile(user: AuthUser) {
        if (!user) return;

        try {
            console.log('Fetching user profile...');
            const data = await authService.login(user);
            console.log('Profile fetched:', data);
            this.setProfile(data);
        } catch (err) {
            console.error('Profile fetch error:', err);
            localStorage.removeItem('google_user');
            this.setUser(null);
            this.setError(err);
        }
    }
}

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const auth = new Auth(setUser, setProfile, setError);

    // Check for existing token on mount
    useEffect(() => {
        auth.checkStoredUser();
    }, []);

    // Fetch profile when user changes
    useEffect(() => {
        if (user) {
            auth.fetchProfile(user);
        }
    }, [user]);

    return {
        user,
        profile,
        error,
        login: auth.login,
        logOut: auth.logOut,
        isLoading: !!user && !profile
    };
};

export type { AuthUser, AuthProfile }; 