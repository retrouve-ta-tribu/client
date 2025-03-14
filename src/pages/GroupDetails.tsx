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
import authService from '../services/authService'
import FriendService from '../services/friendService'

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
    const [debugUserId, setDebugUserId] = useState<string>('')
    const [memberObjects, setMemberObjects] = useState<Member[]>([]);

    // Load group data
    useEffect(() => {
        // console log the current user
        console.log(authService.state.profile)

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

    // DEBUG : Set the first user as default when group data loads
    useEffect(() => {
        if (group && group.members && group.members.length > 0 && !debugUserId) {
            // Assuming members is an array of strings (user IDs)
            setDebugUserId(group.members[0]);
        }
    }, [group, debugUserId]);

    // Start location sharing when component mounts or selected user changes
    useEffect(() => {
        if (!group || !debugUserId) return;

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
                    debugUserId
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
    }, [id, group, debugUserId]);

    // DEBUG : Handle user selection change
    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDebugUserId(e.target.value);
    };

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
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={2} 
                                stroke="currentColor" 
                                className="w-6 h-6"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    d="M15.75 19.5L8.25 12l7.5-7.5" 
                                />
                            </svg>
                        </button>
                        {group.name}
                    </div>
                }
            />

            <div className="p-4">
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
                
                {/* Adapt MemberList to work with the new data structure */}                
                <MemberList 
                    members={memberObjects}
                    userPositions={userPositions}
                />
            </div>
        </PageContainer>
    );
};

export default GroupDetails; 