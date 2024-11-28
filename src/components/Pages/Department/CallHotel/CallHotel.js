/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Modal, Table, Select, Button, Breadcrumb } from 'antd'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'
import { getImage } from '../../../../config/utils'

const { Option } = Select

const CallHotel = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleOk = () => {
    setIsModalVisible(false)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const chcolumns = [
    {
      title: 'Guest',
      dataIndex: 'Guest',
      width: 130,
      render: () => (
        <div className='tableuser'>
          <figure>
            <img src={getImage('images/tableimg.png')}></img>
          </figure>
          <span>Alexander Blake</span>
        </div>
      ),
    },
    {
      title: 'Room No',
      dataIndex: 'RoomNo',
      width: 100,
    },
    {
      title: 'Service',
      dataIndex: 'Service',
      width: 300,
    },
    {
      title: 'Call Recieved Time',
      dataIndex: 'CallRecievedTime',
      width: 135,
    },
  ]

  const chdata = Array.from({ length: 8 }, function (_v, k) {
    return {
      key: k,
      RoomNo: '12B',
      Service: 'Book Taxi',
      CallRecievedTime: '31 Mar 2021 - 11.30 AM',
    }
  })

  return (
    <>
      {/* <Header></Header> */}
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              {/* use this "PageNamecard" component for display the page name and breadcrumbs */}
              {/* <PageNamecard></PageNamecard> */}

              {/* below hardcode is for testing purpose only */}
              <div className='Pagenamecard-wrp'>
                <div>
                  <h1>Call Hotel</h1>
                  <Breadcrumb>
                    <Breadcrumb.Item>Department Admin</Breadcrumb.Item>
                    <Breadcrumb.Item>Call Hotel</Breadcrumb.Item>
                    <Breadcrumb.Item>Requests</Breadcrumb.Item>
                  </Breadcrumb>
                </div>
                <figure>
                  <img src={getImage('images/pageheadimg.svg')}></img>
                </figure>
              </div>
            </div>

            <div className='col-12 col-xl-12'>
              <div className='row'>
                <div className='col-12 col-xl-7'>
                  <div className='tablefilter-wrp'>
                    <div className='form-row'>
                      <div className='col-6 col-md-4 col-lg'>
                        <div className='cmnSelect-form'>
                          <Select defaultValue='Services'>
                            <Option value='Services'>Services</Option>
                            <Option value='lucy'>Lucy</Option>
                            <Option value='Yiminghe'>yiminghe</Option>
                          </Select>
                        </div>
                      </div>

                      <div className='col-6 col-md-4 col-lg'>
                        <div className='cmnSelect-form'>
                          <Select defaultValue='Status'>
                            <Option value='Status'>Status</Option>
                            <Option value='lucy'>Lucy</Option>
                            <Option value='Yiminghe'>yiminghe</Option>
                          </Select>
                        </div>
                      </div>

                      <div className='col-6 col-md-auto '>
                        <Button type='primary' className='adduserbtn'>
                          <img src={getImage('images/clearicon.svg')}></img>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-12 col-xl-12'>
                  <div className='table-wrp'>
                    <Table
                      columns={chcolumns}
                      dataSource={chdata}
                      pagination={false}
                      scroll={{ y: 382 }}
                      rowKey='key'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        title='Order Details'
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        className='orderdetailsModal cmnModal'
        footer={null}
        centered
      >
        <div className='orderdetails-wrp'>
          <div className='ordertypeDetails'>
            <h3>Order Type - Breakfast</h3>
            <h3>June 3, 2021 - 5pm</h3>
          </div>
          <div className='orderpersonDetails'>
            <h4>
              <b>Alexander</b> Blake
            </h4>
            <h6>Room No: 12B</h6>
          </div>

          <div className='restaurantorderdetails'>
            <table>
              <tr>
                <th>No Of Seats Required</th>
                <td className='text-right'>05</td>
              </tr>
              <tr>
                <th>Requested Time</th>
                <td className='text-right'>10 PM</td>
              </tr>
            </table>
          </div>
        </div>

        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={handleCancel}>
            Reject
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={handleOk}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default CallHotel
