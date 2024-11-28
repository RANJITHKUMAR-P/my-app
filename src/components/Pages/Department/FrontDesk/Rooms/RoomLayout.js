/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/iframe-has-title */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react'
import { RoomState } from './model'
import { Tabs } from 'antd'
import HotelRooms from './HotelRooms'
import Header from '../../../../Common/Header/Header'
import SideMenu from '../../../../Common/Sidemenu/Sidemenu'
import PageNamecard from '../../../../Common/PageNameCard/PageNameCard'
import OutOfServiceRooms from './OutOfServiceRooms'
import DataModalPopup from './DataModalPopup'

const { TabPane } = Tabs

const RoomLayout = () => {
  const { translateTextI18N, defaultSelectedTab, setDefaultSelectedTab } =
    useContext(RoomState)

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='Rooms'
                breadcrumb={['Department Admin', 'Front Desk', 'Rooms']}
              />
            </div>
            <Tabs
              defaultActiveKey={defaultSelectedTab}
              onChange={e => {
                setDefaultSelectedTab(e)
              }}
              className='col-12 col-12'
            >
              <TabPane tab={translateTextI18N('Hotel Rooms')} key='1'>
                <HotelRooms />
              </TabPane>
              <TabPane tab={translateTextI18N('Out Of Service Rooms')} key='2'>
                <OutOfServiceRooms />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </section>
      <DataModalPopup />
    </>
  )
}
export default RoomLayout
