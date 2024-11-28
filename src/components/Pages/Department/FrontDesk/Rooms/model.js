import React, { createContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getHotelRooms,
  getOutofServiceRooms,
} from '../../../../../services/roomType'
import { useCustomI18NTranslatorHook } from '../../../../../utility/globalization'
import moment from 'moment'
import { Space, Tooltip, Button } from 'antd'
import { EyeOutlined } from '@ant-design/icons'

const dateFormatList = ['DD-MMM-YYYY']
const INIT_DATE = [
  moment().subtract(1, 'months').startOf('month'),
  moment().subtract(1, 'months').endOf('month'),
]

export const RoomState = createContext()

export const RoomStateProvider = props => {
  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const {
    hotelId,
    rooms,
    outOfServiceRooms,
    roomsLoading,
    outOfServiceRoomsLoading,
  } = useSelector(state => state)

  const [showLoader, setShowLoader] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [defaultSelectedTab, setDefaultSelectedTab] = useState('1')
  const [startDate, setStartDate] = useState(INIT_DATE[0])
  const [endDate, setEndDate] = useState(INIT_DATE[1])
  const [columns, setColumns] = useState([])
  const [modalVisible, setModalVisible] = useState(false)

  const pmsPropertyId = 'SAND01CN'

  let columnsDef = [
    {
      title: translateTextI18N('Sl.No'),
      dataIndex: 'srNo',
      width: 80,
    },
    {
      title: translateTextI18N('Class'),
      dataIndex: 'roomClass',
      width: 150,
    },
    {
      title: translateTextI18N('Room Type'),
      dataIndex: 'roomType',
      width: 200,
    },
    {
      title: translateTextI18N('Room Id'),
      dataIndex: 'roomId',
      width: 150,
    },
    {
      title: translateTextI18N('Room Status'),
      dataIndex: 'roomStatus',
      width: 200,
    },
    {
      title: translateTextI18N('Front Office Status'),
      dataIndex: 'frontOfficeStatus',
      width: 505,
    },
  ]

  useEffect(() => {
    if (defaultSelectedTab === '1') {
      setColumns(columnsDef)
      fetchRooms()
    } else if (defaultSelectedTab === '2') {
      const excludeColumnData = ['roomStatus', 'frontOfficeStatus']
      columnsDef = columnsDef.filter(
        c => !excludeColumnData.includes(c.dataIndex)
      )
      columnsDef.push({
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Space size='middle'>
            {
              <Tooltip title='Out of Order details'>
                <Button
                  type='primary'
                  shape='circle'
                  icon={<EyeOutlined />}
                  size={'small'}
                  onClick={() => setModalVisible(true)}
                />
              </Tooltip>
            }
          </Space>
        ),
      })
      setColumns(columnsDef)
      fetchOutofServiceRooms()
    }
    // eslint-disable-next-line
  }, [defaultSelectedTab, startDate, endDate])

  async function fetchRooms() {
    await getHotelRooms(pmsPropertyId, dispatch)
  }

  async function fetchOutofServiceRooms() {
    await getOutofServiceRooms(pmsPropertyId, startDate, endDate, dispatch)
  }

  return (
    <RoomState.Provider
      value={{
        ...{
          dispatch,
          translateTextI18N,
          hotelId,
          columns,
          rooms,
          showLoader,
          setShowLoader,
          successMessage,
          setSuccessMessage,
          errorMessage,
          setErrorMessage,
          defaultSelectedTab,
          setDefaultSelectedTab,
          startDate,
          setStartDate,
          endDate,
          setEndDate,
          dateFormatList,
          outOfServiceRooms,
          roomsLoading,
          outOfServiceRoomsLoading,
          modalVisible,
          setModalVisible,
        },
      }}
    >
      {props.children}
    </RoomState.Provider>
  )
}
