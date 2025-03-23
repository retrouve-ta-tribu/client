import { FC } from 'react';
import Spinner from '../common/Spinner';

interface LocationStatusProps {
    error: string | null;
    isConnectingSocket: boolean;
    isGettingLocation: boolean;
}

const LocationStatus: FC<LocationStatusProps> = ({ 
    error, 
    isConnectingSocket, 
    isGettingLocation 
}) => {
    return (
        <>
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            
            {isConnectingSocket && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
                    <Spinner size="sm" color="blue" />
                    <span className="ml-2">Connexion au serveur...</span>
                </div>
            )}
            
            {isGettingLocation && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                    <Spinner size="sm" color="green" />
                    <span className="ml-2">Récupération de votre position...</span>
                </div>
            )}
        </>
    );
};

export default LocationStatus; 