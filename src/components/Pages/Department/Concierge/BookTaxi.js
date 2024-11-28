/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'
import CommonTable from './CommonTable'
const BookTaxi = () => {
  return (
    <>
      <CommonTable
        ConciergeServiceName={
          DepartmentAndServiceKeys.concierge.services.bookTaxi.name
        }
        ConciergeServiceKey={
          DepartmentAndServiceKeys.concierge.services.bookTaxi.key
        }
      />
    </>
  )
}

export default BookTaxi
