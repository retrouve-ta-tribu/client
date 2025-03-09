import groups from '../mocks/groups.json'

// Define types for our data structure
interface Member {
  id: string;
  name: string;
  email: string;
}

interface Group {
  _id: {
    $oid: string;
  };
  name: string;
  members: Member[];
}

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