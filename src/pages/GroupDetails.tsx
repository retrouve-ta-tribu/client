import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, FC } from 'react'
import groupService, { Group } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import NotFound from '../components/common/NotFound'
import Spinner from '../components/common/Spinner'
import locationSharingService from '../services/locationSharingService'
import { UserPosition, Member } from "../services/types.ts"
import MemberList from '../components/groups/MemberList'
import SlidingPanel from '../components/layout/SlidingPanel.tsx'
import ChevronIcon from '../components/icons/ChevronIcon'
import Conversation from '../components/Messages/Conversation'
import authService from '../services/authService'

const GroupDetails: FC = () => {
    const params = useParams();
    const navigate = useNavigate();
    const id = params.id || '';
    const [group, setGroup] = useState<Group | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [userPositions, setUserPositions] = useState<UserPosition[]>([])
    const [isSharing, setIsSharing] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isConnectingSocket, setIsConnectingSocket] = useState<boolean>(false)
    const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false)
    const [memberObjects, setMemberObjects] = useState<Member[]>([]);
    const [hasUnreadMessage, setHasUnreadMessage] = useState<boolean>(false);

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
                title={
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => navigate('/')} 
                            className="p-1 hover:bg-gray-100 cursor-pointer rounded-full"
                        >
                            <ChevronIcon direction="left" />
                        </button>
                        {group.name}
                    </div>
                }
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
                    <button
                        onClick={() => navigate(`/group/${id}/edit`)}
                        className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-600 hover:border-indigo-800 rounded-md"
                    >
                        Modifier
                    </button>
                </div>
                
                <MemberList 
                    members={memberObjects}
                    userPositions={userPositions}
                />
            </div>

            <SlidingPanel hasNotification={hasUnreadMessage} setHasNotification={setHasUnreadMessage}>
                <div className="relative max-w-3xl mx-auto bg-white shadow-md h-full flex flex-col justify-between overflow-hidden">
                    <Conversation group={group} setHasUnreadMessage={setHasUnreadMessage}/>
                </div>                
            </SlidingPanel>
        </PageContainer>
    );
};

export default GroupDetails; 