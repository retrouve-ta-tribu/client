import groups from '../mocks/groups.json'

export const getGroups = () => {
  return groups
} 

export const getGroupById = (id: string) => {
  return groups.find(group => group._id.$oid === id)
} 

export const getUserById = (userId: string) => {
  for (const group of groups) {
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