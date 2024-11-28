/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import { Button, Table } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import {
  RoomUpgradePathName,
  RequestStatus,
  OtherRequestPathName,
  scheduledTimePathName,
  StatusLabel,
  ServiceLabel,
  PaginationOptions,
  getRealtimeStatus,
  upgradeRoomValue,
  requestTypeOptionsValue,
  FilterByAssignStatus,
  drpAssignOrNotAssign,
  SortByRequestType,
  drpRequestTypes,
} from '../../../../config/constants'
import {
  ActionAdminCancel,
  arrangeAssignToAndStatusCol,
  GetAddViewCommentColumn,
  getCommonColumns,
  getHotelDeptServiceNames,
  getImage,
  getJobStartEndImageAndName,
  isFilterValueSelected,
  SelectDrops,
  sendNotification,
  SetAutoClearProp,
  sortByCreatedAt,
  swapColumns,
  Ternary,
  TranslateColumnHeader,
} from '../../../../config/utils'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'
import {
  AddFrontDeskRequsetListener,
  UpdateRequestStatus,
} from '../../../../services/requests'
import { AddRoomTypeListener } from '../../../../services/roomType'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import SelectAssignOrNotAssign from '../../../Common/SelectAssignOrNotAssign'
import SelectRequestType from '../../../Common/SelectRequestType'
import RequestImageUpload from '../../../Common/RequestImageUpload'

const RequestTypeLabel = 'Request Type'

const frontDeskServices = DepartmentAndServiceKeys.frontDesk.services
const changeUpgradeRoomServiceOptions = [
  {
    name: upgradeRoomValue,
    value: upgradeRoomValue,
    key: frontDeskServices.changeUpgradeRoom.key,
  },
  {
    name: 'Change Room',
    value: 'Change Room',
    key: frontDeskServices.changeUpgradeRoom.key,
  },
]

const GetFilteredRequests = ({
  filterByAssignOrNotAssign,
  frontDeskRequests,
  frontDeskServiceType,
  roomTypes,
  selectedRequestType,
  selectedService,
  selectedStatus,
  sortByRequestType,
}) => {
  if (!frontDeskRequests.length) return []
  let requestList = [...frontDeskRequests]

  requestList = requestList.map(request => {
    const copiedRequest = { ...request }

    copiedRequest.guestName = copiedRequest.guest

    if (copiedRequest.roomType) {
      const roomType = roomTypes.find(r => r.id === copiedRequest.roomType)
      if (roomType) {
        copiedRequest.roomTypeName = roomType.roomName
      }
    }
    return copiedRequest
  })

  if (isFilterValueSelected(selectedRequestType, RequestTypeLabel))
    requestList = requestList.filter(r => r.requestType === selectedRequestType)

  if (isFilterValueSelected(selectedService, ServiceLabel))
    requestList = requestList.filter(r => r.service === selectedService)

  if (isFilterValueSelected(selectedStatus, StatusLabel))
    requestList = requestList.filter(r => r.status === selectedStatus)

  if (isFilterValueSelected(filterByAssignOrNotAssign, FilterByAssignStatus)) {
    requestList = requestList.filter(r =>
      Ternary(
        filterByAssignOrNotAssign === drpAssignOrNotAssign[0].id,
        r?.assignedToId,
        !r?.assignedToId
      )
    )
  }

  requestList = requestList.filter(
    r => r.frontDeskServiceType === frontDeskServiceType
  )

  if (isFilterValueSelected(sortByRequestType, SortByRequestType)) {
    return drpRequestTypes?.[sortByRequestType]?.filterFunc(requestList)
  }

  return requestList.sort(sortByCreatedAt)
}

const ScheduledTimeServices = [
  frontDeskServices.checkoutAndRequestBill.name,
  frontDeskServices.airportDropoff.name,
  frontDeskServices.wakeUpCall.name,
]

const Config = {
  [RoomUpgradePathName]: {
    type: RoomUpgradePathName,
    excludeColumnList: ['description', 'requestedTime', 'completedTime'],
    serviceOptions: changeUpgradeRoomServiceOptions,
    frontDeskServiceType: DepartmentAndServiceKeys.frontDesk.type.RoomUpgrade,
  },
  [OtherRequestPathName]: {
    type: OtherRequestPathName,
    excludeColumnList: ['roomTypeName', 'requestedTime', 'completedTime'],
    frontDeskServiceType: DepartmentAndServiceKeys.frontDesk.type.OtherRequest,
    serviceOptions: Object.keys(frontDeskServices)
      .map(key => ({
        name: frontDeskServices[key].name,
        key: frontDeskServices[key].key,
      }))
      .filter(
        ({ name: sname }) =>
          !ScheduledTimeServices.includes(sname) &&
          sname !== frontDeskServices.changeUpgradeRoom.name &&
          sname !== frontDeskServices.viewBill.name
      )
      .map(o => ({ name: o.name, value: o.name, key: o.key })),
  },
  [scheduledTimePathName]: {
    type: scheduledTimePathName,
    excludeColumnList: ['roomTypeName', 'description', 'completedTime'],
    frontDeskServiceType: DepartmentAndServiceKeys.frontDesk.type.ScheduledTime,
    serviceOptions: Object.keys(frontDeskServices)
      .map(key => ({
        name: frontDeskServices[key].name,
        key: frontDeskServices[key].key,
      }))
      .filter(o => ScheduledTimeServices.includes(o.name))
      .map(o => ({ name: o.name, value: o.name, key: o.key })),
  },
}

const RealTimeFrontDeskRequests = props => {
  const { location, defaultColumns } = props
  const dispatch = useDispatch()
  const {
    frontDeskRequests,
    roomTypeListenerAdded,
    roomTypes,
    hotelInfo,
    loadingFrontDeskRequests,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const hotelId = hotelInfo?.hotelId

  const [requests, setRequests] = useState([])
  const [excludeColumnData, setExcludeColumnData] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])

  const [selectedRequestType, setSelectedRequestType] =
    useState(RequestTypeLabel)
  const [selectedService, setSelectedService] = useState(ServiceLabel)
  const [selectedStatus, setSelectedStatus] = useState(StatusLabel)

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showLoader, setShowLoader] = useState(false)

  const [filterByAssignOrNotAssign, setFilterByAssignOrNotAssign] =
    useState(FilterByAssignStatus)
  const [sortByRequestType, setSortByRequestType] = useState(SortByRequestType)
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  const handleStatusChange = async reqData => {
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
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const { assignStaffCol } = getCommonColumns({
    translateTextI18N,
    dispatch,
    handleStatusChange,
  })

  let columns = [
    ...defaultColumns,
    
    GetAddViewCommentColumn({
      dispatch,
      translateTextI18N,
      userInfo,
      
    }),
    ActionAdminCancel({
      dispatch,
      translateTextI18N,
      userInfo,
      childIdToParentIds,
      staffHierarchyErrorLogs,
    }),
    ...getJobStartEndImageAndName({ translateTextI18N, showImageUploadPopup }),
    assignStaffCol,
  ]

  columns = swapColumns(columns, 'createdAt', 'assignedToName')
  columns = arrangeAssignToAndStatusCol(columns, {
    dispatch,
    handleStatusChange,
    hotelId,
    setErrorMessage,
    setShowLoader,
    setSuccessMessage,
    translateTextI18N,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  })

  const {
    serviceOptions: serviceOptionList,
    excludeColumnList,
    frontDeskServiceType,
  } = Config[location.pathname]

  useEffect(() => {
    getHotelDeptServiceNames({
      service: frontDeskRequests.filter(
        r => r.frontDeskServiceType === frontDeskServiceType
      ),
      defaultServiceList: serviceOptionList,
      setServiceList: setServiceOptions,
      isAllLableExist: true,
    })

    setExcludeColumnData(excludeColumnList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, frontDeskRequests])

  useEffect(() => {
    AddFrontDeskRequsetListener({
      hotelId,
      frontDeskDepartmentId: userInfo.departmentId,
      dispatch,
    })
  }, [hotelId, dispatch, location.pathname, userInfo.departmentId])

  useEffect(() => {
    AddRoomTypeListener(hotelId, roomTypeListenerAdded, dispatch)
  }, [hotelId, roomTypeListenerAdded, dispatch])

  useEffect(() => {
    const filteredRequests = GetFilteredRequests({
      frontDeskRequests,
      roomTypes,
      selectedRequestType,
      selectedService,
      selectedStatus,
      frontDeskServiceType,
      filterByAssignOrNotAssign,
      sortByRequestType,
    })

    setRequests(filteredRequests)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    frontDeskRequests,
    roomTypes,
    selectedRequestType,
    selectedService,
    selectedStatus,
    filterByAssignOrNotAssign,
    sortByRequestType,
  ])

  const resetFilter = () => {
    setSelectedRequestType(RequestTypeLabel)
    setSelectedService(ServiceLabel)
    setSelectedStatus(StatusLabel)
    setFilterByAssignOrNotAssign(FilterByAssignStatus)
    setSortByRequestType(SortByRequestType)
  }

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12' id='filterFrontDeskRequests'>
          <div className='row'>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectDrops
                      list={requestTypeOptionsValue}
                      value={selectedRequestType}
                      addAll
                      onChange={e => setSelectedRequestType(e)}
                    />
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectDrops
                      list={serviceOptions}
                      value={selectedService}
                      addAll
                      onChange={e => setSelectedService(e)}
                    />
                  </div>

                  <div className='col-6 col-md-4 col-lg'>
                    <SelectDrops
                      list={getRealtimeStatus(RequestStatus)}
                      value={selectedStatus}
                      addAll
                      onChange={e => setSelectedStatus(e)}
                    />
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectAssignOrNotAssign
                      value={filterByAssignOrNotAssign}
                      onChange={e => setFilterByAssignOrNotAssign(e?.id)}
                    />
                  </div>

                  <div className='col-6 col-md-4 col-lg'>
                    <SelectRequestType
                      value={sortByRequestType}
                      onChange={e => setSortByRequestType(e?.id)}
                    />
                  </div>

                  <div className='col-6 col-md-auto '>
                    <Button
                      type='primary'
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
              <div className='row ml-2 mb-2' id='frontDeskAlerts1'>
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
                  columns={TranslateColumnHeader(
                    columns?.filter(
                      c => !excludeColumnData.includes(c.dataIndex)
                    )
                  )}
                  dataSource={requests}
                  pagination={PaginationOptions}
                  scroll={{ y: 385 }}
                  loading={showLoader || loadingFrontDeskRequests}
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

export default RealTimeFrontDeskRequests
