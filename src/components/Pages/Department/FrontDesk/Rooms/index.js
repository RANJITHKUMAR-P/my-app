import React from 'react'
import { RoomStateProvider } from './model'
import RoomLayout from './RoomLayout'

const Rooms = () => {
  return (
    <RoomStateProvider>
      <RoomLayout />
    </RoomStateProvider>
  )
}

export default Rooms
