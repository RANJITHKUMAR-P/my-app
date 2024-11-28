import { Collections, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { actions } from '../Store'
import { DeleteFile, UploadFile, creationData, updatationData } from './common'

export const AddFoodMenuItem = async (image, foodMenuItem, hotelId) => {
  try {
    // upload fodd image
    let imageUrl = ''
    let imageName = ''
    if (image) {
      const {
        success: uploadSuccess,
        downloadUrl,
        message: uploadMessage,
        profileImageName: uploadedImageName,
      } = await UploadFile(image, hotelId)
      if (!uploadSuccess) return { success: false, message: uploadMessage }
      imageUrl = downloadUrl
      imageName = uploadedImageName
    }

    // add food menu item
    await db
      .collection(Collections.FOODMENU)
      .doc()
      .set({
        ...foodMenuItem,
        available: true,
        imageUrl,
        imageName,
        hotelId,
        ...creationData(),
      })

    return { success: true, message: 'Food menu added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const EditFoodMenuItem = async ({
  foodImage,
  foodMenuItem,
  foodImageUrl,
  foodImageName,
  deleteFoodImage,
  foodMenuId,
  hotelId,
}) => {
  try {
    // delete old food image
    let response
    let newImageUrl = foodImageUrl
    let newImageName = foodImageName
    if (foodImageName && (deleteFoodImage || foodImage)) {
      newImageUrl = ''
      newImageName = ''
      response = await DeleteFile(foodImageName, hotelId)
      if (!response.success) {
        return { success: false, message: response.message }
      }
    }

    // update new food Image
    if (foodImage) {
      const {
        success,
        downloadUrl,
        message,
        profileImageName: imageName,
      } = await UploadFile(foodImage, hotelId)
      if (!success) return { success: false, message }
      newImageUrl = downloadUrl
      newImageName = imageName
    }

    // update profile data
    await db
      .collection(Collections.FOODMENU)
      .doc(foodMenuId)
      .update({
        ...foodMenuItem,
        imageUrl: newImageUrl,
        imageName: newImageName,
        ...updatationData(),
      })

    return { success: true, message: 'Food menu updated successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const AddFoodMenuListener = async (hotelId, dispatch) => {
  try {
    let collectionKey = `AddFoodMenuListener_${Collections.FOODMENU}`
    if (!hotelId || unsubscribeList[collectionKey]) return
    dispatch(actions.setLoadingFoodMenu(true))

    let unSub = db
      .collection(Collections.FOODMENU)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .onSnapshot(foodMenuSnapshot => {
        const foodMenus = []
        for (const foodMenu of foodMenuSnapshot.docs) {
          foodMenus.push({ id: foodMenu.id, ...foodMenu.data() })
        }
        dispatch(actions.setFoodMenus(foodMenus))
        dispatch(actions.setLoadingFoodMenu(false))
      })
    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.log({ error })
  }
}

export const UpdateFoodMenuItemAvailability = async (available, foodMenuId) => {
  try {
    await db
      .collection(Collections.FOODMENU)
      .doc(foodMenuId)
      .update({ available, ...updatationData() })
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

export const DeleteFoodMenuItem = async foodMenuId => {
  try {
    await db
      .collection(Collections.FOODMENU)
      .doc(foodMenuId)
      .update({ isDelete: true, ...updatationData() })
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}
