import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { AddDepartmentListener } from '../../../../services/department'

import { GetCurrentUser } from '../../../../services/user'
import GlobalMsg from '../../GlobalMsg/GlobalMsg'
import CommonModal from '../../CommonModal/CommonModal'
import ProductionDetailsToast from '../../ProductionDetailsToast/ProductionDetailsToast'
import StaffHelper from '../../../Pages/Staff/StaffHelper'
import MasterLayout from '../MasterLayout/MasterLayout'
import { hotelFeedbacksListener } from '../../../../services/hotels'

function HotelAdminLayout(props) {
  const history = useHistory()
  const { hotelInfo, titleAndPermissionListenerAdded, isStaffListenerAdded } =
    useSelector(state => state)
  const dispatch = useDispatch()
  const hotelId = useMemo(() => hotelInfo?.hotelId, [hotelInfo?.hotelId])

  useEffect(() => {
    AddDepartmentListener(dispatch, hotelId)
    hotelFeedbacksListener(dispatch, hotelId)
  }, [dispatch, hotelId])

  useEffect(() => {
    if (!GetCurrentUser()) {
      history.push(`/SignIn/${props.subDomain}`)
    }
  })

  useEffect(() => {
    StaffHelper.onChangeHotelId(
      hotelId,
      dispatch,
      titleAndPermissionListenerAdded,
      isStaffListenerAdded
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId])

  return (
    <>
      <MasterLayout>
        <GlobalMsg />
        <ProductionDetailsToast />
        {props.children}
        <CommonModal />
      </MasterLayout>
    </>
  )
}

export default HotelAdminLayout
