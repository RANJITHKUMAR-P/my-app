import axios from 'axios'
import {
  APIs,
  Collections,
  loadProgress,
  PAGELOADER,
  searchingDomainMessages,
  unsubscribeList,
  resActionType,
} from '../config/constants'
import { auth, db, firebase, timestampNow } from '../config/firebase'
import {
  getHotelOverallFeedbackQuestions,
  stringToGeoPoint,
} from '../config/utils'
import { actions } from '../Store'
import { DeleteFile, UploadFile, updatationData, creationData } from './common'
import { GetCurrentUser } from './user'
const MAX_FILE_SIZE = 2 * 1024 * 1024

export function isFileSizeValid(file) {
  return file.size <= MAX_FILE_SIZE
}
const GetHotelInfoFromDoc = doc => ({ hotelId: doc.id, ...doc.data() })

export const GetHotelDetailsFromEmail = async (email, dispatch) => {
  try {
    if (!email) return

    const hotelSnapshot = await db
      .collection(Collections.HOTELS)
      .where('adminEmail', '==', email)
      .where('isDelete', '==', false)
      .limit(1)
      .get()
    let hotelInfo = null
    if (hotelSnapshot.size) {
      for (const hotelDoc of hotelSnapshot.docs) {
        hotelInfo = GetHotelInfoFromDoc(hotelDoc)

        const subDomainDoc = await db
          .collection(Collections.DOMAIN)
          .doc(hotelInfo.hotelId)
          .get()
        const { subDomain, hotelLogo, hotelWallpaper } = subDomainDoc.data()

        dispatch(actions.setHotelInfo(hotelInfo))
        dispatch(actions.setSubDomain(subDomain))
        dispatch(actions.setHotelLogo({ hotelLogo, hotelWallpaper }))

        break
      }
    }
    return hotelInfo
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return {}
  }
}

export let unSubDomain = null
export const CurrentHotelListener = async (hotelId, dispatch) => {
  let subscriptionName = ''
  try {
    let collectionKey1 = `CurrentHotelListener_${Collections.HOTELS}`

    if (!unsubscribeList[collectionKey1] && hotelId && auth?.currentUser) {
      dispatch(
        actions.setSearchingHotel({
          searchingHotel: loadProgress.LOADING,
          searchingHotelMessage: searchingDomainMessages.LOADING,
        })
      )

      let unSubHotel = db
        .collection(Collections.HOTELS)
        .doc(hotelId)
        .onSnapshot(async doc => {
          const hotelInfo = GetHotelInfoFromDoc(doc)
          const subscriptionId = hotelInfo.subscription
          if (subscriptionId) {
            let subscriptionDoc = await db
              .collection(Collections.SUBSCRIPTION)
              .doc(hotelInfo.subscription)
              .get()
            if (subscriptionDoc.data()) {
              subscriptionName = subscriptionDoc.data().name
            }
          }
          dispatch(
            actions.setHotelInfo({
              ...hotelInfo,
              subscription: subscriptionName,
            })
          )
          dispatch(
            actions.setSearchingHotel({
              searchingHotel: loadProgress.LOADED,
              searchingHotelMessage: searchingDomainMessages.SUCCESS,
            })
          )
        })

      unsubscribeList[collectionKey1] = unSubHotel
    }
  } catch (error) {
    console.log(error)
    dispatch(
      actions.setSearchingHotel({
        searchingHotel: loadProgress.LOADED,
        searchingHotelMessage: searchingDomainMessages.INVALID,
      })
    )
  }

  try {
    if (hotelId && (!unSubDomain || !unSubGetLogo)) {
      dispatch(actions.setPageLoading(PAGELOADER.WAITING))
      let searchingDomainData = {
        searchingDomain: loadProgress.LOADING,
        searchingDomainMessage: searchingDomainMessages.LOADING,
      }

      unSubDomain = db
        .collection(Collections.DOMAIN)
        .doc(hotelId)
        .onSnapshot(doc => {
          let subDomain = ''
          let hotelLogo = ''
          let hotelWallpaper = ''

          searchingDomainData['searchingDomain'] = loadProgress.LOADED

          if (doc?.data()?.subDomain) {
            const data = doc?.data()
            subDomain = data?.subDomain
            hotelLogo = data?.hotelLogo
            hotelWallpaper = data?.hotelWallpaper
            searchingDomainData['searchingDomainMessage'] =
              searchingDomainMessages.SUCCESS
          } else {
            searchingDomainData['searchingDomainMessage'] =
              searchingDomainMessages.NOT_AVAILABLE
          }

          dispatch(actions.setSubDomain(subDomain))
          dispatch(actions.setSearchingDomain(searchingDomainData))
          dispatch(actions.setHotelLogo({ hotelLogo, hotelWallpaper }))
          dispatch(actions.setPageLoading(PAGELOADER.LOADED))
        })
    }
  } catch (error) {
    console.log('110', error)
  }
}
export const fetchCustomDepartmentImages = async hotelId => {
  try {
    const hotelDoc = await db.collection(Collections.HOTELS).doc(hotelId).get()
    const customImages = hotelDoc.data()?.CustomDepartmentImage || {}
    return { success: true, data: customImages }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
export const fetchCustomServiceImages = async hotelId => {
  try {
    const hotelDoc = await db.collection(Collections.HOTELS).doc(hotelId).get()
    const customserviceImages = hotelDoc.data()?.CustomServiceImage || {}
    return { success: true, data: customserviceImages }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
export const uploadCustomDepartmentImage = async (
  hotelId,
  departmentId,
  imageFile,
  departmentName,
  dispatch
) => {
  try {
    if (!isFileSizeValid(imageFile)) {
      return { success: false, error: 'Image size should not exceed 2MB' }
    }
    const imageUrl = await UploadFile(imageFile, `${hotelId}/departmentImages`)

    let updateObject = {
      [`CustomDepartmentImage.${departmentId}`]: imageUrl.downloadUrl,
    }

    if (departmentName === 'Engineering & Maintenance') {
      updateObject['CustomDepartmentImage.engineeringAndMaintenance'] =
        imageUrl.downloadUrl
    }

    await db
      .collection(Collections.HOTELS)
      .doc(hotelId)
      .update({
        ...updateObject,
        ...updatationData(),
      })

    dispatch(
      actions.setCustomDepartmentImage({
        departmentId,
        imageUrl: imageUrl.downloadUrl,
      })
    )

    if (departmentName === 'Engineering & Maintenance') {
      dispatch(
        actions.setCustomDepartmentImage({
          departmentId: 'engineeringAndMaintenance',
          imageUrl: imageUrl.downloadUrl,
        })
      )
    }

    return { success: true, imageUrl: imageUrl.downloadUrl }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
export const uploadCustomServiceImage = async (
  hotelId,
  serviceName,
  imageFile,
  dispatch
) => {
  try {
    console.log('Starting image upload for service:', serviceName)

    if (typeof serviceName !== 'string') {
      throw new Error('Service name must be a string')
    }
    if (!isFileSizeValid(imageFile)) {
      return { success: false, error: 'Image size should not exceed 2MB' }
    }
    const imageUrl = await UploadFile(imageFile, `${hotelId}/serviceImages`)
    console.log('Image uploaded, URL:', imageUrl.downloadUrl)

    const removeSpecialCharacters = str => {
      return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    }

    const formattedServiceName = removeSpecialCharacters(serviceName)

    console.log('formatted', formattedServiceName)
    console.log('service', serviceName)

    let updateObject = {
      [`CustomServiceImage.${formattedServiceName}`]: imageUrl.downloadUrl,
    }

    console.log('Updating Firestore with:', updateObject)

    await db
      .collection(Collections.HOTELS)
      .doc(hotelId)
      .update({
        ...updateObject,
        ...updatationData(),
      })

    console.log('Firestore updated successfully')

    dispatch(
      actions.setCustomServiceImage({
        serviceName: formattedServiceName,
        imageUrl: imageUrl.downloadUrl,
      })
    )

    console.log('Redux store updated')

    return { success: true, imageUrl: imageUrl.downloadUrl }
  } catch (error) {
    console.error('Error uploading custom service image:', error)
    return { success: false, error: error.message || 'Unknown error occurred' }
  }
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
export const deleteCustomDepartmentImage = async (
  hotelId,
  departmentId,
  departmentName,
  dispatch
) => {
  try {
    let updateObject = {}

    if (departmentName === 'Engineering & Maintenance') {
      updateObject = {
        [`CustomDepartmentImage.${departmentId}`]:
          firebase.firestore.FieldValue.delete(),
        'CustomDepartmentImage.engineeringAndMaintenance':
          firebase.firestore.FieldValue.delete(),
        'CustomDepartmentImage.Engineering & Maintenance':
          firebase.firestore.FieldValue.delete(),
      }
    } else {
      updateObject[`CustomDepartmentImage.${departmentId}`] =
        firebase.firestore.FieldValue.delete()
    }

    await db
      .collection(Collections.HOTELS)
      .doc(hotelId)
      .update({
        ...updateObject,
        ...updatationData(),
      })

    dispatch(actions.deleteCustomDepartmentImage(departmentId))
    if (departmentName === 'Engineering & Maintenance') {
      dispatch(actions.deleteCustomDepartmentImage('engineeringAndMaintenance'))
      dispatch(actions.deleteCustomDepartmentImage('Engineering & Maintenance'))
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
export const deleteCustomServiceImage = async (
  hotelId,
  serviceName,
  dispatch
) => {
  try {
    console.log('Deleting custom service image for:', serviceName)
    const removeSpecialCharacters = str => {
      return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    }

    const formattedServiceName = removeSpecialCharacters(serviceName)

    const updateObject = {
      [`CustomServiceImage.${formattedServiceName}`]:
        firebase.firestore.FieldValue.delete(),
    }

    await db
      .collection(Collections.HOTELS)
      .doc(hotelId)
      .update({
        ...updateObject,
        ...updatationData(),
      })

    console.log('Custom service image deleted from Firestore')

    dispatch(actions.deleteCustomServiceImage(formattedServiceName))

    console.log('Redux store updated')

    return { success: true }
  } catch (error) {
    console.error('Error deleting custom service image:', error)
    return { success: false, error: error.message || 'Unknown error occurred' }
  }
}

let unSubGetLogo = null
export const GetHotelLogo = async dispatch => {
  if (unSubGetLogo || unSubDomain) return
  try {
    const { pathname } = window.location
    const subDomain = pathname.replace('/SignIn', '').replace('/', '')

    if (subDomain) {
      dispatch(actions.setGettingHotelLogo(true))
      dispatch(actions.setPageLoading(PAGELOADER.WAITING))
      dispatch(actions.setSubDomain(subDomain))
      let unsub = await db
        .collection(Collections.DOMAIN)
        .where('subDomain', '==', subDomain)
        .where('isDelete', '==', false)
        .onSnapshot(domainSnapshot => {
          let hotelLogo = null
          let hotelWallpaper = null
          let subDoaminNotFound = true

          if (domainSnapshot.docs) {
            for (const domain of domainSnapshot.docs) {
              let domainData = { ...domain.data(), id: domain.id }
              hotelLogo = domainData.hotelLogo
              hotelWallpaper = domainData.hotelWallpaper
              subDoaminNotFound = false
              dispatch(
                actions.setSearchingDomain({
                  searchingDomain: loadProgress.LOADED,
                  searchingDomainMessage: searchingDomainMessages.SUCCESS,
                })
              )
              const { id: hotelId, groupId } = domainData
              dispatch(actions.setHotelInfo({ hotelId, groupId }))
            }
          }

          dispatch(actions.setPageLoading(PAGELOADER.LOADED))
          dispatch(actions.setHotelLogo({ hotelLogo, hotelWallpaper }))
          dispatch(actions.setSubDomainNotFound(subDoaminNotFound))
        })

      unSubGetLogo = unsub
    }
  } catch (error) {
    console.log('🚀 ', error)
    dispatch(
      actions.setSearchingDomain({
        searchingDomain: loadProgress.LOADED,
        searchingDomainMessage: searchingDomainMessages.NOT_AVAILABLE,
      })
    )
  }
}

export const EditHotelProfile = async (
  profileImage,
  newHotel,
  profileImageUrl,
  hotelImageName,
  deleteProfileImage,
  hotelId
) => {
  try {
    // delete old profile image
    let newHotelImageUrl = profileImageUrl
    let newHotelImageName = hotelImageName
    if (hotelImageName && (deleteProfileImage || profileImage)) {
      newHotelImageUrl = ''
      newHotelImageName = ''
      await DeleteFile(hotelImageName)
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
      newHotelImageUrl = downloadUrl
      newHotelImageName = imageName
    }
    if (newHotel?.wallpaper?.length) {
      const wallpaper = newHotel.wallpaper
      await db
        .collection(Collections.DOMAIN)
        .doc(hotelId)
        .update({
          hotelLogo: newHotelImageUrl,
          hotelWallpaper: wallpaper,
          ...updatationData(),
        })
    }
    if (newHotel.coordinates) {
      let coo = stringToGeoPoint(newHotel.coordinates)
      newHotel.coordinates = new firebase.firestore.GeoPoint(
        coo.latitude,
        coo.longitude
      )
    }
    // update profile data

    await updateHotelData(hotelId, {
      ...newHotel,
      hotelLogo: newHotelImageUrl,
      hotelLogoImageName: newHotelImageName,
    })

    return { success: true, message: 'User added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const GetHotelByEmailID = async (email, dispatch) => {
  try {
    if (!email) return
    let res = await axios.post(APIs.GET_HOTEL_BY_EMAILID, { email })
    if (res?.data?.data) {
      const { subDomain, hotelLogo, hotelWallpaper } = res.data.data
      dispatch(actions.setSubDomain(subDomain))
      dispatch(actions.setHotelLogo({ hotelLogo, hotelWallpaper }))
      return true
    }
    return false
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return false
  }
}

export const uploadHotelGuideLine = async (
  oldFiles = [],
  files = [],
  hotelId = ''
) => {
  if (!hotelId)
    return {
      success: false,
      message: 'Hotel Id is required',
      type: resActionType.error,
    }
  try {
    const hotelGuideLineFiles = []
    const directory = `${hotelId}/hotelGuideLines`
    for (const file of files) {
      const { fileName, downloadUrl, success, id, dir, type } =
        await UploadFile(file, directory)
      if (!success)
        return {
          success: false,
          message: "File couldn't be uploaded, Please try again!",
          type: resActionType.error,
        }
      hotelGuideLineFiles.push({
        id,
        dir,
        type,
        name: fileName,
        url: downloadUrl,
        createdAt: timestampNow(),
      })
    }

    let newFiles = [...oldFiles, ...hotelGuideLineFiles]

    await saveHotelGuideLine(hotelId, newFiles)

    return {
      success: true,
      message: 'File added successfully',
      type: resActionType.success,
    }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return {
      success: false,
      message: error?.message,
      type: resActionType.error,
    }
  }
}

export let unSubHotelGuideLinesListener = null
export const hotelGuideLinesListener = (dispatch, hotelId) => {
  if (unSubHotelGuideLinesListener || !hotelId) return
  try {
    unSubHotelGuideLinesListener = db
      .collection(Collections.HOTELS)
      .doc(hotelId)
      .collection(Collections.HOTELGUIDELINES)
      .doc(hotelId)
      .onSnapshot(doc => {
        dispatch(
          actions.setHotelGuideLines({
            data: doc?.data()?.files || [],
            loadingStatus: loadProgress.LOADED,
          })
        )
      })
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const deleteHotelGuideLineFile = async (oldFiles, file, hotelId) => {
  if (!file || !hotelId)
    return { success: false, message: 'File Id and Hotel Id is required' }
  try {
    const directory = file?.dir?.split('/').splice(0, 2).join('/')
    const fileName = file?.dir?.split('/').splice(2, 1).join('')
    const { success, message } = await DeleteFile(fileName, directory)

    let newFiles = [...oldFiles]
    newFiles.splice(file.idx, 1)

    await saveHotelGuideLine(hotelId, newFiles)

    return {
      success: true,
      message: 'File deleted successfully',
      type: resActionType.success,
      deleteFromStorage: { success, message },
    }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return {
      success: false,
      message: error?.message,
      type: resActionType.error,
    }
  }
}

async function saveHotelGuideLine(hotelId, newFiles) {
  try {
    await db
      .collection(Collections.HOTELS)
      .doc(hotelId)
      .collection(Collections.HOTELGUIDELINES)
      .doc(hotelId)
      .set({ files: newFiles })
  } catch (error) {
    console.log({ error })
  }
}

export const updateHotelData = async (hotelId, data) => {
  try {
    await db
      .collection(Collections.HOTELS)
      .doc(hotelId)
      .update({
        ...data,
        ...updatationData(),
      })
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export function getUserAssociatedHotels({ hotelId, dispatch }) {
  try {
    const userId = GetCurrentUser()?.uid
    let collectionKey = `getUserHotels${Collections.HOTELS}`

    if (!userId && !unsubscribeList[collectionKey]) return

    let unSubHotel = db
      .collectionGroup(Collections.USERHOTELS)
      .where('userId', '==', userId)
      .where('isDelete', '==', false)
      .onSnapshot(async hotelSnapshot => {
        let hotelsByGroupId = []
        for (const docs of hotelSnapshot.docs) {
          const { hotelId: currHotelId, hotelStatus, status } = docs.data()
          if (
            hotelId === currHotelId ||
            hotelStatus === 'inactive' ||
            status === 'inactive'
          )
            continue
          hotelsByGroupId.push(docs.data())
        }
        dispatch(actions.setHotelsByGroupId(hotelsByGroupId))
      })
    unsubscribeList[collectionKey] = unSubHotel
  } catch (error) {
    console.error(error)
  }
}

export const GetHotelDataByHotelId = async (hotelId, dispatch) => {
  if (!hotelId || !auth?.currentUser) return

  try {
    let subscriptionName = ''
    let hotelDoc = await db.collection(Collections.HOTELS).doc(hotelId).get()

    const hotelInfo = GetHotelInfoFromDoc(hotelDoc)
    const subscriptionId = hotelInfo.subscription
    if (subscriptionId) {
      let subscriptionDoc = await db
        .collection(Collections.SUBSCRIPTION)
        .doc(hotelInfo.subscription)
        .get()
      if (subscriptionDoc.data()) {
        subscriptionName = subscriptionDoc.data().name
      }
    }

    dispatch(actions.reset({ setLogout: false }))
    dispatch(
      actions.setHotelInfo({ ...hotelInfo, subscription: subscriptionName })
    )
  } catch (error) {
    console.error(error)
  }

  try {
    let subDomainDoc = await db
      .collection(Collections.DOMAIN)
      .doc(hotelId)
      .get()

    let subDomain = ''
    let hotelLogo = ''
    let hotelWallpaper = ''

    if (subDomainDoc?.data()?.subDomain) {
      const data = subDomainDoc?.data()
      subDomain = data?.subDomain
      hotelLogo = data?.hotelLogo
      hotelWallpaper = data?.hotelWallpaper
    }

    dispatch(actions.setSubDomain(subDomain))
    dispatch(actions.setHotelLogo({ hotelLogo, hotelWallpaper }))
  } catch (error) {
    console.error('110', error)
  }
}

export const hotelOverAllFeedbackQuestionListener = (dispatch, hotelId) => {
  let collectionKey = `hotelOverAllFeedbackQuestionListener`
  if (!hotelId || unsubscribeList[collectionKey]) return

  const setFunc = actions.setOverAllFeedbackQuestion
  try {
    dispatch(
      setFunc({
        loadingStatus: loadProgress.LOADING,
      })
    )
    let sub = getHotelOverallFeedbackQuestions(hotelId)
      .where('isDelete', '==', false)
      .onSnapshot(snapShot => {
        setData(snapShot, setFunc, dispatch)
      })

    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    dispatch(setFunc({ loadingStatus: loadProgress.LOADED }))
    return { success: false, message: error?.message }
  }
}

export const deleteHotelOverAllFeedbackQuestion = async ({
  hotelId,
  updatedQuestionList = [],
}) => {
  if (!hotelId || !updatedQuestionList?.length)
    return { success: false, message: 'Error' }
  try {
    let promiseArray = []

    for (const ques of updatedQuestionList) {
      promiseArray.push(
        saveHotelOverAllFeedbackQuestion({
          hotelId,
          questionId: ques.id,
          data: { isDelete: ques.isDelete, index: ques.index },
        })
      )
    }

    await Promise.all(promiseArray)

    return {
      success: true,
      message: 'Overall feedback question deleted successfully.',
      type: resActionType.success,
    }
  } catch (error) {
    return {
      success: false,
      message: error?.message,
      type: resActionType.error,
    }
  }
}

export async function saveHotelOverAllFeedbackQuestion({
  hotelId = '',
  questionId = '',
  data = {},
}) {
  let response = {
    success: true,
    message: 'Overall feedback question saved successfully.',
    type: resActionType.success,
  }
  try {
    if (questionId) {
      await getHotelOverallFeedbackQuestions(hotelId, questionId).update({
        ...data,
        ...updatationData(),
      })
    } else {
      const docRef = getHotelOverallFeedbackQuestions(hotelId).doc()
      await getHotelOverallFeedbackQuestions(hotelId)
        .doc(docRef.id)
        .set({
          id: docRef.id,
          hotelId,
          refDocId: '',
          isDefault: false,
          isDelete: false,
          ...data,
          ...creationData(),
        })
    }

    response.message = 'Overall feedback question updated successfully.'
  } catch (error) {
    console.log({ error })
    response.success = false
    response.message = 'Error'
    response.type = resActionType.error
  }

  return response
}

export const hotelFeedbacksListener = (dispatch, hotelId) => {
  let collectionKey = `hotelFeedbacksListener`
  if (!hotelId || unsubscribeList[collectionKey]) return
  const setFunc = actions.setHotelFeedbacks

  try {
    dispatch(
      setFunc({
        loadingStatus: loadProgress.LOADING,
      })
    )
    let sub = db
      .collection(Collections.HOTELS)
      .doc(hotelId)
      .collection(Collections.HOTELFEEDBACKS)
      .onSnapshot(snapShot => {
        setData(snapShot, setFunc, dispatch)
      })

    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.error({ error })
    dispatch(setFunc({ loadingStatus: loadProgress.LOADED }))
    return { success: false, message: error?.message }
  }
}

function setData(snapShot, setFunc, dispatch) {
  let data = {}

  for (const doc of snapShot.docs) {
    data[doc.id] = { id: doc.id, ...doc.data() }
  }

  dispatch(setFunc({ data, loadingStatus: loadProgress.LOADED }))
}
