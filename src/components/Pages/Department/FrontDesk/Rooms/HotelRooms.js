import React, { useContext } from 'react'
import { RoomState } from './model'
import { PaginationOptions } from '../../../../../config/constants'
import CustomAlert from '../../../../Common/CustomAlert/CustomAlert'
import { Table, Button } from 'antd'

export default function HotelRooms() {
  const { rooms, successMessage, errorMessage, columns, roomsLoading } =
    useContext(RoomState)

  return (
    <>
      <div className='col-12 col-xl-12'>
        <div className='tablefilter-wrp'>
          <div className='form-row'>
            <div className='col-8 col-md-auto'>
              <CustomAlert
                visible={successMessage}
                message={successMessage}
                type='success'
                showIcon={true}
              />
              <CustomAlert
                visible={errorMessage}
                message={errorMessage}
                type='error'
                showIcon={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='col-12 col-xl-12'>
        <div className='row'>
          <div className='col-12 col-xl-12'>
            <div className='table-wrp'>
              <Table
                columns={columns}
                dataSource={rooms}
                pagination={PaginationOptions}
                scroll={{ y: 580 }}
                loading={roomsLoading}
                rowKey='id'
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
