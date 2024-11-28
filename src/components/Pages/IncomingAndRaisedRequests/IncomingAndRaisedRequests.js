/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import { Tabs } from 'antd'
import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import RealTimeIncomingAndRaisedRequests from './RealTimeIncomingAndRaisedRequests'
import ArchivedIncomingAndRaisedRequests from './ArchivedIncomingAndRaisedRequests'
import PageNamecard from '../../Common/PageNameCard/PageNameCard'
import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import {
  getCommonColumns,
  getJobStartEndImageAndName,
  getViewOrderDetail,
  Sort,
  Ternary,
  GetAddViewCommentColumn,
  GetFeedBackCol,
  GetFeedBackTimeCol,
} from '../../../config/utils'
import {
  archivedData,
  ManagementDeptObject,
  realTimeData,
  RequestTypes,
  StatusColumnObject,
} from '../../../config/constants'
import { actions } from '../../../Store'
import RequestImageUpload from '../../Common/RequestImageUpload'

const { TabPane } = Tabs

const deptColumnConfig = {
  [RequestTypes.GuestRequest]: {
    guest: { title: 'Guest' },
    pageHeader: 'Guest Request',
  },
  [RequestTypes.DepartmentRequest]: {
    guest: { title: 'Staff' },
    pageHeader: 'Department Request',
  },
  [RequestTypes.All]: {
    guest: { title: 'Guest / Staff' },
    pageHeader: 'Incoming Raised Request',
  },
}

const IncomingAndRaisedRequests = ({
  type,
  sideMenuKey,
  requestRaised = false,
  isMoreRequest = false,
}) => {
  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const {
    userInfo,
    departmentsNew: departments,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)
  const [resetArchive, setResetArchive] = useState(false)
  const [tabIndex, setTabIndex] = useState('1')
  const isManagementStaff =
    userInfo?.departmentId === ManagementDeptObject.id || false
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  useEffect(() => {
    if (!sideMenuKey) {
      dispatch(actions.setSideMenuSelectedKey(sideMenuKey))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  const getColumns = useCallback(
    ({
      translateTextI18N,
      handleStatusChange,
      dispatch,
      type,
      requestRaised = false,
      setErrorMessage = () => {},
      setSuccessMessage = () => {},
      archivedHelperFunc = () => {},
      setSuccessMessageType = () => {},
    }) => {
      const {
        assignStaffCol,
        deptCol,
        guestCol,
        locationCol,
        requestedTimeCol,
        requestTypeCol,
        roomNumberCol,
        serviceCol,
        requestFromCol,
        serviceTypeCol,
        statusCol,
        ActionCancelCol,
        submittedTimeCol,
        getRatinAndFeedbackCol,
        detailCol,
        guestComment,
      } = getCommonColumns({
        translateTextI18N,
        dispatch,
        handleStatusChange,
        hideAssignButton: !requestRaised
          ? requestRaised || tabIndex === '2'
          : !isMoreRequest || requestRaised || tabIndex === '2',
        userInfo,
        isManagementStaff,
        childIdToParentIds,
        staffHierarchyErrorLogs,
      })

      guestCol.title = translateTextI18N(deptColumnConfig[type].guest.title)

      const deptColTitle = `${Ternary(requestRaised, 'To', 'From ')} Department`
      deptCol.title = translateTextI18N(deptColTitle)
      deptCol.dataIndex = Ternary(
        requestRaised,
        'department',
        'fromDepartmentName'
      )

      detailCol.render = (_, row, rowIndex) => {
        return getViewOrderDetail({
          row,
          translateTextI18N,
          setErrorMessage,
          setSuccessMessage,
          dispatch,
          rowIndex,
          isArchived: tabIndex === '2',
          archivedHelperFunc,
          setSuccessMessageType,
        })
      }

      let columns = [
        guestCol,
        requestFromCol,
        roomNumberCol,
        requestTypeCol,
        detailCol,
        serviceCol,
        serviceTypeCol,
        assignStaffCol,
        locationCol,
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
        requestRaised ? StatusColumnObject(translateTextI18N) : statusCol,
        ActionCancelCol,
        submittedTimeCol,
        requestedTimeCol,
        ...getRatinAndFeedbackCol(),
        GetFeedBackCol({
          translateTextI18N,
        }),
        GetFeedBackTimeCol({
          translateTextI18N,
        }),
      ]

      if (requestRaised || isMoreRequest) {
        columns = columns.filter(c => c.dataIndex !== 'Detail')
      }

      return columns
    },
    // eslint-disable-next-line
    [
      childIdToParentIds,
      isManagementStaff,
      isMoreRequest,
      staffHierarchyErrorLogs,
      tabIndex,
      userInfo,
    ]
  )

  const getSortedDepartments = () => {
    const sortedDept = Sort([ManagementDeptObject, ...departments], 'name')
    sortedDept.unshift({ id: 'all', name: 'All' })
    return sortedDept
  }

  const commonProps = {
    getSortedDepartments,
    getColumns,
    type,
    requestRaised,
    isMoreRequest,
    isManagementStaff,
  }

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title={userInfo?.department}
                breadcrumb={[
                  deptColumnConfig[type].pageHeader,
                  userInfo?.department,
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
                    <RealTimeIncomingAndRaisedRequests {...commonProps} />
                  </TabPane>
                  <TabPane tab={translateTextI18N(archivedData)} key='2'>
                    <ArchivedIncomingAndRaisedRequests
                      resetArchive={resetArchive}
                      setResetArchive={setResetArchive}
                      {...commonProps}
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

export default IncomingAndRaisedRequests
