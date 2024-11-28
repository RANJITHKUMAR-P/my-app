/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import { Button } from 'antd'

import {
  RequestStatus,
  RequestTypeLabelValue,
  ServiceLabelValue,
  StatusLabelValue,
  requestTypeOptionsValue,
  PaginationOptions,
  getRealtimeStatus,
  FilterByAssignStatus,
  SortByRequestType,
  drpRequestTypes,
  drpAssignOrNotAssign,
  columnsToExcludeFromRealTime,
} from '../../../../config/constants'
import {
  getHotelDeptServiceNames,
  getImage,
  isFilterValueSelected,
  SelectDrops,
  sendNotification,
  SetAutoClearProp,
  sortByCreatedAt,
  Ternary,
} from '../../../../config/utils'
import {
  AddHouseKeepingRequestListener,
  UpdateRequestStatus,
} from '../../../../services/requests'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import { useDispatch, useSelector } from 'react-redux'
import TableWithCustomAlert from './TableWithCustomAlert'
import { HouseKeepingColumns } from './Common'
import useHouseKeepingFilter from './useHouseKeepingFilter'
import SelectAssignOrNotAssign from '../../../Common/SelectAssignOrNotAssign'
import SelectRequestType from '../../../Common/SelectRequestType'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'

const requestTypeOptions = requestTypeOptionsValue

const GetFilteredRequests = ({
  houseKeepingRequests,
  selectedRequestTypeKey,
  selectedServiceKey,
  selectedStatusKey,
  filterByAssignOrNotAssign,
  sortByRequestType,
  userInfo,
}) => {
  if (!houseKeepingRequests.length) return []

  let hkrequestList = [...houseKeepingRequests]

  if (isFilterValueSelected(selectedRequestTypeKey, RequestTypeLabelValue))
    hkrequestList = hkrequestList.filter(
      r => r.requestType === selectedRequestTypeKey
    )

  if (isFilterValueSelected(selectedServiceKey, ServiceLabelValue))
    hkrequestList = hkrequestList.filter(r => r.service === selectedServiceKey)

  if (isFilterValueSelected(selectedStatusKey, StatusLabelValue))
    hkrequestList = hkrequestList.filter(r => r.status === selectedStatusKey)

  if (isFilterValueSelected(filterByAssignOrNotAssign, FilterByAssignStatus)) {
    hkrequestList = hkrequestList.filter(r =>
      Ternary(
        filterByAssignOrNotAssign === drpAssignOrNotAssign[0].id,
        r?.assignedToId,
        !r?.assignedToId
      )
    )
  }

  if (isFilterValueSelected(sortByRequestType, SortByRequestType)) {
    return drpRequestTypes?.[sortByRequestType]?.filterFunc(hkrequestList)
  }

  hkrequestList = hkrequestList.filter(request => !request.isRecurring)
  return hkrequestList.sort(sortByCreatedAt)
}

const RealTimeHouseKeepingRequests = () => {
  const dispatch = useDispatch()
  const [requestsList, setRequests] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [successMessageType, setSuccessMessageType] = useState('')
  const [serviceOptions, setServiceOptions] = useState([])

  const [filterByAssignOrNotAssign, setFilterByAssignOrNotAssign] =
    useState(FilterByAssignStatus)
  const [sortByRequestType, setSortByRequestType] = useState(SortByRequestType)

  const {
    selectedRequestTypeKey,
    setSelectedRequestType,
    selectedServiceKey,
    setSelectedService,
    selectedStatusKey,
    setSelectedStatus,
    showLoader,
    setShowLoader,
  } = useHouseKeepingFilter()

  const {
    houseKeepingRequests,
    loadingHouseKeepingRequests,
    loadingFrontDeskRequests,
    hotelInfo,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)
  const hotelId = hotelInfo.hotelId

  const handleStatusChange = async reqData => {
    setShowLoader(true)
    const { userReqUpdateData } = reqData
    const success = await UpdateRequestStatus(userReqUpdateData)
    if (success) {
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
  const defaultColumns = HouseKeepingColumns({
    translateTextI18N,
    handleStatusChange,
    dispatch,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  }).filter(c => !columnsToExcludeFromRealTime.includes(c.dataIndex))

  useEffect(() => {
    AddHouseKeepingRequestListener({ hotelId, dispatch })
  }, [dispatch, hotelId])

  useEffect(() => {
    const filteredRequests = GetFilteredRequests({
      houseKeepingRequests,
      selectedRequestTypeKey,
      selectedServiceKey,
      selectedStatusKey,
      filterByAssignOrNotAssign,
      sortByRequestType,
      userInfo,
    })
    setRequests(filteredRequests)
  }, [
    houseKeepingRequests,
    selectedRequestTypeKey,
    selectedServiceKey,
    selectedStatusKey,
    filterByAssignOrNotAssign,
    sortByRequestType,
  ])

  const resetFilterValue = () => {
    setSelectedRequestType(RequestTypeLabelValue)
    setSelectedService(ServiceLabelValue)
    setSelectedStatus(StatusLabelValue)
    setFilterByAssignOrNotAssign(FilterByAssignStatus)
    setSortByRequestType(SortByRequestType)
  }

  useEffect(() => {
    getHotelDeptServiceNames({
      service: requestsList,
      setServiceList: setServiceOptions,
      isAllLableExist: true,
    })
  }, [requestsList])

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  list={requestTypeOptions}
                  value={selectedRequestTypeKey}
                  addAll
                  onChange={e => setSelectedRequestType(e)}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  list={serviceOptions}
                  value={selectedServiceKey}
                  addAll={true}
                  onChange={e => setSelectedService(e)}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  list={getRealtimeStatus(RequestStatus)}
                  value={selectedStatusKey}
                  addAll
                  onChange={e => setSelectedStatus(e)}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectAssignOrNotAssign
                  value={filterByAssignOrNotAssign}
                  onChange={e => setFilterByAssignOrNotAssign(e?.id)}
                  id={DepartmentAndServiceKeys.houseKeeping.key}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectRequestType
                  value={sortByRequestType}
                  onChange={e => setSortByRequestType(e?.id)}
                  id={DepartmentAndServiceKeys.houseKeeping.key}
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
          <TableWithCustomAlert
            successMessage={successMessage}
            successMessageType={successMessageType}
            columns={defaultColumns}
            requests={requestsList}
            showLoader={loadingHouseKeepingRequests}
            pagination={PaginationOptions}
          />
        </div>
      </div>
    </>
  )
}

export default RealTimeHouseKeepingRequests
