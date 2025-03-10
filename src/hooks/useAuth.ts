import { useState, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { fetchGoogleUserProfile } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState<Error | null>(null);

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => setError(error)
    });

    useEffect(() => {
        if (user) {
            fetchGoogleUserProfile(user)
                .then(setProfile)
                .catch(setError);
        }
    }, [user]);

    const logOut = () => {
        googleLogout();
        setUser(null);
        setProfile(null);
        setError(null);
    };

    return {
        user,
        profile,
        error,
        login,
        logOut
    };
}; 