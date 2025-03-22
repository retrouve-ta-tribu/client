import { useState, useEffect } from 'react'
import locationSharingService from '../services/locationSharingService'
import authService from '../services/authService'
import { UserPosition } from '../services/types'
import socketService from "../services/socketService.ts";

export function useLocationSharing(groupId: string, setError: (error: string | null) => void) {
    const [userPositions, setUserPositions] = useState<UserPosition[]>([])
    const [isConnectingSocket, setIsConnectingSocket] = useState<boolean>(false)
    const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false)

    // Start location sharing when component mounts
    useEffect(() => {
        if (!groupId || !authService.state.profile?.id) return
        
        const startLocationSharing = async () => {
            // Stop any existing location sharing
            locationSharingService.stopSharing()
            socketService.disconnect();

            try {
                // First, connect to socket
                setIsConnectingSocket(true)
                await socketService.connect()
                setIsConnectingSocket(false)
            } catch (err: unknown) {
                setIsConnectingSocket(false)
                console.error('Failed to start web socket service:', err)
                const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
                setError(`Impossible de se connecter au serveur: ${errorMessage}`)

                // Retry connection
                setTimeout(startLocationSharing, 3000)
            }
            if(!socketService.isConnected()) return;

            // Retry connection if disconnected
            socketService.onDisconnected.addObserver((needToReconnect : boolean) => {
                if(!needToReconnect) return;
                console.log("Socket disconnected, retrying connection...")
                setIsConnectingSocket(true)
                setTimeout(startLocationSharing, 1000)
            });

            try{
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
            socketService.onDisconnected.removeObservers();
        }
    }, [groupId, setError])

    // Handle location updates from other users
    const handleLocationUpdates = (positions: UserPosition[]) => {
        setUserPositions(positions)
    }

    return { userPositions, isConnectingSocket, isGettingLocation }
} 