/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Table, Button, DatePicker, Select } from 'antd'

import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import {
  DateTimeColumnWidth,
  guestStatusList,
  HotelAdminRole,
  Option,
  PaginationOptions,
  statusFilterLabel,
} from '../../../config/constants'
import {
  FormatDate,
  FormatTimestamp,
  getFeedbackColumn,
  getImage,
  isFilterValueSelected,
  toTitleCase,
} from '../../../config/utils'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import { actions } from '../../../Store'
import { useDispatch, useSelector } from 'react-redux'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { AddGuestListener } from '../../../services/guest'
import { filteredByInDate, filteredByOutDate } from '../../../services/orders'
import CountBrownCard from '../../Common/CountCard/CountBrownCard/CountBrownCard'
import CountGreenCard from '../../Common/CountCard/CountGreenCard/CountGreenCard'
import CountBlueCard from '../../Common/CountCard/CountBlueCard/CountBlueCard'

const GuestInfo = () => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()

  const { guests, hotelId, userInfo, hotelFeedbacks } = useSelector(
    state => state
  )
  const [checkInList, setcheckInList] = useState([])
  const [checkOutList, setcheckOutList] = useState([])

  const [filteredStatus, setFilteredStatus] = useState(statusFilterLabel)
  const [filteredGuest, setFilteredGuest] = useState([])
  const [filteredCheckInDate, setFilteredCheckInDate] = useState(null)
  const [filteredCheckOutDate, setFilteredCheckOutDate] = useState(null)
  const dateFormatList = ['DD-MMM-YYYY']

  useEffect(() => {
    AddGuestListener(hotelId, dispatch)
  }, [dispatch, hotelId])

  const filterGuests = useCallback(async () => {
    let currentfilteredUser = [...guests]
    setcheckInList(guests.filter(user => user.status === 'Check In'))
    setcheckOutList(guests.filter(user => user.status === 'Check Out'))

    let convertedCheckInDate = FormatDate(filteredCheckInDate)
    if (filteredCheckInDate !== '' && filteredCheckInDate !== null) {
      currentfilteredUser = await filteredByInDate(
        currentfilteredUser,
        convertedCheckInDate
      )
    }

    let convertedCheckOutDate = FormatDate(filteredCheckOutDate)
    if (filteredCheckOutDate !== '' && filteredCheckOutDate !== null) {
      currentfilteredUser = await filteredByOutDate(
        currentfilteredUser,
        convertedCheckOutDate
      )
    }

    if (isFilterValueSelected(filteredStatus, statusFilterLabel)) {
      currentfilteredUser = currentfilteredUser.filter(
        user => user.status === filteredStatus
      )
    }

    setFilteredGuest(currentfilteredUser)
  }, [filteredCheckInDate, filteredCheckOutDate, filteredStatus, guests])

  const resetFilter = () => {
    setFilteredStatus(statusFilterLabel)
    setFilteredCheckInDate(null)
    setFilteredCheckOutDate(null)
  }

  useEffect(() => {
    filterGuests()
  }, [filterGuests])

  const { feedbackCol } = getFeedbackColumn({
    translateTextI18N,
    dispatch,
    hotelFeedbacks,
  })

  const guestInfoColumns = useMemo(() => {
    let col = [
      {
        width: 140,
        title: translateTextI18N('Guest'),
        dataIndex: '',
        render: (_, row) => toTitleCase(`${row.name} ${row.surName}`),
      },
      {
        title: translateTextI18N('Room No'),
        width: 100,
        dataIndex: 'roomNumber',
      },
      {
        width: 110,
        title: translateTextI18N('Reference No'),
        dataIndex: 'bookingReferance',
      },
      {
        render: date => FormatTimestamp(date),
        title: translateTextI18N('Check In Date'),
        dataIndex: 'checkedInTime',
        width: DateTimeColumnWidth,
      },
      {
        render: date => FormatTimestamp(date),
        title: translateTextI18N('Check Out Date'),
        dataIndex: 'checkedOutTime',
        width: DateTimeColumnWidth,
      },
      {
        title: translateTextI18N('Status'),
        dataIndex: 'status',
        width: 100,
        render: (_, row) => {
          return (
            <div>
              {row.status === 'Check In' && (
                <Button className='statusBtn completedBtn'>
                  {translateTextI18N(row.status)}
                </Button>
              )}
              {row.status === 'Check Out' && (
                <Button className='statusBtn pendingBtn'>
                  {translateTextI18N(row.status)}
                </Button>
              )}
            </div>
          )
        },
      },
    ]

    if (userInfo.roles[0] === HotelAdminRole) {
      let adminCol = [feedbackCol]
      col = [...col, ...adminCol]
    }

    return col
  }, [feedbackCol, translateTextI18N, userInfo.roles])

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('4'))
  }, [dispatch])

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Guest Info'
                breadcrumb={['Hotel Admin', 'Guest Info']}
              />
            </div>
            <div className='col-12' id='guest-countcard'>
              <div className='row' id='guest-countcardrow'>
                <div className='col-12 col-md-4'>
                  <CountBrownCard
                    imageSource='images/booking.svg'
                    no={guests?.filter(i => !i?.isBulkUpload)?.length}
                    text='Total Bookings'
                  ></CountBrownCard>
                </div>
                <div className='col-12 col-md-4'>
                  <CountGreenCard
                    imageSource='images/checkedin.svg'
                    no={checkInList?.filter(i => !i?.isBulkUpload)?.length}
                    text='Checked In'
                  ></CountGreenCard>
                </div>
                <div className='col-12 col-md-4'>
                  <CountBlueCard
                    imageSource='images/checkedout.svg'
                    no={checkOutList?.filter(i => !i?.isBulkUpload)?.length}
                    text='Checked Out'
                  ></CountBlueCard>
                </div>
              </div>
            </div>
            <div className='col-12 col-xl-12' id='guest-filter'>
              <div className='row'>
                <div className='col-12 col-xl-10'>
                  <div className='tablefilter-wrp'>
                    <div className='form-row'>
                      <div className='col-6 col-md-4 col-lg'>
                        <div className='cmnSelect-form'>
                          <DatePicker
                            format={dateFormatList}
                            value={filteredCheckInDate}
                            placeholder={translateTextI18N('Checked In Date')}
                            onChange={e => setFilteredCheckInDate(e)}
                          />
                        </div>
                      </div>
                      <div className='col-6 col-md-4 col-lg'>
                        <div className='cmnSelect-form'>
                          <DatePicker
                            format={dateFormatList}
                            value={filteredCheckOutDate}
                            placeholder={translateTextI18N('Checked Out Date')}
                            onChange={e => setFilteredCheckOutDate(e)}
                          />
                        </div>
                      </div>
                      <div className='col-6 col-md-4 col-lg' id='drpStatus'>
                        <div className='cmnSelect-form'>
                          <Select
                            value={translateTextI18N(filteredStatus)}
                            onChange={e => setFilteredStatus(e)}
                          >
                            {guestStatusList.map(st => (
                              <Option value={st.id} key={st.id}>
                                {translateTextI18N(st.name)}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </div>

                      <div className='col-6 col-md-auto '>
                        <Button
                          type='primary'
                          title='Reset Filter'
                          className='adduserbtn'
                          onClick={resetFilter}
                        >
                          <img src={getImage('images/clearicon.svg')}></img>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-12 col-xl-12' id='guestTbl'>
                  <div className='table-wrp'>
                    <Table
                      columns={guestInfoColumns}
                      dataSource={filteredGuest}
                      pagination={PaginationOptions}
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

export default GuestInfo
