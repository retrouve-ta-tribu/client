import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

interface GroupHeaderProps {
    groupId: string;
    title: string;
}

const GroupHeader: FC<GroupHeaderProps> = ({ groupId, title }) => {
    const navigate = useNavigate();
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);

    const handleShareGroup = async () => {
        const groupLink = `${window.location.origin}/group/${groupId}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Rejoins mon groupe',
                    text: 'Rejoins mon groupe sur Retrouve Ta Tribu',
                    url: groupLink,
                });
            } else {
                await navigator.clipboard.writeText(groupLink);
                setShowCopiedMessage(true);
                setTimeout(() => setShowCopiedMessage(false), 2000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700">{title}</h2>
            <div className="flex gap-2">
                <Button
                    variant="primary"
                    onClick={handleShareGroup}
                >
                    {showCopiedMessage ? 'Lien copié !' : 'Partager'}
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => navigate(`/group/${groupId}/edit`)}
                >
                    Modifier
                </Button>
            </div>
        </div>
    );
};

export default GroupHeader;
