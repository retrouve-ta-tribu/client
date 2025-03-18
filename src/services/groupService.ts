import authService from './authService';
import { Member } from './types';

/**
 * Represents a group's information in the system
 * @property _id - The unique identifier of the group
 * @property name - The name of the group
 * @property description - The description of the group
 * @property members - The members of the group
 * @property createdBy - The user who created the group
 * @property createdAt - The date and time when the group was created
 */
export interface Group {
  _id: {
    $oid: string;
  };
  name: string;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: {
    $date: string;
  };
}

/**
 * Request structure for creating a new group
 * @property name - The name of the group
 * @property members - The members of the group
 */
interface CreateGroupRequest {
  name: string;
  members: string[];
}

class GroupService {
  private static instance: GroupService;
  private baseUrl: string;

  private constructor() {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('VITE_API_URL environment variable is not defined');
    }
    this.baseUrl = `${apiUrl}/api`;
  }

  /**
   * Get the singleton instance of the GroupService
   * @returns The singleton instance of the GroupService
   */
  public static getInstance(): GroupService {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }

  public async getGroups(): Promise<Group[]> {
    // Get the current user's Google ID from the auth service
    const googleId = authService.state.profile?.id;
    
    if (!googleId) {
      console.warn('User not authenticated, returning empty groups array');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/${googleId}/groups`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  /**
   * Get a group by its ID
   * @param groupId - The ID of the group to fetch
   * @returns A promise that resolves to the group or null if the group is not found
   */
  public async getGroupById(groupId: string): Promise<Group | null> {
    try {
      const response = await fetch(`${this.baseUrl}/groups/${groupId}`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch group: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Error fetching group ${groupId}:`, error);
      return null;
    }
  }

  /**
   * Create a new group
   * @param groupData - The data for the new group
   * @returns A promise that resolves to the created group
   */
  public async createGroup(groupData: CreateGroupRequest): Promise<any> {
    const googleId = authService.state.profile?.id;
    if (!googleId) {
      throw new Error('User not authenticated');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/groups`, {
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

  /**
   * Leave a group
   * @param groupId - The ID of the group to leave
   * @param userId - The ID of the user to leave the group
   * @returns A promise that resolves when the user leaves the group
   */
  public async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to leave group: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error leaving group ${groupId}:`, error);
      throw error;
    }
  }

  /**
   * Get the members of a group
   * @param groupId - The ID of the group to get the members of
   * @returns A promise that resolves to the members of the group
   */
  public async getGroupMembers(groupId: string): Promise<Member[]> {
    const response = await fetch(`${this.baseUrl}/groups/${groupId}/members`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch group members');
    }
    
    const members = await response.json();
    return members.map((member: any) => ({
        id: member.googleId,
        email: member.email,
        name: member.displayName,
        picture: member.picture
    }));
  }

  /**
   * Add a member to a group
   * @param groupId - The ID of the group to add the member to
   * @param userId - The ID of the user to add to the group
   * @returns A promise that resolves when the member is added
   */
  public async addMember(groupId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/groups/${groupId}/members/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to add member: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  /**
   * Remove a member from a group
   * @param groupId - The ID of the group to remove the member from
   * @param userId - The ID of the user to remove from the group
   * @returns A promise that resolves when the member is removed
   */
  public async removeMember(groupId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to remove member: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }
}

export default GroupService.getInstance(); 