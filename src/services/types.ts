export interface Member {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  _id: {
    $oid: string;
  };
  name: string;
  members: Member[];
}

export interface UserPosition {
  latitude: number;
  longitude: number;
  userId: string;
  timestamp: number;
}