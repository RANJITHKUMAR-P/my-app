import React from 'react'
import { ReportStateProvider2 } from './model'
import ReportsLayout2 from './ReportsLayout'

const AllReports = () => {
  return (
    <ReportStateProvider2>
      <ReportsLayout2 />
    </ReportStateProvider2>
  )
}

export default AllReports
