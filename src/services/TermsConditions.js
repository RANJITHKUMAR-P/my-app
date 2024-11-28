import { Collections } from '../config/constants'
import { db } from '../config/firebase'
import { updatationData } from './common'

export const GetTermsandConditions = async hotelId => {
  let TermsandConditions = ''
  try {
    const doc = await db.collection(Collections.TERMSANDCONDITIONS).doc(hotelId).get()

    if (doc) TermsandConditions = doc.data()?.text || ''
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
  }
  return TermsandConditions
}

export const SaveTermsAndConditions = async (hotelId, text) => {
  try {
    await db
      .collection(Collections.TERMSANDCONDITIONS)
      .doc(hotelId)
      .set({ text, ...updatationData() })
    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}
