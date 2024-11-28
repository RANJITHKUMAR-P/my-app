/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react'
import Header from '../../Common/Header/Header'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import { useParams } from 'react-router-dom'
import { ReportState } from './model'
import RequestSummaryReport from './Components/RequestSummaryReport'
import RequestResponseReport from './Components/RequestResponseReport'
import RequestStatusReport from './Components/RequestStatusReport'
import ScheduledReport from './Components/ScheduledReport'
import UsageReport from './Components/UsageReport'
import FilterModal from './Components/FilterModal'

const ReportsLayout = () => {
  const { reportName } = useContext(ReportState)
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
                breadcrumb={['Hotel Admin', 'Reports', reportName]}
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
export default ReportsLayout
