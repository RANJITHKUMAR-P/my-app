import React from 'react'
import { ReportStateProvider } from './model'
import ReportsLayout from './ReportsLayout'

const Reports = () => {
  return (
    <ReportStateProvider>
      <ReportsLayout />
    </ReportStateProvider>
  )
}

export default Reports
