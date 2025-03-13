import authService from './authService';

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
}

export default GroupService.getInstance(); 