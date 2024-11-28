import { Collections } from '../config/constants'
import { db, FieldValue } from '../config/firebase'
import { creationData, updatationData } from './common'
import CuisineTypes from '../config/cuisineTypes'
import { Sort } from '../config/utils'

export const GetCuisineMenuSnapshot = async cuisineMenuSnapshot => {
  let cuisineMenus = []
  try {
    if (cuisineMenuSnapshot) {
      cuisineMenuSnapshot.forEach(doc => {
        const cuisineMenu = doc.data()
        cuisineMenus.push({
          id: doc.id,
          ...cuisineMenu,
        })
      })
    }
  } catch (error) {
    console.log({ error })
  }
  return cuisineMenus
}

export const GetCuisineMenu = async hotelId => {
  let cuisineMenus = []
  try {
    const cuisineMenuSnapshot = await db
      .collection(Collections.CUISINEMENU)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .get()
    if (cuisineMenuSnapshot) {
      cuisineMenus = GetCuisineMenuSnapshot(cuisineMenuSnapshot)
    }
  } catch (error) {
    console.log({ error })
  }

  return cuisineMenus
}

export const GetCuisineType = async hotelId => {
  const cuisineMenus = await GetCuisineMenu(hotelId)
  let firestoreCuisine = []
  const defaultCuisineTypes = [...CuisineTypes]
  try {
    cuisineMenus.forEach(cuisine =>
      firestoreCuisine.push({ id: cuisine.cuisineName, name: cuisine.cuisineName })
    )
    for (let i = 0, len = firestoreCuisine.length; i < len; i++) {
      for (let j = 0, len2 = defaultCuisineTypes.length; j < len2; j++) {
        if (firestoreCuisine[i].name === defaultCuisineTypes[j].name) {
          defaultCuisineTypes.splice(j, 1)
          len2 = defaultCuisineTypes.length
        }
      }
    }
  } catch (error) {
    console.log({ error })
  }
  return defaultCuisineTypes
}

export const CreateNewCuisine = async newCuisine => {
  try {
    // add auth user to users collection in firestore
    await db
      .collection(Collections.CUISINEMENU)
      .doc()
      .set({ ...newCuisine, ...creationData() })

    return { success: true, message: 'Cuisine added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const DeleteCuisineProfile = async cuisine => {
  try {
    let hotelId = cuisine.hotelId
    let cuisineTypeVal = cuisine.id
    let i
    const { success } = await cuisineDelete(cuisine)
    if (success) {
      await db
        .collection(Collections.RESTAURANT)
        .where('hotelId', '==', hotelId)
        .where('cuisineType', 'array-contains', cuisineTypeVal)
        .get()
        .then(query => {
          for (i = 0; i < query.docs.length; i++) {
            const thing = query.docs[i]
            thing.ref.update({
              cuisineType: FieldValue.arrayRemove(cuisineTypeVal),
              ...updatationData(),
            })
          }
        })
      return { success: true, message: 'Cuisine deleted successfully' }
    }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}
export const cuisineDelete = async cuisine => {
  try {
    db.collection(Collections.CUISINEMENU)
      .doc(cuisine.id)
      .update({ isDelete: true, ...updatationData() })
    return { success: true, message: 'Cuisine deleted successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const EditCuisine = async ({ cuisine, cuisineId }) => {
  try {
    // update profile data
    await db
      .collection(Collections.CUISINEMENU)
      .doc(cuisineId)
      .update({
        ...cuisine,
        ...updatationData(),
      })

    return { success: true, message: 'Cuisine edited successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}
export const GetCuisineList = cuisineLists => {
  let cuisineName = []
  cuisineLists.map(cuisineList =>
    cuisineName.push({ name: cuisineList.cuisineName, id: cuisineList.id })
  )
  cuisineName = cuisineName.filter(function (elem, pos) {
    return cuisineName.indexOf(elem) === pos
  })
  return Sort(cuisineName, 'name')
}

export const GetCuisineNameList = cuisineLists => {
  let cuisineName = []
  cuisineLists.map(cuisineList => cuisineName.push(cuisineList.cuisineName))
  return cuisineName.filter(function (elem, pos) {
    return cuisineName.indexOf(elem) === pos
  })
}
