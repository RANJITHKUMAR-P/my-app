import { Collections } from '../config/constants'
import { db } from '../config/firebase'

export const GetRoles = async () => {
  let roles = []
  try {
    const roleSnapshot = await db.collection(Collections.ROLES).get()
    if (roleSnapshot) {
      roleSnapshot.forEach(doc => roles.push({ id: doc.id, name: doc.data().name }))
    }
  } catch (error) {
    console.log({ error })
  }
  return roles
}

export const GetRolesFromEmail = async email => {
  try {
    const userSnapshot = await db
      .collection(Collections.USERS)
      .where('email', '==', email)
      .limit(1)
      .get()
    let userRole = []
    userSnapshot.forEach(snapShot => {
      userRole.push(snapShot.data().roles)
    })
    return userRole?.length ? userRole[0] : []
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return []
  }
}

export const GetRolesFromUsername = async email => {
  try {
    const userSnapshot = await db
      .collection(Collections.USERS)
      .where('username', '==', email)
      .limit(1)
      .get()
    let userRole = []
    userSnapshot.forEach(snapShot => {
      userRole.push(snapShot.data().roles)
    })
    return userRole?.length ? userRole[0] : []
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return []
  }
}
