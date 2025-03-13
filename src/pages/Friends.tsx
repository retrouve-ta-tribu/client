import { FC } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import FriendCard from '../components/FriendCard';
import friendService from '../services/friendService';

const Friends: FC = () => {
  const friends = friendService.getFriends();

  return (
    <PageContainer>
      <PageHeader 
        title="Mes amis" 
        backLink="/"
        backText="Retour aux groupes"
      />
      
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