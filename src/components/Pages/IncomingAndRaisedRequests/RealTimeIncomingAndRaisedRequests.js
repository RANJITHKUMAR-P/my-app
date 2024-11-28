import React, { useEffect, useState } from 'react'
import { Button } from 'antd'

import {
  RequestStatus,
  RequestTypeLabelValue,
  StatusLabelValue,
  requestTypeOptionsValue,
  PaginationOptions,
  getRealtimeStatus,
  RequestTypes,
  FilterByAssignStatus,
  SortByRequestType,
  drpRequestTypes,
  drpAssignOrNotAssign,
  departmentFilterLabel,
  ServiceLabelValue,
  columnsToExcludeFromRealTime,
} from '../../../config/constants'
import {
  AddIncomingAndRaisedRequestListener,
  UpdateRequestStatus,
} from '../../../services/requests'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { useDispatch, useSelector } from 'react-redux'
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
  sortByCreatedAt,
  Ternary,
} from '../../../config/utils'
import TableWithCustomAlert from '../Department/HouseKeeping/TableWithCustomAlert'
import useHouseKeepingFilter from '../Department/HouseKeeping/useHouseKeepingFilter'
import { actions } from '../../../Store'
import AddRequestButton from '../../Common/AddRequestButton/AddRequestButton'
import AddServiceRequestButton from '../../Common/AddServiceRequestButton/AddServiceRequestButton'
import AddRequestModal from './AddRequestModal'
import AddServiceRequestModal from './AddServiceRequestModal'
import SelectAssignOrNotAssign from '../../Common/SelectAssignOrNotAssign'
import SelectRequestType from '../../Common/SelectRequestType'
import { auth } from '../../../config/firebase'
import { GetCurrentUser, UpdateUser } from '../../../services/user'

const requestTypeOptions = requestTypeOptionsValue

const GetFilteredRequests = ({
  incomingRequest,
  selectedRequestTypeKey,
  selectedServiceKey,
  selectedStatusKey,
  isMoreRequest,
  filterByAssignOrNotAssign,
  sortByRequestType,
  filteredDept,
  isManagementStaff,
  hotelId
}) => {
  if (!incomingRequest.length) return []

  let hkrequestList = [...incomingRequest]

  if (
    [
      'CzKrd7ZQdPBR40jSldwy',
      'JvbzSSEUS8Wg9DJS6SKf',
      '7TvRMAI69ZE93dovpFAM',
    ].includes(hotelId)
  ) {
    hkrequestList = hkrequestList.filter(
      request => request.isRecurring == false
    )
  }

  if (isFilterValueSelected(selectedRequestTypeKey, RequestTypeLabelValue)) {
    hkrequestList = hkrequestList.filter(
      r => r.requestType === selectedRequestTypeKey
    )
  }

  if (isFilterValueSelected(selectedServiceKey, ServiceLabelValue)) {
    hkrequestList = hkrequestList.filter(r => r.service === selectedServiceKey)
  }
  if (isFilterValueSelected(selectedStatusKey, StatusLabelValue)) {
    hkrequestList = hkrequestList.filter(r => r.status === selectedStatusKey)
  }
  if (isMoreRequest && !isManagementStaff) {
    hkrequestList = hkrequestList.filter(r => r.serviceKey === '')
  }

  if (isFilterValueSelected(filterByAssignOrNotAssign, FilterByAssignStatus)) {
    hkrequestList = hkrequestList.filter(r =>
      Ternary(
        filterByAssignOrNotAssign === drpAssignOrNotAssign[0].id,
        r?.assignedToId,
        !r?.assignedToId
      )
    )
  }

  if (isFilterValueSelected(filteredDept.id, departmentFilterLabel)) {
    hkrequestList = hkrequestList.filter(
      r => r.departmentId === filteredDept.id
    )
  }

  if (isFilterValueSelected(sortByRequestType, SortByRequestType)) {
    return drpRequestTypes?.[sortByRequestType]?.filterFunc(hkrequestList)
  }

  return hkrequestList.sort(sortByCreatedAt)
}

const RealTimeIncomingAndRaisedRequests = ({
  getColumns,
  type,
  requestRaised,
  isMoreRequest,
  isManagementStaff = false,
}) => {
  const [requestsList, setRequests] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [successMessageType, setSuccessMessageType] = useState('')
  const [showAddRequestModal, setShowAddRequestModal] = useState(false)
  const [showAddServiceRequestModal, setShowAddServiceRequestModal] =
    useState(false)

  useState(false)

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

  const stateKeyAndActionConfig = {
    [false]: {
      [RequestTypes.GuestRequest]: {
        loadingKey: 'loadingIncomingGuestRequest',
        requestsKey: 'incomingGuestRequest',
        action: actions.setIncomingGuestRequest,
      },
      [RequestTypes.DepartmentRequest]: {
        loadingKey: 'loadingIncomingDepartmentRequest',
        requestsKey: 'incomingDepartmentRequest',
        action: actions.setIncomingDepartmentRequest,
      },
      [RequestTypes.All]: {
        loadingKey: 'loadingIncomingAllRequest',
        requestsKey: 'incomingAllRequest',
        action: actions.setIncomingAllRequest,
      },
    },
    [true]: {
      [RequestTypes.GuestRequest]: {
        loadingKey: 'loadingRaisedGuestRequest',
        requestsKey: 'raisedGuestRequest',
        action: actions.setRaisedGuestRequest,
      },
      [RequestTypes.DepartmentRequest]: {
        loadingKey: 'loadingRaisedDepartmentRequest',
        requestsKey: 'raisedDepartmentRequest',
        action: actions.setRaisedDepartmentRequest,
      },
      [RequestTypes.All]: {
        loadingKey: 'loadingRaisedAllRequest',
        requestsKey: 'raisedAllRequest',
        action: actions.setRaisedAllRequest,
      },
    },
  }

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

  const { loadingKey, requestsKey, action } =
    stateKeyAndActionConfig[requestRaised][type]

  const {
    [loadingKey]: loadingRequests,
    [requestsKey]: requests,
    departmentsNew,
    hotelId,
    loadingGuests,
    userInfo,
    departmentAndServiceIdToInfo,
  } = useSelector(state => state)
  const dispatch = useDispatch()
  const [deptList, setDeptList] = useState([])
  const [serviceList, setServiceList] = useState([])
  const [filteredDept, setFilteredDept] = useState({
    id: departmentFilterLabel,
    value: '',
  })
  const { filterFunc, showRequestTypeFilter } = typeConfig[type]

  useEffect(() => {
    let sr = requestsList
    if (isFilterValueSelected(filteredDept.id, departmentFilterLabel)) {
      sr = sr.filter(i => i.departmentId === filteredDept.id)
    }
    sr = sr.map(r => r.service)

    let tempServiceList = [...new Set(sr)]
      .sort()
      .map(s => ({ name: translateTextI18N(s), value: s }))

    let tempDeptList = [...new Set(requestsList.map(r => r.departmentId))].map(
      s => ({ name: departmentAndServiceIdToInfo[s]?.name, value: s })
    )

    tempDeptList = Sort(tempDeptList, 'name')
    tempServiceList = Sort(tempServiceList, 'name')
    setDeptList(tempDeptList)
    setServiceList(tempServiceList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestsList, filteredDept.id])

  const handleStatusChange = async updatedReqData => {
    setShowLoader(true)
    const { userReqUpdateData } = updatedReqData
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

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const defaultColumns = getColumns({
    translateTextI18N,
    handleStatusChange,
    dispatch,
    type,
    requestRaised,
    setSuccessMessageType,
    setSuccessMessage,
  })
    .filter(c => !columnsToExcludeFromRealTime.includes(c.dataIndex))
    .filter(filterFunc)

  useEffect(() => {
    AddIncomingAndRaisedRequestListener({
      hotelId,
      departmentId: userInfo.departmentId,
      type,
      action,
      dispatch,
      requestRaised,
      isManagementStaff,
    })
  }, [
    action,
    dispatch,
    hotelId,
    isManagementStaff,
    requestRaised,
    type,
    userInfo,
  ])

  useEffect(() => {
    const filteredRequests = GetFilteredRequests({
      incomingRequest: requests,
      selectedRequestTypeKey,
      selectedServiceKey,
      selectedStatusKey,
      isMoreRequest,
      filterByAssignOrNotAssign,
      sortByRequestType,
      filteredDept,
      isManagementStaff,
      hotelId,
    })
    setRequests(filteredRequests)
  }, [
    requests,
    isMoreRequest,
    selectedRequestTypeKey,
    selectedServiceKey,
    selectedStatusKey,
    filterByAssignOrNotAssign,
    sortByRequestType,
    filteredDept,
    isManagementStaff,
  ])

  const resetFilterValue = () => {
    setSelectedRequestType(RequestTypeLabelValue)
    setSelectedService(ServiceLabelValue)
    setSelectedStatus(StatusLabelValue)
    setFilterByAssignOrNotAssign(FilterByAssignStatus)
    setSortByRequestType(SortByRequestType)
    setFilteredDept({ id: departmentFilterLabel, value: '' })
  }

  function handleAddRequestButtonClick() {
    setShowAddRequestModal(true)
  }

  function handleAddServiceRequestButtonClick() {
    setShowAddServiceRequestModal(true)
  }

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='tablefilter-wrp'>
            <div className='form-row'></div>
            <div className='form-row'>
              {showRequestTypeFilter ? (
                <div className='col-6 col-md-4 col-lg'>
                  <SelectDrops
                    id='realInco1'
                    list={requestTypeOptions}
                    value={selectedRequestTypeKey}
                    addAll
                    onChange={e => setSelectedRequestType(e)}
                  />
                </div>
              ) : null}
              {isManagementStaff && (
                <div className='col-4 col-md'>
                  <div className='cmnSelect-form' id='drpDept'>
                    <SelectDrops
                      id='realInco2'
                      list={deptList}
                      value={translateTextI18N(filteredDept.id)}
                      addAll
                      onChange={(...args) => {
                        let { value, children } = args[1]
                        setFilteredDept({ id: value, name: children })
                        setSelectedService(ServiceLabelValue)
                      }}
                    />
                  </div>
                </div>
              )}

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  id='realInco2'
                  list={serviceList}
                  value={selectedServiceKey}
                  addAll
                  onChange={e => setSelectedService(e)}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  id='realInco3'
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
                  id='incomingReq'
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectRequestType
                  value={sortByRequestType}
                  onChange={e => setSortByRequestType(e?.id)}
                  id='incomingReq'
                />
              </div>

              <div className='col-6 col-md-auto '>
                <Button
                  id='realIncoReset'
                  type='primary'
                  className='adduserbtn'
                  onClick={resetFilterValue}
                >
                  <img src={getImage('images/clearicon.svg')} alt=''></img>
                </Button>
              </div>
              <AddRequestButton
                requestRaised={requestRaised}
                onClick={handleAddRequestButtonClick}
                loading={loadingGuests || !departmentsNew.length}
              />

              <AddServiceRequestButton
                requestRaised={requestRaised}
                onClick={handleAddServiceRequestButtonClick}
                loading={loadingGuests || !departmentsNew.length}
                type={type}
              />
            </div>
          </div>
        </div>
        <div className='col-12 col-xl-12'>
          <TableWithCustomAlert
            id='realInco1'
            successMessage={successMessage}
            successMessageType={successMessageType}
            columns={defaultColumns}
            requests={requestsList}
            showLoader={showLoader || loadingRequests}
            pagination={PaginationOptions}
          />
        </div>
      </div>

      {showAddRequestModal ? (
        <AddRequestModal
          hideModal={() => setShowAddRequestModal(false)}
          type={type}
          visible={showAddRequestModal}
        />
      ) : null}

      {showAddServiceRequestModal ? (
        <AddServiceRequestModal
          hideModal={() => setShowAddServiceRequestModal(false)}
          type={type}
          visible={showAddServiceRequestModal}
        />
      ) : null}
    </>
  )
}

export default RealTimeIncomingAndRaisedRequests
