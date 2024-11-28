/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import { Tabs } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { archivedData, realTimeData } from '../../../../../config/constants'
import DepartmentAndServiceKeys from '../../../../../config/departmentAndServicekeys'
import {
  ActionAdminCancel,
  GetAddViewCommentColumn,
  getCommonColumns,
  getJobStartEndImageAndName,
} from '../../../../../config/utils'
import { actions } from '../../../../../Store'
import { useCustomI18NTranslatorHook } from '../../../../../utility/globalization'
import Header from '../../../../Common/Header/Header'
import PageNameCard from '../../../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../../../Common/Sidemenu/Sidemenu'
import ArchivedCommonTable from './ArchivedCommonTable'
import RealTimeCommonTable from './RealTimeCommonTable'
import RequestImageUpload from '../../../../Common/RequestImageUpload'

const { TabPane } = Tabs

const conciergeServices = DepartmentAndServiceKeys.concierge.services
const getMyCarLabel = conciergeServices.getMyCar.name
const travelDeskLabel = conciergeServices.travelDesk.name

const CommonTable = ({ ConciergeServiceName, ConciergeServiceKey }) => {
  const {
    sideMenuOpenKeys,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [columns, setColumns] = useState([])
  const [resetArchive, setResetArchive] = useState(false)
  const [tabIndex, setTabIndex] = useState('1')
  const dispatch = useDispatch()
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  useEffect(() => {
    const {
      assignStaffCol,
      guestCol,
      requestFromCol,
      requestedTimeCol,
      requestTypeCol,
      roomNumberCol,
      serviceCol,
      serviceTypeCol,
      submittedTimeCol,
      ticketNumberCol,
      guestComment,
    } = getCommonColumns({
      translateTextI18N,
      dispatch,
      hideAssignButton: tabIndex === '2',
    })

    guestCol.width = 100

    let defaultColumnsList = [
      guestCol,
      roomNumberCol,
      requestFromCol,

      requestTypeCol,
      serviceCol,
      serviceTypeCol,
      ticketNumberCol,
      assignStaffCol,
      guestComment,
      ActionAdminCancel({
        dispatch,
        translateTextI18N,
        userInfo,
        childIdToParentIds,
        staffHierarchyErrorLogs,
      }),
      GetAddViewCommentColumn({
        dispatch,
        translateTextI18N,
        userInfo,
      }),
      ...getJobStartEndImageAndName({
        translateTextI18N,
        showImageUploadPopup,
      }),
      submittedTimeCol,
      requestedTimeCol,
    ]

    if (ConciergeServiceName !== getMyCarLabel) {
      let excludeColumnList = ['ticketNumber']
      if (ConciergeServiceName === travelDeskLabel) {
        excludeColumnList = ['requestedTime', 'ticketNumber']
      }
      setColumns(
        defaultColumnsList.filter(c => !excludeColumnList.includes(c.dataIndex))
      )
    } else {
      setColumns(defaultColumnsList)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex])

  useEffect(() => {
    if (!sideMenuOpenKeys?.includes('1')) {
      dispatch(actions.setSideMenuOpenKeys('1'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let props = {
    ConciergeServiceKey,
    translateTextI18N,
    defaultColumnsList: columns,
  }

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Concierge'
                breadcrumb={[
                  'Department Admin',
                  'Concierge',
                  `${ConciergeServiceName}`,
                ]}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row'>
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
                  <TabPane tab={translateTextI18N(realTimeData)} key='1'>
                    <RealTimeCommonTable {...props} />
                  </TabPane>
                  <TabPane tab={translateTextI18N(archivedData)} key='2'>
                    <ArchivedCommonTable
                      {...props}
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

export default CommonTable
