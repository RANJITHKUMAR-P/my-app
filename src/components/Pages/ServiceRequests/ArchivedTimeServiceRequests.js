/* eslint-disable jsx-a11y/alt-text */
import React, {
  useEffect,
  useState,
  useReducer,
  useCallback,
  useMemo,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, DatePicker, Select } from 'antd'

import {
  statusFilterLabel,
  departmentFilterLabel,
  serviceStatusList,
  serviceFilterLabel,
  requestTypeFilterLabel,
  Search,
  requestTypeList,
  ServiceRequestURL,
  cServiceRequests,
  ManagementDeptObject,
  changeRoomValue,
  upgradeRoomValue,
  RequestStatus,
  ratingFilterLabel,
  departmentWithOutServiceObj,
} from '../../../config/constants'
import {
  GetDepartmentIdsToExcludeFromServiceRequest,
  toTitleCase,
  getCommonColumns,
  Sort,
  isFilterValueSelected,
  deepCloneObject,
  GetAddViewCommentColumn,
  getImage,
  SetAutoClearProp,
  sendNotification,
  getJobStartEndImageAndName,
} from '../../../config/utils'
import { Option } from 'antd/lib/mentions'
import SelectOption from '../../Common/SelectOption/SelectOption'
import { FetchDepartments } from '../../../services/department'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

import { getServiceRequests } from '../../../services/requests'
import CustomAntdTable from '../../Common/CustomAntdTable/index'
import {
  GetActionsHelper,
  GetFetchDataOptions,
  GetInitialState,
  reducer,
} from '../../../config/archivePaginationHelper'
import DepartmentAndServiceKeys from '../../../config/departmentAndServicekeys'
import { UpdateRequestStatus } from './../../../services/requests'
import {
  UpdatedPageData,
  GetStatusColumn,
  Ternary,
} from './../../../config/utils'
import CustomAlert from './../../Common/CustomAlert/CustomAlert'
import RatingFilter from './../../Common/Rating/RatingFilter'
import RequestImageUpload from '../../Common/RequestImageUpload'

const dateFormatList = ['DD-MMM-YYYY']

const GetDepartmentList1 = ({
  departments,
  setLocalDepartments,
  departmentIdsToExclude,
}) => {
  let departmentsList = [...departments]
  departmentsList = Sort(departmentsList, 'name')
  departmentsList.unshift({ id: '0', name: 'All' })
  setLocalDepartments(
    departmentsList.filter(d => !departmentIdsToExclude.includes(d.id))
  )
}

const ArchivedTimeServiceRequests = props => {
  const { resetArchive, setResetArchive, serviceRequestType } = props
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
    useReducer(reducer, GetInitialState())
  const {
    hotelInfo,
    departmentsNew: departments,
    departmentAndServiceKeyToId,
    servicesNew,
    departmentAndServiceIdToInfo,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const [localDepartmentList, setLocalDepartments] = useState([])
  const [filteredStatus, setFilteredStatus] = useState(statusFilterLabel)
  const [filteredRequestType, setFilteredRequestType] = useState(
    requestTypeFilterLabel
  )
  const [filteredRequestDate, setFilteredRequestDate] = useState(null)
  const [filteredServices, setFilteredServices] = useState(serviceFilterLabel)
  const [filteredDept, setFilteredDept] = useState(departmentFilterLabel)
  const [filteredBookingReferenceNo, setFilteredBookingReferenceNo] =
    useState('')
  const [departmentIdsToExclude, setDepartmentIdsToExclude] = useState([])
  const [showLoader, setShowLoader] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [filteredRating, setFilteredRating] = useState(ratingFilterLabel)
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
    GetActionsHelper(localDispatch)

  const dispatch = useDispatch()

  const hotelId = hotelInfo?.hotelId

  const isGuestRequest = useMemo(() => {
    return (
      cServiceRequests?.[serviceRequestType]?.url ===
      ServiceRequestURL.GuestRequest
    )
  }, [serviceRequestType])

  const FetchData = useCallback(
    async (
      filterData = {},
      archiveState = { data, page, fetchingData, snapshotDocs }
    ) => {
      const { startAfter, continueFetching } = GetFetchDataOptions(archiveState)

      if (continueFetching) {
        await getServiceRequests({
          hotelInfo,
          hotelId,
          departmentId: '',
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
          isGuestRequest,
          filteredRating,
          ...filterData,
        })
      }
    },
    [
      SetData,
      SetFetching,
      data,
      fetchingData,
      filteredBookingReferenceNo,
      filteredDept,
      filteredRating,
      filteredRequestDate,
      filteredRequestType,
      filteredServices,
      filteredStatus,
      hotelId,
      isGuestRequest,
      page,
      snapshotDocs,
    ]
  )

  useEffect(() => {
    FetchData({}, { data, page, fetchingData, snapshotDocs })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, page])

  useEffect(() => {
    setDepartmentIdsToExclude(
      GetDepartmentIdsToExcludeFromServiceRequest(departmentAndServiceKeyToId)
    )
  }, [departmentAndServiceKeyToId])

  useEffect(() => {
    FetchDepartments(hotelId, departments, dispatch)
  }, [hotelId, departments, dispatch])

  useEffect(() => {
    GetDepartmentList1({
      departments,
      setLocalDepartments,
      departmentIdsToExclude,
    })
  }, [departmentIdsToExclude, departments])

  useEffect(() => {
    if (resetArchive) {
      resetFilter()
      setResetArchive(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetArchive])

  const serviceList = useMemo(() => {
    let tempServices = []
    let addChangeUpgrade = false
    if (
      isFilterValueSelected(filteredDept, departmentFilterLabel) &&
      filteredDept !== ManagementDeptObject.id
    ) {
      tempServices = deepCloneObject(servicesNew?.[filteredDept]) || []

      addChangeUpgrade =
        departmentAndServiceIdToInfo[filteredDept].name ===
        DepartmentAndServiceKeys.frontDesk.name
    } else {
      tempServices = deepCloneObject(Object.values(servicesNew).flat())
      addChangeUpgrade = true
    }

    if (addChangeUpgrade) {
      let fdservice = [changeRoomValue, upgradeRoomValue]
      fdservice.forEach(s => {
        tempServices.push({
          name: s,
          id: s,
        })
      })
    }

    tempServices = [...new Set(tempServices?.map(s => s.name))].map(name => ({
      name,
      value: name,
      id: name,
    }))

    tempServices = [...tempServices, departmentWithOutServiceObj]

    tempServices = Sort(tempServices, 'name')

    tempServices.unshift({ id: 'all', value: 'all', name: 'All' })
    return tempServices
  }, [departmentAndServiceIdToInfo, filteredDept, servicesNew])

  const resetFilter = useCallback(() => {
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
        filteredRequestDate: null,
        filteredRating: null,
      },
      { ...GetInitialState() }
    )
  }, [FetchData, ResetData])

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  let serviceRequestColumns = useMemo(() => {
    async function handleStatusChange(updatedReqData) {
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
        if (isFilterValueSelected(filteredStatus, serviceFilterLabel)) {
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

    const {
      assignStaffCol,
      bookingReferanceCol,
      deptCol,
      guestCol,
      requestedTimeCol,
      requestTypeCol,
      roomNumberCol,
      serviceCol,
      serviceTypeCol,
      submittedTimeCol,
      locationCol,
      getRatinAndFeedbackCol,
      guestComment,
    } = getCommonColumns({
      translateTextI18N,
      hideAssignButton: true,
      dispatch,
    })

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
      submittedTimeCol,
      requestedTimeCol,
    ]

    if (isGuestRequest) {
      tmpCol.push(...getRatinAndFeedbackCol())
    }

    if (
      cServiceRequests?.[serviceRequestType]?.url ===
      ServiceRequestURL.DepartmentRequest
    ) {
      const exculdeFields = ['roomNumber', 'bookingReferance']
      tmpCol = tmpCol.filter(i => !exculdeFields.includes(i.dataIndex))

      tmpCol[0] = {
        title: translateTextI18N('Name'),
        dataIndex: 'guest',
        width: 100,
        render: guest => toTitleCase(guest),
      }
    }
    return tmpCol
    // eslint-disable-next-line
  }, [
    FetchData,
    ResetData,
    UpdateData,
    childIdToParentIds,
    data,
    dispatch,
    filteredStatus,
    hotelId,
    isGuestRequest,
    page,
    serviceRequestType,
    staffHierarchyErrorLogs,
    staffListForLoggedManager,
    translateTextI18N,
    userInfo,
  ])

  const handlePaginationChange = useCallback(
    (setFunc, value, filterPropName, optionalFilter) => {
      setFunc(value)
      ResetData()
      FetchData(
        { [filterPropName]: value, ...optionalFilter },
        { ...GetInitialState() }
      )
    },
    [FetchData, ResetData]
  )

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='row'>
            <div className='col-12 col-xl-11'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  {cServiceRequests?.[serviceRequestType]?.url ===
                    ServiceRequestURL.GuestRequest && (
                    <div className='col-6 col-md-4 col-lg'>
                      <div className='searchbox' id='searchbox'>
                        <Search
                          value={filteredBookingReferenceNo}
                          placeholder={translateTextI18N('Booking Reference')}
                          id='bookingRef'
                          onChange={e =>
                            handlePaginationChange(
                              setFilteredBookingReferenceNo,
                              e.target.value,
                              'filteredBookingReferenceNo'
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <Select
                        value={translateTextI18N(filteredDept)}
                        id={'filteredDept'}
                        onChange={e => {
                          setFilteredServices(serviceFilterLabel)
                          handlePaginationChange(
                            setFilteredDept,
                            e,
                            'filteredDept',
                            {
                              filteredServices: serviceFilterLabel,
                            }
                          )
                        }}
                      >
                        {localDepartmentList.length &&
                          localDepartmentList.map((dept, idx) => (
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

                  {Ternary(
                    isGuestRequest,
                    <RatingFilter
                      {...{
                        handlePaginationChange,
                        setFilteredRating,
                        filteredRating,
                      }}
                    />,
                    null
                  )}

                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <DatePicker
                        format={dateFormatList}
                        placeholder={translateTextI18N('Request Date')}
                        value={filteredRequestDate}
                        onChange={e =>
                          handlePaginationChange(
                            setFilteredRequestDate,
                            e,
                            'filteredRequestDate'
                          )
                        }
                      />
                    </div>
                  </div>
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
              <div className='row ml-2 mb-2' id='srarchived'>
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
                  columns={serviceRequestColumns}
                  dataSource={data[page]}
                  loading={fetchingData || showLoader}
                  previous={GoPrev}
                  next={GoNext}
                  disableNext={
                    fetchingData || (data[page + 1]?.length ?? 0) === 0
                  }
                  disablePrev={fetchingData || page === 1}
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

export default ArchivedTimeServiceRequests
