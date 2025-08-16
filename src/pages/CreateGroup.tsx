import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import NavBar from '../components/layout/NavBar';
import Button from '../components/common/Button';
import groupService from '../services/groupService';
import authService from '../services/authService';

const CreateGroup: FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('groups');
  const [groupName, setGroupName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'groups') {
      navigate('/');
    }
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

      const memberIds = [currentUserId];

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
              <p className="text-sm text-gray-600">
                Créez un groupe et partagez le lien avec vos amis pour qu'ils puissent vous rejoindre.
              </p>
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
                disabled={groupName.trim() === ''}
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
