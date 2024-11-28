import moment from 'moment'
import unique from 'uniqid'

import { storage, storageRef } from '../config/firebase'
import { GetCurrentUser } from './user'

export const FileExists = async (fileName, directory = 'profileImages') => {
  try {
    const file = `${directory}/${fileName}`
    await storage.ref(file).getDownloadURL()
    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    return { success: false, message: error?.message }
  }
}

export const UploadFile = async (file, directory = 'profileImages') => {
  try {
    if (!directory) return { success: false, message: 'No directory provided' }
    const uniqueName = unique()
    const fileName = file?.name.split('.')[0]
    const fileExtension = file.name.split('.').pop()
    const fileNewName = `${uniqueName}.${fileExtension}`
    const fileDirectory = `${directory}/${fileNewName}`
    const fileRef = storageRef.child(fileDirectory)
    const uploadTaskSnapshot = await fileRef.put(file)
    const downloadUrl = await uploadTaskSnapshot.ref.getDownloadURL()
    return {
      success: true,
      message: '',
      profileImageName: fileNewName,
      downloadUrl,
      fileName,
      id: uniqueName,
      dir: fileDirectory,
      type: fileExtension,
    }
  } catch (error) {
    console.log({ error })
    return { success: false, downloadUrl: '', message: error?.message }
  }
}

export const DeleteFile = async (fileName, directory = 'profileImages') => {
  try {
    if (!fileName || !directory)
      return { success: false, message: 'No file name or directory provided' }
    const { success } = await FileExists(fileName, directory)
    if (!success) return { success, message: 'File does not exist' }
    await storageRef.child(`${directory}/${fileName}`).delete()
    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    return { success: false, message: error?.message }
  }
}

export const convertDate = async date => {
  let dateString
  try {
    const currentDate = new Date(date)
    const currentDayOfMonth = currentDate.getDate()
    const currentMonth = currentDate.getMonth() // Be careful! January is 0, not 1
    const currentYear = currentDate.getFullYear()
    dateString =
      currentDayOfMonth + '-' + (currentMonth + 1) + '-' + currentYear
    return dateString
  } catch (error) {
    console.log({ error })
    return 0
  }
}

export const creationData = (currentDate = new Date()) => {
  const currentUserId = GetCurrentUser().uid
  return {
    isDelete: false,
    createdBy: currentUserId,
    createdAt: currentDate,
    updatedBy: currentUserId,
    updatedAt: currentDate,
  }
}

export const updatationData = (email = null) => {
  const currentUserId = GetCurrentUser() ? GetCurrentUser().uid : null
  return {
    updatedBy: email ? email : currentUserId,
    updatedAt: new Date(),
  }
}

export const GetMomentDaysDiff = (startDate, endDate) =>
  startDate && endDate ? moment(endDate).diff(moment(startDate), 'days') : 0
