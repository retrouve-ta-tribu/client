import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import authService from '../services/authService';

const Login: FC = () => {
    const navigate = useNavigate();
    
    // Set up callback for successful login
    authService.onLoginSuccess = () => navigate('/');
    
    // Get the login function from the service
    const login = authService.getGoogleLogin();

    return (
        <PageContainer>
            <PageHeader title="Connexion" />
            <div className="flex flex-col items-center justify-center p-8">
                {authService.error && (
                    <div className="text-red-500 mb-4">
                        {authService.error.message}
                    </div>
                )}
                
                <button 
                    onClick={() => login()}
                    disabled={authService.isLoading}
                    className={`bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer flex items-center gap-2 ${
                        authService.isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                    }`}
                >
                    <span>{authService.isLoading ? 'Chargement...' : 'Se connecter avec Google'}</span> 
                    {!authService.isLoading}
                </button>
            </div>
        </PageContainer>
    );
};

export default Login;