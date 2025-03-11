import { useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { fetchGoogleUserProfile } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState<Error | null>(null);

    // Check for existing token on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('google_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        }
    }, []);

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
            console.log('Google login success:', codeResponse);
            localStorage.setItem('google_user', JSON.stringify(codeResponse));
            setUser(codeResponse);
        },
        onError: (error) => {
            console.error('Google login error:', error);
            setError(error);
        }
    });

    useEffect(() => {
        if (user) {
            console.log('Fetching user profile...');
            fetchGoogleUserProfile(user)
                .then((data) => {
                    console.log('Profile fetched:', data);
                    setProfile(data);
                })
                .catch((err) => {
                    // If we get an auth error, clear the stored token
                    localStorage.removeItem('google_user');
                    setUser(null);
                    setError(err);
                });
        }
    }, [user]);

    const logOut = () => {
        console.log('Logging out...');
        googleLogout();
        localStorage.removeItem('google_user');
        setUser(null);
        setProfile(null);
        setError(null);
    };

    return {
        user,
        profile,
        error,
        login,
        logOut,
        isLoading: !!user && !profile
    };
}; 