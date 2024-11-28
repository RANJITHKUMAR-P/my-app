import moment from 'moment'
import {
  AdminActionKey,
  Collections,
  CuisineLabel,
  ratingFilterLabel,
  realTimeStatusList,
  StatusLabel,
  unsubscribeList,
} from '../config/constants'
import DepartmentAndServiceKeys from '../config/departmentAndServicekeys'
import { db } from '../config/firebase'
import {
  GetDataFromSnapshot,
  isFilterValueSelected,
  paginateQueryWithOrderBy,
  sortByCreatedAt,
} from '../config/utils'
import { actions } from '../Store'
import { updatationData } from './common'
import { markNotificaitonAsRead } from './notification'
import { getRequestPath } from './user'

export const AddRoomServiceListener = (hotelId, dispatch) => {
  let collectionKey = `AddRoomServiceListener${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}`
  if (!hotelId || unsubscribeList[collectionKey]) return
  console.log(hotelId, 'hotelID')
  try {
    console.log(realTimeStatusList, "realTimeStatusList");
    dispatch(actions.setLoadingRoomServices(true))

    let servicekey =
      DepartmentAndServiceKeys.foodAndBeverage.services.roomService.key
    console.log(servicekey, "servicekey");
    let sub = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('serviceKey', '==', 'doctor')
      .where('status', 'in', realTimeStatusList)
      .onSnapshot(snapshot => {
        const requests = GetDataFromSnapshot(snapshot)
        requests.sort(sortByCreatedAt)
        dispatch(actions.setRoomServices(requests))
        dispatch(actions.setLoadingRoomServices(false))
      })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

export const AcceptRejectRoomServiceOrder = async ({
  id,
  status,
  adminAction,
  assignedById,
  assignedByName,
  assignedToId,
  assignedToName,
  hotelId,
  departmentId,
  jobStartById,
  jobStartByName,
  jobEndById,
  jobEndByName,
  request,
  completedTime,
}) => {
  try {
    let data = {
      [AdminActionKey]: adminAction,
      assignedById,
      assignedByName,
      assignedToId,
      assignedToName,
      status,
      jobStartById,
      jobStartByName,
      jobEndById,
      jobEndByName,
      completedTime,
      ...updatationData(),
    }

    // update notification read status if admin has attended request
    // & notification is unread
    let requestPath = getRequestPath({ hotelId, departmentId, requestId: id })

    markNotificaitonAsRead({ ...request, requestPath })

    const requestSnap = await db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('requestId', '==', id)
      .get()

    if (requestSnap?.docs) {
      const batch = db.batch()
      for (const doc of requestSnap.docs) {
        batch.update(doc.ref, data)
      }
      await batch.commit()

      return { success: true, message: '' }
    } else {
      return {
        success: false,
        message: 'Something went wrong! Please try again!',
      }
    }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return {
      success: false,
      message: error?.message || 'Something went wrong! Please try again!',
    }
  }
}

export const GetRoomServiceRequests = async ({
  hotelId,
  SetFetching,
  SetData,
  page,
  startAfter,
  fetchingData,
  selectedCuisine,
  selectedSubmittedDate,
  selectedStatus,
  filteredRating,
}) => {
  try {
    if (!hotelId || fetchingData) return

    SetFetching(true)

    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where(
        'serviceKey',
        '==',
        DepartmentAndServiceKeys.foodAndBeverage.services.roomService.key
      )

    if (isFilterValueSelected(selectedCuisine, CuisineLabel)) {
      query = query.where('cuisines', 'array-contains', selectedCuisine)
    }

    if (selectedSubmittedDate) {
      query = query.where(
        'createdAtDate',
        '==',
        moment(selectedSubmittedDate).startOf('day').toDate()
      )
    }

    if (isFilterValueSelected(selectedStatus, StatusLabel)) {
      query = query.where('status', '==', selectedStatus)
    }

    if (isFilterValueSelected(filteredRating, ratingFilterLabel)) {
      query = query.where('rating', '==', filteredRating)
    }

    query = paginateQueryWithOrderBy({ query, page, startAfter })

    await query.get().then(snapshot => {
      SetData({
        requests: GetDataFromSnapshot(snapshot),
        snapshotDocs: snapshot.docs,
      })
    })
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
}
