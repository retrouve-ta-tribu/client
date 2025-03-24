import { FC, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import NavBar from '../components/layout/NavBar';
import Button from '../components/common/Button';
import PersonCard from '../components/users/PersonCard';
import userService, { User } from '../services/userService';
import groupService from '../services/groupService';
import authService from '../services/authService';

const CreateGroup: FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('groups');
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'friends') {
      navigate('/friends');
    } else if (tab === 'groups') {
      navigate('/');
    }
  };

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsList = await userService.getFriends();
        setFriends(friendsList);
      } catch (err) {
        console.error('Failed to load friends:', err);
        setError('Impossible de charger les amis. Veuillez réessayer plus tard.');
      }
    };

    loadFriends();
  }, []);

  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();
    return friends.filter(friend => {
      if (selectedFriends.some(selected => selected.googleId === friend.googleId)) {
        return false;
      }

      const displayName = friend.displayName?.toLowerCase() || '';
      const firstName = friend.firstName?.toLowerCase() || '';
      const lastName = friend.lastName?.toLowerCase() || '';
      const email = friend.email.toLowerCase();

      return displayName.includes(lowerSearchTerm) ||
        firstName.includes(lowerSearchTerm) ||
        lastName.includes(lowerSearchTerm) ||
        email.includes(lowerSearchTerm);
    });
  }, [searchTerm, friends, selectedFriends]);

  const handleAddFriend = (friend: User) => {
    setSelectedFriends([...selectedFriends, friend]);
    setSearchTerm('');
  };

  const handleRemoveFriend = (friendGoogleId: string | undefined) => {
    if (!friendGoogleId) return;
    setSelectedFriends(selectedFriends.filter(friend => friend.googleId !== friendGoogleId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const currentUserId = authService.state.profile?.id;

      if (!currentUserId) {
        throw new Error('You must be logged in to create a group');
      }

      const memberIds = [currentUserId, ...selectedFriends.map(friend => friend.googleId).filter((id): id is string => id !== undefined)];

      await groupService.createGroup({
        name: groupName.trim(),
        members: memberIds
      });

      navigate('/');
    } catch (err) {
      console.error('Failed to create group:', err);
      setError(err instanceof Error ? err.message : 'Impossible de créer le groupe. Veuillez réessayer plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col h-full max-h-screen">
        <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="p-4">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du groupe
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez le nom du groupe"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="searchFriends" className="block text-sm font-medium text-gray-700 mb-1">
                Ajouter des amis
              </label>
              <input
                type="text"
                id="searchFriends"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rechercher des amis par nom ou email"
              />
              {searchTerm.trim() !== '' && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {filteredFriends.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Aucun ami trouvé</div>
                  ) : (
                    filteredFriends.map(friend => (
                      <PersonCard
                        key={friend.email}
                        person={friend}
                        onClick={() => handleAddFriend(friend)}
                        showRemoveButton={false}
                        compact={true}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membres du groupe ({selectedFriends.length})
              </label>
              <div className="border border-gray-200 rounded-md p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                {selectedFriends.length === 0 ? (
                  <div className="text-sm text-gray-500">Aucun membre sélectionné</div>
                ) : (
                  <div className="space-y-2">
                    {selectedFriends.map(friend => (
                      <PersonCard
                        key={friend.email}
                        person={friend}
                        onRemove={() => handleRemoveFriend(friend.googleId)}
                        compact={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={groupName.trim() === '' || selectedFriends.length === 0}
                isLoading={isSubmitting}
                loadingText="Création..."
              >
                Créer le groupe
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default CreateGroup; 