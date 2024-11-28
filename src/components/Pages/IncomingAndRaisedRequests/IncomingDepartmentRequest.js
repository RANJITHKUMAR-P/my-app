import React from 'react'
import {
  CustomDepartmentSideMenu,
  RequestTypes,
} from '../../../config/constants'

import IncomingAndRaisedRequests from './IncomingAndRaisedRequests'

const incoming = CustomDepartmentSideMenu[0]

function IncomingDepartmentRequest() {
  return (
    <IncomingAndRaisedRequests
      sideMenuKey={incoming.subMenu[1].index}
      type={RequestTypes.DepartmentRequest}
      requestRaised={false}
    />
  )
}

export default IncomingDepartmentRequest
