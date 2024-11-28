/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import { Button } from 'antd'
import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { useDispatch } from 'react-redux'
import {
  commonTableProps,
  GetActionsHelper,
  GetFetchDataOptions,
  GetInitialState,
  reducer,
} from '../../../../config/archivePaginationHelper'
import {
  columnsToExcludeFromArchived,
  ratingFilterLabel,
  RequestStatus,
  RequestTypeLabelValue,
  requestTypeOptionsValue,
  ServiceLabelValue,
  StatusLabelValue,
} from '../../../../config/constants'
import {
  getImage,
  getRatingOptions,
  isFilterValueSelected,
  MapToIdName,
  SelectDrops,
  sendNotification,
  SetAutoClearProp,
  Sort,
  UpdatedPageData,
} from '../../../../config/utils'
import { AuthContext } from '../../../../Router/AuthRouteProvider'
import {
  fetchExtraDeptServices,
  GetHouseKeepingRequsets,
  UpdateRequestStatus,
} from '../../../../services/requests'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import CustomAntdTable from '../../../Common/CustomAntdTable'
import { HouseKeepingColumns } from './Common'
import useHouseKeepingFilter from './useHouseKeepingFilter'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'
import RequestImageUpload from '../../../Common/RequestImageUpload'

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

const ArchivedHouseKeepingRequests = props => {
  const { resetArchive, setResetArchive } = props
  const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
    useReducer(reducer, GetInitialState())
  const [successMessage, setSuccessMessage] = useState('')
  const [successMessageType, setSuccessMessageType] = useState('')

  const {
    selectedRequestTypeKey,
    setSelectedRequestType,
    selectedServiceKey,
    setSelectedService,
    selectedStatusKey,
    setSelectedStatus,
    showLoader,
    setShowLoader,
    selectedRating,
    setSelectedRating,
  } = useHouseKeepingFilter()

  const {
    hotelId,
    hotelInfo,
    fetchDeptService,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
    ratingConfig,
  } = useContext(AuthContext)

  const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
    GetActionsHelper(localDispatch)

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
    const { rowIndex, userReqUpdateData } = reqData
    const reqUpdateDataByStatus = await UpdateRequestStatus(userReqUpdateData)

    if (reqUpdateDataByStatus) {
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
        selectedStatusKey,
        ResetData,
        FetchData,
      })

      setSuccessMessageType('success')
      SetAutoClearProp(setSuccessMessage, 'Status updated successfully')
      await sendNotification(reqData)
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
  const defaultColumns = HouseKeepingColumns({
    dispatch,
    translateTextI18N,
    handleStatusChange,
    hideAssignButton: true,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
    showImageUploadPopup,
  }).filter(c => !columnsToExcludeFromArchived.includes(c.dataIndex))

  const FetchData = async (
    filterData = {},
    archiveState = { data, page, fetchingData, snapshotDocs }
  ) => {
    const { startAfter, continueFetching } = GetFetchDataOptions(archiveState)

    if (continueFetching) {
      GetHouseKeepingRequsets({
        hotelInfo,
        hotelId,
        SetFetching,
        SetData,
        page: archiveState.page,
        startAfter,
        fetchingData: archiveState.fetchingData,
        selectedRequestTypeKey,
        selectedServiceKey,
        selectedStatusKey,
        selectedRating,
        ...filterData,
      })
    }
  }

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

  const resetFilterValue = () => {
    setSelectedRequestType(RequestTypeLabelValue)
    setSelectedService(ServiceLabelValue)
    setSelectedStatus(StatusLabelValue)
    setSelectedRating(ratingFilterLabel)
    ResetData()
    FetchData(
      {
        selectedRequestTypeKey: null,
        selectedServiceKey: null,
        selectedStatusKey: null,
        selectedRating: null,
      },
      { ...GetInitialState() }
    )
  }

  const handlePaginationChange = (setFunc, value, filterPropName) => {
    setFunc(value)
    ResetData()
    FetchData({ [filterPropName]: value }, { ...GetInitialState() })
  }

  useEffect(() => {
    fetchExtraDeptServices({
      hotelId,
      dispatch,
      departmentId: userInfo.departmentId,
      departmentKey: DepartmentAndServiceKeys.houseKeeping.key,
    })
  }, [dispatch, hotelId, userInfo.departmentId])

  const serviceOptions = useMemo(() => {
    let serviceNames = []
    if (!fetchDeptService.loading && fetchDeptService.data) {
      serviceNames = [...serviceNames, ...MapToIdName(fetchDeptService.data)]
      serviceNames = Sort(serviceNames, 'name')
      serviceNames.unshift({ id: 'all', value: 'All' })
    }
    return serviceNames
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDeptService])

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-7'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
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

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  list={serviceOptions}
                  value={selectedServiceKey}
                  addAll={false}
                  onChange={(...args) => {
                    let { children } = args[1]

                    handlePaginationChange(
                      setSelectedService,
                      children,
                      'selectedServiceKey'
                    )
                  }}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
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

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  list={getRatingOptions(ratingConfig)}
                  value={selectedRating}
                  onChange={e =>
                    handlePaginationChange(
                      setSelectedRating,
                      e,
                      'selectedRating'
                    )
                  }
                />
              </div>

              <div className='col-6 col-md-auto '>
                <Button
                  type='primary'
                  className='adduserbtn'
                  onClick={resetFilterValue}
                >
                  <img src={getImage('images/clearicon.svg')}></img>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className='col-12 col-xl-12'>
          <CustomAntdTable
            columns={defaultColumns}
            dataSource={data[page]}
            loading={fetchingData || showLoader}
            {...commonTableProps({ GoPrev, GoNext, fetchingData, data, page })}
            message={successMessage}
            messageType={successMessageType}
          />
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

export default ArchivedHouseKeepingRequests
