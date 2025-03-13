import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, FC } from 'react'
import groupService, { Group } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import MemberList from '../components/groups/MemberList'
import NotFound from '../components/common/NotFound'
import Spinner from '../components/common/Spinner'
import locationSharingService from '../services/locationSharingService'
import { UserPosition } from "../services/types.ts"

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

    // Get member names from user service or API
    // This is a placeholder - you'll need to implement this
    const getMemberName = (memberId: string) => {
        // Placeholder - replace with actual implementation
        return `User ${memberId.substring(0, 5)}`;
    };

    return (
        <PageContainer>
            <PageHeader 
                title={group.name}
                subtitle={`${group.members.length} members`}
                backLink="/"
            />

            <div className="p-4">
                {/* User selection dropdown */}
                <div className="mb-4">
                    <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-1">
                        Debug: Select User to Simulate
                    </label>
                    <select
                        id="userSelect"
                        value={debugUserId}
                        onChange={handleUserChange}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {group.members.map(memberId => (
                            <option key={memberId} value={memberId}>
                                {getMemberName(memberId)}
                            </option>
                        ))}
                    </select>
                </div>

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
                
                {isSharing && !isConnectingSocket && !isGettingLocation && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                        Sharing location as: <strong>{getMemberName(debugUserId)}</strong>
                    </div>
                )}
                
                {/* Adapt MemberList to work with the new data structure */}
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-3">Group Members</h2>
                    <div className="space-y-2">
                        {group.members.map(memberId => (
                            <div key={memberId} className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-gray-500">{getMemberName(memberId).charAt(0)}</span>
                                    </div>
                                    <div>
                                        <div className="font-medium">{getMemberName(memberId)}</div>
                                        <div className="text-sm text-gray-500">
                                            {userPositions.find(p => p.userId === memberId) 
                                                ? 'Online' 
                                                : 'Offline'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default GroupDetails; 