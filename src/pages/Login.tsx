import { FC } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../hooks/useAuth';

const Login: FC = () => {
    const { error, login, isLoading } = useAuth();

    return (
        <PageContainer>
            <PageHeader title="Login" />
            <div className="flex flex-col items-center justify-center p-8">
                {error && (
                    <div className="text-red-500 mb-4">
                        {error.message}
                    </div>
                )}
                
                <button 
                    onClick={() => login()}
                    disabled={isLoading}
                    className={`bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                    }`}
                >
                    <span>{isLoading ? 'Loading...' : 'Sign in with Google'}</span> 
                    {!isLoading && <span role="img" aria-label="rocket">🚀</span>}
                </button>
            </div>
        </PageContainer>
    );
};

export default Login;