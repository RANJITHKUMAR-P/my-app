import React, { useRef, useEffect, useLayoutEffect } from 'react'
import {
  Modal,
  Form,
  Button,
  Select,
  Input,
  DatePicker,
  TimePicker,
} from 'antd'
import moment from 'moment'

const { Option } = Select
const { TextArea } = Input

export const ChatHistory = ({ messages }) => {
  const chatHistoryRef = useRef(null)

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight
    }
  }

  useLayoutEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className='chat-history' ref={chatHistoryRef}>
      {messages.map((message, index) => (
        <div key={index} className='message-group'>
          <div className='user-message'>{message.userText}</div>
          <div className='assistant-message'>
            <img src='images/ivawhite.png' alt='Logo' className='logo' />
            {message.assistantText}
          </div>
        </div>
      ))}
    </div>
  )
}

// PopUP Modals
export const RoomNumberModal = ({
  visible,
  onOk,
  onCancel,
  form,
  roomNumber,
  setRoomNumber,
  roomNumbers,
  invalidRoomNumber,
  setInvalidRoomNumber,
  afterClose,
}) => {
  return (
    <Modal
      title='Select Room Number'
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={afterClose}
    >
      <Form form={form} layout='vertical'>
        <div className='row' id='room-number-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label='Please select the room number for this request:'
                name='roomNumber'
                rules={[
                  { required: true, message: 'Please select a room number' },
                ]}
              >
                <Select
                  style={{ width: '100%' }}
                  placeholder='Select room number'
                  value={roomNumber}
                  onChange={value => {
                    setRoomNumber(value)
                    setInvalidRoomNumber(false)
                  }}
                >
                  {roomNumbers.map(roomNum => (
                    <Option key={roomNum} value={roomNum}>
                      {roomNum}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {invalidRoomNumber && (
                <div className='warning-message' style={{ color: 'red' }}>
                  Invalid Room number. Please choose a valid Room number.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={onOk}
            disabled={!roomNumber}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const RoomTypeModal = ({
  visible,
  onOk,
  onCancel,
  form,
  roomType,
  setRoomType,
  roomsData,
  invalidRoomType,
  setInvalidRoomType,
  afterClose,
}) => {
  return (
    <Modal
      title='Select Room Type'
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={afterClose}
    >
      <Form form={form} layout='vertical'>
        <div className='row' id='room-type-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label='Please select the room type for this request:'
                name='roomType'
                rules={[
                  { required: true, message: 'Please select a room type' },
                ]}
              >
                <Select
                  style={{ width: '100%' }}
                  placeholder='Select room type'
                  value={roomType}
                  onChange={value => {
                    setRoomType(value)
                    setInvalidRoomType(false)
                  }}
                >
                  {roomsData.map(room => (
                    <Option key={room.id} value={room.id}>
                      {room.roomName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {invalidRoomType && (
                <div className='warning-message' style={{ color: 'red' }}>
                  Invalid Room type. Please select a valid Room type.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={onOk}
            disabled={!roomType}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const ConfirmationModal = ({
  visible,
  onOk,
  onCancel,
  form,
  comment,
  setComment,
  afterClose,
}) => {
  return (
    <Modal
      title='Confirm Request'
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={afterClose}
    >
      <Form form={form} layout='vertical'>
        <p>Are you sure you want to send this request?</p>
        <div className='row' id='confirmation-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item label='Comments' name='comment'>
                <TextArea
                  rows={4}
                  placeholder='Write comments...'
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={onCancel}>
            Cancel
          </Button>
          <Button className='blueBtn ml-3 ml-lg-4' key='submit' onClick={onOk}>
            Confirm
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const TicketNumberModal = ({
  visible,
  onOk,
  onCancel,
  form,
  ticketNumber,
  setTicketNumber,
  afterClose,
}) => {
  return (
    <Modal
      title='Enter Ticket Number'
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={afterClose}
    >
      <Form form={form} layout='vertical'>
        <div className='row' id='ticket-number-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label='Please enter the ticket number for this request:'
                name='ticketNumber'
                rules={[
                  { required: true, message: 'Please enter a ticket number' },
                ]}
              >
                <Input
                  placeholder='Ticket number'
                  value={ticketNumber}
                  onChange={e => setTicketNumber(e.target.value)}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={onOk}
            disabled={!ticketNumber}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const DaysToExtendModal = ({
  visible,
  onOk,
  onCancel,
  form,
  daysToExtend,
  setDaysToExtend,
  afterClose,
}) => {
  return (
    <Modal
      title='Enter Days to Extend'
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={afterClose}
    >
      <Form form={form} layout='vertical'>
        <div className='row' id='days-to-extend-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label='Please enter the number of days to extend your stay:'
                name='daysToExtend'
              >
                <Input
                  placeholder='Number of days'
                  value={daysToExtend}
                  onChange={e => setDaysToExtend(e.target.value)}
                  type='number'
                  min={1}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={onOk}
            disabled={!daysToExtend}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const NumberOfBedsModal = ({
  visible,
  onOk,
  onCancel,
  form,
  numberOfBeds,
  setNumberOfBeds,
  afterClose,
}) => {
  return (
    <Modal
      title='Enter Number of Beds'
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={afterClose}
    >
      <Form form={form} layout='vertical'>
        <div className='row' id='number-of-beds-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label='Please enter the number of extra beds needed:'
                name='numberOfBeds'
              >
                <Input
                  placeholder='Number of beds'
                  value={numberOfBeds}
                  onChange={e => setNumberOfBeds(e.target.value)}
                  type='number'
                  min={1}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={onOk}
            disabled={!numberOfBeds}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const DateTimeModal = ({
  visible,
  onOk,
  onCancel,
  form,
  invalidDate,
  setInvalidDate,
  pastDate,
  setPastDate,
  afterClose,
}) => {
  const [dateTimeSelected, setDateTimeSelected] = React.useState(false)

  const handleSubmit = () => {
    const dateTime = document.getElementById('datePicker').value
    onOk(dateTime)
    resetStates()
  }

  const handleCancel = () => {
    onCancel()
    resetStates()
  }

  const resetStates = () => {
    setDateTimeSelected(false)
    setInvalidDate(false)
    setPastDate(false)
  }

  return (
    <Modal
      title='Select Date and Time'
      visible={visible}
      onCancel={handleCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={afterClose}
    >
      <Form form={form} layout='vertical'>
        <div className='row' id='date-time-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label='Please select the date and time for this request:'
                name='dateTime'
                rules={[
                  { required: true, message: 'Please select date and time' },
                ]}
              >
                <DatePicker
                  id='datePicker'
                  showTime={{
                    format: 'HH:mm',
                    use12Hours: true,
                  }}
                  format='YYYY-MM-DD HH:mm'
                  style={{ width: '100%' }}
                  placeholder='Select date and time'
                  onChange={date => {
                    if (date) {
                      setInvalidDate(false)
                      setPastDate(
                        moment(date).add(1, 'minutes').isBefore(moment())
                      )
                      setDateTimeSelected(true)
                    } else {
                      setDateTimeSelected(false)
                    }
                  }}
                />
              </Form.Item>
              {invalidDate && (
                <div className='warning-message'>
                  <div style={{ color: 'red' }}>Invalid date format.</div>
                  <div style={{ color: 'black' }}>
                    Please enter the date and time in the correct format (e.g.,
                    5th September 5pm).
                  </div>
                </div>
              )}
              {pastDate && (
                <div className='warning-message'>
                  <div style={{ color: 'red' }}>
                    Invalid date and time selected.
                  </div>
                  <div style={{ color: 'black' }}>
                    Please select a date and time in the future.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={handleSubmit}
            disabled={!dateTimeSelected || pastDate || invalidDate}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const TimeOnlyModal = ({
  visible,
  onOk,
  onCancel,
  form,
  pastTime,
  setPastTime,
  afterClose,
}) => {
  const [timeSelected, setTimeSelected] = React.useState(false)

  const handleSubmit = () => {
    const time = document.getElementById('timePicker').value
    onOk(time)
    resetStates()
  }

  const handleCancel = () => {
    onCancel()
    resetStates()
  }

  const resetStates = () => {
    setTimeSelected(false)
    setPastTime(false)
  }

  return (
    <Modal
      title='Select Time'
      visible={visible}
      onCancel={handleCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={afterClose}
    >
      <Form form={form} layout='vertical'>
        <div className='row' id='time-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label='Please select the time for this request:'
                name='time'
                rules={[{ required: true, message: 'Please select time' }]}
              >
                <TimePicker
                  id='timePicker'
                  format='HH:mm'
                  use12Hours
                  style={{ width: '100%' }}
                  placeholder='Select time'
                  onChange={time => {
                    setPastTime(
                      time
                        ? moment(time, 'HH:mm')
                            .add(1, 'minutes')
                            .isBefore(moment())
                        : false
                    )
                    setTimeSelected(!!time)
                  }}
                />
              </Form.Item>
              {pastTime && (
                <div className='warning-message'>
                  <div style={{ color: 'red' }}>Invalid Time selected.</div>
                  <div style={{ color: 'black' }}>
                    Please select a time in the future.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={handleSubmit}
            disabled={!timeSelected || pastTime}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const ReplacementSubservicesModal = ({
  visible,
  onOk,
  onCancel,
  form,
  afterClose,
  setReplacementSubservice,
}) => {
  const [localReplacementSubservice, setLocalReplacementSubservice] =
    React.useState(null)

  const handleOk = () => {
    setReplacementSubservice(localReplacementSubservice)
    onOk(localReplacementSubservice)
  }

  return (
    <Modal
      title='Select Replacement Subservice'
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={() => {
        setLocalReplacementSubservice(null)
        afterClose()
      }}
    >
      <Form form={form} layout='vertical'>
        <div className='row' id='replacement-subservice-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label='Please select the replacement subservice:'
                name='replacementSubservice'
                rules={[
                  { required: true, message: 'Please select a subservice' },
                ]}
              >
                <Select
                  style={{ width: '100%' }}
                  placeholder='Select subservice'
                  onChange={value => setLocalReplacementSubservice(value)}
                >
                  <Option value='tr1'>Toiletries</Option>
                  <Option value='mr1'>Minibar</Option>
                  <Option value='pr1'>Pillow</Option>
                  <Option value='lr1'>Linen/Bed</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={handleOk}
            disabled={!localReplacementSubservice}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export const MaintenanceSubservicesModal = ({
  visible,
  onOk,
  onCancel,
  form,
  afterClose,
  setMaintenanceSubservice,
}) => {
  const [localMaintenanceSubservice, setLocalMaintenanceSubservice] =
    React.useState(null)

  const handleOk = () => {
    setMaintenanceSubservice(localMaintenanceSubservice)
    onOk(localMaintenanceSubservice)
  }

  return (
    <Modal
      title='Select Maintenance Subservice'
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      centered
      className='cmnModal'
      footer={null}
      maskClosable={false}
      afterClose={() => {
        setLocalMaintenanceSubservice(null)
        afterClose()
      }}
    >
      <Form form={form} layout='vertical'>
        <div className='row' id='maintenance-subservice-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label='Please select the maintenance subservice:'
                name='maintenanceSubservice'
                rules={[
                  { required: true, message: 'Please select a subservice' },
                ]}
              >
                <Select
                  style={{ width: '100%' }}
                  placeholder='Select subservice'
                  onChange={value => setLocalMaintenanceSubservice(value)}
                >
                  <Option value='am1'>Air Conditioner</Option>
                  <Option value='em1'>Electric</Option>
                  <Option value='lm1'>Light</Option>
                  <Option value='tm1'>Television</Option>
                  <Option value='wm1'>Water Leakage</Option>
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={handleOk}
            disabled={!localMaintenanceSubservice}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
