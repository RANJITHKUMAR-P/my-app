/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import { Table, Button } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import {
  drpAssignOrNotAssign,
  drpRequestTypes,
  FilterByAssignStatus,
  getRealtimeStatus,
  PaginationOptions,
  RequestStatus,
  ServiceLabel,
  SortByRequestType,
  StatusLabel,
} from '../../../../config/constants'
import { AddReservationListener } from '../../../../services/reservation'
import {
  setColumnOrder,
  GetAddViewCommentColumn,
  getCommonColumns,
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
  ActionAdminCancel,
} from '../../../../config/utils'
import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import { FilterByServiceAndStatus, SetServiceIdsAndFilterData } from './Common'
import { UpdateRequestStatus } from '../../../../services/requests'
import SelectAssignOrNotAssign from '../../../Common/SelectAssignOrNotAssign'
import SelectRequestType from '../../../Common/SelectRequestType'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'
import RequestImageUpload from '../../../Common/RequestImageUpload'

const FiltereData = ({
  reservationList,
  setFilteredReservations,
  pathname,
  departmentAndServiceKeyToId,
  departmentAndServiceIdToInfo,
  setServiceOptions,
  selectedService,
  selectedStatus,
  filterByAssignOrNotAssign,
  sortByRequestType,
}) => {
  let data = [...reservationList]

  data = SetServiceIdsAndFilterData(
    departmentAndServiceKeyToId,
    pathname,
    setServiceOptions,
    departmentAndServiceIdToInfo,
    data,
    false
  )

  data = FilterByServiceAndStatus(data, selectedService, selectedStatus)

  if (isFilterValueSelected(filterByAssignOrNotAssign, FilterByAssignStatus)) {
    data = data.filter(r =>
      Ternary(
        filterByAssignOrNotAssign === drpAssignOrNotAssign[0].id,
        r?.assignedToId,
        !r?.assignedToId
      )
    )
  }

  if (isFilterValueSelected(sortByRequestType, SortByRequestType)) {
    data = drpRequestTypes?.[sortByRequestType]?.filterFunc(data)
  } else {
    data = data.sort(sortByCreatedAt)
  }

  data = data.filter(d => d.serviceKey !== '')
  setFilteredReservations(data)
}

const RealTimeSpaWellnessRequests = ({
  pathname,
  swcolumns,
  translateTextI18N,
  assignStaffCol,
}) => {
  const [showLoader, setShowLoader] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [successMessageType, setSuccessMessageType] = useState('')
  const [filteredReservations, setFilteredReservations] = useState([])
  const [reservationList, setReservationList] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [selectedService, setSelectedService] = useState(ServiceLabel)
  const [selectedStatus, setSelectedStatus] = useState(StatusLabel)

  const [filterByAssignOrNotAssign, setFilterByAssignOrNotAssign] =
    useState(FilterByAssignStatus)
  const [sortByRequestType, setSortByRequestType] = useState(SortByRequestType)
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  const {
    departmentAndServiceIdToInfo,
    departmentAndServiceKeyToId,
    hotelInfo,
    loadingReservations,
    reservationListenerAdded,
    reservations,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const hotelId = hotelInfo?.hotelId

  const dispatch = useDispatch()

  useEffect(() => {
    AddReservationListener({ hotelId, reservationListenerAdded, dispatch })
  }, [dispatch, hotelId, reservationListenerAdded])

  useEffect(() => {
    FiltereData({
      reservationList,
      setFilteredReservations,
      pathname,
      departmentAndServiceKeyToId,
      departmentAndServiceIdToInfo,
      setServiceOptions,
      selectedService,
      selectedStatus,
      filterByAssignOrNotAssign,
      sortByRequestType,
    })
  }, [
    departmentAndServiceIdToInfo,
    departmentAndServiceKeyToId,
    pathname,
    reservationList,
    selectedService,
    selectedStatus,
    filterByAssignOrNotAssign,
    sortByRequestType,
  ])

  useEffect(() => {
    setReservationList(reservations)
  }, [reservations])

  const resetFilter = () => {
    setSelectedService(ServiceLabel)
    setSelectedStatus(StatusLabel)
    setFilterByAssignOrNotAssign(FilterByAssignStatus)
    setSortByRequestType(SortByRequestType)
  }

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  const handleStatusChange = async updatedReqData => {
    const { userReqUpdateData } = updatedReqData

    setShowLoader(true)
    const success = await UpdateRequestStatus(userReqUpdateData)

    if (success) {
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

  const { statusCol } = getCommonColumns({
    dispatch,
    handleStatusChange,
    translateTextI18N,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  })

  swcolumns = [
    ...swcolumns.filter(c => c.dataIndex !== 'completedTime'),
    assignStaffCol,
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
    ...getJobStartEndImageAndName({ translateTextI18N, showImageUploadPopup }),
    statusCol,
  ]

  swcolumns = swapColumns(swcolumns, 'createdAt', 'assignedToName')
  swcolumns = setColumnOrder(swcolumns, 'assignedToName', 'status')

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              {Ternary(
                serviceOptions.length > 1,
                <div className='col-6 col-md-4 col-lg'>
                  <SelectDrops
                    visible={serviceOptions.length > 1}
                    list={serviceOptions}
                    value={selectedService}
                    addAll
                    onChange={e => setSelectedService(e)}
                  />
                </div>,
                null
              )}

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
                  id={DepartmentAndServiceKeys.spaAndWellness.key}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectRequestType
                  value={sortByRequestType}
                  onChange={e => setSortByRequestType(e?.id)}
                  id={DepartmentAndServiceKeys.spaAndWellness.key}
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
          <div className='table-wrp'>
            <div className='row ml-2 mb-2' id='frontDeskAlerts1'>
              <CustomAlert
                visible={successMessage}
                message={successMessage}
                type={successMessageType}
                showIcon={true}
                classNames='mt-2 mb-2'
              />
            </div>
            <Table
              columns={TranslateColumnHeader(swcolumns)}
              dataSource={filteredReservations}
              pagination={PaginationOptions}
              scroll={{ y: 375 }}
              rowKey='id'
              loading={loadingReservations || showLoader}
            />
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

export default RealTimeSpaWellnessRequests
