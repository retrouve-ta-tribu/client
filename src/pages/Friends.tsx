import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import NavBar from '../components/layout/NavBar';
import PersonCard from '../components/users/PersonCard';
import userService, { User } from '../services/userService';

const Friends: FC = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'groups') {
      navigate('/');
    }
  };

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const friendsList = await userService.getFriends();
      setFriends(friendsList);
    } catch (err) {
      console.error('Impossible de charger les amis:', err);
      setError('Impossible de charger les amis. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
    // Load all users initially
    userService.getAllUsers().catch(err => {
      console.error('Impossible de charger les utilisateurs:', err);
    });
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const results = userService.searchUsers(searchTerm);
      // Filter out users that are already friends
      const nonFriends = results.filter(user => 
        !friends.some(friend => friend.googleId === user.googleId)
      );
      setFilteredUsers(nonFriends);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, friends]);

  const handleAddFriend = async (user: User) => {
    setError(null);
    
    try {
      await userService.addFriend(user.email);
      setSearchTerm('');
      // Refresh friends list
      await loadFriends();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleFriendRemoved = (friendId: string) => {
    userService.removeFriend(friendId)
      .then(() => {
        loadFriends();
      })
      .catch(err => {
        console.error('Impossible de supprimer l\'ami:', err);
      });
  };

  return (
    <PageContainer>
      <div className="flex flex-col h-full max-h-screen">
        <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col gap-2">
            <label htmlFor="searchFriends" className="block text-sm font-medium text-gray-700">
              Rechercher des amis
            </label>
            <input
              type="text"
              id="searchFriends"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {searchTerm.trim() !== '' && (
              <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500">Aucun utilisateur trouvé</div>
                ) : (
                  filteredUsers.map(user => (
                    <PersonCard
                      key={user.email}
                      person={user}
                      onClick={() => handleAddFriend(user)}
                      showRemoveButton={false}
                      compact={true}
                    />
                  ))
                )}
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Chargement...</div>
          ) : friends.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Vous n'avez pas encore d'amis</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {friends.map((friend, index) => (
                <PersonCard 
                  key={`${friend.email}-${index}`} 
                  person={friend}
                  onRemove={() => handleFriendRemoved(friend.googleId || friend.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Friends; 