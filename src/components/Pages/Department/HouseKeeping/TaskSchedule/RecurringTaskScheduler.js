import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import {
  Button,
  Table,
  Select,
  DatePicker,
  Modal,
  message,
  Form,
  Input,
  Spin,
} from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Header from '../../../../Common/Header/Header'
import SideMenu from '../../../../Common/Sidemenu/Sidemenu'
import ScheduleTaskModal from './ScheduleTaskModal'
import { Collections, PaginationOptions } from '../../../../../config/constants'
import PageNameCard from '../../../../Common/PageNameCard/PageNameCard'
import { getImage } from '../../../../../config/utils'
import DeleteModal from '../../../../Common/Modals/DeleteModal'
import DepartmentAndServiceKeys from '../../../../../config/departmentAndServicekeys'
import SuccessModal from '../../../../Common/Modals/SuccessModal'
import { AddRecurringTaskRequestListener } from '../../../../../services/requests'
import moment from 'moment'
import firebase from 'firebase/app'

const { Option } = Select
const { Search } = Input

const RecurringTaskScheduler = () => {
  const [form] = Form.useForm()
  const tableRef = useRef(null)

  const [searchStaff, setSearchStaff] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [deleteTaskId, setDeleteTaskId] = useState(null)
  const location = useLocation()
  const [highlightedTaskId, setHighlightedTaskId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [departments, setDepartments] = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { hotelInfo, recurringTaskRequests, loadingRecurringTaskRequests } =
    useSelector(state => state)

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

  const filteredTasks = useMemo(() => {
    return uniqueRecurringTasks.filter(task => {
      const matchesStaff = task.assignedToName
        .toLowerCase()
        .includes(searchStaff.toLowerCase())
      const matchesDepartment =
        !selectedDepartment || task.department === selectedDepartment
      const matchesService =
        !selectedService || task.service === selectedService

      const taskStartDate = moment.unix(task.scheduleStartDate.seconds)
      const taskEndDate = moment.unix(task.scheduleEndDate.seconds)

      let matchesDateRange = true
      if (startDate && endDate) {
        matchesDateRange =
          taskStartDate.isSame(startDate, 'day') &&
          taskEndDate.isSame(endDate, 'day')
      } else if (startDate) {
        matchesDateRange = taskStartDate.isSame(startDate, 'day')
      } else if (endDate) {
        matchesDateRange = taskEndDate.isSame(endDate, 'day')
      }

      return (
        matchesStaff && matchesDepartment && matchesService && matchesDateRange
      )
    })
  }, [
    uniqueRecurringTasks,
    searchStaff,
    selectedDepartment,
    selectedService,
    startDate,
    endDate,
  ])

  const hotelId = hotelInfo.hotelId
  const dispatch = useDispatch()

  useEffect(() => {
    const taskId = new URLSearchParams(location.search).get('id')
    setHighlightedTaskId(taskId)
    loadDepartments()
  }, [location.search])

  useEffect(() => {
    AddRecurringTaskRequestListener({ hotelId, dispatch })
  }, [dispatch, hotelId])

  const loadDepartments = () => {
    const depts = Object.entries(DepartmentAndServiceKeys)
      .filter(
        ([key, dep]) =>
          dep.name &&
          dep.key &&
          dep.services &&
          Object.keys(dep.services).length > 0
      )
      .map(([key, dep]) => ({ name: dep.name, key: key }))
    setDepartments(depts)
  }

  useEffect(() => {
    if (
      !loadingRecurringTaskRequests &&
      highlightedTaskId &&
      tableRef.current
    ) {
      const row = tableRef.current.querySelector(
        `tr[data-row-key="${highlightedTaskId}"]`
      )
      if (row) {
        const cells = row.querySelectorAll('td')
        cells.forEach(cell => {
          cell.classList.add('highlight-blink')
        })
        setTimeout(() => {
          cells.forEach(cell => {
            cell.classList.remove('highlight-blink')
          })
        }, 4000)
      }
    }
  }, [highlightedTaskId, currentPage, loadingRecurringTaskRequests])

  const handleTableChange = pagination => {
    setCurrentPage(pagination.current)
  }

  const taskColumns = [
    {
      title: 'Assigned Staff',
      dataIndex: 'assignedToName',
      width: 100,
    },
    {
      title: 'From',
      dataIndex: 'scheduleStartDate',
      width: 100,
      render: date => {
        if (date && date.seconds) {
          return moment.unix(date.seconds).format('DD-MM-YYYY')
        }
        return ''
      },
    },
    {
      title: 'To',
      dataIndex: 'scheduleEndDate',
      width: 100,
      render: date => {
        if (date && date.seconds) {
          return moment.unix(date.seconds).format('DD-MM-YYYY')
        }
        return ''
      },
    },
    {
      title: 'Department',
      dataIndex: 'department',
      width: 100,
    },
    {
      title: 'Service',
      dataIndex: 'service',
      width: 100,
    },
    {
      title: 'Location',
      dataIndex: 'scheduledRooms',
      width: 100,
      render: location => {
        return Array.isArray(location) ? location.join(', ') : ''
      },
    },
    {
      title: 'Notes',
      dataIndex: 'note',
      width: 150,
      render: text => (
        <div
          style={{
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 100,
      render: (_, record) => (
        <div className='tableactionbtn-grp'>
          <button onClick={() => handleEdit(record)}>
            <img alt='' src={getImage('images/tedit.svg')} />
          </button>
          <button onClick={() => showDeleteConfirmation(record)}>
            <img alt='' src={getImage('images/tdelete.svg')} />
          </button>
        </div>
      ),
    },
  ]

  const onScheduleTaskClick = useCallback(() => {
    setEditingTask(null)
    setIsModalVisible(true)
    form.resetFields()
  }, [form])

  const handleSearchStaff = e => {
    setSearchStaff(e.target.value)
  }

  const handleDepartmentChange = value => {
    setSelectedDepartment(value)
    setSelectedService(null)
  }

  const handleServiceChange = value => {
    setSelectedService(value)
  }

  const handleModalSubmit = () => {
    setIsModalVisible(false)
    setEditingTask(null)
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingTask(null)
  }

  const handleEdit = async record => {
    try {
      const db = firebase.firestore()
      const taskDocs = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('hotelId', '==', hotelInfo.hotelId)
        .where('departmentKey', '==', DepartmentAndServiceKeys.houseKeeping.key)
        .where('serviceKey', '!=', '')
        .where('groupId', '==', record.groupId)
        .get()

      if (taskDocs.empty) {
        throw new Error('No tasks found')
      }

      let allTasksPending = true
      const nonPendingTasks = []

      taskDocs.forEach(doc => {
        const taskToEdit = doc.data()
        if (taskToEdit.status !== 'Pending') {
          allTasksPending = false
          nonPendingTasks.push(taskToEdit.locationName)
        }
      })

      setIsModalVisible(true)
      setEditingTask({
        ...record,
        nonPendingTasks,
        allTasksPending,
      })

      form.setFieldsValue({
        id: record.id,
        startDate: moment.unix(record.scheduleStartDate.seconds),
        endDate: moment.unix(record.scheduleEndDate.seconds),
        department: record.department,
        staff: record.assignedToStaffId,
        roomNumbers: Array.isArray(record.scheduledRooms)
          ? record.scheduledRooms
          : [],
        service: record.service,
        note: record.note,
      })
    } catch (error) {
      console.error('Error fetching tasks:', error)
      message.error('Failed to fetch tasks')
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const db = firebase.firestore()
      const querySnapshot = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('hotelId', '==', hotelInfo.hotelId)
        .where('departmentKey', '==', DepartmentAndServiceKeys.houseKeeping.key)
        .where('serviceKey', '!=', '')
        .where('groupId', '==', deleteTaskId)
        .get()

      if (querySnapshot.empty) {
        setDeleteLoading(false)
        throw new Error('No tasks found')
      }

      let allTasksPending = true

      querySnapshot.forEach(doc => {
        const taskToEdit = doc.data()
        if (taskToEdit.status !== 'Pending') {
          allTasksPending = false
        }
      })

      if (!allTasksPending) {
        setIsDeleteModalVisible(false)
        message.error(`Task cannot be deleted since task has already started`)
        return
      }

      const batch = db.batch()
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      message.success(`Successfully deleted task`)
    } catch (error) {
      console.error('Error deleting tasks:', error)
      message.error('Failed to delete tasks')
    } finally {
      setDeleteLoading(false)
      setIsDeleteModalVisible(false)
    }
  }

  const showDeleteConfirmation = record => {
    setDeleteTaskId(record.groupId) //setting groupId as taskId
    setIsDeleteModalVisible(true)
  }

  const resetFilters = () => {
    setSearchStaff('')
    setSelectedDepartment(null)
    setSelectedService(null)
    setStartDate(null)
    setEndDate(null)
  }

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Recurring Task Scheduler'
                breadcrumb={['Hotel Admin', 'Recurring Task Scheduler']}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-4 col-md-3'>
                    <div className='searchbox'>
                      <Search
                        placeholder={'Search by Staff'}
                        value={searchStaff}
                        onChange={handleSearchStaff}
                      />
                    </div>
                  </div>
                  <div className='col-4 col-md-auto'>
                    <div className='cmnSelect-form' id='drpDept'>
                      <Select
                        showSearch
                        placeholder='Department'
                        optionFilterProp='children'
                        value={selectedDepartment}
                        onChange={handleDepartmentChange}
                      >
                        {departments.map(dept => (
                          <Option key={dept.key} value={dept.name}>
                            {dept.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className='col-4 col-md-auto'>
                    <div className='cmnSelect-form'>
                      <Select
                        showSearch
                        placeholder='Service'
                        optionFilterProp='children'
                        value={selectedService}
                        onChange={handleServiceChange}
                      >
                        <Option value='Room cleaning'>Room cleaning</Option>
                        <Option value='Pick Laundry'>Pick Laundry</Option>
                      </Select>
                    </div>
                  </div>
                  <div className='col-4 col-md-2'>
                    <div className='cmnSelect-form'>
                      <DatePicker
                        placeholder={'Start Date'}
                        onChange={date => setStartDate(date)}
                        format='DD-MM-YYYY'
                        value={startDate}
                      />
                    </div>
                  </div>
                  <div className='col-4 col-md-2'>
                    <div className='cmnSelect-form'>
                      <DatePicker
                        placeholder={'End Date'}
                        onChange={date => setEndDate(date)}
                        format='DD-MM-YYYY'
                        value={endDate}
                      />
                    </div>
                  </div>
                  <div className='col-6 col-md-auto '>
                    <Button
                      type='primary'
                      title='Reset Filter'
                      className='adduserbtn'
                      onClick={resetFilters}
                    >
                      <img src={getImage('images/clearicon.svg')} alt='' />
                    </Button>
                  </div>
                  <div className='col-4 col-md-auto ml-auto'>
                    <Button onClick={onScheduleTaskClick} className='cmnBtn'>
                      Schedule Recurring Task
                    </Button>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-12 col-xl-12'>
                  <div className='table-wrp'>
                    <Table
                      ref={tableRef}
                      columns={taskColumns}
                      dataSource={filteredTasks}
                      pagination={{
                        ...PaginationOptions,
                        current: currentPage,
                      }}
                      scroll={{ y: 382 }}
                      rowKey='id'
                      onChange={handleTableChange}
                      loading={{
                        indicator: <Spin size='medium' />,
                        spinning: loadingRecurringTaskRequests,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ScheduleTaskModal
        isVisible={isModalVisible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        form={form}
        editingTask={editingTask}
      />

      <Modal
        visible={isDeleteModalVisible}
        className='deleteModal cmnModal'
        footer={null}
        centered
        onCancel={() => setIsDeleteModalVisible(false)}
      >
        <DeleteModal
          title='Confirm Delete'
          message='Do you really want to delete this task?'
        />
        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={() => setIsDeleteModalVisible(false)}
          >
            Cancel
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            loading={deleteLoading}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
      <Modal
        visible={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        className='successModal'
        footer={null}
        centered
      >
        <SuccessModal title={successMessage}></SuccessModal>
      </Modal>
      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            background-color: #adadad;
          }
        }
        .highlight-blink {
          animation: blink 0.5s step-start 10;
        }
      `}</style>
    </>
  )
}

export default RecurringTaskScheduler
