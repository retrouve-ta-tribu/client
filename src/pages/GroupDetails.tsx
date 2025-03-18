import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, FC } from 'react'
import groupService, { Group as ServerGroup } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import NotFound from '../components/common/NotFound'
import Spinner from '../components/common/Spinner'
import locationSharingService from '../services/locationSharingService'
import { UserPosition, Member, PointOfInterest, Group } from "../services/types"
import MemberList from '../components/groups/MemberList'
import SlidingPanel from '../components/layout/SlidingPanel'
import ChevronIcon from '../components/icons/ChevronIcon'
import Conversation from '../components/Messages/Conversation'
import authService from '../services/authService'
import Button from '../components/common/Button'
import pointsOfInterestService from '../services/pointsOfInterestService'
import PointOfInterestList from '../components/groups/PointOfInterestList'

const GroupDetails: FC = () => {
    const params = useParams();
    const navigate = useNavigate();
    const id = params.id || '';
    const [group, setGroup] = useState<ServerGroup | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [userPositions, setUserPositions] = useState<UserPosition[]>([])
    const [isSharing, setIsSharing] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isConnectingSocket, setIsConnectingSocket] = useState<boolean>(false)
    const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false)
    const [memberObjects, setMemberObjects] = useState<Member[]>([]);
    const [hasUnreadMessage, setHasUnreadMessage] = useState<boolean>(false);
    const [points, setPoints] = useState<PointOfInterest[]>([]);
    const [pointName, setPointName] = useState('');
    const [isAddingPoint, setIsAddingPoint] = useState(false);

    // Load group data
    useEffect(() => {
        const loadGroup = async () => {
            if (!id) return;
            
            setIsLoading(true);
            try {
                const groupData = await groupService.getGroupById(id);
                setGroup(groupData);
                if (!groupData) {
                    setError('Group not found');
                }
            } catch (err) {
                console.error('Failed to load group:', err);
                setError('Failed to load group details');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadGroup();
    }, [id]);

    // Start location sharing when component mounts or selected user changes
    useEffect(() => {
        if (!group || !authService.state.profile?.id) return;

        // Stop any existing location sharing
        locationSharingService.stopSharing();
        setIsSharing(false);
        
        const startLocationSharing = async () => {
            try {
                // First, connect to socket
                setIsConnectingSocket(true);
                if (!locationSharingService.isSocketConnected()) {
                    await locationSharingService.connectSocket();
                }
                setIsConnectingSocket(false);
                
                // Then, get geolocation
                setIsGettingLocation(true);
                await locationSharingService.startSharing(
                    id,
                    authService.state.profile?.id
                );
                setIsGettingLocation(false);
                setIsSharing(true);
                
                // Add listener for location updates
                locationSharingService.addLocationUpdateListener(handleLocationUpdates);
            } catch (err: unknown) {
                setIsConnectingSocket(false);
                setIsGettingLocation(false);
                console.error('Failed to start location sharing:', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setError(`Failed to start location sharing: ${errorMessage}`);
            }
        };
        
        startLocationSharing();
        
        // Clean up when component unmounts or selected user changes
        return () => {
            locationSharingService.stopSharing();
            locationSharingService.removeLocationUpdateListener(handleLocationUpdates);
        };
    }, [id, group]);

    // Handle location updates from other users
    const handleLocationUpdates = (positions: UserPosition[]) => {
        setUserPositions(positions);
    };

    // Transform member IDs into Member objects when group loads
    useEffect(() => {
        const loadGroupMembers = async () => {
            if (!group) return;
            
            try {
                const members = await groupService.getGroupMembers(id);
                setMemberObjects(members);
            } catch (err) {
                console.error('Failed to load group members:', err);
                setError('Failed to load group members');
            }
        };

        loadGroupMembers();
    }, [group, id]);

    // Load points of interest
    useEffect(() => {
        const loadPoints = async () => {
            if (!id) return;
            try {
                const points = await pointsOfInterestService.getGroupPoints(id);
                setPoints(points);
            } catch (err) {
                console.error('Failed to load points:', err);
                setError('Failed to load points of interest');
            }
        };
        
        loadPoints();
    }, [id]);

    const handleAddPoint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pointName.trim() || !userPositions.length) return;

        const myPosition = userPositions.find(pos => pos.userId === authService.state.profile?.id);
        if (!myPosition) {
            setError('Your location is not available');
            return;
        }

        setIsAddingPoint(true);
        try {
            await pointsOfInterestService.addPoint(
                id,
                pointName,
                myPosition.latitude,
                myPosition.longitude
            );
            setPointName('');
            // Refetch points from backend
            const updatedPoints = await pointsOfInterestService.getGroupPoints(id);
            setPoints(updatedPoints);
        } catch (err) {
            console.error('Failed to add point:', err);
            setError('Failed to add point of interest');
        } finally {
            setIsAddingPoint(false);
        }
    };

    const handleRemovePoint = async (pointId: string) => {
        try {
            await pointsOfInterestService.removePoint(id, pointId);
            // Refetch points from backend
            const updatedPoints = await pointsOfInterestService.getGroupPoints(id);
            setPoints(updatedPoints);
        } catch (err) {
            console.error('Failed to remove point:', err);
            setError('Failed to remove point of interest');
        }
    };

    if (isLoading) {
        return (
            <PageContainer>
                <PageHeader backLink="/" />
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" color="blue" />
                </div>
            </PageContainer>
        );
    }

    if (!group) {
        return (
            <PageContainer>
                <PageHeader backLink="/" />
                <NotFound type="Group" />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader 
                backLink="/"
                title={group.name}
            />

            <div className="p-4 pb-20">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
                
                {isConnectingSocket && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
                        <Spinner size="sm" color="blue" />
                        <span className="ml-2">Connecting to server...</span>
                    </div>
                )}
                
                {isGettingLocation && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                        <Spinner size="sm" color="green" />
                        <span className="ml-2">Getting your location...</span>
                    </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-700">Membres</h2>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/group/${id}/edit`)}
                    >
                        Modifier
                    </Button>
                </div>
                
                <MemberList 
                    members={memberObjects}
                    userPositions={userPositions}
                />

                <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-700 mb-4">Points d'intérêt</h2>
                    
                    <form onSubmit={handleAddPoint} className="mb-4 flex gap-2">
                        <input
                            type="text"
                            value={pointName}
                            onChange={(e) => setPointName(e.target.value)}
                            placeholder="Nom du point d'intérêt"
                            className="flex-1 pl-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            disabled={isAddingPoint}
                        />
                        <Button
                            type="submit"
                            disabled={isAddingPoint || !pointName.trim() || !userPositions.length}
                        >
                            {isAddingPoint ? 'Ajout...' : 'Créer'}
                        </Button>
                    </form>

                    <PointOfInterestList 
                        points={points}
                        onRemovePoint={handleRemovePoint}
                    />
                </div>
            </div>

            <SlidingPanel hasNotification={hasUnreadMessage} setHasNotification={setHasUnreadMessage}>
                <div className="relative max-w-3xl mx-auto bg-white shadow-md h-full flex flex-col justify-between overflow-hidden">
                    <Conversation 
                        group={{
                            _id: group._id,
                            name: group.name,
                            members: memberObjects
                        }} 
                        setHasUnreadMessage={setHasUnreadMessage}
                    />
                </div>                
            </SlidingPanel>
        </PageContainer>
    );
};

export default GroupDetails; 