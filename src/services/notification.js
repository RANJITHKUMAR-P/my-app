import moment from 'moment'
import {
  APIs,
  Collections,
  CommentedLabel,
  entityTypes,
  unsubscribeList,
} from '../config/constants'
import Axios from '../utility/axiosHelper'
import { GetAxiosHeaders } from '../config/utils'
import { db } from '../config/firebase'
import { actions } from '../Store'
import { GetCurrentUser } from './user'
import { updatationData } from './common'

const axios = require('axios')

export const DeletePlayerId = async (
  userType,
  deviceType,
  userid,
  playerid,
  headers
) => {
  Axios.post(
    APIs.DELETE_PLAYER_ID,
    {
      userType: userType,
      deviceType: deviceType,
      userid: userid,
      playerid: playerid,
    },
    { headers }
  )
    .then(response => {
      console.log(response)
      return true
    })
    .catch(err => {
      console.log(err)
    })
}

export const AddPlayerId = async (userType, deviceType, userid, playerid) => {
  const headers = await GetAxiosHeaders()
  Axios.post(
    APIs.ADD_PLAYER_ID,
    {
      userType: userType,
      deviceType: deviceType,
      userid: userid,
      playerid: playerid,
    },
    { headers }
  )
    .then(response => {
      console.log(response)
    })
    .catch(err => {
      console.log(err)
    })
}

export const AdminRequest = async (...argParams) => {
  const [
    notification_type,
    template_variables,
    sender_id,
    guest_id,
    hotel_id,
    referenceId,
    requestType,
    departmentId,
    requestId = '',
    comment,
  ] = argParams
  const headers = await GetAxiosHeaders()
  Axios.post(
    APIs.ADMIN_REQUEST,
    {
      notification_type,
      template_variables,
      sender_id,
      guest_id,
      hotel_id,
      referenceId,
      requestType,
      departmentId,
      requestId,
      comment,
    },
    { headers }
  )
    .then(() => {
      // intentionaly left blank
    })
    .catch(err => {
      throw err
    })
}

/**
 * Sends a request to the appropriate API based on the provided parameters.
 *
 * @param {Object} params - The parameters for the request.
 * @param {string} params.departmentKey - The department key.
 * @param {string} params.staffId - The staff ID.
 * @param {string[]} params.managerIds - The manager IDs.
 * @param {string} params.hotelId - The hotel ID.
 * @param {string} params.notificationType - The notification type.
 * @param {string} params.requestType - The request type.
 * @param {string} params.serviceType - The service type.
 * @param {string} params.serviceName - The service name.
 * @param {string} params.userName - The user name.
 * @param {string} params.reasonForReturn - The reason for return.
 * @param {string} params.requestPath - The request path.
 * @param {string} params.departmentId - The department ID.
 * @param {boolean} params.isGuestRequest - Indicates if it's a guest request.
 * @param {boolean} params.isDepartmentType - Indicates if it's a department type.
 * @returns {Promise<void>} A promise that resolves when the request is completed.
 * @throws {Error} Throws an error if there's an issue with the request.
 */
export const ManagerRequest = async ({
  departmentKey,
  staffId,
  managerIds,
  hotelId,
  notificationType,
  requestType,
  serviceType,
  serviceName,
  userName,
  reasonForReturn,
  requestPath,
  departmentId,
  newComment,
  locationName,
  updatedStatus,
  isGuestRequest, 
  assignedToStaffId,
  isDepartmentType = false,
}) => {

  
  if (!hotelId || !staffId) return

  const headers = await GetAxiosHeaders()

  // Conditionaly called Defered or Canceled or ManagerRequest API based upon isDepartment = true and requestType.
  let apiUrl = isDepartmentType
    ? requestType === 'Deferred'
      ? APIs.DEFERRED_NOTIFICATION
      : requestType === 'Canceled'
      ? APIs.CANCELED_NOTIFICATION
      : APIs.MANAGER_REQUEST
    : APIs.MANAGER_REQUEST

  let data = {
    department_type: departmentKey,
    staff_id: staffId,
    manager_id: managerIds,
    hotel_id: hotelId,
    notification_type: notificationType,
    requestType: requestType,
    service_type: serviceType,
    template_variables: {
      '%serviceName%': serviceName,
      '%userName%': userName,
      '%reasonForReturn%': reasonForReturn,
    },
    requestPath,
    entityType: entityTypes.REQUEST,
    departmentId,
    isGuestRequest,
  }

  if (notificationType === 'STATUS_UPDATE_RECURRING_REQUEST') {
    apiUrl = APIs.DAILY_TASK_STATUS_UPDATE_NOTIFICATION
    const { description, staffName } =
    newComment
    data = {
      department_type: departmentKey,
      staff_id: staffId,
      manager_id: managerIds,
      hotel_id: hotelId,
      notification_type: notificationType,
      requestType: requestType,
      service_type: serviceType,
      template_variables: {
        '%serviceName%': serviceName,
        '%updateByStaff%': staffName,
        '%roomNumber%' : locationName,
        '%status%' : updatedStatus,
        '%comment%':   description,
      },
      requestPath,
      entityType: entityTypes.REQUEST,
      assignedToStaffId,
      departmentId,
      isGuestRequest,
    }
  }

  Axios.post(apiUrl, data, { headers })
    .then(() => {
      // intentionaly left blank
    })
    .catch(err => {
      throw err
    })
}

export const GuestRequest = async data => {
  try {
    const headers = await GetAxiosHeaders()
    await Axios.post(APIs.GUEST_REQUEST, data, { headers })
  } catch (error) {
    console.log(error)
    console.log(error.message)
  }
}

export const DepartmentRequest = async data => {
  try {
    const headers = await GetAxiosHeaders()
    await Axios.post(APIs.DEPARTMENT_REQUEST, data, { headers })
  } catch (error) {
    console.log(error)
    console.log(error.message)
  }
}

export const BulkGuestOrDepartmentRequest = async ({
  guestNotificationList,
  isGuestRequest,
}) => {
  try {
    const headers = await GetAxiosHeaders()
    await Axios.post(
      APIs.GUEST_OR_DEPARTMENT_REQUEST,
      { guestNotificationList, isGuestRequest },
      { headers }
    )
  } catch (error) {
    console.log(error)
    console.log(error.message)
  }
}

export const AddNotificationsListener = (userId, hotelId, dispatch) => {
  try {
    let collectionKey = `AddNotificationsListener_${Collections.NOTIFICATIONS}`
    if (!userId || !hotelId || unsubscribeList[collectionKey]) return

    const end = moment().add(2, 'days').endOf('day').toDate()
    const start = moment().add(-1, 'day').startOf('day').toDate()
    let unSub = db
      .collection(Collections.NOTIFICATIONS)
      .where('receiverId', '==', userId)
      .where('hotelId', '==', hotelId)
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .onSnapshot(notificationSnapshot => {
        let notificationLists = []
        for (const notification of notificationSnapshot.docs) {
          notificationLists.push({
            id: notification.id,
            ...notification.data(),
          })
        }

        notificationLists.sort(
          (a, b) =>
            String(a.readStatus).localeCompare(String(b.readStatus)) ||
            b.createdAt - a.createdAt
        )

        dispatch(actions.setNotification(notificationLists))
      })
    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.log(error)
  }
}

export const PromotionsRequest = async (
  notification_type,
  template_variables,
  sender_id,
  hotel_id
) => {
  const headers = await GetAxiosHeaders()
  Axios.post(
    APIs.PROMOTIONS_REQUEST,
    {
      notificationType: notification_type,
      templateVariables: template_variables,
      senderIid: sender_id,
      hotelId: hotel_id,
    },
    { headers }
  )
    .then(response1 => {
      console.log(response1)
    })
    .catch(err => {
      console.error(err)
    })
}
export const UpdateNotification = (id, readStatus, guestId) => {
  try {
    db.collection(Collections.NOTIFICATIONS).doc(id).update({
      readStatus: readStatus,
      updatedAt: new Date(),
      updatedBy: guestId,
    })
  } catch (error) {
    console.log(error)
  }
}

export const AssignTaskNotificaion = async ({
  assignerName,
  hotel_id,
  isGuest,
  manager_id,
  request_type,
  requestPath,
  roomNumber,
  service_type,
  serviceName,
  staff_id,
  notification_type,
}) => {
  const headers = await GetAxiosHeaders()
  Axios.post(
    APIs.STAFF_ASSIGNED_NOTIFICATION,
    {
      notification_type: notification_type || 'STAFFASSIGNED',
      entityType: 'REQUEST',
      manager_id: manager_id,
      staff_id: staff_id,
      hotel_id: hotel_id,
      requestType: request_type,
      service_type: service_type,
      template_variables: {
        '%request%': isGuest ? 'Guest' : 'Department',
        '%assignerName%': assignerName,
        '%serviceName%': serviceName,
        '%roomNumber%': roomNumber,
      },
      requestPath,
    },
    { headers }
  )
    .then(() => {
      // intentionaly left blank
    })
    .catch(err => {
      throw err
    })
}

export async function markNotificaitonAsRead({
  guestId,
  hotelId,
  requestPath,
  assignedToId,
  assignedById,
  createdBy = '',
}) {
  try {
    let senderIds = []

    if (createdBy) {
      senderIds.push(createdBy)
    }

    if (guestId) {
      senderIds.push(guestId)
    }

    if (assignedToId === assignedById || assignedById) {
      senderIds.push(assignedById)
    }

    if (!senderIds.length || !requestPath) return

    senderIds = [...new Set(senderIds)]

    const batch = db.batch()
    let notificationCollectionRef = db.collection(Collections.NOTIFICATIONS)

    const loggerUserId = GetCurrentUser().uid

    let notificationCollectionRefQuery = notificationCollectionRef
      .where('receiverId', '==', loggerUserId)
      .where('hotelId', '==', hotelId)
      .where('readStatus', '==', false)
      .where('requestPath', '==', requestPath)

    notificationCollectionRefQuery = notificationCollectionRefQuery.where(
      'senderId',
      'in',
      senderIds
    )

    if (assignedToId === loggerUserId) {
      notificationCollectionRefQuery = notificationCollectionRefQuery.where(
        'entityType',
        '==',
        entityTypes.REQUEST
      )
    } else {
      notificationCollectionRefQuery = notificationCollectionRefQuery.limit(1)
    }

    let notificationSnapshot = await notificationCollectionRefQuery.get()

    notificationSnapshot.forEach(n => {
      const notificationRef = notificationCollectionRef.doc(n.id)
      batch.update(notificationRef, { readStatus: true, ...updatationData() })
    })

    await batch.commit()
  } catch (error) {
    console.log(error)
  }
}

export const CommentActivityNotificaion = async data => {
  const { requestData, activity, userInfo, comment, requestPath } = data
  const { isGuestRequest, isRecurring, departmentKey } =
    requestData
  const notification_type = isRecurring
    ? 'COMMENT_RECURRING_REQUEST'
    : isGuestRequest
    ? 'COMMENT_GUEST_REQUEST'
    : 'COMMENT_DEPARTMENT_REQUEST'
  let template_variables = {
    '%userName%': userInfo?.name,
    '%activity%': activity === CommentedLabel ? 'Added' : activity,
    '%serviceName%': requestData?.service,
    '%description%': comment,
  }
  if (isRecurring) {
    const locationName = requestData?.locationName

    template_variables = {
      ...template_variables,
      '%roomNumber%': locationName,
    }
  } else if (isGuestRequest) {
    template_variables = {
      ...template_variables,
      '%guestName%': requestData?.guestName || requestData?.guest,
      '%roomNumber%': requestData?.roomNumber,
    }
  } else {
    template_variables = {
      ...template_variables,
      '%staffName%': requestData?.createdByName,
      '%departmentName%': requestData?.fromDepartmentName,
    }
  }
  const headers = await GetAxiosHeaders()
  let payload = {
    ...requestData,
    template_variables,
    department_type: departmentKey,
    entityType: 'REQUEST',
    hotel_id: requestData?.hotelId,
    notification_type: notification_type,
    referenceId: requestData?.requestId,
    requestPath,
    requestType: requestData?.requestType,
    service_type: requestData?.service,
    staff_id: userInfo?.userId,
    guest_id: requestData?.guestId,
  }
  Axios.post(APIs.COMMENT_ACTIVITY, payload, { headers })
    .then(() => {
      return true
    })
    .catch(err => {
      throw err
    })
}
