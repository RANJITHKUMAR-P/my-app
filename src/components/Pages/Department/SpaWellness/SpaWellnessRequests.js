/* eslint-disable jsx-a11y/alt-text */
import { Tabs } from 'antd'
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { archivedData, realTimeData } from '../../../../config/constants'
import { getCommonColumns } from '../../../../config/utils'
import { actions } from '../../../../Store'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import Header from '../../../Common/Header/Header'
import PageNamecard from '../../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'
import ArchivedSpaWellnessRequests from './ArchivedSpaWellnessRequests'
import RealTimeSpaWellnessRequests from './RealTimeSpaWellnessRequests'

const { TabPane } = Tabs

const SpaWellnessRequests = ({ location: { pathname } }) => {
  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { sideMenuOpenKeys } = useSelector(state => state)

  const [serviceOptions, setServiceOptions] = useState([])
  const [resetArchive, setResetArchive] = useState(false)
  const [tabIndex, setTabIndex] = useState('1')

  const {
    guestCol,
    roomNumberCol,
    requestFromCol,
    serviceCol,
    serviceTypeCol,
    reservedTimeCol,
    submittedTimeCol,
    guestComment,
    assignStaffCol,
  } = getCommonColumns({
    dispatch,
    translateTextI18N,
    hideAssignButton: tabIndex === '2',
  })

  guestCol.width = 130
  roomNumberCol.width = 110
  serviceCol.width = 90
  submittedTimeCol.width = 145
  reservedTimeCol.width = 145

  const swcolumns = [
    guestCol,
    roomNumberCol,
    requestFromCol,
    serviceCol,
    serviceTypeCol,
    submittedTimeCol,
    guestComment,
    reservedTimeCol,
  ]

  let props = {
    pathname,
    swcolumns,
    translateTextI18N,
    serviceOptions,
    setServiceOptions,
    assignStaffCol,
  }

  useEffect(() => {
    if (sideMenuOpenKeys?.includes('2')) {
      dispatch(actions.setSideMenuOpenKeys('2'))
    }
    if (!sideMenuOpenKeys?.includes('3')) {
      dispatch(actions.setSideMenuOpenKeys('3'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='Spa & Wellness'
                breadcrumb={[
                  'Department Admin',
                  'Spa & Wellness',
                  'Reservation',
                ]}
              />
            </div>

            <Tabs
              activeKey={tabIndex}
              onChange={e => {
                if (e === '2') {
                  setResetArchive(true)
                }
                setTabIndex(e)
              }}
              className='col-12 col-12'
            >
              <TabPane tab={translateTextI18N(realTimeData)} key={'1'}>
                <RealTimeSpaWellnessRequests {...props} />
              </TabPane>
              <TabPane tab={translateTextI18N(archivedData)} key='2'>
                <ArchivedSpaWellnessRequests
                  {...props}
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

export default SpaWellnessRequests
