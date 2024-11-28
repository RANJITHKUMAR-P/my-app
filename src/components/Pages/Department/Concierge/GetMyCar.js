/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import CommonTable from './CommonTable'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'

const GetMyCar = () => {
  return (
    <>
      <CommonTable
        ConciergeServiceName={DepartmentAndServiceKeys.concierge.services.getMyCar.name}
        ConciergeServiceKey={DepartmentAndServiceKeys.concierge.services.getMyCar.key}
      />
    </>
  )
}

export default GetMyCar
