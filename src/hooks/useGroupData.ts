import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import groupService, { Group as ServerGroup } from '../services/groupService'
import authService from '../services/authService'
import { Member } from '../services/types'

export function useGroupData(groupId: string) {
    const [group, setGroup] = useState<ServerGroup | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [memberObjects, setMemberObjects] = useState<Member[]>([])
    const navigate = useNavigate()

    // Load group data
    useEffect(() => {
        const loadGroup = async () => {
            if (!groupId) return
            
            setIsLoading(true)
            try {
                const groupData = await groupService.getGroupById(groupId)
                setGroup(groupData)
                if (!groupData) {
                    setError('Group not found')
                }
            } catch (err) {
                console.error('Failed to load group:', err)
                setError('Failed to load group details')
            } finally {
                setIsLoading(false)
            }
        }
        
        loadGroup()
    }, [groupId])

    // Transform member IDs into Member objects when group loads
    useEffect(() => {
        const loadGroupMembers = async () => {
            if (!group) return
            
            try {
                const members = await groupService.getGroupMembers(groupId)
                if (members.length > 0 && !members.some(member => 
                    authService.state.profile?.id && 
                    parseInt(member.id) === parseInt(authService.state.profile.id)
                )) {
                    navigate('/')
                }
                setMemberObjects(members)
            } catch (err) {
                console.error('Failed to load group members:', err)
                setError('Failed to load group members')
            }
        }

        // Add members listener for real-time updates
        const handleMembersUpdate = () => {
            loadGroupMembers()
        }
        
        loadGroupMembers()
        groupService.addMemberListener(groupId, handleMembersUpdate)
        
        return () => {
            groupService.removeMemberListener(groupId, handleMembersUpdate)
        }
    }, [group, groupId, navigate])

    return { group, isLoading, error, setError, memberObjects }
} 