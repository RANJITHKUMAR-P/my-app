//fetchHotelLocationTypes

import { actions } from '../Store'
import { Collections, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { creationData, updatationData } from './common'
import { Ternary } from '../config/utils'

const { LOCATIONTYPES, HOTELLOCATIONTYPES, LOCATIONS, HOTELLOCATIONS } =
  Collections

export const fetchHotelLocations = ({ dispatch, hotelId }) => {
  try {
    const collectionKey = `fetchHotelLocations-${LOCATIONS}${hotelId}${HOTELLOCATIONS}`
    if (unsubscribeList[collectionKey] || !hotelId) return

    let unSub = db
      .collection(LOCATIONS)
      .doc(hotelId)
      .collection(HOTELLOCATIONS)
      .where('isDelete', '==', false)
      .onSnapshot(snapshot => {
        let locationIdToInfo = {}

        for (const doc of snapshot.docs) {
          locationIdToInfo[doc.id] = { id: doc.id, ...doc.data() }
        }

        dispatch(actions.setLocations(locationIdToInfo))
      })
    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.log({ error })
  }
}

export const saveLocation = async (location, isEdit, isLocationTypeUsed) => {
  let message = 'Something went wrong'
  if (!location.hotelId) return { success: false, message }

  try {
    let locationRef = db
      .collection(LOCATIONS)
      .doc(location.hotelId)
      .collection(HOTELLOCATIONS)

    if (isEdit) {
      if (!location.id) return { success: false, message }
      await locationRef
        .doc(location.id)
        .update({ ...location, ...updatationData() })
    } else {
      const docRef = locationRef.doc()
      await locationRef.doc(docRef.id).set({
        ...location,
        locationId: docRef.id,
        isLocationUsed: false,
        ...creationData(),
      })
    }

    if (!isLocationTypeUsed) {
      await db
        .collection(LOCATIONTYPES)
        .doc(location.hotelId)
        .collection(HOTELLOCATIONTYPES)
        .doc(location.locationTypeId)
        .update({
          isLocationTypeUsed: true,
          ...updatationData(),
        })
    }
    message = `Location name ${Ternary(
      !isEdit,
      'saved',
      'updated'
    )} successfully.`
    return { success: true, message }
  } catch (error) {
    console.log({ error })
    return { success: false, message }
  }
}

export const deleteLocation = async locationData => {
  let message = 'Something went wrong'
  if (!locationData.hotelId || !locationData.id)
    return { success: false, message }
  try {
    await db
      .collection(LOCATIONS)
      .doc(locationData?.hotelId)
      .collection(HOTELLOCATIONS)
      .doc(locationData?.id)
      .update({ isDelete: true, ...updatationData() })
    return { success: true, message: `Location name deleted successfully.` }
  } catch (error) {
    console.log({ error })
    return { success: false, message }
  }
}

export const fetchHotelLocationTypes = ({ dispatch, hotelId }) => {
  try {
    const collectionKey = `fetchHotelLocationTypes-${LOCATIONTYPES}${hotelId}${HOTELLOCATIONTYPES}`
    if (unsubscribeList[collectionKey] || !hotelId) return

    let unSub = db
      .collection(LOCATIONTYPES)
      .doc(hotelId)
      .collection(HOTELLOCATIONTYPES)
      .where('isDelete', '==', false)
      .onSnapshot(snapshot => {
        let locationTypeIdToInfo = {}

        for (const doc of snapshot.docs) {
          locationTypeIdToInfo[doc.id] = { id: doc.id, ...doc.data() }
        }

        dispatch(actions.setLocationTypes(locationTypeIdToInfo))
      })
    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.log({ error })
  }
}

export const deleteLocationType = async locationTypeData => {
  if (!locationTypeData) return
  let message = 'Something went wrong'
  try {
    db.collection(LOCATIONTYPES)
      .doc(locationTypeData?.hotelId)
      .collection(HOTELLOCATIONTYPES)
      .doc(locationTypeData?.id)
      .update({ isDelete: true, ...updatationData() })
    return { success: true, message: `Location type deleted successfully.` }
  } catch (error) {
    console.log({ error })
    return { success: false, message }
  }
}

export const saveLocationType = async (locationTypeData, isEdit) => {
  let message = 'Something went wrong'
  if (!locationTypeData.hotelId) return { success: false, message }

  try {
    let locationTypeRef = db
      .collection(LOCATIONTYPES)
      .doc(locationTypeData.hotelId)
      .collection(HOTELLOCATIONTYPES)

    locationTypeData = {
      ...locationTypeData,
      refDocId: '',
      isDefault: false,
      isDelete: false,
    }

    if (isEdit) {
      if (!locationTypeData.id) return { success: false, message }
      await locationTypeRef
        .doc(locationTypeData.id)
        .update({ ...locationTypeData, ...updatationData() })
    } else {
      const docRef = locationTypeRef.doc()
      await locationTypeRef.doc(docRef.id).set({
        ...locationTypeData,
        ...creationData(),
      })
    }

    message = `Location type ${Ternary(
      !isEdit,
      'saved',
      'updated'
    )} successfully.`
    return { success: true, message }
  } catch (error) {
    console.log({ error })
    return { success: false, message }
  }
}

export const fetchAllHotelLocations = ({ dispatch, hotelId }) => {
  try {
    const collectionKey = `fetchAllHotelLocations-${hotelId}`

    if (unsubscribeList[collectionKey] || !hotelId) return

    let unSub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .onSnapshot(snapshot => {
        if (!snapshot || !snapshot.docs) {
          dispatch(actions.setAllLocationsReports([]))
          return
        }

        // Using Set for unique locationNames
        const uniqueLocations = new Set()

        snapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data?.isGuestRequest == false) {
            uniqueLocations.add(data.locationName)
          }
          if (data?.isGuestRequest == true) {
            uniqueLocations.add(data.roomNumber)
          }
        })

        // Convert to sorted array for Select component
        const sortedLocations = Array.from(uniqueLocations).sort()
        dispatch(actions.setAllLocationsReports(sortedLocations))
      })

    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.error('Error setting up locations listener:', error)
    dispatch(actions.setAllLocationsReports([]))
  }
}
