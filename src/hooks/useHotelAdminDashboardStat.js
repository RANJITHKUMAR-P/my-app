import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AddHotelAdminDashboardStatListener } from '../services/dashboard'

function useHotelAdminDashboardStat() {
  const {
    hotelId,
    hotelAdminDashboardStat,
    hotelAdminDashboardStatListenerAdded,
  } = useSelector(state => state)

  const dispatch = useDispatch()

  useEffect(() => {
    AddHotelAdminDashboardStatListener(
      hotelId,
      hotelAdminDashboardStatListenerAdded,
      dispatch
    )
  }, [dispatch, hotelAdminDashboardStatListenerAdded, hotelId])

  return hotelAdminDashboardStat
}

export default useHotelAdminDashboardStat
