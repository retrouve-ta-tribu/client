import groups from '../mocks/groups.json'
import {Group} from "./types.ts";
import authService from '../services/authService';

export const getGroups = () => {
  return groups as Group[]
} 

export const getGroupById = (id: string) => {
  return (groups as Group[]).find(group => group._id.$oid === id)
} 

export const getUserById = (userId: string) => {
  for (const group of groups as Group[]) {
    const user = group.members.find(member => member.id === userId)
    if (user) {
      return {
        ...user,
        groupId: group._id.$oid,
        groupName: group.name
      }
    }
  }
  return null
} 

interface CreateGroupRequest {
  name: string;
  members: string[];
}

export const createGroup = async (groupData: CreateGroupRequest): Promise<any> => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('VITE_API_URL environment variable is not defined');
  }
  
  const googleId = authService.state.profile?.id;
  if (!googleId) {
    throw new Error('User not authenticated');
  }
  
  try {
    const response = await fetch(`${apiUrl}/api/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: groupData.name,
        members: groupData.members,
        createdBy: googleId
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to create group: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
} 