import { FC } from 'react'

/**
 * Represents a user's basic profile information
 * @property id - The unique identifier of the user
 * @property name - The name of the user
 * @property groupName - The name of the group the user is a member of
 */
interface User {
  id: string;
  name: string;
  groupName: string;
}

/**
 * Props for the UserProfile component that displays user profile information
 * @property user - The user object containing profile information
 */
interface UserProfileProps {
  user: User;
}

const UserProfile: FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="flex items-center mb-6">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
        <span className="text-blue-500 text-2xl">
          {user.name.charAt(0)}
        </span>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{user.name}</h1>
        <p className="text-sm text-gray-500">Member of {user.groupName}</p>
      </div>
    </div>
  );
};

export default UserProfile; 