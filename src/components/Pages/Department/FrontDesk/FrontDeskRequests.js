/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unused-vars */
import { Tabs } from 'antd'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { archivedData, realTimeData } from '../../../../config/constants'
import { defaultSelectedTab, getCommonColumns } from '../../../../config/utils'
import { actions } from '../../../../Store'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import Header from '../../../Common/Header/Header'
import PageNameCard from '../../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'
import ArchivedFrontDeskRequests from './ArchivedFrontDeskRequests'
import RealTimeFrontDeskRequests from './RealTimeFrontDeskRequests'

const { TabPane } = Tabs

const FrontDeskRequests = props => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [resetArchive, setResetArchive] = useState(false)
  const { sideMenuOpenKeys } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!sideMenuOpenKeys?.includes('3')) {
      dispatch(actions.setSideMenuOpenKeys('3'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    extraInfo,
    guestCol,
    requestedTimeCol,
    requestFromCol,
    requestTypeCol,
    roomNumberCol,
    roomTypeName,
    serviceCol,
    submittedTimeCol,
    guestComment,
  } = getCommonColumns({ translateTextI18N })

  const defaultColumns = [
    guestCol,
    roomNumberCol,
    requestFromCol,
    requestTypeCol,
    serviceCol,
    roomTypeName,
    extraInfo,
    requestedTimeCol,
    submittedTimeCol,
    guestComment,
  ]

  return (
    <>
      <Header></Header>
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Front Desk'
                breadcrumb={['Department Admin', 'Front Desk', 'Requests']}
              />
            </div>
            <Tabs
              defaultActiveKey={defaultSelectedTab}
              onChange={e => {
                if (e === '2') {
                  setResetArchive(true)
                }
              }}
              className='col-12 col-12'
            >
              <TabPane tab={translateTextI18N(realTimeData)} key='1'>
                <RealTimeFrontDeskRequests
                  {...props}
                  defaultColumns={defaultColumns}
                />
              </TabPane>
              <TabPane tab={translateTextI18N(archivedData)} key='2'>
                <ArchivedFrontDeskRequests
                  {...props}
                  defaultColumns={defaultColumns}
                  resetArchive={resetArchive}
                  setResetArchive={setResetArchive}
                />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </section>
    </>
  )
}

export default FrontDeskRequests
