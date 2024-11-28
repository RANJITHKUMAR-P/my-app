/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import CommonTable from './CommonTable'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'

const TravelDesk = () => {
  return (
    <>
      <CommonTable
        ConciergeServiceName={DepartmentAndServiceKeys.concierge.services.travelDesk.name}
        ConciergeServiceKey={DepartmentAndServiceKeys.concierge.services.travelDesk.key}
      />
    </>
  )
}

export default TravelDesk
