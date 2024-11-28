import { actions } from '../app/store'
import { Collections, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { Sort } from '../config/utils'
import { creationData, updationData } from './common'

export const AddSubscriptionListener = (dispatch, subscriptionListenerAdded) => {
  let collectionKey = `AddSubscriptionListener_${Collections.SUBSCRIPTION}`

  try {
    if (!subscriptionListenerAdded && !unsubscribeList[collectionKey]) {
      dispatch(actions.setSubscriptionListenerAdded(true))
      let unSub = db
        .collection(Collections.SUBSCRIPTION)
        .where('isDelete', '==', false)
        .onSnapshot(subscriptionSnapshot => {
          let subscriptions = []
          subscriptionSnapshot.forEach(doc => {
            const subscription = doc.data()
            subscriptions.push({ id: doc.id, ...subscription })
          })
          subscriptions = Sort(subscriptions, 'index')
          dispatch(actions.setSubscription(subscriptions))
        })
      unsubscribeList[collectionKey] = unSub
    }
  } catch (error) {
    console.log({ error })
  }
}

export const SaveSubscription = async (data, id) => {
  try {
    if (id) {
      await db
        .collection(Collections.SUBSCRIPTION)
        .doc(id)
        .update({ ...data, ...updationData() })
    } else {
      await db
        .collection(Collections.SUBSCRIPTION)
        .doc()
        .set({ ...data, ...creationData() })
    }
    return { success: true, message: `Subscription ${id ? 'edited' : 'added'} successfully` }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const DeleteSubscription = async (id, hotels) => {
  try {
    const batch = db.batch()

    batch.update(db.collection(Collections.SUBSCRIPTION).doc(id), {
      isDelete: true,
      ...updationData(),
    })

    hotels.forEach(h => {
      if (h.subscription === id) {
        batch.update(db.collection(Collections.HOTELS).doc(h.id), {
          subscription: '',
          ...updationData(),
        })
      }
    })

    await batch.commit()
    return { success: true, message: `Subscription deleted successfully` }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}
