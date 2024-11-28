/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import { Table, Button, Alert } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import {
  ManagementDeptObject,
  PaginationOptions,
  secondsToShowAlert,
} from '../../../config/constants'
import { actions } from '../../../Store'
import TitleAndPermissionsModal from './TitleAndPermissionsModal'
import {
  DeleteTitle,
  GetDefaultMenusList,
  TitleAndPermissonListener,
  UsersLinkedToTitle,
} from '../../../services/titleAndPermissions'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { TileModal } from '../../Common/Modals/TiledModal'
import DepartmentOrServiceName from '../../Common/DepartmentOrServiceName/DepartmentOrServiceName'
import { StaffListener } from '../../../services/user'
import ResponseModal from '../../Common/Modals/ResponseModal'
import { getImage } from '../../../config/utils'

const getData = async data => {
  const {
    hotelId,
    setShowLoader,
    setDefaultMenus,
    titleAndPermissionListenerAdded,
    dispatch,
  } = data
  if (hotelId) {
    setShowLoader(true)

    const menuList = await GetDefaultMenusList(hotelId)
    setDefaultMenus(menuList)

    if (!titleAndPermissionListenerAdded) {
      dispatch(actions.setTitleAndPermissionListenerAdded())
      TitleAndPermissonListener(hotelId, dispatch)
    }

    setShowLoader(false)
  }
}

const TitleandPermissions = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [defaultMenus, setDefaultMenus] = useState([])
  const toggleModalVisibility = () => setIsModalVisible(!isModalVisible)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [filteredTitleAndPermission, setFilteredTitleAndPermission] = useState(
    []
  )
  const [showLoader, setShowLoader] = useState(false)
  const [titleToEdit, setTitleToEdit] = useState({})
  const [disableDepartmentSelected, setDisableDepartmentSelected] =
    useState(false)

  const {
    titleAndPermissionListenerAdded,
    titleAndPermission,
    hotelId,
    departmentsNew,
    departmentAndServiceIdToInfo,
    servicesNew,
    isStaffListenerAdded,
    staffList,
  } = useSelector(state => state)

  const dispatch = useDispatch()
  const editTitleAndPermission = row => {
    const { departmentId } = row
    const department = departmentsNew.find(d => d.id === departmentId)
    if (departmentId !== ManagementDeptObject.id && !department?.active) {
      setDisableDepartmentSelected(true)
      return
    }
    setTitleToEdit(row)
    setIsModalVisible(true)
  }

  const deleteTitle = async (e, titleId) => {
    setShowLoader(true)
    e.preventDefault()
    const usersAvailableUnderTitle = await UsersLinkedToTitle(
      titleId,
      staffList
    )
    if (usersAvailableUnderTitle) {
      setShowLoader(false)

      return TileModal(
        'Warning',
        'The title is assigned to staff, if you wish to delete the title, please remove all staff in the title and then delete the title.',
        () => {
          return true
        }
      )
    }
    const deleteSuccess = await DeleteTitle(titleId)
    if (deleteSuccess) setSuccessMessage('Title deleted successfully')
    else setErrorMessage('Something went wrong! Please try again!')
    setShowLoader(false)
  }

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const titlecolumns = [
    {
      title: translateTextI18N('Level'),
      dataIndex: 'level',
      width: 120,
    },
    {
      title: translateTextI18N('Department'),
      dataIndex: 'department',
      width: 120,
      render: (_, row) => {
        return <DepartmentOrServiceName data={row?.department} />
      },
    },
    {
      title: translateTextI18N('Title'),
      dataIndex: 'title',
      width: 120,
    },
    {
      title: translateTextI18N('Service'),
      dataIndex: 'serviceName',
      width: 500,
      render: (_, row) =>
        row.serviceId ? (
          <DepartmentOrServiceName
            data={departmentAndServiceIdToInfo[row.serviceId]}
          />
        ) : null,
    },
    {
      title: translateTextI18N('Action'),
      dataIndex: 'Action',
      width: 80,
      render: (_, row) => (
        <div className='tableactionbtn-grp'>
          <button
            onClick={e => {
              e.preventDefault()
              editTitleAndPermission(row)
            }}
          >
            <img src={getImage('images/tedit.svg')}></img>
          </button>
          <button onClick={e => deleteTitle(e, row.id)}>
            <img src={getImage('images/tdelete.svg')}></img>
          </button>
        </div>
      ),
    },
  ]

  useEffect(() => {
    const transformedData = titleAndPermission.map(d => {
      const data = { ...d }
      const department = departmentsNew.find(d1 => d1.id === d.departmentId)
      data.serviceName = d.serviceId
        ? servicesNew[department.id]?.find(s => s.id === d.serviceId)?.name
        : ''
      return { ...data }
    })
    transformedData.sort((a, b) => {
      return a.level - b.level || a.department.localeCompare(b.department)
    })

    setFilteredTitleAndPermission(transformedData)
  }, [titleAndPermission, departmentsNew, servicesNew])

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('98'))
    getData({
      hotelId,
      setShowLoader,
      setDefaultMenus,
      titleAndPermissionListenerAdded,
      dispatch,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId])

  useEffect(() => {
    if (successMessage)
      setTimeout(() => setSuccessMessage(''), secondsToShowAlert)
    if (errorMessage) setTimeout(() => setErrorMessage(''), secondsToShowAlert)
  }, [successMessage, errorMessage])

  useEffect(() => {
    StaffListener(hotelId, isStaffListenerAdded, dispatch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId])

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Title & Permissions'
                breadcrumb={['Hotel Admin', 'Title & Permissions']}
              />
            </div>

            <div className='col-12 col-md-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-4 col-md-auto ml-auto'>
                    <Button onClick={toggleModalVisibility} className='cmnBtn'>
                      {translateTextI18N('Add New Title')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className='d-flex'>
                {successMessage ? (
                  <Alert
                    message={translateTextI18N(successMessage)}
                    type='success'
                    showIcon
                    className='mb-3'
                  />
                ) : null}

                {errorMessage ? (
                  <Alert
                    message={translateTextI18N(errorMessage)}
                    type='error'
                    showIcon
                    className='mb-3'
                  />
                ) : null}
              </div>

              <div className='table-wrp'>
                <Table
                  columns={titlecolumns}
                  dataSource={filteredTitleAndPermission}
                  pagination={PaginationOptions}
                  scroll={{ y: 490 }}
                  loading={showLoader}
                  rowKey='id'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <TitleAndPermissionsModal
        hotelId={hotelId}
        departmentsNew={departmentsNew.filter(d => d.active)}
        isModalVisible={isModalVisible}
        toggleModalVisibility={toggleModalVisibility}
        defaultMenus={defaultMenus}
        setSaveTitleSuccessMessage={setSuccessMessage}
        titleToEdit={titleToEdit}
        setTitleToEdit={setTitleToEdit}
        titleAndPermission={titleAndPermission}
        servicesNew={servicesNew}
      />

      <ResponseModal
        visible={disableDepartmentSelected}
        title={translateTextI18N(
          'Selected department is disabled. Please enable to change permissions.'
        )}
        success={false}
        onCancel={() => setDisableDepartmentSelected(false)}
      />
    </>
  )
}

export default TitleandPermissions
