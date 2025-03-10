import groups from '../mocks/groups.json'
import {Group} from "./types.ts";

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