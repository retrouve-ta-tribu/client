import groups from '../mocks/groups.json'

export const getGroups = () => {
  return groups
} 

export const getGroupById = (id: string) => {
  return groups.find(group => group._id.$oid === id)
} 