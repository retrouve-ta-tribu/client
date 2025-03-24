import { useState, useEffect } from 'react'
import pointsOfInterestService from '../services/pointsOfInterestService'
import authService from '../services/authService'
import { PointOfInterest, UserPosition } from '../services/types'
import { getCurrentUserPosition } from '../utils/positionUtils'

export function usePointsOfInterest(groupId: string, setError: (error: string | null) => void) {
    const [points, setPoints] = useState<PointOfInterest[]>([])
    const [isAddingPoint, setIsAddingPoint] = useState(false)

    // Load points of interest
    useEffect(() => {
        const loadPoints = async () => {
            if (!groupId) return
            try {
                const points = await pointsOfInterestService.getGroupPoints(groupId)
                setPoints(points)
            } catch (err) {
                console.error('Failed to load points:', err)
                setError('Impossible de charger les points d\'intérêt')
            }
        }

        // Add points listener for real-time updates
        const handlePointsUpdate = () => {
            loadPoints()
        }
        
        loadPoints()
        pointsOfInterestService.addPointsListener(groupId, handlePointsUpdate)
        
        return () => {
            pointsOfInterestService.removePointsListener(groupId, handlePointsUpdate)
        }
    }, [groupId, setError])

    const handleAddPoint = async (pointName: string, userPositions: UserPosition[]) => {
        if (!pointName.trim() || !userPositions.length) return

        const myPosition = getCurrentUserPosition(userPositions, authService.state.profile?.id)
        if (myPosition.latitude === 0 && myPosition.longitude === 0) {
            setError('Votre localisation n\'est pas disponible')
            return
        }

        setIsAddingPoint(true)
        try {
            await pointsOfInterestService.addPoint(
                groupId,
                pointName,
                myPosition.latitude,
                myPosition.longitude
            )
            // Points will be automatically updated through WebSocket
        } catch (err) {
            console.error('Failed to add point:', err)
            setError('Impossible d\'ajouter le point d\'intérêt')
        } finally {
            setIsAddingPoint(false)
        }
    }

    const handleAddPointFromMap = async (name: string, lat: number, lng: number) => {
        setIsAddingPoint(true)
        try {
            await pointsOfInterestService.addPoint(
                groupId,
                name,
                lat,
                lng
            )
            // Points will be automatically updated through WebSocket
        } catch (err) {
            console.error('Failed to add point:', err)
            setError('Impossible d\'ajouter le point d\'intérêt')
        } finally {
            setIsAddingPoint(false)
        }
    }

    const handleRemovePoint = async (pointId: string) => {
        try {
            await pointsOfInterestService.removePoint(groupId, pointId)
            // Points will be automatically updated through WebSocket
        } catch (err) {
            console.error('Failed to remove point:', err)
            setError('Impossible de supprimer le point d\'intérêt')
        }
    }

    return { 
        points, 
        isAddingPoint, 
        handleAddPoint, 
        handleAddPointFromMap, 
        handleRemovePoint 
    }
} 