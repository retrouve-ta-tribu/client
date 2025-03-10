import { FC } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../hooks/useAuth';

const Login: FC = () => {
    const { profile, error, login, logOut } = useAuth();

    return (
        <PageContainer>
            <PageHeader title="Login" />
            <div className="flex flex-col items-center justify-center p-8">
                {error && (
                    <div className="text-red-500 mb-4">
                        {error.message}
                    </div>
                )}
                
                {profile ? (
                    <div className="text-center">
                        <img 
                            src={profile.picture} 
                            alt={profile.name}
                            className="w-20 h-20 rounded-full mx-auto mb-4" 
                        />
                        <h3 className="text-xl font-semibold mb-2">
                            {profile.name}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {profile.email}
                        </p>
                        <button 
                            onClick={logOut}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Log out
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => login()}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <span>Sign in with Google</span> 
                        <span role="img" aria-label="rocket">🚀</span>
                    </button>
                )}
            </div>
        </PageContainer>
    );
};

export default Login;