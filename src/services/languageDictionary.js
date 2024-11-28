import { db } from '../config/firebase'
import { Collections } from '../config/constants'
import { actions } from '../Store'

export const CreateLanguageDictionaryItem = async (name, data) => {
  try {
    await db.collection(Collections.LANGUAGEDICTIONARY).doc(name).set(data)
    return { success: true, message: 'Language Item Created successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const GetLanguageDictionary = isLanguageListenerAdded => {
  return dispatch => {
    try {
      if (!isLanguageListenerAdded) {
        dispatch(actions.setLanguageListerner(true))
        db.collection(Collections.LANGUAGEDICTIONARY).onSnapshot(querySnapshot => {
          let languageList = []
          let flatLanguageData = {}
          querySnapshot.forEach(doc => {
            languageList = [...languageList, doc.data()]
            flatLanguageData = {
              ...flatLanguageData,
              [doc.data().id]: {
                ...flatLanguageData[doc.data().id],
                translation: { ...doc.data().data },
              },
            }
          })
          dispatch(actions.setFetchLanguageDictionary({ languageList, flatLanguageData }))
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
}
