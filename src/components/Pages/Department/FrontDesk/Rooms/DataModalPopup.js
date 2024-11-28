import React, { useContext } from 'react'
import { RoomState } from './model'
import { Modal } from 'antd'

export default function DataModalPopup() {
  const { modalVisible, setModalVisible } = useContext(RoomState)

  return (
    <Modal
      title='Room Details'
      style={{
        top: 20,
      }}
      visible={modalVisible}
      onOk={() => setModalVisible(false)}
      onCancel={() => setModalVisible(false)}
    >
      <p>In progress...</p>
    </Modal>
  )
}
