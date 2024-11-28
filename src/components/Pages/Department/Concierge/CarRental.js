/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import CommonTable from './CommonTable'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'

const CarRental = () => {
  return (
    <>
      <CommonTable
        ConciergeServiceName={DepartmentAndServiceKeys.concierge.services.carRental.name}
        ConciergeServiceKey={DepartmentAndServiceKeys.concierge.services.carRental.key}
      />
    </>
  )
}

export default CarRental
