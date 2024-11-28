/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useMemo, useState } from 'react'
import { Table, Button, DatePicker, Select } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

import {
  statusFilterLabel,
  serviceStatusList,
  departmentFilterLabel,
  requestTypeFilterLabel,
  serviceFilterLabel,
  requestTypeList,
  Search,
  PaginationOptions,
  getRealtimeStatus,
  cServiceRequests,
  ServiceRequestURL,
  FilterByAssignStatus,
  SortByRequestType,
  drpRequestTypes,
  drpAssignOrNotAssign,
  RequestStatus,
} from '../../../config/constants'
import {
  setDeptService,
  getCommonColumns,
  isFilterValueSelected,
  Ternary,
  GetAddViewCommentColumn,
  getImage,
  SetAutoClearProp,
  sendNotification,
  GetStatusColumn,
  getJobStartEndImageAndName,
  ActionAdminCancel,
} from '../../../config/utils'
import SelectOption from '../../Common/SelectOption/SelectOption'
import { Option } from 'antd/lib/mentions'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import SelectAssignOrNotAssign from '../../Common/SelectAssignOrNotAssign'
import SelectRequestType from '../../Common/SelectRequestType'
import {
  serviceRequestsListenerForStatusCount,
  UpdateRequestStatus,
} from './../../../services/requests'
import CustomAlert from './../../Common/CustomAlert/CustomAlert'
import RequestImageUpload from '../../Common/RequestImageUpload'
import { updateRequestStatusValues } from '../../../services/dashboard'

const dateFormatList = ['DD-MMM-YYYY']

const filterService = async ({
  service,
  filteredRequestDate,
  filteredDept,
  filteredServices,
  filteredRequestType,
  filteredBookingReferenceNo,
  filteredStatus,
  setFilteredService,
  filterByAssignOrNotAssign,
  sortByRequestType,
  hotelId,
}) => {
  let currentfilteredService = [...service]

  //filteering out isRecurring task - don't want to show them for admin
  if (
    [
      'CzKrd7ZQdPBR40jSldwy',
      'JvbzSSEUS8Wg9DJS6SKf',
      '7TvRMAI69ZE93dovpFAM',
    ].includes(hotelId)
  ) {
    currentfilteredService = currentfilteredService.filter(
      request => request.isRecurring == false
    )
  }

  if (filteredRequestDate) {
    currentfilteredService = currentfilteredService.filter(s => {
      if (!s.requestedTime || typeof s.requestedTime === 'string') {
        return false
      }
      const requestedMoment = moment(s.requestedTime.toDate()).startOf('day')
      const filteredMoment = moment(filteredRequestDate).startOf('day')
      return requestedMoment.isSame(filteredMoment)
    })
  }

  if (isFilterValueSelected(filteredDept, departmentFilterLabel)) {
    currentfilteredService = currentfilteredService.filter(
      request => request.department === filteredDept
    )
  }

  if (isFilterValueSelected(filteredServices, serviceFilterLabel)) {
    currentfilteredService = currentfilteredService.filter(
      request =>
        request.service === filteredServices ||
        request.serviceType === filteredServices
    )
  }

  if (isFilterValueSelected(filteredRequestType, requestTypeFilterLabel)) {
    currentfilteredService = currentfilteredService.filter(
      request => request.requestType === filteredRequestType
    )
  }

  if (isFilterValueSelected(filteredStatus, statusFilterLabel)) {
    currentfilteredService = currentfilteredService.filter(
      request => request.status === filteredStatus
    )
  }

  if (filteredBookingReferenceNo) {
    currentfilteredService = currentfilteredService.filter(request =>
      String(request.bookingReferance)
        ?.toLowerCase()
        .startsWith(String(filteredBookingReferenceNo).toLowerCase())
    )
  }

  if (isFilterValueSelected(filterByAssignOrNotAssign, FilterByAssignStatus)) {
    currentfilteredService = currentfilteredService.filter(r =>
      Ternary(
        filterByAssignOrNotAssign === drpAssignOrNotAssign[0].id,
        r?.assignedToId,
        !r?.assignedToId
      )
    )
  }

  if (isFilterValueSelected(sortByRequestType, SortByRequestType)) {
    currentfilteredService = drpRequestTypes?.[sortByRequestType]?.filterFunc(
      currentfilteredService
    )
  }

  setFilteredService(currentfilteredService)
}

const RealTimeServiceRequests = ({ serviceRequestType }) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const {
    hotelInfo,
    loadingGuestService,
    guestService,
    loadingDeptService,
    deptService,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const hotelId = hotelInfo?.hotelId

  const [localDepartments, setLocalDepartments] = useState([])
  const [serviceList, setServiceList] = useState([])

  const [filteredStatus, setFilteredStatus] = useState(statusFilterLabel)
  const [filteredRequestType, setFilteredRequestType] = useState(
    requestTypeFilterLabel
  )
  const [filteredServices, setFilteredServices] = useState(serviceFilterLabel)
  const [filteredRequestDate, setFilteredRequestDate] = useState(null)
  const [filteredDept, setFilteredDept] = useState(departmentFilterLabel)
  const [filteredGuestService, setFilteredGuestService] = useState([])
  const [filteredDeptService, setFilteredDeptService] = useState([])
  const [filteredBookingReferenceNo, setFilteredBookingReferenceNo] =
    useState('')
  const [filterByAssignOrNotAssign, setFilterByAssignOrNotAssign] =
    useState(FilterByAssignStatus)
  const [sortByRequestType, setSortByRequestType] = useState(SortByRequestType)

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showLoader, setShowLoader] = useState(false)
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)
  const [statusCountData, setStatusCountData] = useState([])

  const dispatch = useDispatch()

  console.log(filteredDeptService, 'filterdDeptService')

  const isGuestRequest =
    cServiceRequests?.[serviceRequestType]?.url ===
    ServiceRequestURL.GuestRequest

  useEffect(() => {
    resetFilter()
  }, [isGuestRequest])

  /* Service Req Listerner Call Start */
  useEffect(() => {
    cServiceRequests?.[serviceRequestType]?.realTimeAPI({ hotelId, dispatch })
  }, [dispatch, hotelId, serviceRequestType])
  /* Service Req Listerner Call End */

  /* Guest Req Start */
  useEffect(() => {
    setDeptService({
      currService: Ternary(isGuestRequest, guestService, deptService),
      filteredDept,
      setLocalDepartments,
      departmentFilterLabel,
      setFilteredDept,
      setServiceList,
    })
  }, [
    isGuestRequest,
    guestService,
    deptService,
    serviceRequestType,
    filteredDept,
  ])

  useEffect(() => {
    filterService({
      service: Ternary(isGuestRequest, guestService, deptService),
      filteredRequestDate,
      filteredDept,
      filteredServices,
      filteredRequestType,
      filteredStatus,
      filteredBookingReferenceNo,
      setFilteredService: Ternary(
        isGuestRequest,
        setFilteredGuestService,
        setFilteredDeptService
      ),
      filterByAssignOrNotAssign,
      sortByRequestType,
      hotelId,
    })
  }, [
    guestService,
    filteredStatus,
    filteredRequestDate,
    filteredDept,
    filteredRequestType,
    filteredServices,
    filteredBookingReferenceNo,
    serviceRequestType,
    isGuestRequest,
    filterByAssignOrNotAssign,
    sortByRequestType,
    deptService,
  ])

  const extractStatusCounts = data => {
    const newValues = {
      serviceRequestPendingGuest: data.guestReq['Pending'] || 0,
      serviceRequestInProgressGuest: data.guestReq['In Progress'] || 0,
      serviceRequestCompletedGuest: data.guestReq['Completed'] || 0,
      serviceRequestPendingDept: data.departmentReq['Pending'] || 0,
      serviceRequestInProgressDept: data.departmentReq['In Progress'] || 0,
      serviceRequestCompletedDept: data.departmentReq['Completed'] || 0,
    }

    return newValues
  }

  // set status count data from requests
  useEffect(() => {
    if (!hotelId) return

    const unsubscribe = serviceRequestsListenerForStatusCount({
      hotelId,
      SetData: setStatusCountData,
    })

    // Clean up the listener on unmount
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [hotelId])

  // updates the completed, in-progress and pending requests count
  useEffect(async () => {
    const newValues = extractStatusCounts(statusCountData)

    await updateRequestStatusValues(hotelId, newValues)
  }, [filteredGuestService, filteredDeptService, hotelId])

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  let serviceRequestColumns = useMemo(() => {
    async function handleStatusChange(reqData) {
      setShowLoader(true)
      const { userReqUpdateData } = reqData

      const success = await UpdateRequestStatus(userReqUpdateData)

      if (success) {
        SetAutoClearProp(setSuccessMessage, 'Status updated successfully')
        await sendNotification(reqData)
      } else {
        SetAutoClearProp(
          setErrorMessage,
          'Something went wrong! Please try again!'
        )
      }
      setShowLoader(false)
    }

    const {
      assignStaffCol,
      locationCol,
      bookingReferanceCol,
      deptCol,
      guestCol,
      requestedTimeCol,
      requestTypeCol,
      roomNumberCol,
      serviceCol,
      serviceTypeCol,
      submittedTimeCol,
      guestComment,
    } = getCommonColumns({ translateTextI18N, dispatch })

    guestCol.width = 100

    let tmpCol = [
      guestCol,
      roomNumberCol,
      bookingReferanceCol,
      requestTypeCol,
      deptCol,
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
      GetStatusColumn({
        dispatch,
        handleStatusChange,
        hotelId,
        setErrorMessage,
        setShowLoader,
        setSuccessMessage,
        statusOptions: RequestStatus,
        translateTextI18N,
        userInfo,
        staffListForLoggedManager,
        childIdToParentIds,
        staffHierarchyErrorLogs,
      }),
      ActionAdminCancel({
        dispatch,
        translateTextI18N,
        userInfo,
        childIdToParentIds,
        staffHierarchyErrorLogs,
      }),
      submittedTimeCol,
      requestedTimeCol,
    ]

    if (!isGuestRequest) {
      const exculdeFields = ['roomNumber', 'bookingReferance']
      tmpCol = tmpCol.filter(i => !exculdeFields.includes(i.dataIndex))
      guestCol.title = translateTextI18N('Staff')
      tmpCol[0] = guestCol
    }

    return tmpCol
    // eslint-disable-next-line
  }, [
    childIdToParentIds,
    dispatch,
    hotelId,
    isGuestRequest,
    staffHierarchyErrorLogs,
    staffListForLoggedManager,
    translateTextI18N,
    userInfo,
  ])

  const resetFilter = () => {
    setFilteredStatus(statusFilterLabel)
    setFilteredRequestDate(null)
    setFilteredDept(departmentFilterLabel)
    setFilteredRequestType(requestTypeFilterLabel)
    setFilteredServices(serviceFilterLabel)
    setFilteredBookingReferenceNo('')
    setFilterByAssignOrNotAssign(FilterByAssignStatus)
    setSortByRequestType(SortByRequestType)
  }

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='row'>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  {isGuestRequest && (
                    <div className='col-6 col-md-4 col-lg'>
                      <div className='searchbox'>
                        <Search
                          placeholder={translateTextI18N('Booking Reference')}
                          value={filteredBookingReferenceNo}
                          onChange={e =>
                            setFilteredBookingReferenceNo(e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <Select
                        value={translateTextI18N(filteredDept)}
                        onChange={e => {
                          setFilteredDept(e)
                          setFilteredServices(serviceFilterLabel)
                        }}
                      >
                        {localDepartments?.map((dept, idx) => (
                          <Option value={dept.id} key={dept.name} id={idx}>
                            {translateTextI18N(dept.name)}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <SelectOption
                        value={filteredServices}
                        change={setFilteredServices}
                        list={serviceList}
                      ></SelectOption>
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <SelectOption
                        value={filteredRequestType}
                        change={setFilteredRequestType}
                        list={requestTypeList}
                      ></SelectOption>
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <SelectOption
                        value={filteredStatus}
                        change={setFilteredStatus}
                        list={getRealtimeStatus(serviceStatusList)}
                      ></SelectOption>
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <DatePicker
                        format={dateFormatList}
                        value={filteredRequestDate}
                        placeholder={translateTextI18N('Request Date')}
                        onChange={e => setFilteredRequestDate(e)}
                      />
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectAssignOrNotAssign
                      value={filterByAssignOrNotAssign}
                      onChange={e => setFilterByAssignOrNotAssign(e?.id)}
                      id='hotelAdmin'
                    />
                  </div>

                  <div className='col-6 col-md-4 col-lg'>
                    <SelectRequestType
                      value={sortByRequestType}
                      onChange={e => setSortByRequestType(e?.id)}
                      id='hotelAdmin'
                    />
                  </div>
                  <div className='col-6 col-md-auto '>
                    <Button
                      type='primary'
                      title='Reset Filter'
                      className='adduserbtn'
                      onClick={resetFilter}
                    >
                      <img src={getImage('images/clearicon.svg')}></img>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row ml-2 mb-2' id='srrealtime'>
                <CustomAlert
                  visible={successMessage}
                  message={successMessage}
                  type='success'
                  showIcon={true}
                  classNames='mt-2 mb-2'
                />
                <CustomAlert
                  visible={errorMessage}
                  message={errorMessage}
                  type='error'
                  showIcon={true}
                  classNames='mt-2 mb-2'
                />
              </div>
              <div className='table-wrp'>
                <Table
                  columns={serviceRequestColumns}
                  dataSource={Ternary(
                    isGuestRequest,
                    filteredGuestService,
                    filteredDeptService
                  )}
                  pagination={PaginationOptions}
                  scroll={{ y: 385 }}
                  loading={
                    Ternary(
                      isGuestRequest,
                      loadingGuestService,
                      loadingDeptService
                    ) || showLoader
                  }
                  rowKey='id'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {visibleImageUpload && (
        <RequestImageUpload
          visibleImageUpload={visibleImageUpload}
          row={requestRowInfo}
          setVisibleImageUpload={setVisibleImageUpload}
          imageUploadType={imageUploadType}
          FetchData={resetFilter}
        />
      )}
    </>
  )
}

export default RealTimeServiceRequests
