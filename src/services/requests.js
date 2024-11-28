import moment from 'moment'
import firebase from 'firebase/app'
import {
  APIs,
  AssignedToLabelValue,
  Collections,
  commonModalType,
  CompletedLabel,
  defaultCommonModalData,
  departmentFilterLabel,
  entityTypes,
  inProgressLabel,
  pendingLable,
  ratingFilterLabel,
  realTimeStatusList,
  requestTypeFilterLabel,
  RequestTypeLabelValue,
  RequestTypes,
  serviceFilterLabel,
  ServiceLabelValue,
  SortBy,
  SortOrder,
  Location,
  statusFilterLabel,
  StatusLabelValue,
  unsubscribeList,
} from '../config/constants'
import DepartmentAndServiceKeys, {
  serviceType,
} from '../config/departmentAndServicekeys'
import { db } from '../config/firebase'
import {
  GetAxiosHeaders,
  getCollectionKey,
  GetDataFromSnapshot,
  getRequestCollection,
  groupArrayByType,
  isFilterValueSelected,
  paginateQueryWithOrderBy,
  paginateQueryWithCustomOrder,
  sortByCreatedAt,
  sortByCustomField,
  Ternary,
} from '../config/utils'
import { actions } from '../Store'
import { getRequestPath } from './user'
import {
  BulkGuestOrDepartmentRequest,
  markNotificaitonAsRead,
} from './notification'
import axios from 'axios'

export const AddFrontDeskRequsetListener = ({
  hotelId,
  frontDeskDepartmentId,
  dispatch,
}) => {
  try {
    let collectionKey = getCollectionKey({
      funcName: 'AddFrontDeskRequsetListener',
      hotelId,
      departmentId: frontDeskDepartmentId,
    })

    if (!hotelId || !frontDeskDepartmentId || unsubscribeList[collectionKey])
      return

    unsubscribeList[collectionKey] = null

    dispatch(actions.setLoadingFrontDeskRequests(true))

    let sub = getRequestCollection(hotelId, frontDeskDepartmentId)
      .where('status', 'in', realTimeStatusList)
      .onSnapshot(requestSnapshot => {
        const requests = GetDataFromSnapshot(requestSnapshot)
        requests.sort(sortByCreatedAt)
        dispatch(actions.setFrontDeskRequests(requests))
        dispatch(actions.setLoadingFrontDeskRequests(false))
      })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

export const AddHouseKeepingRequestListener = ({ hotelId, dispatch }) => {
  try {
    // Collection key for regular housekeeping requests
    let hkCollectionKey = `AddHouseKeepingRequestListener${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}`

    // Clean up existing listener if it exists
    if (unsubscribeList[hkCollectionKey]) {
      unsubscribeList[hkCollectionKey]()
      delete unsubscribeList[hkCollectionKey]
    }

    if (!hotelId) return

    dispatch(actions.setLoadingHouseKeepingRequests(true))
    // Set up listener for regular housekeeping requests
    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('departmentKey', '==', DepartmentAndServiceKeys.houseKeeping.key)
      .where('serviceKey', '!=', '')
      .where('status', 'in', realTimeStatusList)
      .onSnapshot(requestSnapshot => {
        let requests = GetDataFromSnapshot(requestSnapshot)
        requests.sort(sortByCreatedAt)
        dispatch(actions.setHouseKeepingRequests(requests))
        dispatch(actions.setLoadingHouseKeepingRequests(false))
      })
    unsubscribeList[hkCollectionKey] = sub
  } catch (error) {
    console.log('Error in housekeeping listener:', error)
  }
}

export const AddRecurringTaskRequestListener = ({ hotelId, dispatch }) => {
  try {
    // Collection key for recurring task requests
    let rtCollectionKey = `AddRecurringTaskRequestListener${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}`

    // Clean up existing listener if it exists
    if (unsubscribeList[rtCollectionKey]) {
      unsubscribeList[rtCollectionKey]()
      delete unsubscribeList[rtCollectionKey]
    }

    if (!hotelId) return

    dispatch(actions.setLoadingRecurringTaskRequests(true))
    // Set up listener for recurring task requests
    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('departmentKey', '==', DepartmentAndServiceKeys.houseKeeping.key)
      .where('serviceKey', '!=', '')
      .where('isRecurring', '==', true)
      .onSnapshot(requestSnapshot => {
        let requests = GetDataFromSnapshot(requestSnapshot)
        requests.sort(sortByCreatedAt)
        dispatch(actions.setRecurringTaskRequests(requests))
        dispatch(actions.setLoadingRecurringTaskRequests(false))
      })
    unsubscribeList[rtCollectionKey] = sub
  } catch (error) {
    console.log('Error in recurring task listener:', error)
  }
}

export const GetHouseKeepingRequsets = async ({
  hotelInfo,
  hotelId,
  SetFetching,
  SetData,
  page,
  startAfter,
  fetchingData,
  selectedRequestTypeKey,
  selectedServiceKey,
  selectedStatusKey,
  selectedRating,
}) => {
  try {
    if (!hotelId || fetchingData) return

    SetFetching(true)

    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('departmentKey', '==', DepartmentAndServiceKeys.houseKeeping.key)

    if (
      [
        'CzKrd7ZQdPBR40jSldwy',
        'JvbzSSEUS8Wg9DJS6SKf',
        '7TvRMAI69ZE93dovpFAM',
      ].includes(hotelId)
    ) {
      console.log('Inside enable Recurring')
      query = query.where('isRecurring', '==', false)
    }

    if (isFilterValueSelected(selectedRequestTypeKey, RequestTypeLabelValue)) {
      query = query.where('requestType', '==', selectedRequestTypeKey)
    }

    if (isFilterValueSelected(selectedServiceKey, ServiceLabelValue)) {
      query = query.where('service', '==', selectedServiceKey)
    }

    if (isFilterValueSelected(selectedStatusKey, StatusLabelValue)) {
      query = query.where('status', '==', selectedStatusKey)
    }

    if (isFilterValueSelected(selectedRating, ratingFilterLabel)) {
      query = query.where('rating', '==', selectedRating)
    }

    query = paginateQueryWithOrderBy({ query, page, startAfter })

    await setDataRequests({ query, SetData })
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}

export const setDataRequests = async ({ query, SetData }) => {
  try {
    await query.get().then(snapshot => {
      SetData({
        requests: GetDataFromSnapshot(snapshot),
        snapshotDocs: snapshot.docs,
      })
    })
  } catch (error) {
    console.log('âŒ ', error)
  }
}

export const AddConciergeRequsetListener = ({
  hotelId,
  ConciergeServiceKey,
  dispatch,
}) => {
  try {
    let collectionKey = `AddConciergeRequsetListener${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}${ConciergeServiceKey}`

    if (!hotelId || !ConciergeServiceKey || unsubscribeList[collectionKey])
      return

    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('status', 'in', realTimeStatusList)
      .where('hotelId', '==', hotelId)
      .where('serviceKey', '==', ConciergeServiceKey)
      .onSnapshot(requestSnapshot => {
        const requests = GetDataFromSnapshot(requestSnapshot)
        requests.sort(sortByCreatedAt)
        dispatch(
          actions.setConciergeRequests({
            key: ConciergeServiceKey,
            data: requests || [],
          })
        )
      })

    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

export function guestServiceRequest({ hotelId, dispatch }) {
  serviceRequestListener({
    hotelId,
    dispatch,
    isGuestRequest: true,
    listenerType: 'guest',
  })
}

export function departmentServiceRequest({ hotelId, dispatch }) {
  serviceRequestListener({
    hotelId,
    dispatch,
    isGuestRequest: false,
    listenerType: 'department',
  })
}

const serviceRequestListener = ({
  hotelId,
  dispatch,
  isGuestRequest,
  listenerType,
}) => {
  try {
    let collectionKey = `request-AddServiceListener-${listenerType}-${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}`

    if (!hotelId || unsubscribeList[collectionKey]) return

    if (listenerType === 'guest') {
      dispatch(actions.setLoadingGuestServices(true))
    } else {
      dispatch(actions.setLoadingDeptServices(true))
    }

    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('isGuestRequest', '==', isGuestRequest)
      .where('typeOfService', '==', serviceType.serviceRequest)
      .where('status', 'in', realTimeStatusList)
      .onSnapshot(serviceSnapshot => {
        const requests = GetDataFromSnapshot(serviceSnapshot)
        requests.sort(sortByCreatedAt)
        if (listenerType === 'guest') {
          dispatch(actions.setGuestService(requests))
        } else {
          dispatch(actions.setDeptService(requests))
        }
      })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

function AddDashboardListener({ status, actionMethod, hotelId, dispatch }) {
  try {
    let collectionKey = `request-AddDashboardServiceRequestListener-AddDashboardListener-${status}${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}`
    if (!hotelId || unsubscribeList[collectionKey]) return
    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('typeOfService', '==', serviceType.serviceRequest)
      .where('status', '==', status)
      .orderBy('updatedAt', 'desc')
      .limit(5)
      .onSnapshot(serviceSnapshot => {
        let services = []
        for (const service of serviceSnapshot.docs) {
          services.push({ id: service.id, ...service.data() })
        }
        dispatch(actionMethod(services))
      })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log('❌', error, status)
  }
}

export const AddDashboardServiceRequestListener = (hotelId, dispatch) => {
  const objDashboardServices = [
    {
      status: pendingLable,
      actionMethod: actions.setDashboardServiceRequestPending,
    },
    {
      status: inProgressLabel,
      actionMethod: actions.setDashboardServiceRequestInprogress,
    },
    {
      status: CompletedLabel,
      actionMethod: actions.setDashboardServiceRequestCompleted,
    },
  ]

  objDashboardServices.forEach(({ status, actionMethod }) => {
    AddDashboardListener({ status, actionMethod, hotelId, dispatch })
  })
}

export const UpdateRequestStatus = async objRequestData => {
  try {
    let { requestId, hotelId, departmentId } = objRequestData
    let requestPath = getRequestPath({ hotelId, departmentId, requestId })

    markNotificaitonAsRead({ ...objRequestData, requestPath })

    const requestSnap = await db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('requestId', '==', requestId)
      .get()

    if (requestSnap?.docs) {
      const batch = db.batch()
      for (const doc of requestSnap.docs) {
        batch.update(doc.ref, objRequestData)
      }
      await batch.commit()
      return objRequestData
    } else {
      return false
    }
  } catch (error) {
    console.error({ error })
    return false
  }
}

export const getServiceRequests = async ({
  hotelInfo,
  hotelId,
  departmentId,
  SetFetching,
  SetData,
  page,
  startAfter,
  fetchingData,
  filteredBookingReferenceNo,
  filteredDept,
  filteredServices,
  filteredRequestType,
  filteredStatus,
  filteredRating,
  filteredRequestDate,
  isGuestRequest,
  frontDeskServiceType,
}) => {
  try {
    if (!hotelId || fetchingData) return
    SetFetching(true)

    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('typeOfService', '==', serviceType.serviceRequest)

    if (departmentId) {
      query = query.where('departmentId', '==', departmentId)
    }

    if (isGuestRequest !== undefined) {
      query = query.where('isGuestRequest', '==', isGuestRequest)
    }
    if (filteredRequestDate) {
      filteredRequestDate = moment(
        filteredRequestDate.format('YYYY-MM-DD'),
        'YYYY-MM-DD'
      )

      const requestedDate = firebase.firestore.Timestamp.fromDate(
        filteredRequestDate.toDate()
      )
      query = query.where('requestedDate', '==', requestedDate)
    }

    if (isFilterValueSelected(filteredDept, departmentFilterLabel)) {
      query = query.where('departmentId', '==', filteredDept)
    }

    if (isFilterValueSelected(filteredServices, serviceFilterLabel)) {
      // filtering on service name as this is used in two places
      query = query.where('service', '==', filteredServices)
    } else {
      if (frontDeskServiceType) {
        query = query.where('frontDeskServiceType', '==', frontDeskServiceType)
      }
    }
    if (isFilterValueSelected(filteredRequestType, requestTypeFilterLabel)) {
      query = query.where('requestType', '==', filteredRequestType)
    }

    if (isFilterValueSelected(filteredStatus, statusFilterLabel)) {
      query = query.where('status', '==', filteredStatus)
    }

    if (isFilterValueSelected(filteredRating, ratingFilterLabel)) {
      query = query.where('rating', '==', filteredRating)
    }

    if (filteredBookingReferenceNo) {
      // must use equality operator as we have already used 'not-in' operator with departmentIds
      query = query.where('bookingReferance', '==', filteredBookingReferenceNo)
    }

    if (
      [
        'CzKrd7ZQdPBR40jSldwy',
        'JvbzSSEUS8Wg9DJS6SKf',
        '7TvRMAI69ZE93dovpFAM',
      ].includes(hotelId)
    ) {
      console.log('Inside enable Recurring')
      query = query.where('isRecurring', '==', false)
    }

    query = paginateQueryWithOrderBy({ query, page, startAfter })

    await setDataRequests({ query, SetData })
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}

// listens for service requests and returns the status counts
export const serviceRequestsListenerForStatusCount = ({ hotelId, SetData }) => {
  if (!hotelId) return

  try {
    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('typeOfService', '==', serviceType.serviceRequest)

    if (
      [
        'CzKrd7ZQdPBR40jSldwy',
        'JvbzSSEUS8Wg9DJS6SKf',
        '7TvRMAI69ZE93dovpFAM',
      ].includes(hotelId)
    ) {
      console.log('Inside enable Recurring')
      query = query.where('isRecurring', '==', false)
    }

    // Set up a real-time listener using onSnapshot
    const unsubscribe = query.onSnapshot(snapshot => {
      const requests = []
      snapshot.forEach(doc => {
        requests.push(doc.data())
      })

      // Count occurrences of each status for guest requests and department requests
      const statusCounts = requests.reduce((acc, request) => {
        const status = request.status
        const isGuestRequest = request.isGuestRequest

        const key = isGuestRequest ? 'guestReq' : 'departmentReq'

        if (!acc[key]) {
          acc[key] = {}
        }

        if (status) {
          acc[key][status] = (acc[key][status] || 0) + 1
        }

        return acc
      }, {})

      SetData(statusCounts)
    })

    // Return unsubscribe function to clean up listener
    return unsubscribe
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}

export const getConciergeServiceRequests = async ({
  hotelId,
  SetFetching,
  SetData,
  page,
  startAfter,
  fetchingData,
  ConciergeServiceKey,
  conciergeSelectedRequestTypeKey,
  conciergeSelectedStatusKey,
  filteredRating,
}) => {
  try {
    if (!hotelId || fetchingData) return

    SetFetching(true)

    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('serviceKey', '==', ConciergeServiceKey)

    if (
      isFilterValueSelected(
        conciergeSelectedRequestTypeKey,
        requestTypeFilterLabel
      )
    ) {
      query = query.where('requestType', '==', conciergeSelectedRequestTypeKey)
    }

    if (isFilterValueSelected(conciergeSelectedStatusKey, statusFilterLabel)) {
      query = query.where('status', '==', conciergeSelectedStatusKey)
    }

    if (isFilterValueSelected(filteredRating, ratingFilterLabel)) {
      query = query.where('rating', '==', filteredRating)
    }

    query = paginateQueryWithOrderBy({ query, page, startAfter })

    await setDataRequests({ query, SetData })
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}

export function updateCommonModal(dispatch, value) {
  if (!dispatch || !dispatch(actions.setCommonModalData)) {
    console.error('Dispatch or actions.setCommonModalData is undefined!')
    return
  }

  dispatch(actions.setCommonModalData(value))
}

export function closeCommonModal(dispatch) {
  dispatch(actions.setCommonModalData(defaultCommonModalData))
}

export async function updateRequestComment(request) {
  try {
    const { hotelId, departmentId, id, ...restReqData } = request
    await getRequestCollection(hotelId, departmentId)
      .doc(id)
      .update(restReqData)
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

export function viewAddCommenModal({ dispatch, row, handleStatusChange }) {
  // Ensure that updateCommonModal is defined
  if (typeof updateCommonModal !== 'function') {
    console.error('updateCommonModal is not defined!')
    return
  }

  try {
    updateCommonModal(dispatch, {
      status: true,
      data: {
        handleStatusChange,
        data: row,
      },
      type: commonModalType.AddComment,
    })
  } catch (error) {
    console.error('Error in viewAddCommenModal:', error)
  }
}

export function viewAddRequestModal({
  dispatch,
  row,
  handleStatusChange = () => {},
}) {
  updateCommonModal(dispatch, {
    status: true,
    data: {
      handleStatusChange,
      data: row,
    },
    type: commonModalType.AssignRequest,
  })
}

export function viewResponseModal({ dispatch, data }) {
  updateCommonModal(dispatch, {
    status: true,
    data: {
      response: data,
    },
    type: commonModalType.ResponseModal,
  })
}

export const fetchExtraDeptServices = async ({
  hotelId,
  dispatch,
  frontDeskServiceType = null,
  departmentId,
  departmentKey = '',
}) => {
  try {
    let collectionKey = getCollectionKey({
      funcName: 'fetchExtraDeptServices',
      hotelId,
      frontDeskServiceType,
    })

    if (!hotelId || !departmentId || unsubscribeList[collectionKey]) return

    dispatch(actions.setFetchDeptService({ loading: true, data: [] }))

    let sub = db
      .collection(Collections.DEPARTMENTS)
      .doc(departmentId)
      .collection(Collections.SERVICES)
      .where('hotelId', '==', hotelId)

    if (departmentKey === DepartmentAndServiceKeys.houseKeeping.key) {
      sub = sub.where('default', '==', true)
    }

    if (frontDeskServiceType) {
      sub = sub.where('frontDeskServiceType', '==', frontDeskServiceType)
    }

    sub.onSnapshot(snap => {
      const services = GetDataFromSnapshot(snap)
      dispatch(
        actions.setFetchDeptService({
          loading: false,
          data: services,
        })
      )
    })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

export const AddIncomingAndRaisedRequestListener = ({
  hotelId,
  departmentId,
  action,
  dispatch,
  type = RequestTypes.All,
  requestRaised = false,
  isManagementStaff = false,
}) => {
  try {
    const requestRaisedType = Ternary(requestRaised, 'requestRaised', '')
    const collectionKey = `AddIncomingAndRaisedRequestListener${requestRaisedType}${type}${departmentId}`

    if (!hotelId || !departmentId || unsubscribeList[collectionKey]) return

    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('status', 'in', realTimeStatusList)
      .where('hotelId', '==', hotelId)

    if (type !== RequestTypes.All) {
      sub = sub.where(
        'isGuestRequest',
        '==',
        type === RequestTypes.GuestRequest
      )
    }

    if (requestRaised) {
      sub = sub.where('fromDepartmentId', '==', departmentId)
    } else {
      if (!isManagementStaff) {
        sub = sub.where('departmentId', '==', departmentId)
      }
    }

    sub = sub.onSnapshot(requestSnapshot => {
      const requests = GetDataFromSnapshot(requestSnapshot)
      requests.sort(sortByCreatedAt)
      dispatch(action(requests))
    })

    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

export const GetIncomingAndRaisedRequsets = async ({
  hotelInfo,
  hotelId,
  departmentId,
  type = RequestTypes.GuestRequest,
  requestRaised = false,
  SetFetching,
  SetData,
  page,
  startAfter,
  fetchingData,
  selectedRequestTypeKey,
  selectedServiceId,
  selectedStatusKey,
  filteredRating,
  isMoreRequest,
  isManagementStaff,
}) => {
  try {
    if (!hotelId || fetchingData) return

    SetFetching(true)
    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)

    if (type !== RequestTypes.All) {
      query = query.where(
        'isGuestRequest',
        '==',
        type === RequestTypes.GuestRequest
      )
    }

    if (requestRaised) {
      query = query.where('fromDepartmentId', '==', departmentId)
    } else {
      if (!isManagementStaff) {
        query = query.where('departmentId', '==', departmentId)
      }
    }

    if (isFilterValueSelected(selectedRequestTypeKey, RequestTypeLabelValue)) {
      query = query.where('requestType', '==', selectedRequestTypeKey)
    }

    if (isFilterValueSelected(selectedServiceId, ServiceLabelValue)) {
      query = query.where('service', '==', selectedServiceId)
    }

    if (isFilterValueSelected(selectedStatusKey, StatusLabelValue)) {
      query = query.where('status', '==', selectedStatusKey)
    }

    if (isFilterValueSelected(filteredRating, ratingFilterLabel)) {
      query = query.where('rating', '==', filteredRating)
    }

    if (isMoreRequest) {
      query = query.where('serviceKey', '==', '')
    }

    if (
      [
        'CzKrd7ZQdPBR40jSldwy',
        'JvbzSSEUS8Wg9DJS6SKf',
        '7TvRMAI69ZE93dovpFAM',
      ].includes(hotelId)
    ) {
      console.log('Inside enable Recurring')
      query = query.where('isRecurring', '==', false)
    }

    query = paginateQueryWithOrderBy({ query, page, startAfter })

    await setDataRequests({ query, SetData })
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}

export const GetServiceRequests = async (
  hotelId,
  guestInfo,
  departmentId,
  serviceId
) => {
  try {
    if (!hotelId || !departmentId) {
      return {
        success: false,
        message:
          'Please provide valid data to check number of pending requests!',
        pendingRequests: [],
      }
    }

    const serviceRequestsSnapshot = await getRequestCollection(
      hotelId,
      departmentId
    )
      .where('guestId', '==', guestInfo.guestId)
      .where('serviceId', '==', serviceId)
      .where('status', 'in', [pendingLable, inProgressLabel])
      .get()

    const pendingRequests = []
    for (const request of serviceRequestsSnapshot.docs) {
      pendingRequests.push({ id: request.id, ...request.data() })
    }

    return { success: true, message: '', pendingRequests, guestInfo }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return {
      success: false,
      message: error?.message || 'Something went wrong!',
      pendingRequests: [],
      guestInfo,
    }
  }
}

export async function saveServiceRequest({
  guestList,
  notificationData,
  requestData,
}) {
  try {
    console.log('requestData', requestData)
    const {
      departmentId,
      hotelId,
      requestType,
      isGuestRequest,
      locationId,
      isLocationUsed,
    } = requestData

    if (locationId && !isLocationUsed) {
      await UpdateLocation({ isLocationUsed, hotelId, locationId })
    }

    delete requestData.noOfRequestsAllowed
    delete requestData.isLocationUsed

    const guestNotificationList = []

    const requestCollection = getRequestCollection(hotelId, departmentId)
    const requestCollectionArray = Array.isArray(requestCollection)
      ? requestCollection
      : [requestCollection]

    await Promise.all(
      guestList.map(async guestInfo => {
        const requestDocPromises = requestCollectionArray.map(
          async requestCollectionItem => {
            const requestDoc = requestCollectionItem.doc()
            const { bookingReferance, guest, guestId, roomNumber } = guestInfo

            let notification_type = 'DEPARTMENT_REQUEST'
            let template_variables = {
              '%staffName%': notificationData.staffName,
              '%serviceName%': notificationData.service,
            }

            if (isGuestRequest) {
              template_variables = {
                '%name%': guest,
                '%request%': notificationData.service,
                '%roomNumber%': roomNumber,
                '%priority%': requestType,
              }
              notification_type = 'GUEST_REQUEST'
            }
            let data = {}
            console.log('data', data)

            if (!notificationData?.notificationSendingType) {
              data = {
                currentLanguage: notificationData.currentLanguage,
                department_type: notificationData.departmentKey,
                entityType: entityTypes.REQUEST,
                hotel_id: hotelId,
                notification_type,
                referenceId: '123',
                requestType,
                service_type: notificationData.service,
                staff_id: notificationData.staff_id,
                template_variables,
                departmentId: notificationData.departmentId,
              }
              guestNotificationList.push({
                ...data,
                guest_id: guestId,
                requestPath: requestDoc.path,
              })
              BulkGuestOrDepartmentRequest({
                guestNotificationList,
                isGuestRequest,
              })
            }

            return requestDoc.set({
              requestId: requestDoc.id,
              bookingReferance,
              guest,
              guestId,
              roomNumber,
              ...requestData,
            })
          }
        )

        await Promise.all(requestDocPromises)
      })
    )

    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error)
    return { success: false, message: error.message }
  }
}

async function UpdateLocation(request) {
  try {
    const headers = await GetAxiosHeaders()
    await axios.post(APIs.UPDATE_LOCATION, { request }, { headers })
  } catch (error) {
    console.log(error)
  }
}

export const getUsageReport = async ({
  hotelId,
  setUsageReport,
  setUsageReportLoading,
  filteredStartDate,
  filteredEndDate,
  groupBy,
}) => {
  try {
    if (!hotelId) return
    setUsageReportLoading(true)
    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
    if (filteredStartDate) {
      filteredStartDate = moment(
        filteredStartDate.format('YYYY-MM-DD'),
        'YYYY-MM-DD'
      )

      const requestedStartDate = firebase.firestore.Timestamp.fromDate(
        filteredStartDate.toDate()
      )
      query = query.where('requestedDate', '>=', requestedStartDate)
    }
    if (filteredEndDate) {
      filteredEndDate = moment(
        filteredEndDate.format('YYYY-MM-DD'),
        'YYYY-MM-DD'
      )

      const requestedEndDate = firebase.firestore.Timestamp.fromDate(
        filteredEndDate.toDate()
      )
      query = query.where('requestedDate', '<=', requestedEndDate)
    }

    await query.get().then(snapshot => {
      const res = GetDataFromSnapshot(snapshot)
      const newRes = groupArrayByType(groupBy, res)
      setUsageReport(newRes)
      setUsageReportLoading(false)
    })
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}

export const getRequestReport = async ({
  hotelId,
  SetFetching,
  SetData,
  page,
  startAfter,
  fetchingData,
  filteredDept,
  filteredServices,
  filteredStatus,
  filteredStartDate,
  filteredEndDate,
  staff,
  locationVal,
}) => {
  try {
    if (!hotelId || fetchingData) return
    SetFetching(true)

    const queries = queryFilterHelper({
      hotelId,
      filteredDept,
      filteredServices,
      filteredStatus,
      filteredStartDate,
      filteredEndDate,
      staff,
      locationVal,
    })

    // Handle array of queries for location filter
    if (Array.isArray(queries)) {
      const snapshots = await Promise.all(
        queries.map(query =>
          paginateQueryWithCustomOrder({
            query,
            page,
            startAfter,
            orderBy: 'requestedDate',
          }).get()
        )
      )

      const allDocs = snapshots.reduce((acc, snapshot) => {
        return [...acc, ...snapshot.docs]
      }, [])

      const res = GetDataFromSnapshot({ docs: allDocs })
      SetData({
        requests: res,
        snapshotDocs: allDocs,
      })
    } else {
      // Handle single query (non-location filters)
      const query = paginateQueryWithCustomOrder({
        query: queries,
        page,
        startAfter,
        orderBy: 'requestedDate',
      })
      const snapshot = await query.get()
      const res = GetDataFromSnapshot(snapshot)
      SetData({
        requests: res,
        snapshotDocs: snapshot.docs,
      })
    }
    SetFetching(false)
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}

export const getRequestReportExport = async ({
  hotelId,
  SetFetching,
  filteredDept,
  filteredServices,
  filteredStatus,
  filteredStartDate,
  filteredEndDate,
  staff,
  locationVal,
  sortByVal,
  sortOrderVal,
}) => {
  try {
    if (!hotelId) return
    SetFetching(true)

    const queries = queryFilterHelper({
      hotelId,
      filteredDept,
      filteredServices,
      filteredStatus,
      filteredStartDate,
      filteredEndDate,
      staff,
      locationVal,
    })

    // Handle array of queries for location filter
    let results
    if (Array.isArray(queries)) {
      const snapshots = await Promise.all(queries.map(query => query.get()))

      const allDocs = snapshots.reduce((acc, snapshot) => {
        return [...acc, ...snapshot.docs]
      }, [])
      results = GetDataFromSnapshot({ docs: allDocs })
    } else {
      // Handle single query (non-location filters)
      const snapshot = await queries.get()
      results = GetDataFromSnapshot(snapshot)
    }

    // Apply sorting if necessary
    if (
      isFilterValueSelected(sortByVal, SortBy) &&
      isFilterValueSelected(sortOrderVal, SortOrder)
    ) {
      results.sort(sortByCustomField(sortByVal, sortOrderVal))
    } else if (
      !isFilterValueSelected(sortByVal, SortBy) &&
      !isFilterValueSelected(sortOrderVal, SortOrder)
    ) {
      results.sort(sortByCreatedAt)
    } else if (
      isFilterValueSelected(sortByVal, SortBy) &&
      !isFilterValueSelected(sortOrderVal, SortOrder)
    ) {
      results.sort(sortByCustomField(sortByVal, 'asc'))
    } else if (
      !isFilterValueSelected(sortByVal, SortBy) &&
      isFilterValueSelected(sortOrderVal, SortOrder)
    ) {
      results.sort(sortByCustomField('requestedTime', sortOrderVal))
    }

    SetFetching(false)
    return results
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}

export const getCurrentRequestInfo = async ({
  dispatch,
  hotelId,
  departmentId,
  rowId,
}) => {
  try {
    if (!hotelId || !departmentId || !rowId) return
    let query = db
      .collection(Collections.REQUEST_INFO)
      .doc(hotelId)
      .collection(Collections.REQUEST_INFO_DEPARTMENT)
      .doc(departmentId)
      .collection(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)

    await query.get().then(snapshot => {
      let res = GetDataFromSnapshot(snapshot)
      const findRow = res.find(elem => elem.requestId === rowId)
      dispatch(actions.setSelectedRequest(findRow))
    })
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}

function queryFilterHelper({
  hotelId,
  filteredDept,
  filteredServices,
  filteredStatus,
  filteredStartDate,
  filteredEndDate,
  staff,
  locationVal,
}) {
  let query = db
    .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
    .where('hotelId', '==', hotelId)
    .where('typeOfService', '==', serviceType.serviceRequest)

  if (
    [
      'CzKrd7ZQdPBR40jSldwy',
      'JvbzSSEUS8Wg9DJS6SKf',
      '7TvRMAI69ZE93dovpFAM',
    ].includes(hotelId)
  ) {
    query = query.where('isRecurring', '==', false)
  }
  if (filteredStartDate) {
    filteredStartDate = moment(
      filteredStartDate.format('YYYY-MM-DD'),
      'YYYY-MM-DD'
    ).startOf('day')
    const requestedStartDate = firebase.firestore.Timestamp.fromDate(
      filteredStartDate.toDate()
    )
    query = query.where('requestedDate', '>=', requestedStartDate)
  }
  if (filteredEndDate) {
    filteredEndDate = moment(
      filteredEndDate.format('YYYY-MM-DD'),
      'YYYY-MM-DD'
    ).endOf('day')
    const requestedEndDate = firebase.firestore.Timestamp.fromDate(
      filteredEndDate.toDate()
    )
    query = query.where('requestedDate', '<=', requestedEndDate)
  }
  if (isFilterValueSelected(filteredDept, departmentFilterLabel)) {
    query = query.where('departmentId', '==', filteredDept)
  }
  if (isFilterValueSelected(filteredServices, serviceFilterLabel)) {
    query = query.where('service', '==', filteredServices)
  }
  if (isFilterValueSelected(filteredStatus, statusFilterLabel)) {
    query = query.where('status', '==', filteredStatus)
  }
  if (isFilterValueSelected(staff, AssignedToLabelValue)) {
    query = query.where('assignedToName', '==', staff)
  }
  if (isFilterValueSelected(locationVal, Location)) {
    const queryByLocation = query.where('locationName', '==', locationVal)
    const queryByRoom = query.where('roomNumber', '==', locationVal)
    return [queryByLocation, queryByRoom]
  }

  return query
}
