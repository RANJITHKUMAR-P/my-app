import React from 'react'
import { RequestTypes } from '../../../config/constants'
import IncomingAndRaisedRequests from '../IncomingAndRaisedRequests/IncomingAndRaisedRequests'

function MoreRequests() {
  return (
    <IncomingAndRaisedRequests
      type={RequestTypes.All}
      sideMenuKey='4'
      isMoreRequest={true}
      requestRaised={false}
    />
  )
}

export default MoreRequests
