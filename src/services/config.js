import { actions } from '../Store'
import { Collections, unsubscribeList } from '../config/constants'
import { auth, db } from '../config/firebase'

const hotelAdminConfigKey = 'hotel-admin-configuration'

export async function getFirestoreConfig() {
  let config = { translationVersion: '1.0.0' }
  try {
    const configCollectionRef = db.collection(Collections.CONFIG)
    const firestoreConfig = await configCollectionRef
      .doc(hotelAdminConfigKey)
      .get()

    if (firestoreConfig.exists) {
      config = firestoreConfig.data()
    } else {
      const configDoc = configCollectionRef.doc(hotelAdminConfigKey)
      await configDoc.set(config)
    }
  } catch (error) {
    console.log('🚀 ', error)
  }
  return config
}

export async function setFirestoreConfig(data) {
  try {
    await db
      .collection(Collections.CONFIG)
      .doc(hotelAdminConfigKey)
      .update(data, { merge: true })
  } catch (error) {
    console.log('setFirestoreConfig', error)
  }
}

export function addRatingEmojiConfigListener({ dispatch }) {
  try {
    const ratingKey = 'rating'
    let collectionKey = `${Collections.CONFIG}_${ratingKey}`

    if (unsubscribeList[collectionKey] || !auth.currentUser) return

    const unsub = db
      .collection(Collections.CONFIG)
      .doc(ratingKey)
      .onSnapshot(doc => {
        if (doc.exists) {
          dispatch(actions.setRatingConfig(doc?.data()?.ratingEmoji))
        } else {
          console.error('E R R O R => update rating config in firestore')
        }
      })

    unsubscribeList[collectionKey] = unsub
  } catch (error) {
    console.log({ error })
  }
}
