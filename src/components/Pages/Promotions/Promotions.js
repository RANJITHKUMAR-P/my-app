/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { Modal, Table, Select, Button, DatePicker, message } from 'antd'
import moment from 'moment'

import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import { GetDepartments } from '../../../services/department'
import SuccessModal from '../../Common/Modals/SuccessModal'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../../../Store'
import {
  PromoMenuListener,
  DeletePromoMenuItem,
} from '../../../services/promotion'
import DeleteModal from '../../Common/Modals/DeleteModal'

import {
  secondsToShowAlert,
  departmentFilterLabel,
  statusFilterLabel,
  PromoStatusList,
  Option,
  PaginationOptions,
} from '../../../config/constants'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import AddEditPromotion from './AddEditPromotion'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import ReadMore from '../../Common/ReadMore/ReadMore'
import {
  FormatTimestamp,
  getImage,
  isFilterValueSelected,
  Sort,
} from '../../../config/utils'
import { auth } from '../../../config/firebase'

const DateFormat = 'DD MMM YYYY'

const GetFilteredPromoList = (
  promoMenus,
  filteredDept,
  filteredStatus,
  filteredDate,
  departments
) => {
  let filteredPromoList = [...promoMenus].map(d => {
    const department = departments.find(dept => dept.id === d.department)
    let serviceName = ''
    if (d.service) {
      const service = department?.services.find(s => s.id === d.service)
      serviceName = service?.name
    }
    return { ...d, departmentName: department?.name, serviceName }
  })

  if (isFilterValueSelected(filteredDept, departmentFilterLabel))
    filteredPromoList = filteredPromoList.filter(
      p => p.department === filteredDept
    )
  if (isFilterValueSelected(filteredStatus, statusFilterLabel))
    filteredPromoList = filteredPromoList.filter(
      p => String(p.status) === filteredStatus
    )
  if (filteredDate) {
    filteredPromoList = filteredPromoList.filter(p =>
      moment(filteredDate).isSame(moment(p.startDate.toDate()))
    )
  }
  return filteredPromoList
}

const GetData = (hotelId, getDatartments, promoMenuListenerAdded, dispatch) => {
  if (hotelId) {
    getDatartments()
    if (!promoMenuListenerAdded) {
      dispatch(actions.setPromoMenuListenerAdded(true))
      PromoMenuListener(hotelId, dispatch)
    }
  }
}

const GetDepartmentOptions = departments => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  if (!Array.isArray(departments)) return []

  let deptList = departments.filter(d => d.name.toLowerCase() !== 'promotion')
  deptList = Sort(deptList, 'name')
  return deptList.map(d => (
    <Option value={d.id} key={d.id}>
      {translateTextI18N(d.name)}
    </Option>
  ))
}

const Promotions = () => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const [filteredDept, setFilteredDept] = useState(departmentFilterLabel)
  const [filteredStatus, setFilteredStatus] = useState(statusFilterLabel)
  const [successMessage, setSuccessMessage] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [departments, setDepartments] = useState([])
  const [showDeletConfirmation, setShowDeletConfirmation] = useState(false)
  const [promoMenuId, setPromoMenuId] = useState('')
  const [filteredPromo, setFilteredPromo] = useState([])
  const [filteredDate, setFilteredDate] = useState(null)
  const [promotionToEdit, setPromotionToEdit] = useState({})

  const dispatch = useDispatch()

  const {
    loadingPromoMenu,
    promoMenuListenerAdded,
    promoMenus,
    hotelId,
    isHotelAdmin,
  } = useSelector(state => state)

  const resetFilter = () => {
    setFilteredDept(departmentFilterLabel)
    setFilteredStatus(statusFilterLabel)
    setFilteredDate(null)
  }

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey(isHotelAdmin ? '14' : '1'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let tmpdata = GetFilteredPromoList(
      promoMenus,
      filteredDept,
      filteredStatus,
      filteredDate,
      departments
    )

    tmpdata = tmpdata.map(item => {
      return {
        ...item,
        departmentName: translateTextI18N(item.departmentName),
        serviceName: translateTextI18N(item.serviceName),
      }
    })

    setFilteredPromo(tmpdata)
  }, [promoMenus, filteredDept, filteredStatus, filteredDate, departments])

  useEffect(() => {
    GetData(hotelId, getDepartments, promoMenuListenerAdded, dispatch)
  }, [hotelId])

  const deletePromoMenuItem = async () => {
    try {
      setShowDeletConfirmation(false)
      setShowLoader(true)
      const successUpdate = await DeletePromoMenuItem(promoMenuId)
      if (successUpdate) {
        setSuccessMessage('Promotion deleted successfully')
        setTimeout(() => setSuccessMessage(''), secondsToShowAlert)
      } else {
        message.error('Something went wrong! Please try again!')
      }
    } catch (error) {
      message.error(error.message || 'Something went wrong! Please try again!')
    } finally {
      setShowLoader(false)
    }
  }

  const getDepartments = async () => {
    try {
      setShowLoader(true)
      if (auth?.currentUser) {
        let departmentsList = await GetDepartments(hotelId, 'index', true)
        departmentsList.unshift({
          id: '0',
          name: 'Hotel',
          services: [{ name: 'name' }],
          key: 'Hotel',
        })
        setDepartments(departmentsList)
      }
    } catch (error) {
      console.log({ error })
    } finally {
      setShowLoader(false)
    }
  }

  const promotionColumns = [
    {
      title: translateTextI18N('Banner Image'),
      dataIndex: 'BannerImage',
      width: 100,
      render: (_, row) => (
        <div className='tableuser'>
          <figure>
            <img
              src={
                row.imageUrl ? row.imageUrl : getImage('images/badge-red.svg')
              }
              alt=''
              width='35'
              height='35'
              className='userImage'
            ></img>
          </figure>
        </div>
      ),
    },
    {
      title: translateTextI18N('Promotion Name'),
      dataIndex: 'PromotionName',
      width: 120,
      render: (_, row) => <span>{row.promotionName}</span>,
    },
    {
      title: translateTextI18N('Description'),
      dataIndex: 'Description',
      width: 170,
      render: (_, row) => <ReadMore text={row.description} charLength={100} />,
    },
    {
      title: translateTextI18N('Department'),
      dataIndex: 'departmentName',
      width: 100,
      render: (_, row) => <span>{row.departmentName}</span>,
    },
    {
      title: translateTextI18N('Service'),
      dataIndex: 'Service',
      width: 100,
      render: (_, row) => <span>{row.serviceName}</span>,
    },
    {
      title: translateTextI18N('Status'),
      dataIndex: 'Status',
      width: 90,
      render: (_, row) => (
        <span>
          {translateTextI18N(row.status ? 'Published' : 'Not published')}
        </span>
      ),
    },
    {
      title: translateTextI18N('Start Date'),
      dataIndex: 'StartDate',
      width: 90,
      render: (_, row) => <span>{FormatTimestamp(row.startDate, true)}</span>,
    },
    {
      title: translateTextI18N('End Date'),
      dataIndex: 'EndDate',
      width: 90,
      render: (_, row) => <span>{FormatTimestamp(row.endDate, true)}</span>,
    },
    {
      title: translateTextI18N('Action'),
      dataIndex: 'Action',
      width: 100,
      render: (_, _promoMenuItem) => (
        <div className='tableactionbtn-grp'>
          <button
            onClick={() => {
              setPromotionToEdit(_promoMenuItem)
              setIsModalVisible(true)
            }}
          >
            <img alt=' ' src={getImage('images/tedit.svg')}></img>
          </button>
          <button
            onClick={() => {
              setPromoMenuId(_promoMenuItem.id)
              setShowDeletConfirmation(true)
            }}
          >
            <img alt='' src={getImage('images/tdelete.svg')}></img>
          </button>
        </div>
      ),
    },
  ]

  const showModal = () => {
    setIsModalVisible(true)
  }

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Promotions'
                breadcrumb={['Hotel Admin', 'Promotions']}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row'>
                <div className='col-12 col-xl-12'>
                  <div className='tablefilter-wrp' id='promo-table'>
                    <div className='form-row'>
                      <div className='col-4 col-md col-xl-2'>
                        <div className='cmnSelect-form'>
                          <Select
                            placeholder={translateTextI18N('Department')}
                            value={translateTextI18N(filteredDept)}
                            onChange={selectedDepartment =>
                              setFilteredDept(selectedDepartment)
                            }
                            loading={showLoader}
                          >
                            <Option value='All'>
                              {translateTextI18N('All')}
                            </Option>
                            {GetDepartmentOptions(departments)}
                          </Select>
                        </div>
                      </div>
                      <div className='col-4 col-md col-xl-2'>
                        <div className='cmnSelect-form'>
                          <Select
                            placeholder={translateTextI18N('Status')}
                            value={translateTextI18N(filteredStatus)}
                            loading={showLoader}
                            onChange={s => setFilteredStatus(s)}
                          >
                            {PromoStatusList.map(status => {
                              return (
                                <Option value={status.value} key={status.value}>
                                  {translateTextI18N(status.name)}
                                </Option>
                              )
                            })}
                          </Select>
                        </div>
                      </div>
                      <div className='col-4 col-md col-xl-2'>
                        <div className='cmnSelect-form'>
                          <DatePicker
                            placeholder={translateTextI18N('Date')}
                            format={value => value.format(DateFormat)}
                            loading={showLoader}
                            allowClear={false}
                            value={
                              filteredDate
                                ? moment(filteredDate, DateFormat)
                                : null
                            }
                            onChange={selectedFilteredDate =>
                              setFilteredDate(
                                selectedFilteredDate.startOf('day')
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className='col-4 col-md-auto'>
                        <Button
                          type='primary'
                          className='adduserbtn'
                          title='Reset Filter'
                          onClick={resetFilter}
                        >
                          <img
                            alt=' '
                            src={getImage('images/clearicon.svg')}
                          ></img>
                        </Button>
                      </div>
                      <div className='col-4 col-md-auto ml-auto'>
                        <Button className='cmnBtn' onClick={showModal}>
                          {translateTextI18N('Add Promotion')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-12 col-xl-12'>
                  <div className='table-wrp'>
                    <Table
                      columns={promotionColumns}
                      dataSource={filteredPromo}
                      pagination={PaginationOptions}
                      scroll={{ y: 382 }}
                      loading={loadingPromoMenu || showLoader}
                      rowKey='id'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isModalVisible && (
        <AddEditPromotion
          isModalVisible={isModalVisible}
          promotionToEdit={promotionToEdit}
          setPromotionToEdit={setPromotionToEdit}
          hotelId={hotelId}
          departments={departments}
          showLoader={showLoader}
          setShowLoader={setShowLoader}
          setIsModalVisible={setIsModalVisible}
          setSuccessMessage={setSuccessMessage}
          DateFormat={DateFormat}
          GetDepartmentOptions={GetDepartmentOptions}
        />
      )}

      <Modal
        visible={successMessage}
        className='successModal'
        footer={null}
        centered
        onCancel={() => setSuccessMessage('')}
      >
        <SuccessModal title={successMessage}></SuccessModal>
      </Modal>
      <Modal
        onCancel={() => setShowDeletConfirmation(false)}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={showDeletConfirmation}
      >
        <DeleteModal
          title='Confirm Delete'
          message='Do you really want to delete the Promotions?'
        />
        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={() => setShowDeletConfirmation(false)}
          >
            {translateTextI18N('Cancel')}
          </Button>
          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={deletePromoMenuItem}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>
    </>
  )
}
export default Promotions
