import { FC, useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import NavBar from '../components/layout/NavBar';
import PersonCard from '../components/users/PersonCard';
import userService, { User } from '../services/userService';
import groupService from '../services/groupService';
import { Member } from '../services/types';
import ChevronIcon from '../components/icons/ChevronIcon';

const EditGroup: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('groups');
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGroupAndFriends = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // Load group data
        const group = await groupService.getGroupById(id);
        if (!group) {
          throw new Error('Groupe introuvable');
        }
        setGroupNameInput(group.name);
        setGroupName(group.name);

        // Load all group members
        const members = await groupService.getGroupMembers(id);
        setGroupMembers(members);

        // Load friends for search
        const friendsList = await userService.getFriends();
        setFriends(friendsList);
      } catch (err) {
        console.error('Impossible de charger les données du groupe:', err);
        setError(err instanceof Error ? err.message : 'Impossible de charger les données du groupe');
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupAndFriends();
  }, [id]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'friends') {
      navigate('/friends');
    } else if (tab === 'groups') {
      navigate('/');
    }
  };

  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();
    return friends.filter(friend => {
      if (groupMembers.some(member => member.id === friend.googleId)) {
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
  }, [searchTerm, friends, groupMembers]);

  const handleAddFriend = async (friend: User) => {
    try {
      await groupService.addMember(id, friend.googleId);
      const updatedMembers = await groupService.getGroupMembers(id);
      setGroupMembers(updatedMembers);
      setSearchTerm('');
    } catch (err) {
      console.error('Impossible d\'ajouter le membre:', err);
      setError(err instanceof Error ? err.message : 'Impossible d\'ajouter le membre');
    }
  };

  const handleRemoveFriend = async (memberId: string | undefined) => {
    if (!memberId || !id) return;
    
    try {
      await groupService.removeMember(id, memberId);
      const updatedMembers = await groupService.getGroupMembers(id);
      setGroupMembers(updatedMembers);
    } catch (err) {
      console.error('Impossible de retirer le membre:', err);
      setError(err instanceof Error ? err.message : 'Impossible de retirer le membre');
    }
  };

  const handleUpdateGroupNameInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !groupNameInput.trim()) return;

    try {
      await groupService.renameGroup(id, groupNameInput);
      setGroupName(groupNameInput);
      setError(null);
    } catch (err) {
      console.error('Impossible de mettre à jour le nom du groupe:', err);
      setError(err instanceof Error ? err.message : 'Impossible de mettre à jour le nom du groupe');
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="p-4">Chargement...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col h-full max-h-screen">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(`/group/${id}`)} 
              className="p-1 hover:bg-gray-100 cursor-pointer rounded-full"
            >
              <ChevronIcon direction="left" />
            </button>
            <h1 className="text-xl font-semibold">Modifier le groupe</h1>
          </div>
        </div>

        <div className="p-4">
          <form className="max-w-2xl mx-auto space-y-6" onSubmit={handleUpdateGroupNameInput}>
            <div>
              <label htmlFor="groupNameInput" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du groupe
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="groupNameInput"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez le nom du groupe"
                  required
                />
                <button
                  disabled={groupNameInput.trim() == groupName}
                  type="submit"
                  className="px-4 py-2 cursor-pointer disabled:cursor-default disabled:bg-gray-400 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Valider
                </button>
              </div>
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
                Membres du groupe ({groupMembers.length})
              </label>
              <div className="border border-gray-200 rounded-md p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                {groupMembers.length === 0 ? (
                  <div className="text-sm text-gray-500">Aucun membre dans le groupe</div>
                ) : (
                  <div className="space-y-2">
                    {groupMembers.map(member => (
                      <PersonCard
                        key={member.email}
                        person={member}
                        onRemove={() => handleRemoveFriend(member.id)}
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
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default EditGroup;