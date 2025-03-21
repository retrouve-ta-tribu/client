import { useParams } from 'react-router-dom'
import { useState, FC } from 'react'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import NotFound from '../components/common/NotFound'
import Spinner from '../components/common/Spinner'
import MemberList from '../components/groups/MemberList'
import SlidingPanel from '../components/layout/SlidingPanel'
import Conversation from '../components/messages/Conversation'
import authService from '../services/authService'
import PointOfInterestList from '../components/groups/PointOfInterestList'
import GroupMap from '../components/groups/GroupMap'
import PointOfInterestForm from '../components/groups/PointOfInterestForm'
import LocationStatus from '../components/groups/LocationStatus'
import GroupHeader from '../components/groups/GroupHeader'
import { getCurrentUserPosition } from '../utils/positionUtils'
import { useGroupData } from '../hooks/useGroupData'
import { useLocationSharing } from '../hooks/useLocationSharing'
import { usePointsOfInterest } from '../hooks/usePointsOfInterest'

const GroupDetails: FC = () => {
    const params = useParams()
    const id = params.id || ''
    const [hasUnreadMessage, setHasUnreadMessage] = useState<boolean>(false)
    
    // Use custom hooks for state management
    const { 
        group, 
        isLoading, 
        error, 
        setError, 
        memberObjects 
    } = useGroupData(id)
    
    const { 
        userPositions, 
        isConnectingSocket, 
        isGettingLocation 
    } = useLocationSharing(id, setError)
    
    const { 
        points, 
        isAddingPoint, 
        handleAddPoint: addPoint, 
        handleAddPointFromMap, 
        handleRemovePoint 
    } = usePointsOfInterest(id, setError)

    // Wrapper function to pass userPositions to handleAddPoint
    const handleAddPoint = (pointName: string) => {
        return addPoint(pointName, userPositions)
    }

    if (isLoading) {
        return (
            <PageContainer>
                <PageHeader backLink="/" />
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" color="blue" />
                </div>
            </PageContainer>
        )
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
    )
}

export default GroupDetails 