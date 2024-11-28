/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Button } from 'antd'

import {
  RequestStatus,
  RequestTypeLabelValue,
  StatusLabelValue,
  requestTypeOptionsValue,
  getRealtimeStatus,
  FilterByAssignStatus,
  SortByRequestType,
  drpRequestTypes,
  drpAssignOrNotAssign,
} from '../../../../../config/constants'
import {
  getImage,
  GetStatusColumn,
  isFilterValueSelected,
  SelectDrops,
  sendNotification,
  SetAutoClearProp,
  setColumnOrder,
  sortByCreatedAt,
  Ternary,
} from '../../../../../config/utils'

import TableWithCustomAlert from '../../HouseKeeping/TableWithCustomAlert'
import {
  AddConciergeRequsetListener,
  UpdateRequestStatus,
} from '../../../../../services/requests'
import { useDispatch, useSelector } from 'react-redux'
import { FetchDepartments } from '../../../../../services/department'
import SelectAssignOrNotAssign from '../../../../Common/SelectAssignOrNotAssign'
import SelectRequestType from '../../../../Common/SelectRequestType'
import DepartmentAndServiceKeys from '../../../../../config/departmentAndServicekeys'

const RequestTypeKeyLabel = RequestTypeLabelValue
const StatusLabel = StatusLabelValue
const conciergeRequestTypeOptions = requestTypeOptionsValue

const RealTimeCommonTable = ({
  ConciergeServiceName,
  ConciergeServiceKey,
  translateTextI18N,
  defaultColumnsList,
}) => {
  const [successMessage, setSuccessMessage] = useState('')
  const [successMessageType, setSuccessMessageType] = useState('')
  const [showLoader, setShowLoader] = useState(false)
  const [requestsList, setRequests] = useState([])
  const [conciergeSelectedRequestTypeKey, setConciergeSelectedRequestType] =
    useState(RequestTypeKeyLabel)
  const [conciergeSelectedStatusKey, setConciergeSelectedStatus] =
    useState(StatusLabel)
  const [filterByAssignOrNotAssign, setFilterByAssignOrNotAssign] =
    useState(FilterByAssignStatus)
  const [sortByRequestType, setSortByRequestType] = useState(SortByRequestType)

  const {
    loadingConciergeRequests,
    conciergeRequests,
    hotelInfo,
    conciergeDepartmentId,
    departments,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const dispatch = useDispatch()

  const hotelId = hotelInfo.hotelId

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

  defaultColumnsList = [
    ...defaultColumnsList.filter(c => c.dataIndex !== 'completedTime'),
    GetStatusColumn({
      dispatch,
      handleStatusChange,
      hotelId,
      setErrorMessage: () => {},
      setShowLoader,
      setSuccessMessage,
      statusOptions: RequestStatus,
      translateTextI18N,
      userInfo,
      staffListForLoggedManager,
      childIdToParentIds,
      staffHierarchyErrorLogs,
    }),
  ]

  defaultColumnsList = setColumnOrder(
    defaultColumnsList,
    'assignedToName',
    'status',
  )

  useEffect(() => {
    if (!conciergeRequests?.[ConciergeServiceKey].length) {
      setRequests([])
      return []
    }

    let conciergeRequestList = Ternary(
      conciergeRequests?.[ConciergeServiceKey],
      [...conciergeRequests[ConciergeServiceKey]],
      []
    )

    if (
      isFilterValueSelected(
        conciergeSelectedRequestTypeKey,
        RequestTypeKeyLabel
      )
    ) {
      conciergeRequestList = conciergeRequestList.filter(
        r => r.requestType === conciergeSelectedRequestTypeKey
      )
    }

    if (ConciergeServiceName) {
      conciergeRequestList = conciergeRequestList.filter(
        r => r.service === ConciergeServiceName
      )
    }

    if (isFilterValueSelected(conciergeSelectedStatusKey, StatusLabel)) {
      conciergeRequestList = conciergeRequestList.filter(
        r => r.status === conciergeSelectedStatusKey
      )
    }

    if (
      isFilterValueSelected(filterByAssignOrNotAssign, FilterByAssignStatus)
    ) {
      conciergeRequestList = conciergeRequestList.filter(r =>
        Ternary(
          filterByAssignOrNotAssign === drpAssignOrNotAssign[0].id,
          r?.assignedToId,
          !r?.assignedToId
        )
      )
    }

    if (isFilterValueSelected(sortByRequestType, SortByRequestType)) {
      conciergeRequestList =
        drpRequestTypes?.[sortByRequestType]?.filterFunc(conciergeRequestList)
    } else {
      conciergeRequestList = conciergeRequestList.sort(sortByCreatedAt)
    }

    setRequests(conciergeRequestList)
  }, [
    conciergeRequests,
    conciergeSelectedRequestTypeKey,
    conciergeSelectedStatusKey,
    ConciergeServiceKey,
    ConciergeServiceName,
    filterByAssignOrNotAssign,
    sortByRequestType,
  ])

  const resetFilterData = () => {
    setConciergeSelectedRequestType(RequestTypeKeyLabel)
    setConciergeSelectedStatus(StatusLabel)
    setFilterByAssignOrNotAssign(FilterByAssignStatus)
    setSortByRequestType(SortByRequestType)
  }

  useEffect(() => {
    AddConciergeRequsetListener({
      hotelId,
      conciergeDepartmentId,
      ConciergeServiceKey,
      dispatch,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, conciergeDepartmentId, dispatch])

  useEffect(() => {
    setShowLoader(true)
    FetchDepartments(hotelId, departments, dispatch)
    setShowLoader(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  list={conciergeRequestTypeOptions}
                  value={conciergeSelectedRequestTypeKey}
                  addAll
                  onChange={e => setConciergeSelectedRequestType(e)}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  list={getRealtimeStatus(RequestStatus)}
                  value={conciergeSelectedStatusKey}
                  addAll
                  onChange={e => setConciergeSelectedStatus(e)}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectAssignOrNotAssign
                  value={filterByAssignOrNotAssign}
                  onChange={e => setFilterByAssignOrNotAssign(e?.id)}
                  id={DepartmentAndServiceKeys.concierge.key}
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectRequestType
                  value={sortByRequestType}
                  onChange={e => setSortByRequestType(e?.id)}
                  id={DepartmentAndServiceKeys.concierge.key}
                />
              </div>

              <div className='col-6 col-md-auto '>
                <Button
                  type='primary'
                  className='adduserbtn'
                  onClick={resetFilterData}
                >
                  <img alt='clear' src={getImage('images/clearicon.svg')}></img>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='col-12 col-xl-12'>
          <TableWithCustomAlert
            successMessage={successMessage}
            columns={defaultColumnsList}
            requests={requestsList}
            showLoader={showLoader || loadingConciergeRequests}
            successMessageType={successMessageType}
          />
        </div>
      </div>
    </>
  )
}

export default RealTimeCommonTable
