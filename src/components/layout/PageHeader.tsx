import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from '../../hooks/useAuthState';
import authService from '../../services/authService';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, backLink, backText }) => {
  const { profile } = useAuthState();

  return (
    <header className="border-b border-gray-200 p-4 flex justify-between items-center">
      <div>
        {backLink && (
          <div className="flex items-center mb-2">
            <Link to={backLink} className="text-blue-500 hover:text-blue-700 mr-2">
              &larr; {backText || 'Back'}
            </Link>
          </div>
        )}
        {title && <h1 className="text-xl font-semibold text-gray-800">{title}</h1>}
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      {profile && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img 
              src={profile.picture} 
              alt={profile.name}
              className="w-8 h-8 rounded-full" 
            />
            <span className="text-sm text-gray-600">
              {profile.name}
            </span>
          </div>
          <button
            onClick={authService.logOut}
            className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
          >
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
};

export default PageHeader; 