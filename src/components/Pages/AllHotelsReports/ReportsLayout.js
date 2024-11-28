/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react'
import Header from '../../Common/Header/Header'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import { useParams } from 'react-router-dom'
import { ReportState2 } from './model'

import RequestSummaryReport from './Components/RequestSummaryReport'
import RequestResponseReport from '../Reports/Components/RequestResponseReport'
import RequestStatusReport from '../Reports/Components//RequestStatusReport'
import ScheduledReport from '../Reports/Components/ScheduledReport'
import UsageReport from '../Reports/Components/UsageReport'
import FilterModal from '../Reports/Components/FilterModal'

const ReportsLayout2 = () => {
  const { reportName } = useContext(ReportState2)
  const [id, setId] = useState(1)
  const params = useParams()

  useEffect(() => {
    const repId = Number(params.reportId)
    setId(repId)
  }, [params.reportId])

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Reports'
                breadcrumb={['Hotel Admin', 'All Report', reportName]}
              />
            </div>
            {id === 1 ? <RequestSummaryReport /> : <></>}
            {id === 2 ? <RequestResponseReport /> : <></>}
            {id === 3 ? <RequestStatusReport /> : <></>}
            {id === 4 ? <ScheduledReport /> : <></>}
            {id === 6 ? <UsageReport /> : <></>}
          </div>
        </div>
      </section>
      <FilterModal />
    </>
  )
}
export default ReportsLayout2
