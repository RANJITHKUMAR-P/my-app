import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import Header from '../../Common/Header/Header'
import PageNamecard from '../../Common/PageNameCard/PageNameCard'
import { Tabs, Spin } from 'antd'
import {
  whiteBoxStyle,
  statusColors,
  roomContainerStyle,
  roomWrapperStyle,
} from '../../../config/constants'
import { getColor } from '../../../config/utils'
import 'antd/dist/antd.css'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHotelLocations } from '../../../services/location'
import { getCardStyle } from '../../../config/utils'
import moment from 'moment'
import { AddRecurringTaskRequestListener } from '../../../services/requests'
const { TabPane } = Tabs

const RoomComponent = ({ room, disabled }) => {
  const color = disabled ? '#808080' : getColor(room.status)
  const style = useMemo(
    () => ({
      ...getCardStyle(color),
      borderRadius: '6px',
      padding: '8px',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginRight: '10px',
      minWidth: '90px',
      height: '75px',
      width: '100%',
      maxHeight: '75px',
      maxWidth: '120px',
      backgroundColor: '#FFFFFF',
      borderWidth: '0 0 0 4px',
      borderLeft: `4px solid ${color}`,
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }),
    [color, disabled]
  )

  const content = (
    <div style={style}>
      <div>
        <div style={{ fontWeight: 'bold' }}>{room.locationName}</div>
        <div style={{ color }}>{disabled ? 'Not Assigned' : room.status}</div>
      </div>
    </div>
  )

  return disabled ? (
    content
  ) : (
    <Link
      to={`/HouseKeepingTimeScheduler?id=${room.id}`}
      style={{ textDecoration: 'none' }}
    >
      {content}
    </Link>
  )
}

const RoomView = () => {
  const [rooms, setRooms] = useState({ numbered: [], common: [] })
  const [locations, setLocations] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(true)

  const { hotelId, hotelInfo, locationIdToInfo, recurringTaskRequests } =
    useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    AddRecurringTaskRequestListener({ hotelId, dispatch })
  }, [dispatch, hotelId])

  // Process recurring tasks
  const uniqueRecurringTasks = useMemo(() => {
    const groupIdMap = new Map()
    return recurringTaskRequests.filter(task => {
      if (!groupIdMap.has(task.groupId)) {
        groupIdMap.set(task.groupId, true)
        return true
      }
      return false
    })
  }, [recurringTaskRequests])

  useEffect(() => {
    const processRecurringTasks = () => {
      setLoadingLocations(true)
      const currentDate = moment().format('DD-MM-YYYY')
      const filteredTasks = recurringTaskRequests.filter(task => {
        const taskDate = moment
          .unix(task.requestedDate.seconds)
          .format('DD-MM-YYYY')
        return taskDate === currentDate
      })

      // const flattenedTasks = filteredTasks.flatMap(task => {
      //   // Check if `scheduledRooms` is an array, and map over it
      //   if (
      //     Array.isArray(task.scheduledRooms) &&
      //     task.scheduledRooms.length > 0
      //   ) {
      //     return task.scheduledRooms.map(roomNumber => ({
      //       ...task,
      //       location: roomNumber, // use room number as the location
      //       uniqueId: `${task.id}-${roomNumber}`, // create a unique ID combining task ID and room number
      //       status: task.status || 'Assigned', // fallback to 'Assigned' status if not present
      //     }))
      //   }

      // If `scheduledRooms` is not an array, fallback to `roomNumber`
      // else if (task.roomNumber) {
      //   return {
      //     ...task,
      //     location: task.locationName,
      //     uniqueId: `${task.id}-${task.roomNumber}`,
      //     status: task.status || 'Assigned',
      //   }
      // }

      // Return an empty array if neither `scheduledRooms` nor `roomNumber` exist
      //   return []
      // })
      //avoid duplicate rooms
      // const uniqueRooms = [
      //   ...new Set(filteredTasks.map(room => room.location)),
      // ].map(room => {
      //   return filteredTasks.find(r => r.location === room)
      // })
      const numbered = filteredTasks.filter(room =>
        /^\d+$/.test(room.locationName)
      )

      const common = filteredTasks.filter(
        room => !/^\d+$/.test(room.scheduledRooms)
      )

      setRooms({ numbered, common })
    }

    processRecurringTasks()
  }, [uniqueRecurringTasks])

  useEffect(() => {
    if (hotelInfo.hotelId) {
      setLoadingLocations(true)
      fetchHotelLocations({ dispatch, hotelId: hotelInfo.hotelId })
    }
  }, [dispatch, hotelInfo.hotelId])

  useEffect(() => {
    if (locationIdToInfo) {
      setLocations(
        Object.values(locationIdToInfo).map(location => ({
          ...location,
          isNumeric: /^\d+$/.test(location.locationName),
        }))
      )
    }
  }, [locationIdToInfo])

  useEffect(() => {
    if (locations.length > 0) {
      setLoadingLocations(false)
    }
  }, [rooms, locations])

  const getRoomsToDisplay = (roomsData, locationsData, isNumeric) => {
    const assignedRooms = new Set(roomsData.map(room => room.locationName))
    const roomMap = new Map()

    locationsData
      .filter(location => location.isNumeric === isNumeric)
      .forEach(location => {
        const room = {
          locationName: location.locationName,
          location: location.locationName,
          status: assignedRooms.has(location.locationName)
            ? 'Assigned'
            : 'Not Assigned',
        }
        roomMap.set(location.locationName, room)
      })

    const uniqueRooms = Array.from(roomMap.values())

    // Rooms sorting logic
    const sortedRooms = uniqueRooms.sort((a, b) => {
      if (a.status === 'Not Assigned' && b.status === 'Not Assigned') {
        // For numeric rooms
        if (isNumeric) {
          const numA = parseInt(a.locationName, 10)
          const numB = parseInt(b.locationName, 10)
          return numA - numB
        }
        // For non-numeric (common areas)
        return a.locationName.localeCompare(b.locationName)
      }

      if (a.status === 'Not Assigned') return 1
      if (b.status === 'Not Assigned') return -1

      // Sort assigned rooms
      if (isNumeric) {
        const numA = parseInt(a.locationName, 10)
        const numB = parseInt(b.locationName, 10)
        return numA - numB
      }
      return a.locationName.localeCompare(b.locationName)
    })

    return sortedRooms.map(room => {
      const assignedRoom = roomsData.find(r => r.locationName === room.location)
      return assignedRoom || { ...room, disabled: true }
    })
  }

  const numberedRooms = getRoomsToDisplay(rooms.numbered, locations, true)
  const commonRooms = getRoomsToDisplay(rooms.common, locations, false)

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='iNPLASS Room View'
                breadcrumb={['Admin', 'RoomView']}
              />
            </div>
          </div>
          <div style={whiteBoxStyle}>
            {loadingLocations ? (
              <div
                style={{ textAlign: 'center', margin: '20px 0', width: '100%' }}
              >
                <Spin size='default' />
              </div>
            ) : (
              <Tabs defaultActiveKey='1' style={{ marginLeft: 15 }}>
                <TabPane tab='Rooms' key='1'>
                  <div style={roomContainerStyle}>
                    {numberedRooms.map(room => (
                      <div key={room.id} style={roomWrapperStyle}>
                        <RoomComponent room={room} disabled={room.disabled} />
                      </div>
                    ))}
                  </div>
                </TabPane>
                <TabPane tab='Common Area' key='2'>
                  <div style={roomContainerStyle}>
                    {commonRooms.map(room => (
                      <div
                        key={room.uniqueId || room.id}
                        style={roomWrapperStyle}
                      >
                        <RoomComponent room={room} disabled={room.disabled} />
                      </div>
                    ))}
                  </div>
                </TabPane>
              </Tabs>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default RoomView
