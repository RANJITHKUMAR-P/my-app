import { Collections, translationDataKey, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { actions } from '../Store'
import { creationData, updatationData } from './common'

export const AddCuisineListener = async (hotelId, cuisineListenerAdded, dispatch) => {
  try {
    let collectionKey = `AddCuisineListener_${Collections.CUISINES}`

    if (hotelId && !cuisineListenerAdded && !unsubscribeList[collectionKey]) {
      dispatch(actions.setCuisineListenerAdded(true))
      dispatch(actions.setLoadingCuisines(true))

      let unsub = db
        .collection(Collections.CUISINES)
        .where('hotelId', '==', hotelId)
        .where('isDelete', '==', false)
        .orderBy('index')
        .onSnapshot(cuisinesSnapshot => {
          const cuisines = []
          for (const cuisine of cuisinesSnapshot.docs) {
            cuisines.push({ id: cuisine.id, ...cuisine.data() })
          }
          dispatch(actions.setCuisines(cuisines))
          dispatch(actions.setLoadingCuisines(false))
        })
      unsubscribeList[collectionKey] = unsub
    }
  } catch (error) {
    console.log({ error })
  }
}

export const SaveCuisine = async (hotelId, cuisineList) => {
  try {
    const batch = db.batch()
    const cuisinesRef = db.collection(Collections.CUISINES)
    let idx = 1
    if (cuisineList) {
      cuisineList.forEach(async cuisine => {
        const {name, imageUrl = ''} = cuisine
        if (!cuisine.id) {
          idx++
          const cuisineRef = cuisinesRef.doc()
          batch.set(cuisineRef, {
            name,
            imageUrl,
            hotelId,
            index: idx,
            [translationDataKey]: cuisine[translationDataKey] || {},
            ...creationData(),
          })
        } else if (cuisine.isDelete) {
          const cuisineRef = cuisinesRef.doc(cuisine.id)
          batch.update(cuisineRef, {
            isDelete: true,
            ...updatationData(),
          })
        } else {
          idx++
          const data = { name, imageUrl }
          if (cuisine[translationDataKey]) {
            data[translationDataKey] = cuisine[translationDataKey]
          }

          const cuisineRef = cuisinesRef.doc(cuisine.id)
          batch.update(cuisineRef, {
            ...data,
            index: idx,
            ...updatationData(),
          })
        }
      })

      await batch.commit()
      return { success: true, message: 'Cuisines updated successfully' }
    }
    return { success: false, message: 'Problem updating cuisines' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message || 'Something went wrong! Please try again!' }
  }
}
