/* eslint-disable jsx-a11y/alt-text */
import { Tabs } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useMemo, useState } from 'react'
import {
  archivedData,
  cardColorClassName,
  columnsToExcludeFromRealTime,
  realTimeData,
} from '../../../config/constants'
import {
  defaultSelectedTab,
  getCommonColumns,
  GetAddViewCommentColumn,
  getJobStartEndImageAndName,
} from '../../../config/utils'
import useHotelAdminDashboardStat from '../../../hooks/useHotelAdminDashboardStat'
import { actions } from '../../../Store'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CountCard from '../../Common/CountCard'
import Header from '../../Common/Header/Header'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import ArchivedReservations from './ArchivedReservations'
import RealTimeReservations from './RealTimeReservations'
import RequestImageUpload from '../../Common/RequestImageUpload'

const { TabPane } = Tabs

const Reservations = () => {
  const { userInfo } = useSelector(state => state)
  const { reservationCompleted, reservationInProgress, reservationPending } =
    useHotelAdminDashboardStat()

  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [resetArchive, setResetArchive] = useState(false)
  const [tabIndex, setTabIndex] = useState('1')
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  const columns = useMemo(() => {
    const {
      assignStaffCol,
      deptCol,
      guestCol,
      requestTypeCol,
      reservedTimeCol,
      roomNumberCol,
      serviceCol,
      serviceTypeCol,
      submittedTimeCol,
      detailCol,
      getRatinAndFeedbackCol,
      guestComment,
    } = getCommonColumns({
      translateTextI18N,
      hideAssignButton: tabIndex === '2',
      dispatch,
    })

    guestCol.width = 135

    let tmpCol = [
      guestCol,
      roomNumberCol,
      deptCol,
      serviceCol,
      serviceTypeCol,
      requestTypeCol,
      detailCol,
      assignStaffCol,
      guestComment,
      GetAddViewCommentColumn({
        dispatch,
        translateTextI18N,
        userInfo,
      }),
      ...getJobStartEndImageAndName({
        translateTextI18N,
        showImageUploadPopup,
      }),
      reservedTimeCol,
      submittedTimeCol,
    ]

    if (tabIndex === '2') {
      tmpCol = [...tmpCol, ...getRatinAndFeedbackCol()]
    }

    return tmpCol
    // eslint-disable-next-line
  }, [dispatch, tabIndex, translateTextI18N])

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('7'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Header id='Reservations' />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Reservations'
                breadcrumb={['Hotel Admin', 'Reservations']}
              />
            </div>
            <div className='col-12'>
              <div className='row'>
                <div className='col-12 col-md-4'>
                  <CountCard
                    title={reservationCompleted}
                    desc='Completed Reservations'
                    cardColorClassname={cardColorClassName.BROWN}
                    image='images/count-reservation-br.svg'
                  ></CountCard>
                </div>
                <div className='col-12 col-md-4'>
                  <CountCard
                    title={reservationInProgress}
                    desc='In Progress Reservations '
                    cardColorClassname={cardColorClassName.GREEN}
                    image='images/count-reservation-gr.svg'
                  ></CountCard>
                </div>
                <div className='col-12 col-md-4'>
                  <CountCard
                    title={reservationPending}
                    desc='Pending Reservations'
                    cardColorClassname={cardColorClassName.BLUE}
                    image='images/count-reservation-gr.svg'
                  ></CountCard>
                </div>
              </div>
            </div>

            <Tabs
              defaultActiveKey={defaultSelectedTab}
              onChange={e => {
                if (e === '2') {
                  setResetArchive(true)
                }
                setTabIndex(e)
              }}
              className='col-12 col-12'
            >
              <TabPane tab={translateTextI18N(realTimeData)} key={'1'}>
                <RealTimeReservations
                  columns={columns.filter(
                    c => !columnsToExcludeFromRealTime.includes(c?.dataIndex)
                  )}
                />
              </TabPane>
              <TabPane tab={translateTextI18N(archivedData)} key='2'>
                <ArchivedReservations
                  columns={columns}
                  resetArchive={resetArchive}
                  setResetArchive={setResetArchive}
                />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </section>
      {visibleImageUpload && (
        <RequestImageUpload
          visibleImageUpload={visibleImageUpload}
          row={requestRowInfo}
          setVisibleImageUpload={setVisibleImageUpload}
          imageUploadType={imageUploadType}
        />
      )}
    </>
  )
}

export default Reservations
