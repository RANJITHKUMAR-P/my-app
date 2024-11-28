import firebase from 'firebase/app'
import moment from 'moment'
import {
  Collections,
  departmentFilterLabel,
  ratingFilterLabel,
  realTimeStatusList,
  serviceFilterLabel,
  statusFilterLabel,
  StatusLabelValue,
  unsubscribeList,
} from '../config/constants'
import DepartmentAndServiceKeys, {
  serviceType,
} from '../config/departmentAndServicekeys'
import { db } from '../config/firebase'
import {
  GetDataFromSnapshot,
  isFilterValueSelected,
  paginateQueryWithOrderBy,
  sortByCreatedAt,
} from '../config/utils'
import { actions } from '../Store'
import { setDataRequests } from './requests'

export const AddReservationRealTimeListener = ({ hotelId, dispatch }) => {
  try {
    let collectionKey = `AddReservationRealTimeListener${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}`
    if (!hotelId || unsubscribeList[collectionKey]) return

    dispatch(actions.setLoadingReservations(true))

    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('typeOfService', '==', serviceType.reservation)
      .where('hotelId', '==', hotelId)
      .where('status', 'in', realTimeStatusList)
      .onSnapshot(snapshot => setReservationData(dispatch, snapshot))

    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log('❌', error)
  }
}

const setReservationData = (dispatch, snapshot) => {
  const requests = GetDataFromSnapshot(snapshot)
  requests.sort(sortByCreatedAt)
  dispatch(actions.setReservations(requests))
  dispatch(actions.setLoadingReservations(false))
}

export const AddReservationListener = ({ hotelId, dispatch }) => {
  try {
    let collectionKey = `AddReservationListener${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}`
    if (!hotelId || unsubscribeList[collectionKey]) return

    dispatch(actions.setLoadingReservations(true))

    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('departmentKey', '==', DepartmentAndServiceKeys.spaAndWellness.key)
      .where('status', 'in', realTimeStatusList)
      .onSnapshot(snapshot => setReservationData(dispatch, snapshot))

    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

let previousDate
export const AddBookingListener = ({ hotelId, dispatch, selectedDate }) => {
  try {
    let collectionKey = `AddBookingListener${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}-${selectedDate}`

    if (!hotelId || previousDate?.toString() === selectedDate?.toString())
      return

    previousDate = selectedDate

    dispatch(actions.setBookingListenerAdded(true))

    let requestedDate = selectedDate ? moment(selectedDate) : moment()
    requestedDate = requestedDate.startOf('day').toDate()

    unsubscribeList?.[collectionKey]?.()

    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('departmentKey', '==', DepartmentAndServiceKeys.spaAndWellness.key)
      .where('requestedDate', '>=', new Date(requestedDate))
      .onSnapshot(snapshot => {
        const bookings = GetDataFromSnapshot(snapshot)
        dispatch(actions.setBookings(bookings))
      })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

export const getReservation = async ({
  hotelId,
  SetFetching,
  SetData,
  page,
  startAfter,
  fetchingData,
  selectedStatus,
  selectedService,
  selectedReservationDate,
  selectedDepartment,
  filteredRating,
}) => {
  try {
    if (!hotelId || fetchingData) return
    SetFetching(true)

    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('typeOfService', '==', serviceType.reservation)

    if (isFilterValueSelected(selectedStatus, StatusLabelValue)) {
      query = query.where('status', '==', selectedStatus)
    }

    if (selectedReservationDate) {
      const selectedReservationDateTimestamp =
        firebase.firestore.Timestamp.fromDate(
          new Date(
            moment(selectedReservationDate).format(moment.HTML5_FMT.DATE)
          )
        )
      query = query.where(
        'requestedDate',
        '==',
        selectedReservationDateTimestamp
      )
    }

    if (isFilterValueSelected(selectedDepartment, departmentFilterLabel)) {
      query = query.where('department', '==', selectedDepartment)
    }

    if (isFilterValueSelected(selectedService, serviceFilterLabel)) {
      query = query.where('serviceKey', '==', selectedService)
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

export const getSpaAndWellnessReservation = async ({
  hotelId,
  SetFetching,
  SetData,
  page,
  startAfter,
  fetchingData,
  selectedService,
  selectedStatus,
  filteredRating,
}) => {
  try {
    if (!hotelId || fetchingData) return
    SetFetching(true)
    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('departmentKey', '==', DepartmentAndServiceKeys.spaAndWellness.key)
      .where('isMoreRequest', '==', false)
    if (isFilterValueSelected(selectedStatus, statusFilterLabel)) {
      query = query.where('status', '==', selectedStatus)
    }

    if (isFilterValueSelected(selectedService, serviceFilterLabel)) {
      query = query.where('serviceKey', '==', selectedService.toLowerCase())
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
