import { FC } from 'react';
import { useAuthState } from '../../hooks/useAuthState';
import authService from '../../services/authService';

interface NavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavBar: FC<NavBarProps> = ({ activeTab, onTabChange }) => {
  const { profile } = useAuthState();
  
  return (
    <div className="flex justify-between items-center border-b border-gray-200 p-2 flex-shrink-0">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          className={`px-6 py-2 text-sm font-medium cursor-pointer rounded-l-lg ${
            activeTab === 'groups'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onTabChange('groups')}
        >
          Mes groupes
        </button>
        <button
          type="button"
          className={`px-6 py-2 text-sm font-medium cursor-pointer rounded-r-lg ${
            activeTab === 'friends'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onTabChange('friends')}
        >
          Mes amis
        </button>
      </div>
      
      {profile && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img 
              src={profile.picture} 
              alt={profile.name}
              className="w-8 h-8 rounded-full" 
            />
            <span className="text-sm text-gray-600 hidden sm:inline">
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
    </div>
  );
};

export default NavBar; 