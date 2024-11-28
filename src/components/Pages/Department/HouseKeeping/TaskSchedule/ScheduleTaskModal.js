import React, { useEffect, useState } from 'react'
import { Modal, DatePicker, Select, Button, Form, Input, message } from 'antd'
import { useCustomI18NTranslatorHook } from '../../../../../utility/globalization'
import { fetchHotelLocations } from '../../../../../services/location'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import SuccessModal from '../../../../Common/Modals/SuccessModal'
import DepartmentAndServiceKeys from '../../../../../config/departmentAndServicekeys'
import { saveServiceRequest } from '../../../../../services/requests'
import { StaffListener } from '../../../../../services/user'
import { nanoid } from 'nanoid'
import firebase from 'firebase/app'
import { Collections } from '../../../../../config/constants'
import { scheduleRecurringNotificationCron } from '../../../../../services/cron'
import { v4 as uuidv4 } from 'uuid'

const { Option } = Select

const ScheduleTaskModal = ({
  isVisible,
  onCancel,
  onSubmit,
  form,
  editingTask,
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const {
    hotelInfo,
    userInfo,
    locationIdToInfo,
    departmentsNew,
    servicesNew,
    staffList,
    isStaffListenerAdded,
  } = useSelector(state => state)
  const [locations, setLocations] = useState([])
  const [departments, setDepartments] = useState([
    DepartmentAndServiceKeys.houseKeeping.name,
  ])
  const [services, setServices] = useState([
    DepartmentAndServiceKeys.houseKeeping.services.roomCleaning.name,
  ])
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [housekeepingStaff, setHousekeepingStaff] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [selectedRooms, setSelectedRooms] = useState([])
  const [note, setNote] = useState('')
  const [nonPendingTasks, setNonPendingTasks] = useState([])
  const [nonPendingDates, setNonPendingDates] = useState([])

  const getHouseKeepingId = () => {
    const key = DepartmentAndServiceKeys.houseKeeping.key
    const item = departmentsNew.find(obj => obj.key === key)
    return item ? item.id : null
  }

  const getRoomCleaningId = () => {
    const allServices = Object.values(servicesNew).flat()
    const roomCleaningKey =
      DepartmentAndServiceKeys.houseKeeping.services.roomCleaning.key

    const service = allServices.find(s => s.key === roomCleaningKey)

    return service ? service.id : null
  }
  const fetchNonPendingDates = async groupId => {
    if (!groupId) return

    try {
      const db = firebase.firestore()
      const querySnapshot = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('groupId', '==', groupId)
        .where('status', '!=', 'Pending')
        .get()

      const dates = []
      querySnapshot.forEach(doc => {
        const data = doc.data()
        const date = moment(data.requestedDate.toDate()).format('YYYY-MM-DD')
        if (!dates.includes(date)) {
          dates.push(date)
        }
      })

      setNonPendingDates(dates)
    } catch (error) {
      console.error('Error fetching non-pending dates:', error)
    }
  }
  useEffect(() => {
    if (isVisible && editingTask && editingTask.groupId) {
      fetchNonPendingDates(editingTask.groupId)
    }
  }, [isVisible, editingTask])

  // Validate date changes
  const validateDateChange = (newStartDate, newEndDate) => {
    if (!editingTask) return true

    const originalStartDate = moment.unix(editingTask.scheduleStartDate.seconds)
    const originalEndDate = moment.unix(editingTask.scheduleEndDate.seconds)

    // Check if any non-pending dates would be excluded
    const wouldExcludeDates = nonPendingDates.some(date => {
      const momentDate = moment(date)
      return (
        momentDate.isBetween(originalStartDate, originalEndDate, 'day', '[]') &&
        !momentDate.isBetween(newStartDate, newEndDate, 'day', '[]')
      )
    })

    if (wouldExcludeDates) {
      message.error(
        'Cannot modify schedule dates as some tasks are not in pending'
      )
      return false
    }

    return true
  }
  const handleStartDateChange = date => {
    if (!date) {
      setStartDate(null)
      return
    }

    const currentEndDate = form.getFieldValue('endDate')
    if (currentEndDate && !validateDateChange(date, currentEndDate)) {
      // Reset to original start date if validation fails
      form.setFieldsValue({
        startDate: moment.unix(editingTask.scheduleStartDate.seconds),
      })
      return
    }
    setStartDate(date)
    form.setFieldsValue({ startDate: date })
  }
  const handleEndDateChange = date => {
    if (!date) {
      setEndDate(null)
      return
    }

    const currentStartDate = form.getFieldValue('startDate')
    if (currentStartDate && !validateDateChange(currentStartDate, date)) {
      // Reset to original end date if validation fails
      form.setFieldsValue({
        endDate: moment.unix(editingTask.scheduleEndDate.seconds),
      })
      return
    }

    setEndDate(date)
    form.setFieldsValue({ endDate: date })
  }

  const checkExistingBookings = async (startDate, endDate, roomNumbers) => {
    try {
      const db = firebase.firestore()
      const startTimestamp = startDate.startOf('day').toDate()
      const endTimestamp = endDate.endOf('day').toDate()

      const querySnapshot = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('hotelId', '==', hotelInfo.hotelId)
        .where('departmentKey', '==', DepartmentAndServiceKeys.houseKeeping.key)
        .where(
          'serviceKey',
          '==',
          DepartmentAndServiceKeys.houseKeeping.services.roomCleaning.key
        )
        .where('requestedDate', '>=', startTimestamp)
        .where('requestedDate', '<=', endTimestamp)
        .get()

      const bookings = []
      querySnapshot.forEach(doc => {
        const data = doc.data()
        // Only include bookings for selected rooms that don't belong to the current editing task group
        if (
          roomNumbers.includes(data.locationName) &&
          (!editingTask || data.groupId !== editingTask.groupId)
        ) {
          bookings.push({
            date: moment(data.requestedDate.toDate()).format('DD-MM-YYYY'),
            room: data.locationName,
            staffId: data.assignedToStaffId,
            staffName: data.assignedToName,
            id: doc.id,
            groupId: data.groupId,
          })
        }
      })

      return bookings
    } catch (error) {
      console.error('Error checking existing bookings:', error)
      throw error
    }
  }

  useEffect(() => {
    if (isVisible && editingTask) {
      setNonPendingTasks(editingTask.nonPendingTasks || [])
      setSelectedStaff(editingTask.assignedToStaffId)
      setSelectedRooms(editingTask.scheduledRooms || [])
      setNote(editingTask.note || '')
      form.setFieldsValue({
        startDate: moment.unix(editingTask.scheduleStartDate.seconds),
        endDate: moment.unix(editingTask.scheduleEndDate.seconds),
        department: editingTask.department,
        staff: editingTask.assignedToStaffId,
        roomNumbers: editingTask.scheduledRooms || [],
        service: editingTask.service,
        note: editingTask.note || '',
      })
    } else {
      setNonPendingTasks([])
      setNonPendingDates([])
      setSelectedStaff(null)
      setSelectedRooms([])
      setNote('')
      form.resetFields()
    }
  }, [isVisible, editingTask, form])

  useEffect(() => {
    if (hotelInfo.hotelId) {
      fetchHotelLocations({ dispatch, hotelId: hotelInfo.hotelId })
    }
  }, [dispatch, hotelInfo.hotelId])

  useEffect(() => {
    StaffListener(hotelInfo.hotelId, isStaffListenerAdded, dispatch)
    if (staffList) {
      const filteredStaff = staffList
        .filter(
          staff =>
            staff.department === DepartmentAndServiceKeys.houseKeeping.name &&
            staff.status === 'active' &&
            staff.id
        )
        .map(staff => ({ value: staff.id, label: staff.name }))
      setHousekeepingStaff(filteredStaff)
    }
  }, [dispatch, hotelInfo.hotelId, staffList])

  useEffect(() => {
    if (locationIdToInfo) {
      setLocations(
        Object.values(locationIdToInfo).map(location => ({
          ...location,
        }))
      )
    }
  }, [locationIdToInfo])

  useEffect(() => {
    if (!isVisible) {
      setSelectedDepartment(null)
      form.resetFields()
    }
  }, [isVisible, form])

  const updateExistingTasks = async (values, startDate, endDate) => {
    try {
      const db = firebase.firestore()
      const newDaysDiff = endDate.diff(startDate, 'days') + 1

      const querySnapshot = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('hotelId', '==', hotelInfo.hotelId)
        .where('departmentKey', '==', DepartmentAndServiceKeys.houseKeeping.key)
        .where('serviceKey', '!=', '')
        .where('groupId', '==', editingTask.groupId)
        .get()

      if (querySnapshot.empty) {
        throw new Error('No tasks found to update')
      }

      const existingDocs = querySnapshot.docs
      const updatePromises = []
      const addPromises = []
      const deletePromises = []

      // Create a map of existing docs by date and room
      const existingDocsMap = new Map()
      existingDocs.forEach(doc => {
        const data = doc.data()
        const key = `${moment(data.requestedDate.toDate()).format(
          'YYYY-MM-DD'
        )}_${data.locationName}`
        existingDocsMap.set(key, { doc, data })
      })

      // Iterate through the new date range and rooms
      for (let i = 0; i < newDaysDiff; i++) {
        for (let j = 0; j < values.roomNumbers.length; j++) {
          const scheduleDate = moment(startDate).add(i, 'days')
          const key = `${scheduleDate.format('YYYY-MM-DD')}_${
            values.roomNumbers[j]
          }`

          if (existingDocsMap.has(key)) {
            // Update existing doc (for existing locations, dates)
            const { doc, data } = existingDocsMap.get(key)
            const updatedData = {
              scheduleStartDate: startDate.toDate(),
              scheduleEndDate: endDate.toDate(),
              assignedToStaffId: values.staff,
              assignedToName:
                housekeepingStaff.find(staff => staff.value === values.staff)
                  ?.label || '',
              note: values.note,
              scheduledRooms: values.roomNumbers,
              updatedAt: new Date(),
              updatedBy: userInfo.id || '',
              locationName: values.roomNumbers[j],
              requestDate: scheduleDate.toDate(),
              requestedDate: scheduleDate.clone().hour(0).minute(0).toDate(),
              requestedTime: scheduleDate.clone().hour(0).minute(0).toDate(),
              requestTime: scheduleDate.clone().hour(0).minute(0).toDate(),
            }
            updatePromises.push(doc.ref.update(updatedData))
            existingDocsMap.delete(key)
          } else {
            // Create a new document reference first to get the auto-generated ID
            const newDocRef = db
              .collection(Collections.REQUEST_INFO)
              .doc(hotelInfo.hotelId)
              .collection(Collections.REQUEST_INFO_DEPARTMENT)
              .doc(getHouseKeepingId())
              .collection(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
              .doc()
            // Use the auto-generated ID for both the document ID and requestId
            const newData = {
              ...editingTask,
              id: newDocRef.id, // Use Firebase's auto-generated ID
              requestId: newDocRef.id, // Use the same ID for requestId
              scheduleStartDate: startDate.toDate(),
              scheduleEndDate: endDate.toDate(),
              assignedToStaffId: values.staff,
              assignedToName:
                housekeepingStaff.find(staff => staff.value === values.staff)
                  ?.label || '',
              note: values.note,
              scheduledRooms: values.roomNumbers,
              createdAt: new Date(),
              updatedAt: new Date(),
              updatedBy: userInfo.id || '',
              locationName: values.roomNumbers[j],
              requestDate: scheduleDate.toDate(),
              requestedDate: scheduleDate.clone().hour(0).minute(0).toDate(),
              requestedTime: scheduleDate.clone().hour(0).minute(0).toDate(),
              requestTime: scheduleDate.clone().hour(0).minute(0).toDate(),
              status: 'Pending',
              startTime: null,
              completedTime: null,
            }

            // Add the document with the specific ID
            addPromises.push(newDocRef.set(newData))
          }
        }
      }

      // Delete docs that are no longer needed (for removal of locations or dates)
      existingDocsMap.forEach(({ doc }) => {
        deletePromises.push(doc.ref.delete())
      })

      await Promise.all([...updatePromises, ...addPromises, ...deletePromises])
    } catch (error) {
      console.error('Error updating tasks:', error)
      throw error
    }
  }

  const handleSubmit = async values => {
    setSubmitLoading(true)
    try {
      const startDate = moment(values.startDate)
      const endDate = moment(values.endDate)

      // Validate date changes for editing
      if (editingTask && !validateDateChange(startDate, endDate)) {
        setSubmitLoading(false)
        return
      }

      // Calculate days difference for creating tasks
      const daysDiff = endDate.diff(startDate, 'days') + 1

      // Get existing bookings
      const existingBookings = await checkExistingBookings(
        startDate,
        endDate,
        values.roomNumbers
      )

      // Helper functions for conflict checking
      const areArraysEqual = (arr1, arr2) => {
        if (!arr1 || !arr2) return false
        if (arr1.length !== arr2.length) return false
        return arr1.every(item => arr2.includes(item))
      }

      const isDateInRange = (date, start, end) => {
        const checkDate = moment(date)
        return checkDate.isBetween(moment(start), moment(end), 'day', '[]')
      }

      // Check if any changes were made when editing
      if (editingTask) {
        const hasDateChange =
          !moment(editingTask.scheduleStartDate.toDate()).isSame(
            startDate,
            'day'
          ) ||
          !moment(editingTask.scheduleEndDate.toDate()).isSame(endDate, 'day')
        const hasRoomChange = !areArraysEqual(
          editingTask.scheduledRooms,
          values.roomNumbers
        )
        const hasStaffChange = editingTask.assignedToStaffId !== values.staff

        // If nothing changed, proceed without conflict validation
        if (!hasDateChange && !hasRoomChange && !hasStaffChange) {
          // Update the task with the same values (in case there are other non-conflicting fields)
          await updateExistingTasks(values, startDate, endDate)
          setSuccessMessage('Tasks updated successfully')
          setShowSuccessModal(true)
          onSubmit()
          setSubmitLoading(false)
          return
        }
      }

      // Check for conflicts
      const conflicts = []
      for (let date = moment(startDate); date <= endDate; date.add(1, 'days')) {
        const dateStr = date.format('DD-MM-YYYY')

        for (const room of values.roomNumbers) {
          const conflictingBookings = existingBookings.filter(
            booking =>
              booking.date === dateStr &&
              booking.room === room &&
              // Exclude current task's bookings when editing
              (!editingTask || booking.groupId !== editingTask.groupId)
          )

          for (const booking of conflictingBookings) {
            // Different staff conflict - always show
            if (booking.staffId !== values.staff) {
              conflicts.push({
                date: dateStr,
                room,
                existingStaff: booking.staffName,
                type: 'different_staff',
              })
            }
            // Same staff conflict - only show for new assignments
            else if (
              !editingTask || // new task
              !editingTask.scheduledRooms.includes(room) || // new room added
              !isDateInRange(
                date,
                editingTask.scheduleStartDate.toDate(),
                editingTask.scheduleEndDate.toDate()
              ) // new date
            ) {
              conflicts.push({
                date: dateStr,
                room,
                existingStaff: booking.staffName,
                type: 'same_staff',
              })
            }
          }
        }
      }

      // Display conflicts if any found
      if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(conflict => {
          if (conflict.type === 'different_staff') {
            return `Room ${conflict.room} on ${conflict.date} is already assigned to ${conflict.existingStaff}`
          } else {
            return `Room ${conflict.room} on ${conflict.date} is already assigned to the same staff member (${conflict.existingStaff})`
          }
        })

        message.error(
          <>
            Cannot schedule task due to conflicts:
            <br />
            {conflictMessages.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </>
        )
        setSubmitLoading(false)
        return
      }

      // Proceed with original submit logic if no conflicts
      if (editingTask) {
        await updateExistingTasks(values, startDate, endDate)
        setSuccessMessage('Tasks updated successfully')
        setShowSuccessModal(true)
        onSubmit()
      } else {
        // Create new tasks (existing logic)
        const requests = []
        const groupId = nanoid()

        for (let i = 0; i < daysDiff; i++) {
          for (let j = 0; j < values.roomNumbers.length; j++) {
            const scheduleDate = moment(startDate).add(i, 'days')

            const requestData = {
              billAmount: 0,
              cuisines: [],
              dateTime: moment().format('DD/MM/YY, hh:mm a'),
              department_type: DepartmentAndServiceKeys.houseKeeping.name,
              department: DepartmentAndServiceKeys.houseKeeping.name,
              departmentId: getHouseKeepingId(),
              departmentKey: DepartmentAndServiceKeys.houseKeeping.key,
              departmentRequestImages: [],
              description: '',
              escalationTime: '',
              extraInfo: '',
              fromDepartmentId: userInfo.departmentId || '',
              fromDepartmentName: userInfo.department || 'Hotel Admin',
              frontDeskServiceType: '',
              hotelId: hotelInfo.hotelId || '',
              isSubService: false,
              menuDetail: [],
              noOfGuest: '1',
              parentServiceId: '',
              parentServiceKey: '',
              requestDate: scheduleDate.toDate(),
              requestedDate: scheduleDate.clone().hour(0).minute(0).toDate(),
              requestedTime: scheduleDate.clone().hour(0).minute(0).toDate(),
              requestTime: scheduleDate.clone().hour(0).minute(0).toDate(),
              requestType: 'Normal',
              requiredTime: '00:30',
              restaurantId: '',
              restaurantName: '',
              roomType: '',
              service:
                DepartmentAndServiceKeys.houseKeeping.services.roomCleaning
                  .name,
              serviceId: getRoomCleaningId(),
              serviceKey:
                DepartmentAndServiceKeys.houseKeeping.services.roomCleaning.key,
              serviceType: '',
              status: 'Pending',
              ticketNumber: '',
              typeOfService: 'ServiceRequests',
              writeRequest: '',
              assignedById: '',
              assignedByName: '',
              createdAtDate: moment().startOf('day').toDate(),
              assignedToName: '',
              completedTime: null,
              createdByName: userInfo.name || '',
              from: 'HOP',
              isEscalationNotificationSend: false,
              isGuestRequest: false,
              isReminderSend: false,
              isWarningSend: false,
              noOfRequestsAllowed: 0,
              isDelete: false,
              createdBy: userInfo.id || '',
              createdAt: new Date(),
              updatedBy: userInfo.id || '',
              updatedAt: new Date(),
              isMoreRequest: false,
              locationId: '',
              locationName: `${values.roomNumbers[j]}`,
              locationTypeId: '',
              locationTypeName: '',
              locationTypeisDefault: false,
              isLocationUsed: true,
              isRecurring: true,
              scheduleStartDate: startDate.toDate(),
              scheduleEndDate: endDate.toDate(),
              assignedToStaffId: selectedStaff,
              assignedToName:
                housekeepingStaff.find(staff => staff.value === selectedStaff)
                  ?.label || '',
              note: values.note || '',
              groupId: groupId,
              scheduledRooms: values.roomNumbers || '',
            }

            let guestList = [
              {
                bookingReferance: '',
                guest: userInfo.name || '',
                guestId: '',
                roomNumber: 'Front Desk',
              },
            ]

            // Setting notification data
            const notificationData = {
              staffName: userInfo?.name,
              staff_id: userInfo?.id,
              department: DepartmentAndServiceKeys.houseKeeping.name,
              departmentId: getHouseKeepingId(),
              departmentKey: DepartmentAndServiceKeys.houseKeeping.key,
              serviceId: getRoomCleaningId(),
              serviceKey:
                DepartmentAndServiceKeys.houseKeeping.services.roomCleaning.key,
              service:
                DepartmentAndServiceKeys.houseKeeping.services.roomCleaning
                  .name,
              currentLanguage: 'en',
              scheduleStartDate: startDate.toDate(),
              scheduleEndDate: endDate.toDate(),
              assignedToStaffId: selectedStaff,
              assignedToName:
                housekeepingStaff.find(staff => staff.value === selectedStaff)
                  ?.label || '',
              note: values.note || '',
              notificationSendingType: 'recurring',
              recurringCronName: uuidv4(),
            }

            console.log('notificationData', notificationData)

            requests.push({ guestList, notificationData, requestData })
          }
        }

        await Promise.all(
          requests.map(async request => {
            console.log('sdfsdfsdfs')
            const { success, message: responseMessage } =
              await saveServiceRequest(request)
            if (!success) {
              throw new Error(responseMessage)
            }
          })
        )

        // Now you can access the data of the first index
        const notificationData = requests[0].notificationData
        const requestData = requests[0].requestData

        console.log('notificationData', notificationData)
        console.log('requestData', requestData)

        await scheduleRecurringNotificationCron({
          requestData,
          notificationData,
        })

        setSuccessMessage('Tasks scheduled successfully')
        setShowSuccessModal(true)
        onSubmit()
      }
    } catch (error) {
      console.error('Error adding requests to Firestore:', error)
      message.error(
        editingTask ? 'Failed to update tasks' : 'Failed to schedule tasks'
      )
    } finally {
      setSubmitLoading(false)
    }
  }

  const isRoomDisabled = room => nonPendingTasks.includes(room)

  const handleCancel = () => {
    setSelectedDepartment(null)
    setSelectedStaff(null)
    setSelectedRooms([])
    setNote('')
    form.resetFields()
    onCancel()
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    onCancel()
  }

  const disabledDate = current => {
    return current && current < moment().startOf('day')
  }

  const filterOption = (input, option) =>
    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0

  return (
    <>
      <Modal
        title={translateTextI18N(
          editingTask ? 'Edit Recurring Task' : 'Schedule Recurring Task'
        )}
        visible={isVisible}
        onCancel={handleCancel}
        centered
        footer={null}
        className='addtitleModal cmnModal'
        maskClosable={false}
        width={600}
      >
        <Form layout='vertical' form={form} onFinish={handleSubmit}>
          <Form.Item name='id' hidden>
            <Input />
          </Form.Item>

          <div className='row' id='myprofile-form'>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Schedule Start Date')}
                  name='startDate'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select a start date'),
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format='DD MMM YYYY'
                    disabledDate={disabledDate}
                    onChange={handleStartDateChange}
                  />
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Schedule End Date')}
                  name='endDate'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select an end date'),
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format='DD MMM YYYY'
                    disabledDate={disabledDate}
                    onChange={handleEndDateChange}
                  />
                </Form.Item>
              </div>
            </div>

            <div className='col-12'>
              <div className='form-group cmn-input group-input'>
                <Form.Item
                  label={translateTextI18N('Department')}
                  name='department'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select a department'),
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder={translateTextI18N('Department')}
                    optionFilterProp='children'
                    className='editButonnSelect'
                    dropdownClassName='editButonn-dropdown'
                  >
                    {departments.map(dept => (
                      <Option key={dept} value={dept}>
                        {translateTextI18N(dept)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className='col-12'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Staff')}
                  name='staff'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N(
                        'Please select a staff member'
                      ),
                    },
                  ]}
                >
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder={translateTextI18N('Staff')}
                    loading={housekeepingStaff.length === 0}
                    filterOption={filterOption}
                    onChange={value => setSelectedStaff(value)}
                  >
                    {housekeepingStaff.map((staff, index) => (
                      <Option
                        key={staff.value || `staff-${index}`}
                        value={staff.value}
                      >
                        {staff.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className='col-12'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Location')}
                  name='roomNumbers'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select room numbers'),
                    },
                  ]}
                >
                  <Select
                    mode='multiple'
                    showSearch
                    style={{ width: '100%' }}
                    placeholder={translateTextI18N('Room Number')}
                    className='location-select'
                  >
                    {locations
                      .sort((a, b) => {
                        const numA = parseInt(a.locationName, 10)
                        const numB = parseInt(b.locationName, 10)
                        return isNaN(numA) || isNaN(numB)
                          ? a.locationName.localeCompare(b.locationName)
                          : numA - numB
                      })
                      .map(location => (
                        <Option
                          key={location.id}
                          value={location.locationName}
                          disabled={isRoomDisabled(location.locationName)}
                        >
                          {location.locationName}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                {locations.some(location =>
                  isRoomDisabled(location.locationName)
                ) && (
                  <div
                    style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}
                  >
                    The following room cannot be removed as their status is not
                    'pending':
                    {locations
                      .filter(location => isRoomDisabled(location.locationName))
                      .map(location => location.locationName)
                      .join(', ')}
                  </div>
                )}
              </div>
            </div>

            <div className='col-12'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Service')}
                  name='service'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select a service'),
                    },
                  ]}
                >
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder={translateTextI18N('Service')}
                  >
                    {services.map(service => (
                      <Option key={service} value={service}>
                        {translateTextI18N(service)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className='col-12'>
              <div className='form-group cmn-input'>
                <Form.Item label={translateTextI18N('Note')} name='note'>
                  <Input.TextArea
                    placeholder={translateTextI18N(
                      'Enter any additional notes (optional)'
                    )}
                    rows={3}
                    onChange={e => setNote(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className='modalFooter'>
            <Button className='grayBtn' key='back' onClick={handleCancel}>
              {translateTextI18N('Cancel')}
            </Button>
            <Button
              className='blueBtn ml-4'
              key='submit'
              htmlType='submit'
              type='primary'
              loading={submitLoading}
            >
              {translateTextI18N(editingTask ? 'Update' : 'Submit')}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        visible={showSuccessModal}
        onCancel={handleSuccessModalClose}
        className='successModal'
        footer={null}
        centered
      >
        <SuccessModal title={successMessage}></SuccessModal>
      </Modal>
    </>
  )
}

export default ScheduleTaskModal
