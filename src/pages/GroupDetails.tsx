import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, FC } from 'react'
import groupService, { Group as ServerGroup } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import NotFound from '../components/common/NotFound'
import Spinner from '../components/common/Spinner'
import locationSharingService from '../services/locationSharingService'
import { UserPosition, Member, PointOfInterest } from "../services/types"
import MemberList from '../components/groups/MemberList'
import SlidingPanel from '../components/layout/SlidingPanel'
import Conversation from '../components/messages/Conversation'
import authService from '../services/authService'
import pointsOfInterestService from '../services/pointsOfInterestService'
import PointOfInterestList from '../components/groups/PointOfInterestList'
import GroupMap from '../components/groups/GroupMap'
import PointOfInterestForm from '../components/groups/PointOfInterestForm'
import LocationStatus from '../components/groups/LocationStatus'
import GroupHeader from '../components/groups/GroupHeader'
import { getCurrentUserPosition } from '../utils/positionUtils'

const GroupDetails: FC = () => {
    const params = useParams();
    const navigate = useNavigate();
    const id = params.id || '';
    const [group, setGroup] = useState<ServerGroup | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [userPositions, setUserPositions] = useState<UserPosition[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isConnectingSocket, setIsConnectingSocket] = useState<boolean>(false)
    const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false)
    const [memberObjects, setMemberObjects] = useState<Member[]>([]);
    const [hasUnreadMessage, setHasUnreadMessage] = useState<boolean>(false);
    const [points, setPoints] = useState<PointOfInterest[]>([]);
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
                    authService.state.profile?.id || ''
                );
                setIsGettingLocation(false);
                
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
                if (members.length > 0 && !members.some(member => 
                    authService.state.profile?.id && 
                    parseInt(member.id) === parseInt(authService.state.profile.id)
                )) {
                    navigate('/');
                }
                setMemberObjects(members);
            } catch (err) {
                console.error('Failed to load group members:', err);
                setError('Failed to load group members');
            }
        };

        // Add members listener for real-time updates
        const handleMembersUpdate = () => {
            loadGroupMembers();
        };
        
        loadGroupMembers();
        groupService.addMemberListener(id, handleMembersUpdate);
        
        return () => {
            groupService.removeMemberListener(id, handleMembersUpdate);
        };
    }, [group, id, navigate]);

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

        // Add points listener for real-time updates
        const handlePointsUpdate = () => {
            loadPoints();
        };
        
        loadPoints();
        pointsOfInterestService.addPointsListener(id, handlePointsUpdate);
        
        return () => {
            pointsOfInterestService.removePointsListener(id, handlePointsUpdate);
        };
    }, [id]);

    const handleAddPoint = async (pointName: string) => {
        if (!pointName.trim() || !userPositions.length) return;

        const myPosition = getCurrentUserPosition(userPositions, authService.state.profile?.id);
        if (myPosition.latitude === 0 && myPosition.longitude === 0) {
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
            // Points will be automatically updated through WebSocket
        } catch (err) {
            console.error('Failed to add point:', err);
            setError('Failed to add point of interest');
        } finally {
            setIsAddingPoint(false);
        }
    };

    const handleAddPointFromMap = async (name: string, lat: number, lng: number) => {
        setIsAddingPoint(true);
        try {
            await pointsOfInterestService.addPoint(
                id,
                name,
                lat,
                lng
            );
            // Points will be automatically updated through WebSocket
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
            // Points will be automatically updated through WebSocket
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

            <div className="p-4 pb-[76px] h-full overflow-y-auto">
                <LocationStatus 
                    error={error}
                    isConnectingSocket={isConnectingSocket}
                    isGettingLocation={isGettingLocation}
                />
                
                <GroupHeader 
                    groupId={id} 
                    title="Membres" 
                />
                
                <MemberList 
                    members={memberObjects}
                    userPositions={userPositions}
                />

                <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-700 mb-4">Points d'intérêt</h2>
                    
                    <PointOfInterestForm 
                        isAddingPoint={isAddingPoint}
                        onAddPoint={handleAddPoint}
                        hasLocation={!!userPositions.find(pos => pos.userId === authService.state.profile?.id)}
                    />

                    <PointOfInterestList 
                        points={points}
                        myPosition={getCurrentUserPosition(userPositions, authService.state.profile?.id)}
                        onRemovePoint={handleRemovePoint}
                    />
                </div>

                <div className="mt-8">
                    <GroupMap 
                        userPositions={userPositions}
                        points={points}
                        memberObjects={memberObjects}
                        groupId={id}
                        onPointAdd={handleAddPointFromMap}
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