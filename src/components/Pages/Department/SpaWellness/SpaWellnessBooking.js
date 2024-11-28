/* eslint-disable jsx-a11y/alt-text */
// eslint-disable jsx-a11y/alt-text /
import { Button, DatePicker, Modal, Skeleton } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CompletedLabel,
  DeferredLabel,
  inProgressLabel,
  RequestStatus,
  ServiceLabel,
  StatusLabel,
} from '../../../../config/constants'
import {
  FormatTimestamp,
  getImage,
  SelectDrops,
  sortByCreatedAt,
  Ternary,
  toTitleCase,
} from '../../../../config/utils'
import { AddBookingListener } from '../../../../services/reservation'
import { actions } from '../../../../Store'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import Header from '../../../Common/Header/Header'
import PageNamecard from '../../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'
import {
  FilterByServiceAndStatus,
  GetServiceIds,
  SetServiceIdsAndFilterData,
} from './Common'

const DateFormat = 'DD MMM YYYY'
const today = moment()

const FiltereData = ({
  reservationList,
  setFilteredReservations,
  pathname,
  departmentAndServiceKeyToId,
  departmentAndServiceIdToInfo,
  setServiceOptions,
  selectedService,
  selectedStatus,
  selectedDate,
}) => {
  let data = [...reservationList]

  data = SetServiceIdsAndFilterData(
    departmentAndServiceKeyToId,
    pathname,
    setServiceOptions,
    departmentAndServiceIdToInfo,
    data,
    true
  )

  data = FilterByServiceAndStatus(data, selectedService, selectedStatus)

  if (selectedDate) {
    data = data.filter(d => {
      const reservedMoment = moment(d.requestedTime.toDate()).startOf('day')
      return moment(selectedDate).isSame(reservedMoment)
    })
  } else {
    data = []
  }

  data.sort((a, b) => {
    const aMoment = moment(a.requestedTime.toDate())
    const bMoment = moment(b.requestedTime.toDate())
    return aMoment.isBefore(bMoment) ? 0 : 1
  })

  let formattedData = Array(24).fill(null)
  data.forEach(d => {
    const index = +moment(d.requestedTime.toDate()).format('H')
    if (!formattedData[index]) formattedData[index] = []
    formattedData[index].push(d)
  })

  setFilteredReservations(formattedData)
}

const GetFilterClass = serviceOptions =>
  `col-6 col-md-4 col-${serviceOptions.length > 1 ? 'lg' : 'md'}`

const GetRequestedTime = requestedTime =>
  !requestedTime
    ? ''
    : moment(requestedTime.toDate())?.format('HH:mm a')?.toUpperCase()

const SpaWellnessBooking = ({ location: { pathname } }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const [filteredReservations, setFilteredReservations] = useState([])
  const [reservationList, setReservationList] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [selectedService, setSelectedService] = useState(ServiceLabel)
  const [selectedStatus, setSelectedStatus] = useState(StatusLabel)
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'))
  const [selectedReservation, setSelectedReservation] = useState({})

  const {
    hotelId,
    bookingListenerAdded,
    departmentAndServiceKeyToId,
    departmentAndServiceIdToInfo,
    loadingBookings,
    bookings,
    sideMenuOpenKeys,
  } = useSelector(state => state)

  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  useEffect(() => {
    if (sideMenuOpenKeys?.includes('3')) {
      dispatch(actions.setSideMenuOpenKeys('3'))
    }

    if (!sideMenuOpenKeys?.includes('2')) {
      dispatch(actions.setSideMenuOpenKeys('2'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    AddBookingListener({
      hotelId,
      bookingListenerAdded,
      dispatch,
      selectedDate,
    })
  }, [dispatch, hotelId, bookingListenerAdded, selectedDate])

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
      selectedDate,
    })
  }, [
    departmentAndServiceIdToInfo,
    departmentAndServiceKeyToId,
    pathname,
    reservationList,
    selectedService,
    selectedStatus,
    selectedDate,
  ])

  useEffect(() => {
    const data = [...bookings]
    data.sort(sortByCreatedAt)
    setReservationList(data)
  }, [bookings])

  const resetFilter = () => {
    setSelectedService(ServiceLabel)
    setSelectedStatus(StatusLabel)
    setSelectedDate(moment().startOf('day'))
  }

  const showModal = reservation => {
    setIsModalVisible(true)
    setSelectedReservation(reservation)
  }

  const hideModal = () => {
    setIsModalVisible(false)
  }

  const GetBookingDetails = () => {
    if (loadingBookings) return <Skeleton />

    const { gymId, salonId, spaId } = GetServiceIds(departmentAndServiceKeyToId)

    const serviceIdToClass = {
      [gymId]: 'item-gym',
      [salonId]: 'item-salon',
      [spaId]: 'item-spa',
    }

    return filteredReservations.map((reservation, idx) => {
      if (!reservation) return null

      const hour = today
        .set('hour', idx)
        .set('minute', 0)
        .format('HH:mm a')
        .toUpperCase()
      return (
        <>
          <div className='timeblock' key={idx}>
            <span className='timeslot'>{hour}</span>
            <div className='bookeditems-wrp'>
              {reservation.map(r => {
                const guest = toTitleCase(r.guest)
                const completedClass =
                  r.status === CompletedLabel ? 'completeditem' : ''
                return (
                  <div
                    className={`bookeditem ${
                      serviceIdToClass[r.serviceId]
                    } ${completedClass}`}
                    onClick={() => showModal(r)}
                  >
                    {guest} - {translateTextI18N(r.service)}{' '}
                    {[CompletedLabel, inProgressLabel, DeferredLabel].includes(
                      r.status
                    )
                      ? ` (${translateTextI18N(r.status)})`
                      : ''}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )
    })
  }

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='Spa & Wellness'
                breadcrumb={[
                  'Department Admin',
                  'Spa & Wellness',
                  'Reservation',
                ]}
              />
            </div>

            <div className='col-12 col-xl-12'>
              <div className='row'>
                <div className='col-12 col-xl-7'>
                  <div className='tablefilter-wrp'>
                    <div className='form-row'>
                      <div className={GetFilterClass(serviceOptions)}>
                        <div className='cmnSelect-form' id='filter3'>
                          <DatePicker
                            id='filter2'
                            format={DateFormat}
                            value={selectedDate}
                            placeholder={translateTextI18N('Reservation Date')}
                            onChange={e => {
                              const date = e ? e.startOf('day') : null
                              setSelectedDate(date)
                              dispatch(actions.setBookingListenerAdded(false))
                            }}
                          />
                        </div>
                      </div>
                      {Ternary(
                        serviceOptions.length > 1,
                        <div className={GetFilterClass(serviceOptions)}>
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

                      <div className={GetFilterClass(serviceOptions)}>
                        <SelectDrops
                          list={RequestStatus}
                          value={selectedStatus}
                          addAll
                          onChange={e => setSelectedStatus(e)}
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
                  <div className='bookingtimeCard'>{GetBookingDetails()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        title='Booking Details'
        visible={isModalVisible}
        onOk={hideModal}
        onCancel={hideModal}
        className='orderdetailsModal cmnModal'
        footer={null}
        centered
      >
        <div className='orderdetails-wrp'>
          <div className='ordertypeDetails'>
            <h3>{FormatTimestamp(selectedReservation?.createdAt)}</h3>
          </div>
          <div className='orderpersonDetails'>
            <h4>{toTitleCase(selectedReservation?.guest)} </h4>
            <h6>
              {translateTextI18N('Room No')} : {selectedReservation?.roomNumber}
            </h6>
          </div>

          <div className='restaurantorderdetails'>
            <table>
              <tr>
                <th>{translateTextI18N('Service Requested')}</th>
                <td className='text-right'>{selectedReservation?.service}</td>
              </tr>
              <tr>
                <th>{translateTextI18N('Requested Time')}</th>
                <td className='text-right'>
                  {GetRequestedTime(selectedReservation?.requestedTime)}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default SpaWellnessBooking
