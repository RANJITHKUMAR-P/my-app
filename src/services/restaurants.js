import moment from 'moment'
import {
  Collections,
  RestaurantLabel,
  StatusLabel,
  ratingFilterLabel,
  unsubscribeList,
} from '../config/constants'
import DepartmentAndServiceKeys from '../config/departmentAndServicekeys'
import { db } from '../config/firebase'
import {
  GetDataFromSnapshot,
  isFilterValueSelected,
  paginateQueryWithOrderBy,
} from '../config/utils'
import { actions } from '../Store'
import { DeleteFile, UploadFile, creationData, updatationData } from './common'

export const GetRestaurantsSnapshot = restaurantsSnapshot => {
  let restaurants = []
  try {
    if (restaurantsSnapshot) {
      restaurantsSnapshot.forEach(doc => {
        const restaurant = doc.data()
        restaurants.push({
          id: doc.id,
          ...restaurant,
        })
      })
    }
  } catch (error) {
    console.log({ error })
  }
  return restaurants
}

export const GetRestaurants = async hotelId => {
  let restaurants = []
  try {
    const restaurantsSnapshot = await db
      .collection(Collections.RESTAURANT)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .get()
    if (restaurantsSnapshot) {
      restaurants = GetRestaurantsSnapshot(restaurantsSnapshot)
    }
  } catch (error) {
    console.log({ error })
  }
  return restaurants
}

export const AddRestaurantListener = async (
  hotelId,
  restaurantsListenerAdded,
  dispatch
) => {
  try {
    let collectionKey = `AddRestaurantListener_${Collections.RESTAURANT}`
    if (
      hotelId &&
      !restaurantsListenerAdded &&
      !unsubscribeList[collectionKey]
    ) {
      dispatch(actions.setRestaurantsListenerAdded(true))
      dispatch(actions.setLoadingRestaurants(true))
      let unSub = db
        .collection(Collections.RESTAURANT)
        .where('hotelId', '==', hotelId)
        .where('isDelete', '==', false)
        .onSnapshot(async restaurantSnapshot => {
          const restaurants = GetRestaurantsSnapshot(restaurantSnapshot)
          dispatch(actions.setRestaurants(restaurants))
          dispatch(actions.setLoadingRestaurants(false))
        })
      unsubscribeList[collectionKey] = unSub
    }
  } catch (error) {
    console.log({ error })
  }
}

export const GetMenu = (cuisineList, restaurants) => {
  try {
    if (!restaurants?.length) return []
    let tmpfilteredRestaurant = [...restaurants]
    let cuisineIds = tmpfilteredRestaurant.flatMap(rest => rest.cuisineType)
    return cuisineList
      .filter(c => cuisineIds.includes(c.id))
      .map(c => c.name)
      .sort()
  } catch (error) {
    console.log({ error })
    return []
  }
}
export const UploadMenu = async (id, menu, hotelId) => {
  try {
    // upload menu
    let menuUrl = ''
    if (menu) {
      const {
        success: uploadSuccess,
        downloadUrl,
        message: uploadMessage,
      } = await UploadFile(menu, hotelId)
      if (!uploadSuccess) return { success: false, message: uploadMessage }
      menuUrl = downloadUrl
    }

    // add auth user to users collection in firestore
    await db
      .collection(Collections.RESTAURANT)
      .doc(id)
      .update({ menu: menuUrl, ...updatationData() })

    return { success: true, message: 'Restaurant added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}
export const UploadMenuAdvanced = async (id, menu) => {
  try {
    await db
      .collection(Collections.RESTAURANT)
      .doc(id)
      .update({ menu: menu, ...updatationData() })

    return { success: true, message: 'Menu Uploaded Successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const UpdateRestaurant = async (id, restaurant) => {
  try {
    const restaurantRef = db.collection(Collections.RESTAURANT).doc(id)
    await restaurantRef.update({ ...restaurant, ...updatationData() })
    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: 'Problem updating user!' }
  }
}

export const filteredRestaurantByStatus = async (restaurants, value) => {
  let filteredRestaurant = []
  try {
    filteredRestaurant = restaurants.filter(
      restaurant => restaurant.status === value
    )
  } catch (error) {
    console.log({ error })
  }
  return filteredRestaurant
}

export const filteredRestaurantByName = async (restaurants, value) => {
  let filteredRestaurant = []
  try {
    filteredRestaurant = restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(value.toLowerCase())
    )
  } catch (error) {
    console.log({ error })
  }
  return filteredRestaurant
}

export const filteredRestaurantByCuisine = async (restaurants, value) => {
  let filteredRestaurant = []
  try {
    filteredRestaurant = restaurants.filter(restaurant =>
      restaurant.cuisineType.toLowerCase().includes(value.toLowerCase())
    )
  } catch (error) {
    console.log({ error })
  }
  return filteredRestaurant
}

export const CreateNewRestaurant = async (profileImage, newRestaurant) => {
  try {
    // upload profile image
    let profileImageUrl = ''
    let profileImageName = ''
    if (profileImage) {
      const {
        success: uploadSuccess,
        downloadUrl,
        message: uploadMessage,
        profileImageName: imageName,
      } = await UploadFile(profileImage, 'profileImages')
      if (!uploadSuccess) return { success: false, message: uploadMessage }
      profileImageUrl = downloadUrl
      profileImageName = imageName
    }

    // add auth user to users collection in firestore
    await db
      .collection(Collections.RESTAURANT)
      .doc()
      .set({
        ...newRestaurant,
        profileImage: profileImageUrl,
        profileImageName,
        ...creationData(),
      })

    return { success: true, message: 'Restaurant added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const DeleteRestaurantProfile = async restaurant => {
  try {
    await db
      .collection(Collections.RESTAURANT)
      .doc(restaurant.id)
      .update({ isDelete: true, ...updatationData() })
    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const DeleteRestaurantMenu = async id => {
  try {
    await db
      .collection(Collections.RESTAURANT)
      .doc(id)
      .update({ menu: '', ...updatationData() })
    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const EditRestaurantProfile = async ({
  profileImage,
  restaurant,
  profileImageUrl,
  profileImageName,
  deleteProfileImage,
  restaurantId,
}) => {
  try {
    // delete old profile image
    let response
    let newProfileImageUrl = profileImageUrl
    let newProfileImageName = profileImageName
    if (profileImageName && (deleteProfileImage || profileImage)) {
      newProfileImageUrl = ''
      newProfileImageName = ''
      response = await DeleteFile(profileImageName)
      if (!response.success) {
        return { success: false, message: response.message }
      }
    }

    // update new profile Image
    if (profileImage) {
      const {
        success,
        downloadUrl,
        message,
        profileImageName: imageName,
      } = await UploadFile(profileImage, 'profileImages')
      if (!success) return { success: false, message }
      newProfileImageUrl = downloadUrl
      newProfileImageName = imageName
    }

    // update profile data
    await db
      .collection(Collections.RESTAURANT)
      .doc(restaurantId)
      .update({
        ...restaurant,
        profileImage: newProfileImageUrl,
        profileImageName: newProfileImageName,
        ...updatationData(),
      })

    return { success: true, message: 'User added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const GetRestaurant = async ({
  hotelId,
  SetFetching,
  SetData,
  page,
  startAfter,
  fetchingData,
  selectedRestaurant,
  selectedSubmittedDate,
  selectedStatus,
  filteredRating,
}) => {
  try {
    if (!hotelId || fetchingData) return

    SetFetching(true)

    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where(
        'serviceKey',
        '==',
        DepartmentAndServiceKeys.foodAndBeverage.services.restaurant.key
      )

    if (isFilterValueSelected(selectedRestaurant, RestaurantLabel)) {
      query = query.where('restaurantName', '==', selectedRestaurant)
    }

    if (isFilterValueSelected(selectedStatus, StatusLabel)) {
      query = query.where('status', '==', selectedStatus)
    }

    if (selectedSubmittedDate) {
      query = query.where(
        'createdAtDate',
        '==',
        moment(selectedSubmittedDate).startOf('day').toDate()
      )
    }

    if (isFilterValueSelected(filteredRating, ratingFilterLabel)) {
      query = query.where('rating', '==', filteredRating)
    }

    query = paginateQueryWithOrderBy({ query, page, startAfter })

    await query.get().then(snapshot => {
      SetData({
        requests: GetDataFromSnapshot(snapshot),
        snapshotDocs: snapshot.docs,
      })
    })
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}
