/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import { Tabs } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  archivedData,
  cServiceRequests,
  realTimeData,
  ServiceRequestURL,
} from '../../../config/constants'
import { callback } from '../../../config/utils'
import useHotelAdminDashboardStat from '../../../hooks/useHotelAdminDashboardStat'
import { actions } from '../../../Store'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CountBlueCard from '../../Common/CountCard/CountBlueCard/CountBlueCard'
import CountBrownCard from '../../Common/CountCard/CountBrownCard/CountBrownCard'
import CountGreenCard from '../../Common/CountCard/CountGreenCard/CountGreenCard'
import Header from '../../Common/Header/Header'
import PageNamecard from '../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import ArchivedTimeServiceRequests from './ArchivedTimeServiceRequests'
import RealTimeServiceRequests from './RealTimeServiceRequests'

const { TabPane } = Tabs

const ServiceRequests = () => {
  const {
    serviceRequestPendingGuest,
    serviceRequestInProgressGuest,
    serviceRequestCompletedGuest,
    serviceRequestPendingDept,
    serviceRequestInProgressDept,
    serviceRequestCompletedDept,
  } = useHotelAdminDashboardStat()
  const [pageTitle, setPageTitle] = useState('')
  const [serviceRequestType, setServiceRequestType] = useState('')
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const [resetArchive, setResetArchive] = useState(false)
  const [tabKey, setTabKey] = useState('1')

  useEffect(() => {
    const defaultPagedata = Object.values(cServiceRequests)[1]
    const currPagetitle =
      cServiceRequests?.[window.location.pathname] || defaultPagedata
    setServiceRequestType(currPagetitle.url)
    setPageTitle(currPagetitle.pageTitle)
    dispatch(
      actions.setSideMenuSelectedKey(['sub2', currPagetitle.subMenuIndex])
    )
    setTabKey('1')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.pathname])

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title={pageTitle}
                breadcrumb={['Hotel Admin', pageTitle]}
              />
            </div>
            <div className='col-12'>
              <div className='row'>
                <div className='col-12 col-md-4'>
                  <CountBrownCard
                    imageSource='images/count-rquest-br.svg'
                    no={
                      cServiceRequests?.[serviceRequestType]?.url ===
                      ServiceRequestURL.GuestRequest
                        ? serviceRequestCompletedGuest
                        : serviceRequestCompletedDept
                    }
                    text='Completed Requests'
                  ></CountBrownCard>
                </div>
                <div className='col-12 col-md-4'>
                  <CountGreenCard
                    imageSource='images/count-rquest-br.svg'
                    no={
                      cServiceRequests?.[serviceRequestType]?.url ===
                      ServiceRequestURL.GuestRequest
                        ? serviceRequestInProgressGuest
                        : serviceRequestInProgressDept
                    }
                    text='Inprogress Requests'
                  ></CountGreenCard>
                </div>
                <div className='col-12 col-md-4'>
                  <CountBlueCard
                    imageSource='images/count-rquest-br.svg'
                    no={
                      cServiceRequests?.[serviceRequestType]?.url ===
                      ServiceRequestURL.GuestRequest
                        ? serviceRequestPendingGuest
                        : serviceRequestPendingDept
                    }
                    text='Pending Requests'
                  ></CountBlueCard>
                </div>
              </div>
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row'>
                <Tabs
                  activeKey={tabKey}
                  onChange={e => {
                    setTabKey(e)
                    if (e === '2') {
                      setResetArchive(true)
                    }
                    callback()
                  }}
                  className='col-12 col-12'
                >
                  <TabPane tab={translateTextI18N(realTimeData)} key='1'>
                    <RealTimeServiceRequests
                      serviceRequestType={serviceRequestType}
                    />
                  </TabPane>
                  <TabPane tab={translateTextI18N(archivedData)} key='2'>
                    <ArchivedTimeServiceRequests
                      serviceRequestType={serviceRequestType}
                      resetArchive={resetArchive}
                      setResetArchive={setResetArchive}
                    />
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ServiceRequests
