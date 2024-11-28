/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState, useReducer } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from 'antd'

import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import {
  statusFilterLabel,
  departmentFilterLabel,
  serviceStatusList,
  serviceFilterLabel,
  requestTypeFilterLabel,
  requestTypeList,
  RoomUpgradePathName,
  OtherRequestPathName,
  scheduledTimePathName,
  StatusLabelValue,
  changeUpgradeRoomOptions,
  ratingFilterLabel,
} from '../../../../config/constants'
import {
  SetAutoClearProp,
  UpdatedPageData,
  Sort,
  MapToIdName,
  getCommonColumns,
  sendNotification,
  isFilterValueSelected,
  getImage,
  getJobStartEndImageAndName,
  swapColumns,
  arrangeAssignToAndStatusCol,
  GetAddViewCommentColumn,
} from '../../../../config/utils'
import SelectOption from '../../../Common/SelectOption/SelectOption'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'

import {
  fetchExtraDeptServices,
  getServiceRequests,
  UpdateRequestStatus,
} from '../../../../services/requests'
import CustomAntdTable from './../../../Common/CustomAntdTable/index'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'
import {
  GetActionsHelper,
  GetInitialState,
  reducer,
} from '../../../../config/archivePaginationHelper'
import { AddRoomTypeListener } from '../../../../services/roomType'
import RatingFilter from '../../../Common/Rating/RatingFilter'
import RequestImageUpload from '../../../Common/RequestImageUpload'

const frontDesk = DepartmentAndServiceKeys.frontDesk
const frontDeskServices = frontDesk.services
const frontDeskType = frontDesk.type

const ScheduledTimeServices = [
  frontDeskServices.checkoutAndRequestBill.name,
  frontDeskServices.airportDropoff.name,
  frontDeskServices.wakeUpCall.name,
]
const Config = {
  [RoomUpgradePathName]: {
    type: RoomUpgradePathName,
    excludeColumnList: ['description', 'requestedTime'],
    serviceOptions: changeUpgradeRoomOptions,
    frontDeskServiceType: frontDeskType.RoomUpgrade,
  },
  [OtherRequestPathName]: {
    type: OtherRequestPathName,
    excludeColumnList: ['roomType', 'requestedTime'],
    frontDeskServiceType: frontDeskType.OtherRequest,
  },
  [scheduledTimePathName]: {
    type: scheduledTimePathName,
    excludeColumnList: ['roomType', 'description'],
    frontDeskServiceType: frontDeskType.ScheduledTime,
    serviceOptions: Object.keys(frontDeskServices)
      .map(key => frontDeskServices[key].name)
      .filter(service => ScheduledTimeServices.includes(service))
      .map(v => ({ name: v, value: v })),
  },
}

Config[OtherRequestPathName].serviceOptions = [
  ...Config[RoomUpgradePathName].serviceOptions,
  ...Config[scheduledTimePathName].serviceOptions,
]

const ArchivedFrontDeskRequests = props => {
  const { defaultColumns, location, resetArchive, setResetArchive } = props
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
    useReducer(reducer, GetInitialState())
  const {
    hotelInfo,
    roomTypes,
    roomTypeListenerAdded,
    fetchDeptService,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const hotelId = hotelInfo?.hotelId

  const [serviceList, setServiceList] = useState([])
  const [filteredStatus, setFilteredStatus] = useState(statusFilterLabel)
  const [filteredRating, setFilteredRating] = useState(ratingFilterLabel)
  const [filteredRequestType, setFilteredRequestType] = useState(
    requestTypeFilterLabel
  )
  const [filteredRequestDate, setFilteredRequestDate] = useState(null)
  const [filteredServices, setFilteredServices] = useState(serviceFilterLabel)
  const [filteredDept, setFilteredDept] = useState(departmentFilterLabel)
  const [filteredBookingReferenceNo, setFilteredBookingReferenceNo] =
    useState('')
  const [showLoader, setShowLoader] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [excludeColumnListData, setExcludeColumnListData] = useState([])
  const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
    GetActionsHelper(localDispatch)

  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  const dispatch = useDispatch()

  const handleStatusChange = async updatedReqData => {
    setShowLoader(true)
    const { rowIndex, userReqUpdateData } = updatedReqData

    const reqUpdateDataByStatus = await UpdateRequestStatus(userReqUpdateData)

    if (reqUpdateDataByStatus) {
      UpdatedPageData({
        data,
        page,
        rowIndex,
        userReqUpdateData,
        UpdateData,
      })

      // If we have already filtered data according to perticular status then we need to fetch the data again
      // as the data with the new status does not belong to the current filer
      if (isFilterValueSelected(filteredStatus, StatusLabelValue)) {
        ResetData()
        FetchData({}, { ...GetInitialState() })
      }

      SetAutoClearProp(setSuccessMessage, 'Status updated successfully')
      await sendNotification(updatedReqData)
    } else {
      SetAutoClearProp(
        setErrorMessage,
        'Something went wrong! Please try again!'
      )
    }
    setShowLoader(false)
  }

  const FetchData = async (
    filterData = {},
    archiveState = { data, page, fetchingData, snapshotDocs }
  ) => {
    const nextPageData =
      (archiveState.data[archiveState.page + 1]?.length ?? 0) > 0
    const fisrtPageData = archiveState.data[1]?.length ?? 0
    if ((archiveState.page === 1 && !fisrtPageData) || !nextPageData) {
      let startAfter = null
      if (archiveState.page > 1) {
        startAfter = archiveState.snapshotDocs[archiveState.page]
        if (!startAfter) {
          return
        }
      }
      const { serviceOptions: serviceOptionList, frontDeskServiceType } =
        Config[location.pathname]

      let serviceNamesArray = serviceOptionList.map(function (item) {
        return item['name']
      })
      if (!serviceNamesArray.length) return
      await getServiceRequests({
        hotelInfo,
        hotelId,
        departmentId: userInfo.departmentId,
        SetFetching,
        SetData,
        page: archiveState.page,
        startAfter,
        fetchingData: archiveState.fetchingData,
        filteredBookingReferenceNo,
        filteredDept,
        filteredServices,
        filteredRequestType,
        filteredStatus,
        filteredRequestDate,
        filteredRating,
        serviceNamesArray,
        frontDeskServiceType,
        ...filterData,
      })
    }
  }

  useEffect(() => {
    if (window.location.pathname === OtherRequestPathName) {
      fetchExtraDeptServices({
        hotelId,
        dispatch,
        frontDeskServiceType: frontDeskType.OtherRequest,
        departmentId: userInfo.departmentId,
        departmentKey: frontDesk.key,
      })
    }
  }, [dispatch, hotelId, userInfo.departmentId])

  useEffect(() => {
    FetchData({}, { data, page, fetchingData, snapshotDocs })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, page, serviceList])

  useEffect(() => {
    AddRoomTypeListener(hotelId, roomTypeListenerAdded, dispatch)
  }, [hotelId, roomTypeListenerAdded, dispatch])

  useEffect(() => {
    const { serviceOptions: serviceOptionList, excludeColumnList } =
      Config[location.pathname]
    let serviceNames = MapToIdName(serviceOptionList)
    if (
      !fetchDeptService.loading &&
      fetchDeptService.data &&
      window.location.pathname === OtherRequestPathName
    ) {
      serviceNames = [
        ...MapToIdName(
          fetchDeptService.data.filter(
            s => ![frontDesk.services.viewBill.key].includes(s.key)
          )
        ),
      ]
      serviceNames = Sort(serviceNames, 'name')
    }
    serviceNames.unshift({ id: 'all', name: 'All' })

    setServiceList(serviceNames)
    setExcludeColumnListData(excludeColumnList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, fetchDeptService])

  useEffect(() => {
    if (resetArchive) {
      resetFilter()
      setResetArchive(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetArchive])

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  const resetFilter = () => {
    setFilteredBookingReferenceNo('')
    setFilteredDept(departmentFilterLabel)
    setFilteredServices(serviceFilterLabel)
    setFilteredRequestType(requestTypeFilterLabel)
    setFilteredStatus(statusFilterLabel)
    setFilteredRequestDate(null)
    setFilteredRating(ratingFilterLabel)
    ResetData()
    FetchData(
      {
        filteredBookingReferenceNo: null,
        filteredDept: null,
        filteredServices: null,
        filteredRequestType: null,
        filteredStatus: null,
        filteredRating: null,
        filteredRequestDate: null,
      },
      { ...GetInitialState() }
    )
  }
  const getRoomType = roomTypeId => {
    const roomType = roomTypes.find(r => r.id === roomTypeId)
    if (roomType) {
      return roomType.roomName
    }
    return ''
  }

  const { assignStaffCol, getRatinAndFeedbackCol } = getCommonColumns({
    translateTextI18N,
    dispatch,
    handleStatusChange,
    hideAssignButton: true,
  })

  let serviceRequestColumns = [
    ...defaultColumns,
    GetAddViewCommentColumn({
      dispatch,
      translateTextI18N,
      userInfo,
    }),
    ...getJobStartEndImageAndName({ translateTextI18N, showImageUploadPopup }),
    assignStaffCol,
    ...getRatinAndFeedbackCol(),
  ]

  serviceRequestColumns = swapColumns(
    serviceRequestColumns,
    'createdAt',
    'assignedToName'
  )

  serviceRequestColumns = arrangeAssignToAndStatusCol(serviceRequestColumns, {
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

  const roomTypeColumn = serviceRequestColumns.find(
    c => c.dataIndex === 'roomTypeName'
  )
  if (roomTypeColumn) {
    roomTypeColumn.dataIndex = 'roomType'
    roomTypeColumn.render = roomTypeId => getRoomType(roomTypeId)
  }

  const handlePaginationChange = (setFunc, value, filterPropName) => {
    setFunc(value)
    ResetData()
    FetchData({ [filterPropName]: value }, { ...GetInitialState() })
  }

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='row'>
            <div className='col-12 col-xl-7'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <SelectOption
                        id='filteredRequestType'
                        value={filteredRequestType}
                        list={requestTypeList}
                        change={e =>
                          handlePaginationChange(
                            setFilteredRequestType,
                            e,
                            'filteredRequestType'
                          )
                        }
                      ></SelectOption>
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <SelectOption
                        change={e =>
                          handlePaginationChange(
                            setFilteredServices,
                            e,
                            'filteredServices'
                          )
                        }
                        value={filteredServices}
                        list={serviceList}
                        id='filteredServices'
                      ></SelectOption>
                    </div>
                  </div>

                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <SelectOption
                        change={e =>
                          handlePaginationChange(
                            setFilteredStatus,
                            e,
                            'filteredStatus'
                          )
                        }
                        value={filteredStatus}
                        list={serviceStatusList}
                      ></SelectOption>
                    </div>
                  </div>
                  <RatingFilter
                    {...{
                      handlePaginationChange,
                      setFilteredRating,
                      filteredRating,
                    }}
                  />
                  <div className='col-6 col-md-auto '>
                    <Button
                      title='Reset Filter'
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
                <CustomAntdTable
                  columns={serviceRequestColumns
                    .filter(c => !excludeColumnListData.includes(c.dataIndex))
                    .map(item => ({
                      ...item,
                      title: translateTextI18N(item.title),
                    }))}
                  dataSource={data[page]}
                  loading={fetchingData || showLoader}
                  previous={GoPrev}
                  next={GoNext}
                  disableNext={
                    fetchingData || (data[page + 1]?.length ?? 0) === 0
                  }
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
          FetchData={FetchData}
        />
      )}
    </>
  )
}

export default ArchivedFrontDeskRequests
