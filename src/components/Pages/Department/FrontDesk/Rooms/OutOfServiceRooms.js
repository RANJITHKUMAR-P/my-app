import React, { useContext } from 'react'
import { DatePicker, Table } from 'antd'
import { RoomState } from './model'
import { PaginationOptions } from '../../../../../config/constants'

export default function OutOfServiceRooms() {
  const {
    translateTextI18N,
    dateFormatList,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    columns,
    outOfServiceRooms,
    outOfServiceRoomsLoading,
  } = useContext(RoomState)

  return (
    <div className='row'>
      <div className='col-12 col-xl-12'>
        <div className='row'>
          <div className='col-12 col-xl-12'>
            <div className='tablefilter-wrp'>
              <div className='form-row'>
                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form'>
                    <DatePicker
                      format={dateFormatList}
                      value={startDate}
                      placeholder={translateTextI18N('Start Date')}
                      onChange={e => setStartDate(e)}
                    />
                  </div>
                </div>
                <div className='col-6 col-md-4 col-lg'>
                  <div className='cmnSelect-form'>
                    <DatePicker
                      format={dateFormatList}
                      value={endDate}
                      placeholder={translateTextI18N('End Date')}
                      onChange={e => setEndDate(e)}
                    />
                  </div>
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
                    dataSource={outOfServiceRooms}
                    pagination={PaginationOptions}
                    scroll={{ y: 580 }}
                    loading={outOfServiceRoomsLoading}
                    rowKey='id'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
