import { Button } from 'antd'
import React, {
  useEffect,
  useReducer,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  commonTableProps,
  GetActionsHelper,
  GetFetchDataOptions,
  GetInitialState,
  reducer,
} from '../../../config/archivePaginationHelper'
import {
  departmentWithOutServiceObj,
  ratingFilterLabel,
  RequestStatus,
  RequestTypeLabelValue,
  requestTypeOptionsValue,
  RequestTypes,
  ServiceLabelValue,
  StatusLabelValue,
} from '../../../config/constants'
import {
  getImage,
  isFilterValueSelected,
  removeAllRequestColumns,
  removeDepartmentRequestColumns,
  removeGuestRequestColumns,
  SelectDrops,
  sendNotification,
  SetAutoClearProp,
  Sort,
  UpdatedPageData,
} from '../../../config/utils'
import {
  GetIncomingAndRaisedRequsets,
  UpdateRequestStatus,
} from '../../../services/requests'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CustomAntdTable from '../../Common/CustomAntdTable'
import useHouseKeepingFilter from '../Department/HouseKeeping/useHouseKeepingFilter'
import RatingFilter from './../../Common/Rating/RatingFilter'
import DepartmentAndServiceKeys from '../../../config/departmentAndServicekeys'

const FetchIfDataIsFilteredByStatus = ({
  selectedStatusKey,
  ResetData,
  FetchData,
}) => {
  if (isFilterValueSelected(selectedStatusKey, StatusLabelValue)) {
    ResetData()
    FetchData({}, { ...GetInitialState() })
  }
}

const ArchivedIncomingAndRaisedRequests = props => {
  const {
    getColumns,
    type,
    resetArchive,
    setResetArchive,
    requestRaised = false,
    isMoreRequest,
    isManagementStaff = false,
  } = props
  const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
    useReducer(reducer, GetInitialState())
  const [successMessage, setSuccessMessage] = useState('')
  const [successMessageType, setSuccessMessageType] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')

  const [filteredRating, setFilteredRating] = useState(ratingFilterLabel)

  const {
    selectedRequestTypeKey,
    setSelectedRequestType,
    selectedStatusKey,
    setSelectedStatus,
    showLoader,
    setShowLoader,
  } = useHouseKeepingFilter()

  const { hotelId, hotelInfo, userInfo, servicesNew } = useSelector(
    state => state
  )

  const serviceList = useMemo(() => {
    let nServiceList = []

    if (requestRaised || isManagementStaff) {
      nServiceList = Object.values(servicesNew).flat()
    } else if (servicesNew?.[userInfo?.departmentId]?.length) {
      nServiceList = servicesNew?.[userInfo.departmentId]?.filter(
        s => !s.key && !s.default
      )
    }

    const viewBill = DepartmentAndServiceKeys.frontDesk.services.viewBill.key

    let tempServices = nServiceList
      .filter(s => ![viewBill].includes(s.key) && !s.isSubService)
      .map(s => ({ name: s.name, value: s.id, ...s }))

    if (!isMoreRequest || isManagementStaff) {
      tempServices = [...tempServices, departmentWithOutServiceObj]
    }

    tempServices = Sort(tempServices, 'name')

    return tempServices
  }, [
    isManagementStaff,
    isMoreRequest,
    requestRaised,
    servicesNew,
    userInfo.departmentId,
  ])

  const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
    GetActionsHelper(localDispatch)

  const typeConfig = {
    [RequestTypes.GuestRequest]: {
      filterFunc: removeDepartmentRequestColumns,
      showRequestTypeFilter: true,
    },
    [RequestTypes.DepartmentRequest]: {
      filterFunc: removeGuestRequestColumns,
      showRequestTypeFilter: false,
    },
    [RequestTypes.All]: {
      filterFunc: removeAllRequestColumns,
      showRequestTypeFilter: false,
    },
  }

  const { filterFunc, showRequestTypeFilter } = typeConfig[type]

  const FetchData = useCallback(
    async (
      filterData = {},
      archiveState = { data, page, fetchingData, snapshotDocs }
    ) => {
      const { startAfter, continueFetching } = GetFetchDataOptions(archiveState)

      if (continueFetching) {
        await GetIncomingAndRaisedRequsets({
          hotelInfo,
          hotelId,
          departmentId: userInfo.departmentId,
          type,
          requestRaised,
          SetFetching,
          SetData,
          page: archiveState.page,
          startAfter,
          fetchingData: archiveState.fetchingData,
          selectedRequestTypeKey,
          selectedServiceId,
          selectedStatusKey,
          filteredRating,
          isMoreRequest,
          isManagementStaff,
          ...filterData,
        })
      }
    },
    [
      SetData,
      SetFetching,
      data,
      fetchingData,
      hotelId,
      isManagementStaff,
      isMoreRequest,
      page,
      requestRaised,
      filteredRating,
      selectedRequestTypeKey,
      selectedServiceId,
      selectedStatusKey,
      snapshotDocs,
      type,
      userInfo.departmentId,
    ]
  )

  const updateArchivedTableData = useCallback(
    (rowIndex, userReqUpdateData) => {
      UpdatedPageData({
        data,
        page,
        rowIndex,
        userReqUpdateData,
        UpdateData,
      })

      // If we have alredy filtered data according to perticular status then we need to fetch the data again
      // as the data with the new status does not belong to the current filer
      FetchIfDataIsFilteredByStatus({
        FetchData,
        ResetData,
        selectedStatusKey,
      })
    },
    [FetchData, ResetData, UpdateData, data, page, selectedStatusKey]
  )

  const handleStatusChange = async updatedReqData => {
    setShowLoader(true)
    const { rowIndex, userReqUpdateData } = updatedReqData
    const reqUpdateDataByStatus = await UpdateRequestStatus(userReqUpdateData)

    if (reqUpdateDataByStatus) {
      updateArchivedTableData({ rowIndex, userReqUpdateData })
      setSuccessMessageType('success')
      SetAutoClearProp(setSuccessMessage, 'Status updated successfully')
      await sendNotification(updatedReqData)
    } else {
      setSuccessMessageType('error')
      SetAutoClearProp(
        setSuccessMessage,
        'Something went wrong! Please try again!'
      )
    }
    setShowLoader(false)
  }

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()

  const defaultColumns = getColumns({
    dispatch,
    translateTextI18N,
    handleStatusChange,
    type,
    requestRaised,
    successMessageType,
    setSuccessMessage,
    archivedHelperFunc: (rowIndex, userReqUpdateData) =>
      updateArchivedTableData({
        rowIndex,
        userReqUpdateData,
      }),
  })
    .filter(filterFunc)
    .filter(c => c.dataIndex !== 'Action')

  useEffect(() => {
    FetchData({}, { data, page, fetchingData, snapshotDocs })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, page])

  useEffect(() => {
    if (resetArchive) {
      resetFilterValue()
      setResetArchive(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetArchive])

  const resetFilterValue = useCallback(async () => {
    setSelectedRequestType(RequestTypeLabelValue)
    setSelectedServiceId(ServiceLabelValue)
    setFilteredRating(ratingFilterLabel)
    setSelectedStatus(StatusLabelValue)
    ResetData()
    FetchData(
      {
        selectedRequestTypeKey: null,
        selectedServiceId: null,
        selectedStatusKey: null,
        filteredRating: null,
      },
      { ...GetInitialState() }
    )
  }, [FetchData, ResetData, setSelectedRequestType, setSelectedStatus])

  const handlePaginationChange = useCallback(
    (setFunc, value, filterPropName) => {
      if (value) {
        setFunc(value)
        ResetData()
        FetchData({ [filterPropName]: value }, { ...GetInitialState() })
      }
    },
    [FetchData, ResetData]
  )

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-7'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              {showRequestTypeFilter ? (
                <div className='col-6 col-md-4 col-lg'>
                  <SelectDrops
                    id='selectedRequestTypeKey'
                    list={requestTypeOptionsValue}
                    value={selectedRequestTypeKey}
                    addAll
                    onChange={e =>
                      handlePaginationChange(
                        setSelectedRequestType,
                        e,
                        'selectedRequestTypeKey'
                      )
                    }
                  />
                </div>
              ) : null}

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  id='selectedServiceId'
                  list={serviceList}
                  value={selectedServiceId}
                  addAll
                  onChange={e => {
                    handlePaginationChange(
                      setSelectedServiceId,
                      serviceList?.find(i => i.id === e)?.name,
                      'selectedServiceId'
                    )
                  }}
                />
              </div>
              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  id='selectedStatusKey'
                  list={RequestStatus}
                  value={selectedStatusKey}
                  addAll
                  onChange={e =>
                    handlePaginationChange(
                      setSelectedStatus,
                      e,
                      'selectedStatusKey'
                    )
                  }
                />
              </div>
              {[RequestTypes.GuestRequest, RequestTypes.All].includes(type) ? (
                <RatingFilter
                  {...{
                    handlePaginationChange,
                    setFilteredRating,
                    filteredRating,
                  }}
                />
              ) : null}
              <div className='col-6 col-md-auto '>
                <Button
                  id='resetFilterButton'
                  type='primary'
                  className='adduserbtn'
                  onClick={resetFilterValue}
                >
                  <img src={getImage('images/clearicon.svg')} alt=''></img>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className='col-12 col-xl-12'>
          <CustomAntdTable
            id='archiveIncomingTable'
            columns={defaultColumns}
            dataSource={data[page]}
            loading={fetchingData || showLoader}
            {...commonTableProps({ GoPrev, GoNext, fetchingData, data, page })}
            message={successMessage}
            messageType={successMessageType}
          />
        </div>
      </div>
    </>
  )
}

export default ArchivedIncomingAndRaisedRequests
