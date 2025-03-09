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

    // Start location sharing when component mounts
    useEffect(() => {
        if (!group) return

        // Get current user info (in a real app, this would come from auth)
        // For demo purposes, we'll use a hardcoded user ID (first member in the group)
        const currentUser = group.members[0]
        
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
        
        // Clean up when component unmounts
        return () => {
            locationSharingService.stopSharing()
            locationSharingService.removeLocationUpdateListener(handleLocationUpdates)
        }
    }, [id, group])
    
    // Handle location updates from other users
    const handleLocationUpdates = (positions) => {
        setUserPositions(positions)
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
                        Sharing your location with the group
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