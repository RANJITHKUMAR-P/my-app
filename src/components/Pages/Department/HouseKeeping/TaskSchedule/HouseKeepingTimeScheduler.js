import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Table,
  Button,
  Menu,
  Dropdown,
  Select,
  DatePicker,
  message,
  Tooltip,
  Tabs,
} from 'antd'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { useLocation } from 'react-router-dom'
import Header from '../../../../Common/Header/Header'
import SideMenu from '../../../../Common/Sidemenu/Sidemenu'
import PageNameCard from '../../../../Common/PageNameCard/PageNameCard'
import {
  Collections,
  Search,
  entityTypes,
} from '../../../../../config/constants'
import { AddRecurringTaskRequestListener } from '../../../../../services/requests'
import { AssignTaskNotificaion } from '../../../../../services/notification'

import moment from 'moment'
import {
  getImage,
  getStatusButtonStyle,
  handleStatusChangeWithComment,
  getCustomTitle,
  updateTasksState,
  getRequestCollection,
  sendNotification,
} from '../../../../../config/utils'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from '../../../../../Store'
import { DownOutlined, CommentOutlined } from '@ant-design/icons'
import { getStaffs, getRequestPath } from '../../../../../services/user'
import ReassignTask from './ReassignTask'
import TaskComments from './TaskComments'
import DepartmentAndServiceKeys from '../../../../../config/departmentAndServicekeys'
import { nanoid } from 'nanoid'
const { Option } = Select
const { TabPane } = Tabs
const HouseKeepingTimeScheduler = () => {
  const [tasks, setTasks] = useState([])
  const [reassignModalVisible, setReassignModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const dispatch = useDispatch()
  const {
    hotelId,
    hotelInfo,
    userInfo,
    recurringPermissions,
    recurringTaskRequests,
    loadingRecurringTaskRequests,
  } = useSelector(state => state)

  const [activeTab, setActiveTab] = useState('today')
  const [staffList, setStaffList] = useState([])
  const location = useLocation()
  const tableRef = useRef(null)
  const [highlightedRowKey, setHighlightedRowKey] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [statusChangeComment, setStatusChangeComment] = useState('')
  const [changingStatus, setChangingStatus] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [filterDate, setFilterDate] = useState('all')
  const [departments, setDepartments] = useState([])
  const [listOfStaff, setListOfStaff] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const listView = recurringPermissions?.canListView || ''
  const [housekeepingStaff, setHousekeepingStaff] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
        })
      } else {
        setCurrentUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const taskSheetManagementView =
    recurringPermissions?.canTaskSheetManagementView
  let currentStaffName = ''

  let isTaskSheet = null
  let isListView = null
  let isRoomView = null

  if (taskSheetManagementView && listView) {
    isTaskSheet = true
    isListView = false
  } else if (listView) {
    isListView = true
  } else if (taskSheetManagementView) {
    isRoomView = true
  }
  if (isTaskSheet) {
    currentStaffName = ''
  } else {
    currentStaffName = userInfo?.name
  }

  if (userInfo.level === 0) {
    currentStaffName = ''
  }

  const [searchStaff, setSearchStaff] = useState(currentStaffName)

  const handleTabChange = key => {
    setActiveTab(key)
    setFilterDate(key)
    setCurrentPage(1)
  }

  const filterTasks = useCallback(
    tasks => {
      // Ensure we're working with unique tasks based on their IDs
      const uniqueTasks = Array.from(
        new Map(tasks.map(task => [task.id, task])).values()
      )

      return uniqueTasks.filter(task => {
        const matchesStaff = currentStaffName
          ? task.assignedToName.toLowerCase() === currentStaffName.toLowerCase()
          : task.assignedToName
              .toLowerCase()
              .includes(searchStaff.toLowerCase())
        const matchesDepartment =
          !selectedDepartment || task.department === selectedDepartment
        const matchesService =
          !selectedService || task.service === selectedService
        const matchesStatus = !selectedStatus || task.status === selectedStatus

        // Date filtering logic
        let matchesDate = true
        const taskDate = moment
          .unix(task.requestedDate.seconds)
          .format('DD-MM-YYYY')

        if (activeTab === 'today') {
          const today = moment().format('DD-MM-YYYY')
          matchesDate = taskDate === today
        } else if (selectedDate) {
          matchesDate = moment(taskDate, 'DD-MM-YYYY').isSame(
            selectedDate,
            'day'
          )
        }

        return (
          matchesStaff &&
          matchesDepartment &&
          matchesService &&
          matchesStatus &&
          matchesDate
        )
      })
    },
    [
      searchStaff,
      selectedDepartment,
      selectedService,
      selectedStatus,
      selectedDate,
      activeTab,
      currentStaffName,
    ]
  )

  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const list = await getStaffs(hotelId)
        setStaffList(list)
      } catch (error) {
        console.error('Error fetching staff list:', error)
      }
    }

    fetchStaffList()
  }, [hotelId])

  useEffect(() => {
    AddRecurringTaskRequestListener({ hotelId, dispatch })
  }, [dispatch, hotelId])

  useEffect(() => {
    if (recurringTaskRequests.length > 0) {
      const currentDate = moment().format('DD-MM-YYYY')
      const filtered = recurringTaskRequests.filter(task => {
        const taskDate = moment
          .unix(task.requestedDate.seconds)
          .format('DD-MM-YYYY')
        return taskDate === currentDate
      })

      // Ensure unique tasks in filteredTasks
      const uniqueFiltered = Array.from(
        new Map(filtered.map(task => [task.id, task])).values()
      )

      setFilteredTasks(uniqueFiltered)
    }
  }, [recurringTaskRequests])

  // Modify getTableData to ensure unique records
  const getTableData = useCallback(() => {
    const currentTasks = recurringTaskRequests
    const filteredData = filterTasks(currentTasks)

    // Ensure each task has a unique ID
    const uniqueData = filteredData.map(task => ({
      ...task,
      id: task.id || task.key || `${task.requestId}-${task.locationName}`,
      key: task.id || task.key || `${task.requestId}-${task.locationName}`,
    }))

    // Remove duplicates based on ID
    const uniqueMap = new Map()
    uniqueData.forEach(task => {
      if (!uniqueMap.has(task.id)) {
        uniqueMap.set(task.id, task)
      }
    })

    return Array.from(uniqueMap.values()).sort(sortTasksByDate)
  }, [recurringTaskRequests, filterTasks])

  const parseDateString = dateString => {
    const parsed = moment(dateString, 'DD-MM-YYYY', true)
    return parsed.isValid() ? parsed : moment(0)
  }

  const fetchDepartments = useCallback(async () => {
    try {
      const db = firebase.firestore()
      const hotelTasksRef = db.collection('tasks').doc(hotelInfo.hotelId)
      const doc = await hotelTasksRef.get()

      if (doc.exists && doc.data().services) {
        const servicesData = doc.data().services
        const activeDepartments = servicesData
          .filter(s => s.status !== false)
          .map(s => s.department)
        const departmentsSet = new Set(activeDepartments)
        setDepartments(Array.from(departmentsSet))
      } else {
        setDepartments([])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }, [hotelInfo.hotelId])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const sortTasksByDate = (a, b) => {
    const dateA = moment.unix(a.requestedDate.seconds)
    const dateB = moment.unix(b.requestedDate.seconds)
    return dateA.diff(dateB)
  }

  const updateStatus = useCallback(
    async (docId, newStatus) => {
      try {
        const db = firebase.firestore()
        const querySnapshot = await db
          .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
          .where('hotelId', '==', hotelInfo.hotelId)
          .where(
            'departmentKey',
            '==',
            DepartmentAndServiceKeys.houseKeeping.key
          )
          .where('serviceKey', '!=', '')
          .where('requestId', '==', docId)
          .get()

        if (querySnapshot.empty) {
          throw new Error('Task not found')
        }
        const taskDoc = querySnapshot.docs[0]

        const currentTime = firebase.firestore.FieldValue.serverTimestamp()
        const currentDate = moment().format('DD-MM-YYYY')

        let updateObj = { status: newStatus }
        if (newStatus === 'In Progress') {
          updateObj = { ...updateObj, startTime: currentTime }
        } else if (newStatus === 'Completed') {
          const taskData = taskDoc.data()
          updateObj = {
            ...updateObj,
            completedTime: currentTime,
            completeddate: currentDate,
            startTime: taskData.startTime || currentTime, // Set startTime to current time if it doesn't exist
          }
        }

        await taskDoc.ref.update(updateObj)
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.key === docId ? { ...task, ...updateObj } : task
          )
        )
        message.success('status changed successfully')
      } catch (error) {
        console.error('Error updating status:', error)
      }
    },
    [hotelInfo.hotelId]
  )

  const fetchServices = useCallback(
    async department => {
      try {
        const db = firebase.firestore()
        const hotelTasksRef = db.collection('tasks').doc(hotelInfo.hotelId)
        const doc = await hotelTasksRef.get()

        if (doc.exists && doc.data().services) {
          const servicesData = doc.data().services
          let filteredServices
          if (department) {
            filteredServices = servicesData
              .filter(s => s.department === department && s.status !== false)
              .map(s => s.service)
          } else {
            filteredServices = servicesData
              .filter(s => s.status !== false)
              .map(s => s.service)
          }
          setServices(filteredServices)
        } else {
          setServices([])
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    },
    [hotelInfo.hotelId]
  )

  useEffect(() => {
    fetchServices(selectedDepartment)
  }, [selectedDepartment, fetchServices])

  const checkAndUpdateStatus = useCallback(task => {
    const now = moment()
    const scheduleDate = parseDateString(task.scheduleDate)

    if (scheduleDate.isBefore(now, 'day') && task.status !== 'Completed') {
      return { ...task, status: 'Pending' }
    }
    return task
  }, [])

  useEffect(() => {
    const filteredStaff = staffList
      .filter(
        staff =>
          staff.department === DepartmentAndServiceKeys.houseKeeping.name &&
          staff.status === 'active' &&
          staff.id
      )
      .map(staff => ({ value: staff.id, label: staff.name }))

    setHousekeepingStaff(filteredStaff)
  }, [staffList, dispatch])

  //filtered staff for hotelAdmin
  useEffect(() => {
    if (staffList.length > 0 && userInfo.level === 0) {
      const filteredStaffList = staffList
        .filter(staff => staff.status === 'active')
        .map(staff => ({
          value: staff.id,
          label: staff.name,
        }))

      setListOfStaff(filteredStaffList)
    }
  }, [staffList])

  const calculatePageForHighlightedRow = useCallback((data, highlightedKey) => {
    if (!highlightedKey) return 1

    const index = data.findIndex(
      item => (item.id || item.key) === highlightedKey
    )
    if (index === -1) return 1

    return Math.floor(index / pageSize) + 1
  }, [])

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('1446'))

    const taskId = new URLSearchParams(location.search).get('id')
    setHighlightedRowKey(taskId)

    if (taskId) {
      const data = getTableData()
      const targetPage = calculatePageForHighlightedRow(data, taskId)
      setCurrentPage(targetPage)

      if (highlightedRowKey && tableRef.current) {
        setTimeout(() => {
          const highlightedRow =
            tableRef.current.querySelector('.highlighted-row')
          if (highlightedRow) {
            highlightedRow.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
        }, 100) // Small delay to ensure the row is rendered
      }
    }
  }, [
    location.search,
    dispatch,
    calculatePageForHighlightedRow,
    getTableData,
    highlightedRowKey,
  ])

  const showReassignModal = task => {
    setSelectedTask(task)
    setReassignModalVisible(true)
  }

  const handleReassign = async (docId, newStaff, staffDate) => {
    try {
      const db = firebase.firestore()

      // Fetch the specific task document to be reassigned
      const querySnapshot = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('hotelId', '==', hotelInfo.hotelId)
        .where('departmentKey', '==', DepartmentAndServiceKeys.houseKeeping.key)
        .where('serviceKey', '!=', '')
        .where('requestId', '==', docId)
        .get()

      if (querySnapshot.empty) {
        throw new Error('Task not found')
      }

      const taskDoc = querySnapshot.docs[0]
      const taskData = taskDoc.data()
      const scheduleDate = staffDate
      const newStaffGroupId = nanoid()
      const remainingGroupId = nanoid()

      const batch = db.batch()

      // Step 1: Reassign the task to the new staff
      batch.update(taskDoc.ref, {
        assignedToName: newStaff.name,
        assignedToStaffId: newStaff.id,
        status: 'Pending',
        scheduleStartDate: scheduleDate,
        scheduleEndDate: scheduleDate,
        groupId: newStaffGroupId,
        scheduledRooms: [taskData.locationName],
      })

      // Step 2: Get all tasks that match the initial criteria and filter by requestedDate manually
      const allTasks = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('hotelId', '==', hotelInfo.hotelId)
        .where('departmentKey', '==', DepartmentAndServiceKeys.houseKeeping.key)
        .where('serviceKey', '!=', '')
        .get()

      // Filter for tasks with the same requestedDate as newStaff schedule
      const tasksOnSameDate = allTasks.docs.filter(doc => {
        const data = doc.data()
        return (
          data.requestedDate.seconds === scheduleDate.seconds &&
          data.assignedToStaffId === taskData.assignedToStaffId &&
          data.requestId !== docId
        )
      })

      tasksOnSameDate.forEach(doc => {
        const data = doc.data()

        // Step 2a: Assign a new unique groupId to each doc
        // Step 2b: Set the start and end dates to the same date as newStaff start date
        // Step 2c: Remove newStaff room from the scheduledRooms
        const updatedScheduledRooms = data.scheduledRooms.filter(
          room => room !== taskData.locationName
        )

        batch.update(doc.ref, {
          scheduledRooms: updatedScheduledRooms,
          groupId: remainingGroupId,
          scheduleStartDate: scheduleDate,
          scheduleEndDate: scheduleDate,
        })
      })

      // Step 3: Update remaining tasks for the old user on subsequent dates
      const remainingTasks = allTasks.docs.filter(doc => {
        const data = doc.data()
        return (
          data.requestedDate.seconds > scheduleDate.seconds &&
          data.assignedToStaffId === taskData.assignedToStaffId
        )
      })

      remainingTasks.forEach(doc => {
        // increment date to next date and firebase format
        const date = new Date(staffDate.seconds * 1000)
        date.setDate(date.getDate() + 1)
        const newStaffDate = {
          seconds: Math.floor(date.getTime() / 1000),
          nanoseconds: 0,
        }

        // Update the document with the new scheduleStartDate
        batch.update(doc.ref, {
          scheduleStartDate: newStaffDate,
        })
      })

      // Commit all updates in a batch
      await batch
        .commit()
        .then(() => {
          let {
            hotelId,
            departmentId,
            requestId,
            isGuestRequest,
            service,
            roomNumber,
            requestType,
            serviceType,
            fromDepartmentId,
          } = taskData
          let requestPath = getRequestPath({
            hotelId,
            isGuestRequest,
            departmentId,
            fromDepartmentId,
            requestId: requestId,
          })

          if (newStaff.id !== userInfo?.id || newStaff.id !== userInfo?.userId) {
            // In case of self assign no need to send notification
            AssignTaskNotificaion({
              manager_id: userInfo.id || userInfo.userId,
              staff_id: newStaff.id,
              hotel_id: hotelId,
              request_type: requestType,
              service_type: serviceType || service,
              isGuest: isGuestRequest,
              assignerName: userInfo.name,
              serviceName: service,
              roomNumber,
              requestPath,
              notification_type: 'REASSIGN_RECURRING_REQUEST'
            })
          }
        })
        .catch(error => {
          // Handle errors
          console.error('Error updating batch:', error)
          // Additional error actions
        })
      message.success('Task reassigned successfully')
    } catch (error) {
      console.error('Error reassigning task:', error)
      message.error('Failed to reassign task')
    }
  }

  const isToday = dateString => {
    const today = moment().format('DD-MM-YYYY')
    return dateString === today
  }

  const getRowClassName = useCallback(
    record => {
      const rowKey = record.id || record.key
      return rowKey === highlightedRowKey ? 'highlighted-row' : ''
    },
    [highlightedRowKey]
  )

  // Modify the table render function to handle pagination properly
  const renderTable = data => {
    const uniqueData = Array.from(
      new Map(data.map(item => [item.id, item])).values()
    )

    return (
      <Table
        columns={taskColumns}
        dataSource={uniqueData}
        loading={loadingRecurringTaskRequests}
        scroll={{ y: 382 }}
        rowKey={record => record.id || record.key}
        rowClassName={getRowClassName}
        ref={tableRef}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: uniqueData.length,
          onChange: page => {
            setCurrentPage(page)
            if (tableRef.current) {
              const tableBody =
                tableRef.current.getElementsByClassName('ant-table-body')[0]
              if (tableBody) {
                tableBody.scrollTop = 0
              }
            }
          },
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    )
  }

  const renderFilters = () => (
    <div className='tablefilter-wrp'>
      <div className='form-row'>
        {!isListView && userInfo.level === 0 && (
          <div className='col-4 col-md-3'>
            <div className='searchbox'>
              <Search
                placeholder={'Search by Staff'}
                value={searchStaff}
                onChange={e => setSearchStaff(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className='col-4 col-md-auto'>
          <div className='cmnSelect-form'>
            <Select
              showSearch
              placeholder='Department'
              value={selectedDepartment}
              onChange={value => setSelectedDepartment(value)}
            >
              <Option value='House Keeping'>House Keeping</Option>
              <Option value='Front Desk'>Front Desk</Option>
            </Select>
          </div>
        </div>
        <div className='col-4 col-md-auto'>
          <div className='cmnSelect-form'>
            <Select
              showSearch
              placeholder='Service'
              value={selectedService}
              onChange={value => setSelectedService(value)}
            >
              <Option value='Room cleaning'>Room cleaning</Option>
              <Option value='Pick Laundry'>Pick Laundry</Option>
            </Select>
          </div>
        </div>
        {activeTab === 'all' && (
          <div className='col-4 col-md-2'>
            <div className='cmnSelect-form'>
              <DatePicker
                placeholder={'Schedule Date'}
                onChange={value => setSelectedDate(value)}
                format='DD-MM-YYYY'
                value={selectedDate}
              />
            </div>
          </div>
        )}
        <div className='col-4 col-md-auto'>
          <div className='cmnSelect-form'>
            <Select
              placeholder='Status'
              value={selectedStatus}
              onChange={value => setSelectedStatus(value)}
            >
              <Option value='Completed'>Completed</Option>
              <Option value='In Progress'>In Progress</Option>
              <Option value='Pending'>Pending</Option>
              <Option value='DND'>DND</Option>
              <Option value='Out Of Service'>Out Of Service</Option>
              <Option value='Delayed'>Delayed</Option>
              <Option value='Guest Refused'>Guest Refused</Option>
              <Option value='CheckOut'>CheckOut</Option>
            </Select>
          </div>
        </div>
        <div className='col-6 col-md-auto'>
          <Button
            type='primary'
            title='Reset Filter'
            className='adduserbtn'
            onClick={() => {
              setSearchStaff('')
              setSelectedDepartment(null)
              setSelectedService(null)
              setSelectedDate(null)
              setSelectedStatus(null)
            }}
          >
            <img src={getImage('images/clearicon.svg')} alt='' />
          </Button>
        </div>
      </div>
    </div>
  )
  const handleStatusChangeWithCommentWrapper = async (
    taskId,
    newStatus,
    comment
  ) => {
    try {
      const db = firebase.firestore()

      // Find the task in the current table data
      const currentData = getTableData()
      const taskToUpdate = currentData.find(
        task => task.id === taskId || task.key === taskId
      )

      if (!taskToUpdate) {
        throw new Error('Task not found in current data')
      }

      const newComment = await handleStatusChangeWithComment(
        taskId,
        newStatus,
        comment,
        currentUser,
        db,
        hotelInfo.hotelId,
        userInfo.name
      )

      const notiifcationData = {
        guestId: '',
        requestId: taskToUpdate?.requestId,
        requestReferenceId: '',
        requestType: taskToUpdate?.requestType,
        rowIndex: 0,
        serviceName: taskToUpdate?.service,
        updatedStatus: newStatus,
        userReqUpdateData: taskToUpdate,
        userInfo,
        newComment,
      }

      // / Call the notification API
      await sendNotification(notiifcationData)

      // Update the tasks state
      setTasks(prevTasks =>
        updateTasksState(prevTasks, taskId, newStatus, newComment)
      )

      // Update filtered tasks if necessary
      setFilteredTasks(prevFilteredTasks =>
        updateTasksState(prevFilteredTasks, taskId, newStatus, newComment)
      )
      setCommentModalVisible(false)
      setChangingStatus(null)
      setStatusChangeComment('')
      setSelectedTask(null)

      message.success(`Status updated to ${newStatus} and comment added`)
    } catch (error) {
      console.error('Error updating status with comment:', error)
      message.error('Failed to update status and add comment')
    }
  }

  const showCommentModal = task => {
    setSelectedTask({
      ...task,
      staffId: task.staffId,
      staffName: task.staffName,
    })
    setCommentModalVisible(true)
  }

  const statusMenu = task => {
    const canViewCheckOut =
      userInfo?.level === 0 ||
      userInfo?.level === 1 ||
      (taskSheetManagementView && listView)

    if (task.status.toLowerCase() === 'completed') {
      return null
    }

    const restrictedStatuses = ['in progress', 'pending', 'completed']
    const statuses = [
      'In Progress',
      'Completed',
      'Pending',
      'DND',
      'Out Of Service',
      'Delayed',
      'Guest Refused',
      ...(canViewCheckOut ? ['CheckOut'] : []),
    ]

    const handleStatusChange = newStatus => {
      // Check if the current user is not the assigned staff
      if (
        task.assignedToName !== userInfo.name &&
        restrictedStatuses.includes(newStatus.toLowerCase())
      ) {
        message.error(
          'You cannot change to this status as you are not the assigned staff member.'
        )
        return
      }

      if (task.status === 'In Progress' && newStatus === 'Pending') {
        message.error(
          'Status change from "In Progress" to "Pending" is not allowed.'
        )
        return
      }
      setStatusChangeComment('')
      if (
        [
          'DND',
          'Out Of Service',
          'Delayed',
          'CheckOut',
          'Guest Refused',
        ].includes(newStatus)
      ) {
        setSelectedTask(task)
        setChangingStatus(newStatus)
        setCommentModalVisible(true)
      } else {
        updateStatus(task.requestId, newStatus)
      }
    }

    return (
      <Menu onClick={({ key }) => handleStatusChange(key)}>
        {statuses.map(status => {
          const isRestricted =
            task.assignedToName !== userInfo.name &&
            restrictedStatuses.includes(status.toLowerCase())

          return (
            <Menu.Item
              key={status}
              disabled={isRestricted}
              title={
                isRestricted
                  ? 'Only assigned staff can change to this status'
                  : ''
              }
            >
              <span>{status}</span>
            </Menu.Item>
          )
        })}
      </Menu>
    )
  }

  const taskColumns = [
    {
      title: 'Location',
      dataIndex: 'locationName',
      width: 100,
      render: (_, record) => {
        return record.locationName || ''
      },
    },
    { title: 'Assigned Staff', dataIndex: 'assignedToName', width: 100 },
    { title: 'Department', dataIndex: 'department', width: 100 },
    { title: 'Service', dataIndex: 'service', width: 100 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (_, record) => {
        if (record.status.toLowerCase() === 'completed') {
          return (
            <Button
              className={`statusBtn ant-btn-${record.status
                .toLowerCase()
                .replace(/ /g, '-')}`}
              style={getStatusButtonStyle(record.status)}
            >
              <span>{record.status}</span>
            </Button>
          )
        }
        return (
          <Tooltip
            title={
              !isToday(
                moment.unix(record.requestedDate.seconds).format('DD-MM-YYYY')
              )
                ? 'Cannot change status for this date'
                : ''
            }
          >
            <span>
              <Dropdown
                overlay={statusMenu(record)}
                trigger={['click']}
                disabled={
                  !isToday(
                    moment
                      .unix(record.requestedDate.seconds)
                      .format('DD-MM-YYYY')
                  )
                }
              >
                <Button
                  className={`statusBtn ant-btn-${record.status
                    .toLowerCase()
                    .replace(/ /g, '-')}`}
                  style={getStatusButtonStyle(record.status)}
                  disabled={
                    !isToday(
                      moment
                        .unix(record.requestedDate.seconds)
                        .format('DD-MM-YYYY')
                    )
                  }
                >
                  <span>{record.status}</span>
                  <DownOutlined
                    style={{ fontSize: '10px', marginLeft: '3px' }}
                  />
                </Button>
              </Dropdown>
            </span>
          </Tooltip>
        )
      },
    },
    {
      title: 'Schedule Date',
      dataIndex: 'requestedDate',
      width: 100,
      render: date => {
        if (date && date.seconds) {
          return moment.unix(date.seconds).format('DD-MM-YYYY')
        }
        return ''
      },
      sorter: false,
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      width: 100,
      render: startTime => {
        if (startTime && startTime.seconds) {
          const milliseconds =
            startTime.seconds * 1000 + startTime.nanoseconds / 1000000
          return moment(milliseconds).format('hh:mm A')
        }
        return ''
      },
    },
    {
      title: 'Completed Time',
      dataIndex: 'completedTime',
      width: 100,
      render: completedTime => {
        if (completedTime && completedTime.seconds) {
          const milliseconds =
            completedTime.seconds * 1000 + completedTime.nanoseconds / 1000000
          return moment(milliseconds).format('hh:mm A')
        }
        return ''
      },
    },
    ...(!isListView
      ? [
          {
            title: 'Reassign',
            dataIndex: 'reassign',
            width: 100,
            render: (_, record) => {
              const getButtonTitle = () => {
                switch (record.status) {
                  case 'In Progress':
                    return 'Cannot reassign while task is In Progress'
                  case 'Completed':
                    return 'Cannot reassign completed tasks'
                  default:
                    return 'Reassign this task'
                }
              }

              return record.status === 'In Progress' ||
                record.status === 'Completed' ? (
                <Button
                  className='statusBtn completedBtn'
                  disabled
                  title={getButtonTitle()}
                >
                  Reassign
                </Button>
              ) : (
                <Button
                  className='statusBtn completedBtn'
                  onClick={() =>
                    showReassignModal({ ...record, docId: record.id })
                  }
                  title={getButtonTitle()}
                >
                  Reassign
                </Button>
              )
            },
          },
        ]
      : []),
    {
      title: 'Comments',
      dataIndex: 'comments',
      width: 100,
      render: (_, record) => (
        <CommentOutlined
          className='viewlink'
          style={{ fontSize: 20, cursor: 'pointer' }}
          onClick={() => showCommentModal(record)}
        />
      ),
    },
  ]

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='List View'
                breadcrumb={['Hotel Admin', 'List View']}
              />
              <div className='mt-3'>
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  destroyInactiveTabPane
                >
                  <TabPane tab='Today' key='today'>
                    {renderFilters()}
                    <div className='table-wrp'>
                      {renderTable(getTableData())}
                    </div>
                  </TabPane>
                  <TabPane tab='All' key='all'>
                    {renderFilters()}
                    <div className='table-wrp'>
                      {renderTable(getTableData())}
                    </div>
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ReassignTask
        visible={reassignModalVisible}
        onCancel={() => setReassignModalVisible(false)}
        task={selectedTask}
        onReassign={handleReassign}
        staffList={housekeepingStaff}
        staffName={userInfo.name}
      />
      <TaskComments
        visible={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false)
          setChangingStatus(null)
          setStatusChangeComment('')
          setSelectedTask(null)
        }}
        task={selectedTask}
        isStatusChange={!!changingStatus}
        statusChangeComment={statusChangeComment}
        setStatusChangeComment={setStatusChangeComment}
        onStatusChange={handleStatusChangeWithCommentWrapper}
        changingStatus={changingStatus}
        getTitleFunction={getCustomTitle}
        key={`${selectedTask?.id || ''}-${changingStatus || ''}`}
      />
      <style jsx>{`
        .highlighted-row td {
          background-color: rgba(24, 144, 255, 0.2) !important;
        }
      `}</style>
    </>
  )
}

export default HouseKeepingTimeScheduler
