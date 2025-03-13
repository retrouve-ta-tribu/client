// Mock data for friends
const mockFriends = [
  { id: '1', firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@example.com', picture: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', firstName: 'Jean', lastName: 'Martin', email: 'jean.martin@example.com', picture: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '3', firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@example.com', picture: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '4', firstName: 'Thomas', lastName: 'Petit', email: 'thomas.petit@example.com', picture: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: '5', firstName: 'Camille', lastName: 'Dubois', email: 'camille.dubois@example.com', picture: 'https://randomuser.me/api/portraits/women/3.jpg' },
];

export interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
}

class FriendService {
  private static instance: FriendService;

  private constructor() {}

  public static getInstance(): FriendService {
    if (!FriendService.instance) {
      FriendService.instance = new FriendService();
    }
    return FriendService.instance;
  }

  public getFriends(): Friend[] {
    return mockFriends;
  }

  public getFriendById(id: string): Friend | undefined {
    return mockFriends.find(friend => friend.id === id);
  }
}

export default FriendService.getInstance(); 