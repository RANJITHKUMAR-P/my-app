import React from 'react'
import { RaisedRequestSideMenu, RequestTypes } from '../../../config/constants'
import IncomingAndRaisedRequests from './IncomingAndRaisedRequests'

function RaisedGuestRequest() {
  return (
    <IncomingAndRaisedRequests
      type={RequestTypes.GuestRequest}
      sideMenuParentKey={RaisedRequestSideMenu.index}
      sideMenuKey={RaisedRequestSideMenu.subMenu[0].index}
      requestRaised={true}
    />
  )
}

export default RaisedGuestRequest
