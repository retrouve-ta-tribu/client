import { useState, useEffect } from 'react';
import authService, { AuthState } from '../services/authService';

export function useAuthState(): AuthState {
    const [state, setState] = useState<AuthState>(authService.state);

    useEffect(() => {
        return authService.subscribe(() => {
            setState(authService.state);
        });
    }, []);

    return state;
} 