/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Table, Button, DatePicker } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

import { actions } from '../../../Store'
import {
  departmentFilterLabel,
  drpAssignOrNotAssign,
  drpRequestTypes,
  FilterByAssignStatus,
  PaginationOptions,
  realTimeServiceStatus,
  serviceFilterLabel,
  SortByRequestType,
  StatusLabel,
} from '../../../config/constants'
import {
  arrangeAssignToAndStatusCol,
  deepCloneObject,
  getHotelDeptServiceNames,
  getImage,
  getViewOrderDetail,
  isFilterValueSelected,
  SelectDrops,
  sendNotification,
  SetAutoClearProp,
  sortByCreatedAt,
  Ternary,
} from '../../../config/utils'
import { AddGuestListener } from '../../../services/guest'
import { AddReservationRealTimeListener } from '../../../services/reservation'
import { UpdateRequestStatus } from './../../../services/requests'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CustomAlert from './../../Common/CustomAlert/CustomAlert'
import SelectAssignOrNotAssign from '../../Common/SelectAssignOrNotAssign'
import SelectRequestType from '../../Common/SelectRequestType'

const DateFormat = 'DD MMM YYYY'

const FiltereData = ({
  reservationList,
  setFilteredReservations,
  selectedDepartment,
  selectedService,
  selectedStatus,
  selectedReservationDate,
  filterByAssignOrNotAssign,
  sortByRequestType,
}) => {
  let data = [...reservationList]

  if (isFilterValueSelected(selectedDepartment, departmentFilterLabel)) {
    data = data.filter(d => d.department === selectedDepartment)
  }

  if (selectedReservationDate) {
    const reservationMoment = moment(selectedReservationDate).startOf('day')
    data = data.filter(d => {
      const requestedMoment = moment(d.requestedTime.toDate()).startOf('day')
      return reservationMoment.isSame(requestedMoment)
    })
  }

  if (isFilterValueSelected(selectedService, serviceFilterLabel)) {
    data = data.filter(d => d.service === selectedService)
  }

  if (isFilterValueSelected(selectedStatus, StatusLabel)) {
    data = data.filter(d => d.status === selectedStatus)
  }

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
  }

  setFilteredReservations(data)
}

const GetData = ({
  reservations,
  guestIdToInfo,
  departmentAndServiceIdToInfo,
  setReservationList,
}) => {
  let data = [...reservations].map(d => {
    const guestName = guestIdToInfo[d.guestId]?.name || ''
    const guestSurname = guestIdToInfo[d.guestId]?.surName || ''
    const roomNumber = guestIdToInfo[d.guestId]?.roomNumber || ''
    const departmentName =
      departmentAndServiceIdToInfo[d.departmentId]?.name || ''

    return { ...d, guestName, guestSurname, roomNumber, departmentName }
  })

  data.sort(sortByCreatedAt)
  setReservationList(data)
}

const RealTimeReservations = ({ columns }) => {
  const [reservationColumns, setReservationColumns] = useState([])

  const [reservationList, setReservationList] = useState([])

  const [filteredReservations, setFilteredReservations] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState(
    departmentFilterLabel
  )
  const [selectedService, setSelectedService] = useState(serviceFilterLabel)
  const [selectedStatus, setSelectedStatus] = useState(StatusLabel)
  const [selectedReservationDate, setSelectedReservationDate] = useState('')

  const [filterByAssignOrNotAssign, setFilterByAssignOrNotAssign] =
    useState(FilterByAssignStatus)
  const [sortByRequestType, setSortByRequestType] = useState(SortByRequestType)

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showLoader, setShowLoader] = useState(false)

  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const {
    departmentAndServiceIdToInfo,
    guestIdToInfo,
    hotelInfo,
    loadingReservations,
    reservations,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const hotelId = hotelInfo?.hotelId

  const resColumnRef = useRef([])
  useEffect(() => {
    if (!resColumnRef.current.length) {
      let findDetailIndex = columns.findIndex(c => c.dataIndex === 'Detail')
      if (findDetailIndex > -1) {
        columns[findDetailIndex].render = (_, row) => {
          return getViewOrderDetail({
            row,
            translateTextI18N,
            setErrorMessage,
            setSuccessMessage,
            dispatch,
          })
        }
      }

      resColumnRef.current = arrangeAssignToAndStatusCol(columns, {
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

      setReservationColumns(resColumnRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns])

  useEffect(() => {
    AddReservationRealTimeListener({ hotelId, dispatch })
  }, [dispatch, hotelId])

  useEffect(() => {
    AddGuestListener(hotelId, dispatch)
  }, [hotelId, dispatch])

  useEffect(() => {
    GetData({
      reservations,
      guestIdToInfo,
      departmentAndServiceIdToInfo,
      setReservationList,
    })
  }, [
    reservations,
    guestIdToInfo,
    departmentAndServiceIdToInfo,
    setReservationList,
  ])

  useEffect(() => {
    FiltereData({
      reservationList,
      setFilteredReservations,
      selectedDepartment,
      selectedService,
      selectedStatus,
      selectedReservationDate,
      filterByAssignOrNotAssign,
      sortByRequestType,
    })
  }, [
    reservationList,
    selectedDepartment,
    selectedReservationDate,
    selectedService,
    selectedStatus,
    filterByAssignOrNotAssign,
    sortByRequestType,
  ])

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('7'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const servicesList = useMemo(() => {
    let tmpReservations = deepCloneObject(reservations)

    if (!tmpReservations.length) return []

    if (isFilterValueSelected(selectedDepartment, departmentFilterLabel)) {
      tmpReservations = reservations.filter(
        i => i.department === selectedDepartment
      )
    }

    const getSL = getHotelDeptServiceNames({
      service: tmpReservations,
      setServiceList: () => {},
      isAllLableExist: true,
    })

    return getSL.servicesList
  }, [reservations, selectedDepartment])

  const deptList = useMemo(() => {
    let tmpReservation = [
      ...new Set(reservations.map(({ department }) => department)),
    ]

    return tmpReservation.map(department => ({
      id: department,
      name: department,
      value: department,
    }))
  }, [reservations])

  const resetFilter = () => {
    setSelectedDepartment(departmentFilterLabel)
    setSelectedService(serviceFilterLabel)
    setSelectedStatus(StatusLabel)
    setSelectedReservationDate(null)
    setFilterByAssignOrNotAssign(FilterByAssignStatus)
    setSortByRequestType(SortByRequestType)
  }

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

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='row'>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form'>
                      <DatePicker
                        id='filter2'
                        format={DateFormat}
                        value={selectedReservationDate}
                        placeholder={translateTextI18N('Reserved Date')}
                        onChange={e => {
                          if (e) setSelectedReservationDate(e.startOf('day'))
                          else setSelectedReservationDate(null)
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form'>
                      <SelectDrops
                        addAll
                        list={deptList}
                        value={selectedDepartment}
                        onChange={e => {
                          setSelectedService(serviceFilterLabel)
                          setSelectedDepartment(e)
                        }}
                      />
                    </div>
                  </div>

                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form'>
                      <SelectDrops
                        addAll
                        list={servicesList}
                        value={selectedService}
                        onChange={setSelectedService}
                      />
                    </div>
                  </div>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form'>
                      <SelectDrops
                        list={realTimeServiceStatus}
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                      />
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectAssignOrNotAssign
                      value={filterByAssignOrNotAssign}
                      onChange={e => setFilterByAssignOrNotAssign(e?.id)}
                      id='reservation'
                    />
                  </div>

                  <div className='col-6 col-md-4 col-lg'>
                    <SelectRequestType
                      value={sortByRequestType}
                      onChange={e => setSortByRequestType(e?.id)}
                      id='reservation'
                    />
                  </div>
                  <div className='col-4 col-md-auto'>
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
              <div className='row ml-2 mb-2' id='reservation-realtime'>
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
                  columns={reservationColumns}
                  dataSource={filteredReservations}
                  pagination={PaginationOptions}
                  scroll={{ y: 382 }}
                  rowKey='id'
                  loading={loadingReservations || showLoader}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RealTimeReservations
