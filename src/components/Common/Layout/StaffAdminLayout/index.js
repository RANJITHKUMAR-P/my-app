import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { AddDepartmentListener } from '../../../../services/department'
import { TitleAndPermissonListener } from '../../../../services/titleAndPermissions'
import {
  GetCurrentUser,
  getStaffListUnderLoggedInManager,
  StaffListener,
} from '../../../../services/user'
import { actions } from '../../../../Store'
import CommonModal from '../../CommonModal/CommonModal'

import GlobalMsg from '../../GlobalMsg/GlobalMsg'
import ProductionDetailsToast from '../../ProductionDetailsToast/ProductionDetailsToast'
import MasterLayout from '../MasterLayout/MasterLayout'
import { hotelFeedbacksListener } from '../../../../services/hotels'

function StaffAdminLayout(props) {
  const { userInfo, isStaffListenerAdded, flatSideMenus, isManagementStaff } =
    useSelector(state => state)

  const dispatch = useDispatch()
  const history = useHistory()

  const { userId, hotelId, departmentId } = userInfo

  useEffect(() => {
    if (!isManagementStaff) {
      getStaffListUnderLoggedInManager({
        dispatch,
        hotelId,
        departmentId,
      })
    }
    AddDepartmentListener(dispatch, hotelId)
  }, [departmentId, dispatch, hotelId, isManagementStaff, userId])

  useEffect(() => {
    if (!GetCurrentUser()) {
      history.push(`/SignIn/${props.subDomain}`)
    }
  })

  useEffect(() => {
    if (hotelId && isManagementStaff) {
      let addTitleAndPermission = false
      StaffListener(hotelId, isStaffListenerAdded, dispatch)

      if (flatSideMenus?.find(i => ['98', '13'].includes(i?.id))) {
        addTitleAndPermission = true
      }

      if (addTitleAndPermission) {
        dispatch(actions.setTitleAndPermissionListenerAdded())
        TitleAndPermissonListener(hotelId, dispatch)
      }

      AddDepartmentListener(dispatch, hotelId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, flatSideMenus, isManagementStaff])

  useEffect(() => {
    hotelFeedbacksListener(dispatch, hotelId)
  }, [dispatch, hotelId])

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

export default StaffAdminLayout
