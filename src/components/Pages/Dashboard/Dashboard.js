/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import { actions } from '../../../Store'
import BookingCard from '../../Common/BookingCard/BookingCard'
import RequestsCard from '../../Common/RequestsCard/RequestsCard'
import ReservationCard from '../../Common/ReservationCard/ReservationCard'
import ActivityCard from '../../Common/ActivityCard/ActivityCard'
import useHotelAdminDashboardStat from '../../../hooks/useHotelAdminDashboardStat'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import CountCard from '../../Common/CountCard'
import GuestOverviewCard from '../../Common/GuestOverviewCard'
import {
  AddCheckinAndCheckoutCountListener,
  AddGuestListener,
} from '../../../services/guest'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { AuthContext } from '../../../Router/AuthRouteProvider'
import { FetchDepartments } from '../../../services/department'
import { Button, Modal } from 'antd'

const Dashboard = () => {
  const { departments } = useSelector(state => state)

  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { checkinAndCheckoutCountListenerAdded, hotelInfo, hotelId } =
    useContext(AuthContext)

  const {
    roomCount,
    staffActiveCount,
    staffInactiveCount,
    totalDepartments,
    occupiedRooms,
  } = useHotelAdminDashboardStat()

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('1'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    AddCheckinAndCheckoutCountListener(hotelId, dispatch)
    AddGuestListener(hotelId, dispatch)
  }, [checkinAndCheckoutCountListenerAdded, dispatch, hotelId])

  useEffect(() => {
    FetchDepartments(hotelId, departments, dispatch)
  }, [departments, dispatch, hotelId])

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent dashboard-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Dashboard'
                breadcrumb={['Hotel Admin', 'Dashboard']}
              />
            </div>
            <div className='col-12'>
              <div className='row '>
                <div className='col-12  col-xl-5'>
                  <GuestOverviewCard hotelInfo={hotelInfo} />
                  <div className='dashboardUserActivity cmnCard-wrp'>
                    <div className='cardHead'>
                      <h3>{translateTextI18N('Staff')}</h3>
                    </div>
                    <div className='row align-items-center'>
                      <div className='col'>
                        <ActivityCard
                          total={staffActiveCount + staffInactiveCount}
                          active={staffActiveCount}
                        ></ActivityCard>
                      </div>
                      <div className='col-auto'>
                        <ul className='list-list-unstyled chartlegends'>
                          <li>
                            <span
                              className='indiSpan'
                              style={{
                                backgroundColor: '#0BAE36',
                              }}
                            ></span>
                            {translateTextI18N('Active Staffs')}
                          </li>
                          <li>
                            <span
                              className='indiSpan'
                              style={{
                                backgroundColor: '#FF1616',
                              }}
                            ></span>
                            {translateTextI18N('Inactive Staffs')}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-12 col-md-6 col-xl-3' id=''>
                  <CountCard
                    page='Dashboard'
                    title={totalDepartments}
                    desc='Total Departments'
                    image='images/count-departments.svg'
                    cardColorClassname='blue'
                  ></CountCard>
                  <CountCard
                    page='Dashboard'
                    title={roomCount}
                    desc='Total Rooms'
                    image='images/count-rooms.svg'
                    cardColorClassname='brown'
                  ></CountCard>
                  <CountCard
                    page='Dashboard'
                    title={occupiedRooms}
                    desc='Occupied Rooms'
                    image='images/count-ocrooms.svg'
                    cardColorClassname='green'
                  ></CountCard>
                  <BookingCard />
                </div>
                <div className='col-12 col-md-6 col-xl-4'>
                  <RequestsCard />
                  <ReservationCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        className='cmnModal restaurant-timings'
        title='Restuarent'
        visible={false}
        footer={null}
      >
        <ul className='list-unstyled'>
          <li>
            <span>Opening Time</span>02:00 AM
          </li>
          <li>
            <span>Closing Time</span>02:00 PM
          </li>
          <li>
            <span>Dress Code</span>Dress Code Information
          </li>
        </ul>
        <div className='modalFooter mt-4'>
          <Button className='grayBtn'>Cancel</Button>
          <Button className='blueBtn ml-3 ml-lg-4'>Continue</Button>
        </div>
      </Modal>
    </>
  )
}

export default Dashboard
