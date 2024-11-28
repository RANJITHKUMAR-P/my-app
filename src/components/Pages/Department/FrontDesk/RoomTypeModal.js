import React, { useState, useEffect } from 'react'
import { Input, Modal, Button, Form } from 'antd'

import { secondsToShowAlert } from '../../../../config/constants'
import { SaveRoomType, UpdateRoomType } from '../../../../services/roomType'
import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'

const GetRoomTypeSavedMessage = roomTypeToEdit =>
  `Room type ${roomTypeToEdit.id ? 'updated' : 'added'} successfully`

const IsValidRoomType = (value, roomTypeToEdit, roomTypes) => {
  if (!value) return true

  let existingRoomTypes = roomTypes.map(r => r.roomName.toLowerCase())
  if (roomTypeToEdit.id) {
    existingRoomTypes = existingRoomTypes.filter(r => r !== roomTypeToEdit.roomName.toLowerCase())
  }

  return !existingRoomTypes.includes(value.toLowerCase())
}

const RoomTypeModal = ({
  roomTypes,
  isModalVisible,
  setIsModalVisible,
  showLoader,
  setShowLoader,
  hotelId,
  roomTypeToEdit,
  setSuccessMessage,
  setRoomTypeToEdit,
}) => {
  const [roomName, setRoomName] = useState('')
  const [description, setDescription] = useState('')
  const [saveRoomTypeError, setSaveRoomTypeError] = useState(false)

  const [form] = Form.useForm()
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const hideModal = () => {
    setIsModalVisible(false)
    setRoomTypeToEdit({})
  }

  useEffect(() => {
    form.resetFields()
    if (roomTypeToEdit.id) {
      setRoomName(roomTypeToEdit.roomName)
      setDescription(roomTypeToEdit.description)

      form.setFieldsValue({
        roomName: roomTypeToEdit.roomName,
        description: roomTypeToEdit.description,
      })
    } else {
      setRoomName('')
      setDescription('')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible])

  const saveRoomType = async () => {
    try {
      if (showLoader) return

      setShowLoader(true)
      setSaveRoomTypeError('')

      const roomType = {
        roomName,
        description,
        hotelId,
      }

      let successfullySaved = ''
      let errorMessage = ''
      if (roomTypeToEdit.id) {
        const { success: updateSuccess, message: updateRoomTypeMessage } = await UpdateRoomType(
          roomType,
          roomTypeToEdit.id
        )
        successfullySaved = updateSuccess
        errorMessage = updateRoomTypeMessage
      } else {
        const { success, message: saveRoomTypeMessage } = await SaveRoomType(roomType)
        successfullySaved = success
        errorMessage = saveRoomTypeMessage
      }

      if (!successfullySaved) {
        setSaveRoomTypeError(errorMessage)
        return
      }

      hideModal()
      setSuccessMessage(GetRoomTypeSavedMessage(roomTypeToEdit))
      setTimeout(() => setSuccessMessage(''), secondsToShowAlert)
    } finally {
      setShowLoader(false)
    }
  }

  const handleRoomNameChagne = value => {
    setRoomName(value)
    form.setFieldsValue({ roomName: value })
  }

  return (
    <Modal
      title={translateTextI18N(`${roomTypeToEdit.id ? 'Edit' : 'Add'} Room Type`)}
      visible={isModalVisible}
      onOk={hideModal}
      onCancel={hideModal}
      className='addrestaurantModal cmnModal'
      footer={null}
      centered
    >
      <Form layout='vertical' form={form} onFinish={saveRoomType} validateTrigger>
        <div className='row'>
          <div className='col-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Room Name')}
                name='roomName'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please add the Room Name'),
                  },
                  () => ({
                    validator(_, value) {
                      if (IsValidRoomType(value?.toLowerCase() || '', roomTypeToEdit, roomTypes)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(
                        new Error(translateTextI18N('Room type already exists'))
                      )
                    },
                  }),
                ]}
                value={roomName}
              >
                <Input
                  placeholder={translateTextI18N('Room Name')}
                  value={roomName}
                  onChange={e => handleRoomNameChagne(e.target.value)}
                  onBlur={e => handleRoomNameChagne(e.target.value.trim())}
                />
              </Form.Item>
            </div>
          </div>

          <div className='col-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Description')}
                name='description'
                value={description}
              >
                <Input
                  placeholder={translateTextI18N('Description')}
                  onChange={e => setDescription(e.target.value)}
                  value={description}
                />
              </Form.Item>
            </div>
          </div>
        </div>

        <CustomAlert
          visible={saveRoomTypeError}
          message={saveRoomTypeError}
          type='error'
          showIcon={true}
        />

        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={hideModal}>
            {translateTextI18N('Cancel')}
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            htmlType='submit'
            loading={showLoader}
          >
            {translateTextI18N('Submit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default RoomTypeModal
