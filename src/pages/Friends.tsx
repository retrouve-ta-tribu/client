import { FC, useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import FriendCard from '../components/FriendCard';
import friendService, { Friend } from '../services/friendService';

const Friends: FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load friends
    setFriends(friendService.getFriends());
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await friendService.addFriend(email);
      setEmail('');
      // Refresh friends list
      setFriends(friendService.getFriends());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFriendRemoved = () => {
    // Refresh friends list
    setFriends(friendService.getFriends());
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Mes amis" 
        backLink="/"
        backText="Retour aux groupes"
      />
      
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Envoi...' : 'Ajouter un ami'}
          </button>
        </form>
        
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">Chargement...</div>
      ) : friends.length === 0 ? (
        <div className="p-4 text-center text-gray-500">Vous n'avez pas encore d'amis</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {friends.map((friend) => (
            <FriendCard 
              key={friend.id} 
              friend={friend}
              onRemove={handleFriendRemoved}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default Friends; 