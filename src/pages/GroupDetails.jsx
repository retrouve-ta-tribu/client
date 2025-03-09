import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getGroupById } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import MemberList from '../components/groups/MemberList'
import NotFound from '../components/common/NotFound'
import Spinner from '../components/common/Spinner'
import locationSharingService from '../services/locationSharingService'

const GroupDetails = () => {
    const { id } = useParams()
    const group = getGroupById(id)
    const [userPositions, setUserPositions] = useState([])
    const [isSharing, setIsSharing] = useState(false)
    const [error, setError] = useState(null)
    const [isConnectingSocket, setIsConnectingSocket] = useState(false)
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState('')

    // Set the first user as default when group data loads
    useEffect(() => {
        if (group && group.members.length > 0 && !selectedUserId) {
            setSelectedUserId(group.members[0].id)
        }
    }, [group, selectedUserId])

    // Start location sharing when component mounts or selected user changes
    useEffect(() => {
        if (!group || !selectedUserId) return

        // Find the selected user from the group members
        const currentUser = group.members.find(member => member.id === selectedUserId)
        if (!currentUser) return

        // Stop any existing location sharing
        locationSharingService.stopSharing()
        setIsSharing(false)
        
        const startLocationSharing = async () => {
            try {
                // First, connect to socket
                setIsConnectingSocket(true)
                if (!locationSharingService.isSocketConnected()) {
                    await locationSharingService.connectSocket()
                }
                setIsConnectingSocket(false)
                
                // Then, get geolocation
                setIsGettingLocation(true)
                await locationSharingService.startSharing(
                    id,
                    currentUser.id,
                    currentUser.name
                )
                setIsGettingLocation(false)
                setIsSharing(true)
                
                // Add listener for location updates
                locationSharingService.addLocationUpdateListener(handleLocationUpdates)
            } catch (err) {
                setIsConnectingSocket(false)
                setIsGettingLocation(false)
                console.error('Failed to start location sharing:', err)
                setError(`Failed to start location sharing: ${err.message}`)
            }
        }
        
        startLocationSharing()
        
        // Clean up when component unmounts or selected user changes
        return () => {
            locationSharingService.stopSharing()
            locationSharingService.removeLocationUpdateListener(handleLocationUpdates)
        }
    }, [id, group, selectedUserId])
    
    // Handle location updates from other users
    const handleLocationUpdates = (positions) => {
        setUserPositions(positions)
    }

    // Handle user selection change
    const handleUserChange = (e) => {
        setSelectedUserId(e.target.value)
    }

    if (!group) {
        return (
            <PageContainer>
                <PageHeader backLink="/" />
                <NotFound type="Group" />
            </PageContainer>
        )
    }

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
                        value={selectedUserId}
                        onChange={handleUserChange}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {group.members.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.name}
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
                        Sharing location as: <strong>{group.members.find(m => m.id === selectedUserId)?.name}</strong>
                    </div>
                )}
                
                <MemberList 
                    members={group.members} 
                    userPositions={userPositions}
                />
            </div>
        </PageContainer>
    )
}

export default GroupDetails 