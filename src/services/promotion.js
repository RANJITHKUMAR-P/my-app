import { Collections, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { actions } from '../Store'
import { creationData, DeleteFile, updatationData, UploadFile } from './common'
import dotenv from 'dotenv'
dotenv.config()

export const AddPromotionMenuItem = async (
  image,
  promotionMenuItem,
  hotelId,
  promotionName,
  promotionCaption,
  publish
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
      .collection(Collections.PROMOTIONS)
      .doc()
      .set({
        ...promotionMenuItem,
        imageUrl,
        imageName,
        isDelete: false,
        hotelId,
        ...creationData(),
      })

    if (publish) {
      //Send OneSignal web push notification
      const notificationObj = {
        // app_id: '4a0b9443-7a29-4ab7-a200-f1d8dc0b43ff',
        app_id: process.env.REACT_APP_GUEST_ONESIGNAL_APPID,
        // include_player_ids: ['0d313fb7-618a-491a-a3d5-86eae8e66353'],
        // included_segments: ['All'],
        // filters: [
        //   { field: 'tag', key: 'hotelId', relation: '=', value: hotelId },
        // ],

        data: {
          foo: 'bar',
        },
        contents: {
          en: promotionCaption,
        },
        headings: {
          en: promotionName,
        },
        subtitle: {
          en: 'New Promotion',
        },
        // tags: [{ key: 'hotelId', relation: '=', value: hotelId }],
        url: process.env.REACT_APP_GUEST_URL,
        chrome_web_image: imageUrl,
        chrome_web_icon:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUcr4xYCCffBPJxMYpl9fxbVUcNcBj74sbq1hsza0S9Q&s',
        web_buttons: [
          {
            id: 'button_id_1',
            text: 'Interested',
            icon: 'https://png.pngtree.com/png-vector/20210104/ourmid/pngtree-thumbs-up-icon-png-image_2696349.jpg',
            url: `${process.env.REACT_APP_GUEST_URL}`,
          },
          {
            id: 'button_id_2',
            text: 'Not Interested',
            icon: 'https://i.pinimg.com/474x/44/c0/19/44c0198c36c2fddc60d76390bcf47738.jpg',
          },
        ],
      }
      notificationObj.tags = [{ key: 'hotelId', relation: '=', value: hotelId }]

      const response = await fetch(
        'https://onesignal.com/api/v1/notifications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${process.env.REACT_APP_GUEST_ONESIGNAL_REST_API_KEY}`,
          },
          body: JSON.stringify(notificationObj),
        }
      )

      // Check response status
      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(`OneSignal API error: ${errorMessage}`)
      }
    }
    return { success: true, message: '' }
  } catch (error) {
    console.error('Error adding promotion menu item:', error)
    return { success: false, message: error?.message }
  }
}
export const DeletePromoMenuItem = async promoId => {
  try {
    await db.collection(Collections.PROMOTIONS).doc(promoId).delete()
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}
export const PromoMenuListener = async (hotelId, dispatch) => {
  try {
    let collectionKey = `PromoMenuListener_${Collections.PROMOTIONS}`

    if (!hotelId || unsubscribeList[collectionKey]) return

    let unSub = db
      .collection(Collections.PROMOTIONS)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .onSnapshot(promoSnapshot => {
        const promoMenu = []
        dispatch(actions.setLoadingPromoMenu(true))
        for (const promotions of promoSnapshot.docs) {
          promoMenu.push({ id: promotions.id, ...promotions.data() })
        }
        dispatch(actions.setPromoMenus(promoMenu))
        dispatch(actions.setLoadingPromoMenu(false))
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
      .collection(Collections.PROMOTIONS)
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
