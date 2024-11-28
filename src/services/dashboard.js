import { Collections, Months, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { actions } from '../Store'

export const AddHotelAdminDashboardStatListener = async (
  hotelId,
  hotelAdminDashboardStatListenerAdded,
  dispatch
) => {
  try {
    let collectionKey = `AddHotelAdminDashboardStatListener${Collections.HOTEL_ADMIN_DASHBOARD}`
    if (!hotelId || unsubscribeList[collectionKey]) return

    let unsub = db
      .collection(Collections.HOTEL_ADMIN_DASHBOARD)
      .doc(hotelId)
      .onSnapshot(doc => {
        dispatch(actions.setHotelAdminDashboardStat(doc.data() || {}))
      })

    unsubscribeList[collectionKey] = unsub
  } catch (error) {
    console.log('❌ ', error)
  }
}

export const updateRequestStatusValues = async (hotelId, newValues) => {
  try {
    if (!hotelId) {
      console.error('Hotel ID is required')
      return
    }

    const docRef = db.collection(Collections.HOTEL_ADMIN_DASHBOARD).doc(hotelId)

    await docRef.update({
      serviceRequestPendingGuest: newValues.serviceRequestPendingGuest,
      serviceRequestInProgressGuest: newValues.serviceRequestInProgressGuest,
      serviceRequestCompletedGuest: newValues.serviceRequestCompletedGuest,
      serviceRequestPendingDept: newValues.serviceRequestPendingDept,
      serviceRequestInProgressDept: newValues.serviceRequestInProgressDept,
      serviceRequestCompletedDept: newValues.serviceRequestCompletedDept,
    })
  } catch (error) {
    console.error('Error updating request status values:', error)
  }
}

export function addOverViewChartDataListener(hotelId, dispatch) {
  try {
    let collectionKey = `addOverViewChartDataListener${Collections.HOTEL_ADMIN_DASHBOARD}-${hotelId}-${Collections.GUEST_OVERVIEW}`

    if (!hotelId || unsubscribeList[collectionKey]) return

    const dayToIndex = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    }
    let sub = db
      .collection(Collections.HOTEL_ADMIN_DASHBOARD)
      .doc(hotelId)
      .collection(Collections.GUEST_OVERVIEW)
      .onSnapshot(snapshot => {
        const data = {}
        for (const doc of snapshot.docs) {
          const daysWiseCounter = doc.data()
          data[doc.id] = Array(7).fill(0)
          for (const day of Object.keys(daysWiseCounter)) {
            const dayIndex = dayToIndex[day]
            data[doc.id][dayIndex] = daysWiseCounter[day]
          }
        }
        dispatch(actions.setOvewViewChartData(data))
      })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log('🚀 ', error)
  }
}

export function getWeekKey(selectedYear, selectedMonth, selectedWeek) {
  if (selectedYear === '' || selectedMonth === '' || selectedWeek === '') {
    return ''
  }

  const month = Months[selectedMonth]?.short_name?.toLowerCase() || ''
  return `${selectedYear}-${month}-${selectedWeek + 1}`
}
