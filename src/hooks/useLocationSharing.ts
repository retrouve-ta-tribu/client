import { useState, useEffect } from 'react'
import locationSharingService from '../services/locationSharingService'
import authService from '../services/authService'
import { UserPosition } from '../services/types'

export function useLocationSharing(groupId: string, setError: (error: string | null) => void) {
    const [userPositions, setUserPositions] = useState<UserPosition[]>([])
    const [isConnectingSocket, setIsConnectingSocket] = useState<boolean>(false)
    const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false)

    // Start location sharing when component mounts
    useEffect(() => {
        if (!groupId || !authService.state.profile?.id) return

        // Stop any existing location sharing
        locationSharingService.stopSharing()
        
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
                    groupId,
                    authService.state.profile?.id || ''
                )
                setIsGettingLocation(false)
                
                // Add listener for location updates
                locationSharingService.addLocationUpdateListener(handleLocationUpdates)
            } catch (err: unknown) {
                setIsConnectingSocket(false)
                setIsGettingLocation(false)
                console.error('Failed to start location sharing:', err)
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
                setError(`Impossible de partager la localisation: ${errorMessage}`)
            }
        }
        
        startLocationSharing()
        
        // Clean up when component unmounts
        return () => {
            locationSharingService.stopSharing()
            locationSharingService.removeLocationUpdateListener(handleLocationUpdates)
        }
    }, [groupId, setError])

    // Handle location updates from other users
    const handleLocationUpdates = (positions: UserPosition[]) => {
        setUserPositions(positions)
    }

    return { userPositions, isConnectingSocket, isGettingLocation }
} 