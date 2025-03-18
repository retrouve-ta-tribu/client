/**
 * Represents a member of a group with their basic information
 * @property id - Unique identifier of the member
 * @property name - Display name of the member
 * @property email - Email address of the member
 */
export interface Member {
  id: string;
  googleId: string;
  displayName: string;
  email: string;
  picture: string;
}

/**
 * Represents a group with its basic information and members
 * @property _id - Unique identifier object of the group
 * @property name - Name of the group
 * @property members - Array of members in the group
 */
export interface Group {
  _id: {
    $oid: string;
  };
  name: string;
  members: Member[];
}

/**
 * Represents a user's geographical position at a specific time
 * @property latitude - Geographical latitude coordinate
 * @property longitude - Geographical longitude coordinate
 * @property userId - Unique identifier of the user
 * @property timestamp - Unix timestamp of when the position was recorded
 */
export interface UserPosition {
  latitude: number;
  longitude: number;
  userId: string;
  timestamp: number;
}

/**
 * Represents a message in a chat
 * @property userId - Unique identifier of the user who sent the message
 * @property content - Content of the message
 * @property timestamp - Unix timestamp of when the message was sent
 * @property userName - Display name of the user who sent the message
 * @property userPicture - URL of the user's profile picture
 */
export interface ChatMessage {
  userId: string;
  content: string;
  timestamp: number;
  userName?: string;
  userPicture?: string;
}

/**
 * Represents a user's authentication profile
 * @property id - The user's Google ID
 * @property name - The user's display name
 * @property email - The user's email address
 * @property picture - The user's profile picture URL
 */
export interface AuthProfile {
    id: string;
    name: string;
    email: string;
    picture: string;
}

/**
 * Represents a point of interest in a group
 * @property _id - Unique identifier of the point
 * @property name - Name of the point of interest
 * @property location - GeoJSON Point location
 */
export interface PointOfInterest {
    _id: string;
    name: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
}