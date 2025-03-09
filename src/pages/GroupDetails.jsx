import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getGroupById } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import MemberList from '../components/groups/MemberList'
import NotFound from '../components/common/NotFound'
import locationSharingService from '../services/locationSharingService'

const GroupDetails = () => {
    const { id } = useParams()
    const group = getGroupById(id)
    const [userPositions, setUserPositions] = useState([])
    const [isSharing, setIsSharing] = useState(false)
    const [error, setError] = useState(null)

    // Start location sharing when component mounts
    useEffect(() => {
        if (!group) return

        // Get current user info (in a real app, this would come from auth)
        // For demo purposes, we'll use a hardcoded user ID (first member in the group)
        const currentUser = group.members[0]
        
        const startLocationSharing = async () => {
            try {
                await locationSharingService.startSharing(
                    id,
                    currentUser.id,
                    currentUser.name
                )
                setIsSharing(true)
                
                // Add listener for location updates
                locationSharingService.addLocationUpdateListener(handleLocationUpdates)
            } catch (err) {
                console.error('Failed to start location sharing:', err)
                setError('Failed to start location sharing. Please check your browser permissions.')
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
                <MemberList members={group.members} />
            </div>
        </PageContainer>
    )
}

export default GroupDetails 