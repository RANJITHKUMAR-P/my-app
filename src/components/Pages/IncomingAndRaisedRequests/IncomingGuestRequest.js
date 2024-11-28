import React from 'react'
import {
  CustomDepartmentSideMenu,
  RequestTypes,
} from '../../../config/constants'
import IncomingAndRaisedRequests from './IncomingAndRaisedRequests'

const incoming = CustomDepartmentSideMenu[0]

function IncomingGuestRequest() {
  return (
    <IncomingAndRaisedRequests
      requestRaised={false}
      sideMenuKey={incoming.subMenu[0].index}
      type={RequestTypes.GuestRequest}
    />
  )
}

export default IncomingGuestRequest
