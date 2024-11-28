import { APIs, Collections, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { actions } from '../Store'
import { creationData, updatationData } from './common'
import Axios from '../utility/axiosHelper'
import { GetAxiosHeaders } from '../config/utils'

export const AddRoomTypeListener = async (
  hotelId,
  roomTypeListenerAdded,
  dispatch
) => {
  try {
    let collectionKey = `AddRoomTypeListener_${Collections.ROOM_TYPE}`
    if (!hotelId || roomTypeListenerAdded || unsubscribeList[collectionKey])
      return

    dispatch(actions.setRoomTypeListenerAdded(true))
    let unSub = db
      .collection(Collections.ROOM_TYPE)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .orderBy('createdAt')
      .onSnapshot(roomTypeSnapshot => {
        const roomTypes = []
        for (const roomType of roomTypeSnapshot.docs) {
          roomTypes.push({ id: roomType.id, ...roomType.data() })
        }
        dispatch(actions.setRoomTypes(roomTypes))
      })

    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.log(error)
  }
}

export const SaveRoomType = async roomType => {
  try {
    await db
      .collection(Collections.ROOM_TYPE)
      .doc()
      .set({
        ...roomType,
        ...creationData(),
      })

    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const UpdateRoomType = async (roomType, roomTypeId) => {
  try {
    await db
      .collection(Collections.ROOM_TYPE)
      .doc(roomTypeId)
      .update({
        ...roomType,
        ...updatationData(),
      })

    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const DeleteRoomType = async roomTypeId => {
  try {
    await db
      .collection(Collections.ROOM_TYPE)
      .doc(roomTypeId)
      .update({
        isDelete: true,
        ...updatationData(),
      })
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

export const getHotelRooms = async (hotelId, dispatch) => {
  try {
    const roomArr = []
    dispatch(actions.setRoomsLoading(true))
    const headers = await GetAxiosHeaders()
    let res = await Axios.post(APIs.GET_ROOMS, { hotelId }, { headers })

    if (res?.totalResults > 0) {
      const {
        hotelRoomsDetails: { room },
      } = res
      room.forEach((ele, index) => {
        const { roomId, roomType, housekeeping } = ele

        const obj = {
          srNo: index + 1,
          roomClass: roomType?.roomClass,
          roomType: roomType?.roomType,
          roomId,
          roomStatus: housekeeping?.roomStatus?.roomStatus,
          frontOfficeStatus: housekeeping?.roomStatus?.frontOfficeStatus,
        }
        roomArr.push(obj)
      })
    }
    dispatch(actions.setRooms(roomArr))
    dispatch(actions.setRoomsLoading(false))
  } catch (error) {
    console.log(error)
    dispatch(actions.setRooms([]))
    dispatch(actions.setRoomsLoading(false))
  }
}

export const getOutofServiceRooms = async (
  hotelId,
  startDate,
  endDate,
  dispatch
) => {
  try {
    const outOfServiceRoomArr = []
    dispatch(actions.setOutOfServiceRoomsLoading(true))
    const headers = await GetAxiosHeaders()
    let res = await Axios.post(
      APIs.OUT_OF_SERVICE_ROOMS,
      { hotelId, startDate, endDate },
      { headers }
    )
    if (res?.housekeepingRooms) {
      const {
        housekeepingRooms: { room },
      } = res
      room.forEach((ele, index) => {
        const { roomId, roomType, outOfOrder } = ele
        const obj = {
          srNo: index + 1,
          roomClass: roomType?.roomClass,
          roomType: roomType?.roomType,
          roomId,
          outOfOrder,
        }
        outOfServiceRoomArr.push(obj)
      })
    }
    dispatch(actions.setOutOfServiceRooms(outOfServiceRoomArr))
    dispatch(actions.setOutOfServiceRoomsLoading(false))
  } catch (error) {
    console.log(error)
    dispatch(actions.setOutOfServiceRooms([]))
    dispatch(actions.setOutOfServiceRoomsLoading(false))
  }
}
