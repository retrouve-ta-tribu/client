import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import NavBar from '../components/layout/NavBar';
import FriendCard from '../components/FriendCard';
import Button from '../components/ui/Button';
import friendService, { Friend } from '../services/friendService';

const Friends: FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const friendsList = await friendService.getFriends();
      setFriends(friendsList);
    } catch (err) {
      console.error('Failed to load friends:', err);
      setError('Failed to load friends. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await friendService.addFriend(email);
      setEmail('');
      // Refresh friends list
      await loadFriends();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFriendRemoved = () => {
    // Refresh friends list
    loadFriends();
  };

  return (
    <PageContainer>
      <div className="flex flex-col h-full max-h-screen">
        <NavBar activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              loadingText="Envoi..."
              disabled={!email.trim()}
            >
              Ajouter un ami
            </Button>
          </form>
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Chargement...</div>
          ) : friends.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Vous n'avez pas encore d'amis</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {friends.map((friend, index) => (
                <FriendCard 
                  key={`${friend.email}-${index}`} 
                  friend={friend}
                  onRemove={handleFriendRemoved}
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