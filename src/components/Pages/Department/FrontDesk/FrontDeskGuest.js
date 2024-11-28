/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import React, { useContext, useEffect, useState } from 'react'
import { Table, Select, Button } from 'antd'

import Header from '../../../Common/Header/Header'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'
import {
  GuestCheckInOutStatusList,
  Option,
  PaginationOptions,
  secondsToShowAlert,
} from '../../../../config/constants'
import {
  getCommonColumns,
  getFeedbackColumn,
  getImage,
  GetOptions,
  isFilterValueSelected,
  SelectDrops,
} from '../../../../config/utils'
import PageNameCard from '../../../Common/PageNameCard/PageNameCard'
import { useDispatch, useSelector } from 'react-redux'
import {
  AddGuestListener,
  UpdateCheckInOutStatus,
} from '../../../../services/guest'
import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import { AuthContext } from '../../../../Router/AuthRouteProvider'
import { actions } from '../../../../Store'

const GetFilteredGuestList = ({
  roomNumberLabel,
  statusLabel,
  guests,
  selectedRoomNo,
  selectedStatus,
}) => {
  let filteredGuestList = [...guests]

  if (isFilterValueSelected(selectedRoomNo, roomNumberLabel))
    filteredGuestList = filteredGuestList.filter(
      g => g.roomNumber === selectedRoomNo
    )

  if (isFilterValueSelected(selectedStatus, statusLabel))
    filteredGuestList = filteredGuestList.filter(
      g => g.status === selectedStatus
    )

  return filteredGuestList
}

const FrontDeskGuest = () => {
  const { hotelId } = useContext(AuthContext)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const roomNumberLabel = translateTextI18N('Room No')
  const statusLabel = translateTextI18N('Status')

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showLoader, setShowLoader] = useState(false)

  const [selectedRoomNo, setSelectedRoomNo] = useState(roomNumberLabel)
  const [selectedStatus, setSelectedStatus] = useState(statusLabel)
  const [filteredGuests, setFilteredGuests] = useState([])

  const [roomNos, setRoomNos] = useState([])

  const { guests, loadingGuests, hotelFeedbacks, levelBasedDisable } =
    useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('2'))
    AddGuestListener(hotelId, dispatch)
  }, [dispatch, hotelId])

  useEffect(() => {
    const filteredGuestList = GetFilteredGuestList({
      roomNumberLabel,
      statusLabel,
      guests,
      selectedRoomNo,
      selectedStatus,
    })
    setFilteredGuests(filteredGuestList)
  }, [guests, selectedRoomNo, selectedStatus])

  useEffect(() => {
    const roomNumberList = guests.map(g => ({
      name: g.roomNumber,
      value: g.roomNumber,
    }))

    const uniquesRoomNo = Object.values(
      roomNumberList.reduce((a, c) => {
        a[c.value + '|' + c.name] = c
        return a
      }, {})
    )

    setRoomNos(uniquesRoomNo)
  }, [guests])

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('2'))
  }, [])

  const setMessage = (func, message) => {
    func(message)
    setTimeout(() => func(''), secondsToShowAlert)
  }

  const handleStatusChange = async (newStatus, guestId) => {
    setShowLoader(true)
    const guestToUpdate = guests.find(guest => guest.id === guestId)

    const roomOccupied = guests.some(
      guest =>
        guest.roomNumber === guestToUpdate.roomNumber &&
        guest.status === 'Check In'
    )
    if (newStatus === 'Check In' && roomOccupied) {
      setMessage(setErrorMessage, 'Cannot check in. Room is already occupied.')
      setShowLoader(false)
      return
    }

    const success = await UpdateCheckInOutStatus(newStatus, guestId)
    if (success) {
      setMessage(setSuccessMessage, 'Status updated successfully')
    } else {
      setMessage(setErrorMessage, 'Something went wrong! Please try again!')
    }
    setShowLoader(false)
  }

  const resetFilter = () => {
    setSelectedRoomNo(roomNumberLabel)
    setSelectedStatus(statusLabel)
  }

  const {
    bookingReferanceCol,
    checkedInTimeCol,
    checkedOutTimeCol,
    guestFullName,
    roomNumberCol,
    serialNumberCol,
  } = getCommonColumns({
    translateTextI18N,
  })
  const { feedbackCol } = getFeedbackColumn({
    translateTextI18N,
    dispatch,
    hotelFeedbacks,
  })

  const frontDeskGuestColumns = [
    serialNumberCol,
    guestFullName,
    roomNumberCol,
    bookingReferanceCol,
    checkedInTimeCol,
    checkedOutTimeCol,

    {
      title: translateTextI18N('Status'),
      dataIndex: '',
      width: 100,
      render: (_, row) => {
        const className = GuestCheckInOutStatusList.find(
          s => s.value === row.status
        ).className
        return (
          <Select
            className={className}
            value={translateTextI18N(row.status)}
            bordered={false}
            onChange={e => handleStatusChange(e, row.id)}
            disabled={levelBasedDisable}
          >
            {GuestCheckInOutStatusList.map(s => (
              <Option value={s.value}>{translateTextI18N(s.name)}</Option>
            ))}
          </Select>
        )
      },
    },
    feedbackCol,
  ]

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title={levelBasedDisable ? 'Guest Info' : 'Front Desk'}
                breadcrumb={
                  levelBasedDisable
                    ? ['Guest', 'Feedback']
                    : ['Department Admin', 'Front Desk', 'Guests']
                }
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row'>
                <div className='col-12 col-xl-7'>
                  <div className='tablefilter-wrp'>
                    <div className='form-row'>
                      <div className='col-6 col-md-4 col-lg'>
                        <div className='cmnSelect-form'>
                          <SelectDrops
                            value={selectedRoomNo}
                            onChange={e => setSelectedRoomNo(e)}
                            list={roomNos}
                            addAll={true}
                            keepDropDownOpen={true}
                            showSearch={true}
                          />
                        </div>
                      </div>
                      <div className='col-6 col-md-4 col-lg'>
                        <div className='cmnSelect-form'>
                          <Select
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e)}
                          >
                            {GetOptions({
                              list: GuestCheckInOutStatusList,
                              addAll: true,
                            })}
                          </Select>
                        </div>
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
                  <div className='row ml-2 mb-2' id='frontDeskAlerts'>
                    <CustomAlert
                      visible={errorMessage}
                      message={errorMessage}
                      type='error'
                      showIcon={true}
                      classNames='mt-2 mb-2'
                    />
                    <CustomAlert
                      visible={successMessage}
                      message={successMessage}
                      type='success'
                      showIcon={true}
                      classNames='mt-2 mb-2'
                    />
                  </div>
                  <div className='table-wrp'>
                    <Table
                      columns={frontDeskGuestColumns}
                      dataSource={filteredGuests}
                      pagination={PaginationOptions}
                      loading={showLoader || loadingGuests}
                      rowKey='id'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
export default FrontDeskGuest
