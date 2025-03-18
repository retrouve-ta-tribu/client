import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from '../../hooks/useAuthState';
import authService from '../../services/authService';
import ChevronIcon from '../icons/ChevronIcon';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  backLink?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, backLink }) => {
  const { profile } = useAuthState();

  return (
    <header className="border-b border-gray-200 p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        {backLink && (
          <Link 
            to={backLink} 
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Retour"
          >
            <ChevronIcon direction="left" className="w-6 h-6 text-gray-600" />
          </Link>
        )}
        <div>
          {title && <h1 className="text-xl font-semibold text-gray-800">{title}</h1>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      {profile && window.location.pathname == '/' && (
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