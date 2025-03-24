import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

interface GroupHeaderProps {
    groupId: string;
    title: string;
}

const GroupHeader: FC<GroupHeaderProps> = ({ groupId, title }) => {
    const navigate = useNavigate();
    
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700">{title}</h2>
            <Button
                variant="secondary"
                onClick={() => navigate(`/group/${groupId}/edit`)}
            >
                Modifier
            </Button>
        </div>
    );
};

export default GroupHeader; 