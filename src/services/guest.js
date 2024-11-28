import {
  checkInLable,
  checkOutLable,
  Collections,
  commonModalType,
  ENTITY_TYPE,
  rejectedLable,
  unsubscribeList,
} from '../config/constants'
import { db, timestamp } from '../config/firebase'
import { Sort } from '../config/utils'
import { actions } from '../Store'
import { updatationData } from './common'
import { GetCurrentUser } from './user'
import moment from 'moment'

export const AddGuestListener = async (hotelId, dispatch) => {
  try {
    let collectionKey = `AddGuestListener${Collections.GUEST}`
    if (!hotelId || unsubscribeList[collectionKey]) return

    dispatch(actions.setLoadingGuests(true))
    let sub = db
      .collection(Collections.GUEST)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)

    sub = sub.orderBy('createdAt', 'desc').onSnapshot(guestSnapshot => {
      const guests = []
      for (const guest of guestSnapshot.docs) {
        const { name, surName } = guest.data()
        guests.push({
          id: guest.id,
          value: guest.id,
          fullName: `${name} ${surName}`,
          ...guest.data(),
        })
      }
      dispatch(actions.setGuests(guests))
      dispatch(actions.setLoadingGuests(false))
    })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

export const AcceptRejectCheckIn = async (
  _hotelId,
  guestId,
  accepted,
  roomNumber,
  checkInCheckOutRequests
) => {
  try {
    const batch = db.batch()
    let guestRequest = checkInCheckOutRequests.filter(
      i => i.roomNumberLc === roomNumber
    )

    let checkInGuestByRoomNo = guestRequest.filter(
      i => i.status === checkInLable
    )

    if (accepted && checkInGuestByRoomNo.length > 0) {
      return { success: false, message: 'Room number already Occupied' }
    }

    const guestRef = db.collection(Collections.GUEST).doc(guestId)
    batch.update(guestRef, {
      status: accepted ? checkInLable : rejectedLable,
      checkedInTime: timestamp(),
      checkedOutTime: null,
      ...updatationData(),
    })

    // change read status of check-in notification for current user
    // if user has not seen notification & accept/reject checkin
    const notificationCollectionRef = db.collection(Collections.NOTIFICATIONS)
    const notificationSnapshot = await notificationCollectionRef
      .where('senderId', '==', guestId)
      .where('receiverId', '==', GetCurrentUser().uid)
      .where('entityType', '==', ENTITY_TYPE.GUEST)
      .where('notificationType', '==', 'CHECKIN')
      .where('readStatus', '==', false)
      .get()
    notificationSnapshot.forEach(n => {
      const notificationRef = notificationCollectionRef.doc(n.id)
      batch.update(notificationRef, { readStatus: true, ...updatationData() })
    })

    await batch.commit()
    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error)
    return {
      success: false,
      message: error?.message || 'Something went wrong while updating check-in',
    }
  }
}

export const UpdateCheckInOutStatus = async (status, guestId) => {
  try {
    const checkedOutTime = status === checkOutLable ? timestamp() : null
    await db
      .collection(Collections.GUEST)
      .doc(guestId)
      .update({
        status,
        checkedOutTime,
        ...updatationData(),
      })
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

export const AddCheckinAndCheckoutCountListener = async (hotelId, dispatch) => {
  try {
    const date = moment().format('YYYY-MM-DD')
    let collectionKey = `AddCheckinAndCheckoutCountListener${Collections.HOTEL_ADMIN_DASHBOARD}${hotelId}${Collections.CHECK_IN_OUT_COUNT}${date}`
    if (!hotelId || unsubscribeList[collectionKey]) return

    let sub = db
      .collection(Collections.HOTEL_ADMIN_DASHBOARD)
      .doc(hotelId)
      .collection(Collections.CHECK_IN_OUT_COUNT)
      .doc(date)
      .onSnapshot(guestSnapshot => {
        const { checkIn = 0, checkOut = 0 } = guestSnapshot?.data() || {}
        dispatch(actions.setCheckInCount(checkIn))
        dispatch(actions.setCheckOutCount(checkOut))
      })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

export const GetOverallFeedback = async (hotelId, guestId, dispatch) => {
  try {
    const feedbackDoc = await db
      .collection(Collections.HOTELS)
      .doc(hotelId)
      .collection(Collections.HOTELFEEDBACKS)
      .doc(guestId)
      .get()
    if (feedbackDoc.exists) {
      const feedbackData = feedbackDoc.data()
      dispatch(actions.setFeedbackQuestionnaire(feedbackData.questionnaire))
      dispatch(actions.setFeedbackLoading(false))
    }
  } catch (error) {
    console.error('Error fetching feedback:', error)
  }
}

export const onViewFeedbackClick = (e, row, dispatch) => {
  e.preventDefault()
  dispatch(actions.setFeedbackLoading(true))
  GetOverallFeedback(row.hotelId, row.guestId, dispatch)
  dispatch(
    actions.setCommonModalData({
      status: true,
      data: row,
      type: commonModalType.ViewHotelFeedback,
    })
  )
}

export const DefaultGuestSettingsListener = async (hotelId, dispatch) => {
  try {
    let collectionKey = `DefaultGuestSettingsListener${Collections.SUPERADMINSETTINGS}`

    if (hotelId && !unsubscribeList[collectionKey]) {
      let findHotelGuestSettings = false
      dispatch(actions.setGuestSettingsLoading(true))

      let unsub = db
        .collection(Collections.ADMINSETTINGS)
        .doc(hotelId)
        .collection(Collections.ADMIN_GUESTSETTINGS)
        .onSnapshot(settingsSanapshot => {
          let guestSettings = []
          if (settingsSanapshot.size > 0) {
            findHotelGuestSettings = true
            settingsSanapshot.forEach(doc => {
              guestSettings.push({ id: doc.id, ...doc.data() })
            })
            guestSettings = Sort(guestSettings, 'order')
            dispatch(actions.setGuestSettingsList(guestSettings))
          }
        })
      if (!findHotelGuestSettings) {
        const unsub1 = db
          .collectionGroup(Collections.SUPERADMIN_GUESTSETTINGS)
          .onSnapshot(settingsSanapshot => {
            let guestSettings = []
            settingsSanapshot.forEach(doc => {
              guestSettings.push({ id: doc.id, ...doc.data() })
            })
            guestSettings = Sort(guestSettings, 'order')
            dispatch(actions.setGuestSettingsList(guestSettings))
          })
        unsubscribeList[collectionKey] = unsub1
      }
      dispatch(actions.setGuestSettingsLoading(false))
      unsubscribeList[collectionKey] = unsub
    }
  } catch (error) {
    console.log({ error })
  }
}

export const DefaultGuestFeedbackListener = async (hotelId, dispatch) => {
  try {
    let collectionKey = `DefaultGuestFeedbackListener${Collections.ADMIN_FEEDBACK_NOTIFICATION_SETTINGS}`

    if (hotelId && !unsubscribeList[collectionKey]) {
      dispatch(actions.setExistingLevelsAllocatedFeedbackSettingsLoading(true))
      let unsub = db
        .collectionGroup(Collections.ADMIN_FEEDBACK_NOTIFICATION_SETTINGS)
        .where('hotelId', '==', hotelId)
        .onSnapshot(feedbackSanapshot => {
          for (const doc of feedbackSanapshot.docs) {
            let settingsData = { ...doc.data(), id: doc.id }
            dispatch(
              actions.setExistingLevelsAllocatedFeedbackSettings(settingsData)
            )
          }
        })
      dispatch(actions.setExistingLevelsAllocatedFeedbackSettingsLoading(false))
      unsubscribeList[collectionKey] = unsub
    }
  } catch (error) {
    console.log({ error })
  }
}
