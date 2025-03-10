interface GoogleUser {
    access_token: string;
    // Add other properties as needed
}

interface UserProfile {
    picture: string;
    name: string;
    email: string;
    // Add other profile properties as needed
}

export const fetchGoogleUserProfile = async (user: GoogleUser): Promise<UserProfile> => {
    try {
        const response = await fetch(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                    Accept: 'application/json'
                }
            }
        );

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Token expired or invalid');
            }
            throw new Error('Failed to fetch user profile');
        }

        return response.json();
    } catch (error) {
        console.error('Profile fetch error:', error);
        throw error;
    }
}; 