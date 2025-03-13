import { FC, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import FriendCard from '../components/FriendCard';
import friendService from '../services/friendService';

const Friends: FC = () => {
  const friends = friendService.getFriends();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      if (email.includes('@')) {
        setEmail('');
      } else {
        setError('Veuillez entrer une adresse email valide');
      }
      setIsSubmitting(false);
    }, 1000);
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
      
      <div className="divide-y divide-gray-100">
        {friends.map((friend) => (
          <FriendCard 
            key={friend.id} 
            friend={friend} 
          />
        ))}
      </div>
    </PageContainer>
  );
};

export default Friends; 