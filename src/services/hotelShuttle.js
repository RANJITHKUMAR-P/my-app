import { Collections } from '../config/constants'
import { db } from '../config/firebase'
import { creationData, updatationData } from './common'

export const GetHotelShuttleSnapshot = async hotelShuttleMenuSnapshot => {
  let hotelShuttles = []
  try {
    if (hotelShuttleMenuSnapshot) {
      hotelShuttleMenuSnapshot.forEach(doc => {
        const hotelShuttle = doc.data()
        hotelShuttles.push({
          id: doc.id,
          ...hotelShuttle,
        })
      })
    }
  } catch (error) {
    console.log({ error })
  }
  return hotelShuttles
}

export const GetHotelShuttle = async hotelId => {
  let hotelShuttles = []
  try {
    const hotelShuttleSnapshot = await db
      .collection(Collections.HOTELSHUTTLE)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .get()
    if (hotelShuttleSnapshot) {
      hotelShuttles = GetHotelShuttleSnapshot(hotelShuttleSnapshot)
    }
  } catch (error) {
    console.log({ error })
  }

  return hotelShuttles
}

export const CreateNewHotelShuttle = async newHotelShuttle => {
  try {
    // add auth user to users collection in firestore
    await db
      .collection(Collections.HOTELSHUTTLE)
      .doc()
      .set({ ...newHotelShuttle, ...creationData() })

    return { success: true, message: 'Destination added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const DeleteHotelShuttle = async hotelShuttle => {
  try {
    let id = hotelShuttle.id
    await db
      .collection(Collections.HOTELSHUTTLE)
      .doc(id)
      .update({
        isDelete: true,
        ...updatationData(),
      })
    return { success: true, message: 'Destination deleted successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const EditHotelShuttle = async ({ hotelShuttle, hotelShuttleId }) => {
  try {
    await db
      .collection(Collections.HOTELSHUTTLE)
      .doc(hotelShuttleId)
      .update({
        ...hotelShuttle,
        ...updatationData(),
      })

    return { success: true, message: 'Destination edited successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}
