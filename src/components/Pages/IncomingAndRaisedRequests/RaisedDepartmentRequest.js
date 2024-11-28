import React from 'react'
import { RaisedRequestSideMenu, RequestTypes } from '../../../config/constants'
import IncomingAndRaisedRequests from './IncomingAndRaisedRequests'

function RaisedDepartmentRequest() {
  return (
    <IncomingAndRaisedRequests
      type={RequestTypes.DepartmentRequest}
      sideMenuParentKey={RaisedRequestSideMenu.index}
      sideMenuKey={RaisedRequestSideMenu.subMenu[1].index}
      requestRaised={true}
    />
  )
}

export default RaisedDepartmentRequest
