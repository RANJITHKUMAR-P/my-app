import { Collections } from '../config/constants'
import { db } from '../config/firebase'
import { creationData } from './common'

export const GetPrivacyPolicy = async hotelId => {
  let privacyPolicy = ''

  try {
    const doc = await db.collection(Collections.PRIVACYPOLICY).doc(hotelId).get()

    if (doc) privacyPolicy = doc.data()?.text || ''
  } catch (error) {
    console.log(error?.message)
    console.log({ error })
  }
  return privacyPolicy
}

export const SavePrivacyPolicy = async (hotelId, text) => {
  try {
    await db
      .collection(Collections.PRIVACYPOLICY)
      .doc(hotelId)
      .set({ text, ...creationData() })
    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}
