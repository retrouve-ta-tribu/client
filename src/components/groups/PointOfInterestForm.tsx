import { FC, FormEvent, useState } from 'react';
import Button from '../common/Button';

interface PointOfInterestFormProps {
    isAddingPoint: boolean;
    onAddPoint: (name: string) => Promise<void>;
    hasLocation: boolean;
}

const PointOfInterestForm: FC<PointOfInterestFormProps> = ({ 
    isAddingPoint,
    onAddPoint, 
    hasLocation 
}) => {
    const [pointName, setPointName] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!pointName.trim() || !hasLocation) return;
        
        await onAddPoint(pointName);
        setPointName('');
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
            <input
                type="text"
                value={pointName}
                onChange={(e) => setPointName(e.target.value)}
                placeholder="Nom du point"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAddingPoint}
            />
            <Button
                type="submit"
                disabled={isAddingPoint || !pointName.trim() || !hasLocation}
            >
                {isAddingPoint ? 'Ajout...' : 'Créer'}
            </Button>
        </form>
    );
};

export default PointOfInterestForm; 