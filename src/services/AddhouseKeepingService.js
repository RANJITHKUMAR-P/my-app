import { Collections, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { actions } from '../Store'
import { creationData, DeleteFile, updatationData, UploadFile } from './common'

export const AddPromotionMenuItem = async (
  image,
  promotionMenuItem,
  hotelId
) => {
  try {
    // upload promo image
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

    // add promo menu item
    await db
      .collection(Collections.HOUSEKEEPINGSERVICES)
      .doc()
      .set({
        ...promotionMenuItem,
        imageUrl,
        imageName,
        isDelete: false,
        hotelId,
        ...creationData(),
      })

    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}
export const DeletePromoMenuItem = async promoId => {
  try {
    await db.collection(Collections.HOUSEKEEPINGSERVICES).doc(promoId).delete()
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}
export const PromoMenuListener = async (hotelId, dispatch) => {
  try {
    let collectionKey = `PromoMenuListener_${Collections.HOUSEKEEPINGSERVICES}`

    if (!hotelId || unsubscribeList[collectionKey]) return

    let unSub = db
      .collection(Collections.HOUSEKEEPINGSERVICES)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .onSnapshot(promoSnapshot => {
        const promoMenu = []
        dispatch(actions.setLoadingPromoMenuTwo(true))
        for (const promotions of promoSnapshot.docs) {
          promoMenu.push({ id: promotions.id, ...promotions.data() })
        }
        dispatch(actions.setPromoMenusTwo(promoMenu))
        dispatch(actions.setLoadingPromoMenuTwo(false))
      })

    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.log({ error })
  }
}

export const EditPromoMenuItem = async ({
  promoImage,
  promotionMenuItem,
  promoImageUrl,
  promoImageName,
  deleteFoodImage,
  promoMenuId,
  hotelId,
}) => {
  try {
    // delete old promo image
    let response
    let newImageUrl = promoImageUrl
    let newImageName = promoImageName
    if (promoImageName && (deleteFoodImage || promoImage)) {
      newImageUrl = ''
      newImageName = ''
      response = await DeleteFile(promoImageName, hotelId)
      if (!response.success) {
        return { success: false, message: response.message }
      }
    }

    // update new promo Image
    if (promoImage) {
      const {
        success,
        downloadUrl,
        message,
        profileImageName: imageName,
      } = await UploadFile(promoImage, hotelId)
      if (!success) return { success: false, message }
      newImageUrl = downloadUrl
      newImageName = imageName
    }

    // update profile data
    await db
      .collection(Collections.HOUSEKEEPINGSERVICES)
      .doc(promoMenuId)
      .update({
        ...promotionMenuItem,
        imageUrl: newImageUrl,
        imageName: newImageName,
        ...updatationData(),
      })

    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}
