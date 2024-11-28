import React, { useContext, useEffect, useState } from 'react'
import {
  Table,
  Input,
  Modal,
  Form,
  Button,
  Switch,
  message,
  Popover,
  TimePicker,
  Upload,
  Spin,
  Tooltip,
} from 'antd'
import {
  MoreOutlined,
  UploadOutlined,
  PlusOutlined,
  CloseOutlined,
  UpOutlined,
} from '@ant-design/icons'

import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import TranslateModal from '../../Common/TranslateModal/TranslateModal'

import BookingCard from '../../Common/BookingCard/BookingCard'
import RequestsCard from '../../Common/RequestsCard/RequestsCard'
import DeleteModal from '../../Common/Modals/DeleteModal'
import ErrorModal from '../../Common/Modals/ErrorModal'
import SuccessModal from '../../Common/Modals/SuccessModal'
import ReservationCard from '../../Common/ReservationCard/ReservationCard'
import { actions } from '../../../Store'
import {
  uploadCustomDepartmentImage,
  deleteCustomDepartmentImage,
  fetchCustomDepartmentImages,
  fetchCustomServiceImages,
  uploadCustomServiceImage,
  deleteCustomServiceImage,
  isFileSizeValid,
} from '../../../services/hotels'
import {
  UpdateDepartmentStatus,
  UpdateServiceStatus,
  UpdateSubServiceStatus,
  AddCustomDepartmentListener,
  SaveDepartment,
  EditDepartment,
  saveRequiredTime,
  SaveCustomService,
  EditService,
} from '../../../services/department'
import { ToggleServiceStatus } from '../../../services/service'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import CountCard from '../../Common/CountCard'
import {
  cardColorClassName,
  secondsToShowAlert,
  translationDataKey,
  validateAlphaNumeric,
} from '../../../config/constants'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { AuthContext } from '../../../Router/AuthRouteProvider'
import {
  getImage,
  GetTranlationStyle,
  GetTranslationImage,
  Ternary,
} from '../../../config/utils'
import {
  AddCheckinAndCheckoutCountListener,
  AddGuestListener,
} from '../../../services/guest'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import DepartmentOrServiceName from '../../Common/DepartmentOrServiceName/DepartmentOrServiceName'
import useHotelAdminDashboardStat from '../../../hooks/useHotelAdminDashboardStat'
import DepartmentAndServiceKeys from '../../../config/departmentAndServicekeys'

const format = 'HH:mm'

function RequiedTime({
  value = '12:30',
  departmentId = '',
  serviceId = '',
  subServiceId = '',
}) {
  const [disabled, setDisabled] = useState(false)

  async function saveTime(requiredTime) {
    if (requiredTime !== value) {
      setDisabled(true)
      await saveRequiredTime(
        departmentId,
        serviceId,
        subServiceId,
        requiredTime
      )
      setDisabled(false)
    }
  }

  return (
    <div className='customTimer'>
      <TimePicker
        value={moment(value, format)}
        format={format}
        showNow={false}
        inputReadOnly={false}
        disabled={disabled}
        clearIcon={false}
        clearText=''
        onOk={data => saveTime(data.format(format))}
      />
    </div>
  )
}

function setMessages(data) {
  const { departmentSuccessAlert, setDepartmentSuccessAlert } = data
  if (departmentSuccessAlert)
    setTimeout(() => setDepartmentSuccessAlert(''), secondsToShowAlert)
}

function getDepartmentOrService(serviceFlag, capitalizeFirstChar) {
  let text = Ternary(serviceFlag, 'service', 'department')
  if (capitalizeFirstChar) {
    text = text[0].toUpperCase() + text.slice(1)
  }
  return text
}

const customDepartmentAndServiceValidation = ({
  value,
  oldValue,
  dataList,
  serviceFlag,
  isEdit,
  custDeptNo,
  translateTextI18N,
}) => ({
  validator() {
    if (!value) return Promise.resolve()

    if (serviceFlag && dataList === undefined) return Promise.resolve()

    if (!serviceFlag && dataList.length === 0) {
      return Promise.reject(
        new Error(translateTextI18N('Wait! Department list is loading'))
      )
    }

    // check duplicate
    let nameList = dataList.map(item => item.name.trim().toLowerCase())
    if (isEdit) {
      nameList = nameList.filter(n => n !== oldValue.trim().toLowerCase())
    }
    if (nameList.includes(value.trim().toLowerCase())) {
      return Promise.reject(
        new Error(
          translateTextI18N(
            `${getDepartmentOrService(serviceFlag, true)} already exists`
          )
        )
      )
    }

    // check custom department limit
    if (!serviceFlag && !isEdit) {
      custDeptNo = +custDeptNo
      const customDeptCount = dataList.filter(
        d => !d.default && !d.predefined
      ).length
      if (customDeptCount >= custDeptNo) {
        return Promise.reject(
          new Error(
            translateTextI18N(
              `You are only allowed to add up to ${custDeptNo} departments`,
              {
                custDeptNo,
              }
            )
          )
        )
      }
    }

    return Promise.resolve()
  },
})

const Department = () => {
  const [loadingData, setLoadingData] = useState(false)
  const [loadingCustomData, setLoadingCustomData] = useState(false)
  const [updatingServiceStatus, setUpdatingServiceStatus] = useState(false)
  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [showCustomDepartment, setShowCustomDepartment] = useState(false)
  const [newDepartmentOrServiceName, setNewDepartmentOrServiceName] =
    useState('')
  const [showCustomLoader, setShowCustomLoader] = useState(false)
  const [
    showCustomDepartmentTransalateModal,
    setShowCustomDepartmentTransalateModal,
  ] = useState(false)
  const [translationData, setTranslationData] = useState({})
  const [form] = Form.useForm()
  const [isEdit, setIsEdit] = useState(false)
  const [departmentId, setDepartmentId] = useState(false)
  const [departmentSuccessAlert, setDepartmentSuccessAlert] = useState('')
  const [serviceFlag, setServiceFlag] = useState(false)
  const [newServiceId, setNewServiceId] = useState('')
  const [departmentOrServiceData, setDepartmentOrServiceData] = useState({})
  const [isDefaultDepartment, setIsDefaultDepartment] = useState(true)
  const { totalDepartments, roomCount, occupiedRooms } =
    useHotelAdminDashboardStat()
  const [departmentData, setDepartmentData] = useState(null)
  const customDepartmentImages = useSelector(
    state => state.customDepartmentImages
  )
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState(null)
  const [errorModalVisible, setErrorModalVisible] = useState(false)
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [deleteServiceModalVisible, setDeleteServiceModalVisible] =
    useState(false)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const showErrorModal = message => {
    setModalMessage(message)
    setErrorModalVisible(true)
  }
  const showDeleteServiceConfirmation = (serviceId, serviceName) => {
    setServiceToDelete({ id: serviceId, name: serviceName })
    setDeleteServiceModalVisible(true)
  }
  const showSuccessModal = message => {
    setModalMessage(message)
    setSuccessModalVisible(true)
  }
  const [loadingStates, setLoadingStates] = useState({})

  let {
    services: servicesList,
    hotelId,
    defaultDepartments,
    customDepartmentsNew,
    hotelInfo,
    servicesNew,
    checkinAndCheckoutCountListenerAdded,
    departmentsNew,
  } = useContext(AuthContext)

  const loadDeptFunc = {
    true: setLoadingData,
    false: setLoadingCustomData,
  }
  const departmentImageRequirements = {
    'Front Desk': '400px x 300px',
    'House Keeping': '350px x 110px',
    'Concierge': '350px x 110px',
    'Engineering & Maintenance': '700px x 110px',
    'Food and Beverage': '1200px x 150px',
    'Promotion': '1200px x 150px',
    'Spa and Wellness': '600px x 200px',
  }

  const { custDeptNo } = hotelInfo

  const handleTranslationClick = () => {
    setShowCustomDepartmentTransalateModal(true)
  }

  const CustomImageUpload = ({
    row,
    hotelInfo,
    customDepartmentImages,
    onUpload,
    onDelete,
  }) => {
    if (!departmentImageRequirements[row.name]) {
      return null
    }

    const isLoading = loadingStates[row.id]

    return (
      <div>
        {customDepartmentImages[row.id] ? (
          <div className='custom-image-container'>
            <img
              src={customDepartmentImages[row.id]}
              alt='Custom department image'
              className='custom-image'
            />
            <CloseOutlined
              className='custom-image-delete'
              onClick={() => onDelete(row.id)}
            />
          </div>
        ) : (
          <Tooltip title='Image size should be less than or equal to 2 MB'>
            <Upload
              accept='image/*'
              beforeUpload={async file => {
                try {
                  if (!isFileSizeValid(file)) {
                    showErrorModal('Image size should not exceed 2MB')
                    return false
                  }
                  setLoadingStates(prev => ({ ...prev, [row.id]: true }))
                  await onUpload(file, row.id, row.name)
                  return false
                } catch (error) {
                  console.error('Error in beforeUpload:', error)
                  showErrorModal('Failed to upload image: ' + error.message)
                  return false
                } finally {
                  setLoadingStates(prev => ({ ...prev, [row.id]: false }))
                }
              }}
              showUploadList={false}
              disabled={!hotelInfo.enableDepartmentCustomImage}
            >
              <div className='uploadimgtypedeptimg'>
                {isLoading ? (
                  <Spin />
                ) : (
                  <Button disabled={!hotelInfo.enableDepartmentCustomImage}>
                    <img
                      className=''
                      src={getImage('images/uploadfig.svg')}
                      alt=''
                    />
                  </Button>
                )}
              </div>
            </Upload>
          </Tooltip>
        )}
      </div>
    )
  }

  const handleCustomImageUpload = async (
    file,
    departmentId,
    departmentName
  ) => {
    try {
      const result = await uploadCustomDepartmentImage(
        hotelId,
        departmentId,
        file,
        departmentName,
        dispatch
      )
      if (result.success) {
        showSuccessModal('Custom image uploaded successfully')
      } else {
        showErrorModal(result.error || 'Failed to upload custom image')
      }
    } catch (error) {
      showErrorModal('An error occurred while uploading the image')
    }
  }
  const handleCustomServiceImageUpload = async (file, serviceName) => {
    try {
      console.log('Starting image upload for service:', serviceName)
      if (typeof serviceName !== 'string') {
        throw new Error('Service name must be a string')
      }
      setLoadingStates(prev => ({ ...prev, [serviceName]: true }))
      const result = await uploadCustomServiceImage(
        hotelId,
        serviceName,
        file,
        dispatch
      )
      if (result.success) {
        dispatch(
          actions.setCustomServiceImage({
            serviceName,
            imageUrl: result.imageUrl,
          })
        )
        showSuccessModal('Custom service image uploaded successfully')
      } else {
        showErrorModal(result.error || 'Failed to upload custom service image')
      }
    } catch (error) {
      console.error('Error in handleCustomServiceImageUpload:', error)
      showErrorModal(
        'An error occurred while uploading the image: ' + error.message
      )
    } finally {
      setLoadingStates(prev => ({ ...prev, [serviceName]: false }))
    }
  }

  const removeSpecialCharacters = str => {
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  }
  const customServiceImages = useSelector(state => state.customServiceImages)

  const showDeleteConfirmation = departmentId => {
    setDepartmentToDelete(departmentId)
    setDeleteModalVisible(true)
  }

  const handleDeleteImage = async () => {
    try {
      setDeleteLoading(true)
      if (!departmentToDelete) {
        throw new Error('No department selected for deletion')
      }

      const departmentName =
        customDepartmentsNew.find(dept => dept.id === departmentToDelete)
          ?.name || ''

      const result = await deleteCustomDepartmentImage(
        hotelId,
        departmentToDelete,
        departmentName,
        dispatch
      )
      if (result.success) {
        showSuccessModal('Custom image deleted successfully')
        setDeleteModalVisible(false)
        setDepartmentToDelete(null)
      } else {
        throw new Error(result.error || 'Failed to delete custom image')
      }
    } catch (error) {
      showErrorModal(
        error.message || 'An error occurred while deleting the image'
      )
    } finally {
      setDeleteLoading(false)
    }
  }
  const handleDeleteServiceImage = async () => {
    if (!serviceToDelete) return

    try {
      setDeleteLoading(true)
      console.log('Deleting custom service image for:', serviceToDelete.name)
      const result = await deleteCustomServiceImage(
        hotelId,
        serviceToDelete.name,
        dispatch
      )
      if (result.success) {
        dispatch(actions.deleteCustomServiceImage(serviceToDelete.name))
        showSuccessModal('Custom service image deleted successfully')
      } else {
        showErrorModal(result.error || 'Failed to delete custom service image')
      }
    } catch (error) {
      console.error('Error in handleDeleteServiceImage:', error)
      showErrorModal('An error occurred while deleting the image')
    } finally {
      setDeleteLoading(false)
      setDeleteServiceModalVisible(false)
      setServiceToDelete(null)
    }
  }
  const customImageColumn = {
    title: translateTextI18N('Custom Image'),
    dataIndex: 'customImage',
    width: 95,
    render: (_, row) => (
      <CustomImageUpload
        row={row}
        hotelInfo={hotelInfo}
        customDepartmentImages={customDepartmentImages}
        onUpload={handleCustomImageUpload}
        onDelete={showDeleteConfirmation}
      />
    ),
  }

  const saveCustomService = async () => {
    try {
      setShowCustomLoader(true)

      const departmentID = departmentId
      const serviceName = newDepartmentOrServiceName
      const serviceId = newServiceId

      const frontDeskDept = DepartmentAndServiceKeys.frontDesk
      const frontDeskDeptType = frontDeskDept.type
      let frontDeskServiceType = ''

      if (departmentData?.key && departmentData?.key === frontDeskDept.key) {
        frontDeskServiceType = frontDeskDeptType.OtherRequest
      }

      if (isEdit) {
        const { success: editSuccess, message: editErrorMessage } =
          await EditService({
            departmentId,
            serviceId,
            serviceName,
            translationData,
            hotelId,
            departmentData,
            frontDeskServiceType,
          })
        if (!editSuccess) {
          message.error(editErrorMessage)
          return
        }
        setShowCustomDepartment(false)
        setDepartmentSuccessAlert('Changes saved successfully')
        return
      }

      const servcieList = servicesNew[departmentID] || []
      const serviceCount = servcieList.length
      const index = Ternary(
        serviceCount,
        Math.max(...servcieList.map(s => s.index)) + 1,
        1
      )
      const { success: saveSuccess, message: saveServiceMessage } =
        await SaveCustomService({
          departmentId: departmentID,
          translationData,
          serviceName,
          serviceCount,
          dispatch,
          index,
          active: departmentOrServiceData.active,
          hotelId,
          frontDeskServiceType,
        })

      if (!saveSuccess) {
        message.error(saveServiceMessage)
      } else {
        // setShowCustomDepartment(false)
        setDepartmentSuccessAlert('Service added successfully')
      }
    } catch (error) {
      message.error(
        error.message ||
          translateTextI18N('Something went wrong! Please try again!')
      )
    } finally {
      setShowCustomLoader(false)
    }
  }

  const saveDepartment = async () => {
    try {
      if (serviceFlag) {
        await saveCustomService()
        return
      }

      const departmentName = newDepartmentOrServiceName
      if (showCustomLoader || !departmentName) return
      setShowCustomLoader(true)
      if (isEdit) {
        const { success: editSuccess, message: editErrorMessage } =
          await EditDepartment({
            departmentId,
            departmentName,
            translationData,
          })
        if (!editSuccess) {
          message.error(editErrorMessage)
          return
        }
        setShowCustomDepartment(false)
        setDepartmentSuccessAlert('Changes saved successfully')
        return
      }

      const index = Math.max(...customDepartmentsNew.map(d => d.index)) + 1
      const { success, message: saveDepartmentMessage } = await SaveDepartment(
        hotelId,
        newDepartmentOrServiceName,
        translationData,
        index
      )

      if (!success) {
        message.error(saveDepartmentMessage)
      } else {
        setShowCustomDepartment(false)
        setDepartmentSuccessAlert('Department added successfully')
      }
    } catch (error) {
      message.error(
        error.message ||
          translateTextI18N('Something went wrong! Please try again!')
      )
    } finally {
      setShowCustomLoader(false)
      setTranslationData({})
      // setServiceFlag(false)  desable to service model
      setIsEdit(false)
      // setDepartmentOrServiceData({}) desable to service model
    }
  }

  const handleCancel = () => {
    if (showCustomLoader) return
    setShowCustomDepartment(false)
    form.resetFields()
  }

  const editDepartmentData = row => {
    setShowCustomDepartment(true)
    setIsEdit(true)
    setDepartmentId(row.id)
    setNewDepartmentOrServiceName(row.name)
    setDepartmentOrServiceData(row)
    setServiceFlag(false)
    form.setFieldsValue({
      deptname: row.name,
    })
  }

  const editServiceData = (deptId, row) => {
    setShowCustomDepartment(true)
    setIsEdit(true)
    setDepartmentId(deptId)
    setServiceFlag(true)
    setNewDepartmentOrServiceName(row.name)
    setNewServiceId(row.id)
    form.setFieldsValue({
      deptname: row.name,
    })
  }

  const addCustomService = row => {
    form.resetFields()
    setDepartmentData(row)
    setIsEdit(false)
    setShowCustomDepartment(true)
    setDepartmentId(row?.id)
    setNewDepartmentOrServiceName(row?.name)
    setDepartmentOrServiceData({
      ...departmentOrServiceData,
      active: row?.active,
    })
    setServiceFlag(true)
  }
  useEffect(() => {
    const loadCustomServiceImages = async () => {
      try {
        const result = await fetchCustomServiceImages(hotelId)
        if (result.success) {
          dispatch(actions.setCustomServiceImages(result.data))
        } else {
          console.error('Failed to load custom service images:', result.error)
        }
      } catch (error) {
        console.error('Error loading custom service images:', error)
      }
    }

    loadCustomServiceImages()
  }, [dispatch, hotelId])

  useEffect(() => {
    AddCheckinAndCheckoutCountListener(hotelId, dispatch)
    AddGuestListener(hotelId, dispatch)
  }, [checkinAndCheckoutCountListenerAdded, dispatch, hotelId])
  useEffect(() => {
    const loadCustomImages = async () => {
      try {
        const result = await fetchCustomDepartmentImages(hotelId)
        if (result.success) {
          dispatch(actions.setCustomDepartmentImages(result.data))
        } else {
          console.error('Failed to load custom images:', result.error)
        }
      } catch (error) {
        console.error('Error loading custom images:', error)
      }
    }

    loadCustomImages()
  }, [dispatch, hotelId])
  useEffect(() => {
    AddCustomDepartmentListener(dispatch, hotelId)
  }, [dispatch, hotelId])

  useEffect(() => {
    setMessages({
      departmentSuccessAlert,
      setDepartmentSuccessAlert,
    })
  }, [departmentSuccessAlert])

  const handleDepartmentSwitchClick = async (deptId, active) => {
    try {
      setLoadingData(true)
      await UpdateDepartmentStatus(deptId, active)
    } catch (error) {
      console.log({ error })
    } finally {
      setLoadingData(false)
    }
  }

  const handleCustomDepartment = async (deptId, active) => {
    try {
      setLoadingCustomData(true)
      await UpdateDepartmentStatus(deptId, active)
    } catch (error) {
      console.log({ error })
    } finally {
      setLoadingCustomData(false)
    }
  }

  const handleServiceSwitchClick = async (deptId, serviceId, active) => {
    try {
      loadDeptFunc[isDefaultDepartment](true)
      await UpdateServiceStatus(deptId, serviceId, active)
    } catch (error) {
      console.log({ error })
    } finally {
      loadDeptFunc[isDefaultDepartment](false)
    }
  }

  const handleSubServiceSwitchClick = async (
    deptId,
    serviceId,
    subServiceId,
    active
  ) => {
    try {
      setLoadingData(true)
      await UpdateSubServiceStatus(deptId, serviceId, subServiceId, active)
    } catch (error) {
      console.log({ error })
    } finally {
      setLoadingData(false)
    }
  }

  const toggleServiceClick = async (id, active) => {
    try {
      setUpdatingServiceStatus(true)
      const success = await ToggleServiceStatus(id, !active)
      if (!success)
        message.error(
          translateTextI18N('Something went wrong! Please try again!')
        )
    } catch (error) {
      console.log({ error })
    } finally {
      setUpdatingServiceStatus(false)
    }
  }

  const showCustomDepartmentModal = () => {
    form.resetFields()
    setDepartmentData(true)
    setIsEdit(false)
    setNewDepartmentOrServiceName('')
    setShowCustomDepartment(true)
    setServiceFlag(false)
  }

  function EditDepartmentMenu({ data }) {
    if (data.default || data?.predefined) return null

    return (
      <li className='ant-dropdown-menu-item'>
        <div className='tableactionbtn-grp'>
          <button
            className='nostyle-btn'
            title={translateTextI18N('Edit Department')}
            onClick={() => editDepartmentData(data)}
          >
            {translateTextI18N('Edit Department')}
          </button>
        </div>
      </li>
    )
  }

  function ViewServicesMenu({ services, data }) {
    if (!services)
      return (
        <li className='ant-dropdown-menu-item'>
          <div style={{ padding: '1px 6px' }}>
            {translateTextI18N('No Services')}
          </div>
        </li>
      )

    return (
      <li className='ant-dropdown-menu-item'>
        <Popover
          content={content(data.id, data.active, data.default)}
          overlayStyle={{ maxWidth: '95%' }}
          className='tablepopover serviceLink'
          overlayClassName={'tableDropdown'}
          trigger='click'
          placement='bottomLeft'
        >
          <button className='nostyle-btn'>
            {translateTextI18N('View Services')}{' '}
            <img alt=' ' src={getImage('images/arrow-right.svg')}></img>
          </button>
        </Popover>
      </li>
    )
  }

  const Dropdowncontent = ({ services, row: data }) => {
    let commonProps = { data, services }

    return (
      <>
        <ul className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'>
          <li className='ant-dropdown-menu-item'>
            <div className='tableactionbtn-grp'>
              <button
                className=''
                title={translateTextI18N('Add Service')}
                onClick={() => addCustomService(data)}
              >
                {translateTextI18N('Add Service')}
              </button>
            </div>
          </li>

          <EditDepartmentMenu {...commonProps} />
          <ViewServicesMenu {...commonProps} />
        </ul>
      </>
    )
  }

  const columns1 = [
    {
      title: '#',
      dataIndex: 'index',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: translateTextI18N('Popular Services'),
      dataIndex: 'name',
      width: 180,
      render: name => translateTextI18N(name),
    },
    {
      title: translateTextI18N('Action'),
      dataIndex: 'active',
      width: 85,
      render: (active, { id }) => (
        <div className='customSwitch'>
          <Switch
            checked={active}
            onClick={() => toggleServiceClick(id, active)}
          />
        </div>
      ),
    },
    {
      title: translateTextI18N('Custom Image'),
      dataIndex: 'customImage',
      width: 95,
      render: (_, row) => {
        const formattedServiceName = removeSpecialCharacters(row.name)
        const isLoading = loadingStates[row.name]

        return (
          <div>
            {customServiceImages[formattedServiceName] ? (
              <div className='custom-image-container'>
                <img
                  src={customServiceImages[formattedServiceName]}
                  alt='Custom service image'
                  className='custom-image'
                />
                <CloseOutlined
                  className='custom-image-delete'
                  onClick={() =>
                    showDeleteServiceConfirmation(row.id, row.name)
                  }
                />
              </div>
            ) : (
              <Tooltip title='Image size should be less than or equal to 2 MB'>
                <Upload
                  accept='image/*'
                  beforeUpload={async file => {
                    try {
                      if (!isFileSizeValid(file)) {
                        showErrorModal('Image size should not exceed 2MB')
                        return false
                      }
                      setLoadingStates(prev => ({ ...prev, [row.name]: true }))
                      await handleCustomServiceImageUpload(file, row.name)
                      return false
                    } catch (error) {
                      console.error('Error in beforeUpload:', error)
                      showErrorModal('Failed to upload image: ' + error.message)
                      return false
                    } finally {
                      setLoadingStates(prev => ({ ...prev, [row.name]: false }))
                    }
                  }}
                  showUploadList={false}
                  disabled={!hotelInfo.enableDepartmentCustomImage}
                >
                  <div className='uploadimgtypedeptimg'>
                    {isLoading ? (
                      <Spin />
                    ) : (
                      <Button disabled={!hotelInfo.enableDepartmentCustomImage}>
                        <img
                          className=''
                          src={getImage('images/uploadfig.svg')}
                          alt=''
                        />
                      </Button>
                    )}
                  </div>
                </Upload>
              </Tooltip>
            )}
          </div>
        )
      },
    },
  ]

  const customDepartmentColumns = [
    {
      title: '#',
      dataIndex: 'index',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: translateTextI18N('Custom Department'),
      dataIndex: 'name',
      width: 150,
      render: (_, row) => <DepartmentOrServiceName data={row} />,
    },
    {
      title: (
        <Button
          title={translateTextI18N('Add Department')}
          className='plusBtn'
          onClick={showCustomDepartmentModal}
        >
          <img alt=' ' src={getImage('images/plus.svg')}></img>
        </Button>
      ),
      dataIndex: '',
      width: 40,
    },
    {
      title: translateTextI18N('Time Allocated'),
      dataIndex: 'requiredTime',
      width: 100,
      render: (_, row) => showTimeAllocated(row),
    },
    {
      title: translateTextI18N('Action'),
      dataIndex: 'active',
      width: 55,
      render: (active, { id }) => (
        <div className='customSwitch'>
          <Switch
            checked={active}
            onClick={() => handleCustomDepartment(id, !active)}
          />
        </div>
      ),
    },
    customImageColumn,
    {
      title: '',
      dataIndex: 'services',
      width: 50,
      render: (services, row) => {
        return <ThreeDotPopOver {...{ services, row }} />
      },
    },
  ]

  const departmentColumns = [
    {
      title: '#',
      dataIndex: 'index',
      width: 40,
      render: (_, __, index) => index + 1,
    },
    {
      title: translateTextI18N('Department'),
      dataIndex: 'name',
      width: 130,
      render: name => translateTextI18N(name),
    },
    {
      title: translateTextI18N('Time Allocated'),
      dataIndex: 'requiredTime',
      width: 110,
      render: (_, row) => showTimeAllocated(row),
    },
    {
      title: translateTextI18N('Action'),
      dataIndex: 'active',
      width: 65,
      render: (active, { id }) => (
        <div className='customSwitch'>
          <Switch
            checked={active}
            onClick={() => handleDepartmentSwitchClick(id, !active)}
          />
        </div>
      ),
    },
    customImageColumn,
    {
      title: '',
      dataIndex: 'services',
      width: 40,
      render: (services, row) => {
        return row.index !== 6 && <ThreeDotPopOver {...{ services, row }} />
      },
    },
  ]

  const ThreeDotPopOver = ({ services, row }) => {
    return (
      <Popover
        content={() => <Dropdowncontent {...{ services, row }} />}
        trigger='click'
        placement='bottomRight'
        overlayClassName={'moreDropdown'}
        onOpenChange={() => {
          setIsDefaultDepartment(row.default)
        }}
      >
        <button className='moreicon'>
          <MoreOutlined />
        </button>
      </Popover>
    )
  }

  const showTimeAllocated = row => {
    return Ternary(
      row.services,
      null,
      <RequiedTime value={row.requiredTime} departmentId={row.id} />
    )
  }

  const content2 = (serviceId, deptId, serviceEnabled) => {
    return (
      <ul className='list-unstyled'>
        {servicesNew[serviceId]?.map(({ id, name, active, requiredTime }) => (
          <li key={id} value={id}>
            {translateTextI18N(name)}
            <div className='d-flex align-items-center ml-auto'>
              <RequiedTime
                value={requiredTime}
                departmentId={deptId}
                serviceId={serviceId}
                subServiceId={id}
              />
            </div>
            <div className='customSwitch'>
              <Switch
                disabled={!serviceEnabled}
                checked={active}
                onClick={() =>
                  handleSubServiceSwitchClick(deptId, serviceId, id, !active)
                }
              />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  function ManageEditIcon(data) {
    const {
      predefinedService,
      default: isDefaultService,
      id,
      name,
      deptId,
    } = data
    const enableEditIcon = !isDefaultService && !predefinedService

    function onClick(e) {
      e.preventDefault()
      if (enableEditIcon) {
        setDepartmentOrServiceData({ ...data, name, id })
        editServiceData(deptId, { id, name })
      }
    }

    return (
      <button
        className='nostyle-btn'
        title='Edit Service'
        onClick={onClick}
        disabled={!enableEditIcon}
      >
        {enableEditIcon ? (
          <img
            id={`deptservice${id}`}
            alt={name}
            src={getImage('images/tedit.svg')}
          ></img>
        ) : null}
      </button>
    )
  }

  const ServicesWithImageUpload = {
    'Front Desk': [
      'Change/Upgrade room',
      'Extra bed',
      'Checkout and request bill',
      'Airport dropoff',
      'Wake up call',
      'Doctor on a call',
      'View Bill',
      'Extend stay',
    ],
    'House Keeping': [
      'Room cleaning',
      'Pick laundry',
      'Clean tray',
      'Replacement',
      'Pillow',
      'Linen bed',
      'Toiletries',
      'Minibar',
    ],
    'Concierge': [
      'Book taxi',
      'Car rental',
      'Get my car',
      'Travel Desk',
      'Hotel Shuttle',
    ],
    'Food and Beverage': ['Restaurant', 'Room service'],
    'Spa and Wellness': ['Spa', 'Gym', 'Saloon'],
  }

  function ViewServices(serviceData) {
    const {
      id,
      active: serviceEnabled,
      services: subServices,
      requiredTime,
      predefined: predefinedService,
      default: isDefaultService,
      departmentEnabled,
      isDefaultDept,
      deptId,
      name,
      department,
    } = serviceData
    const dispatch = useDispatch()

    const formattedServiceName = removeSpecialCharacters(name)

    const isEngineeringMaintenance =
      name.toLowerCase().includes('electrical') ||
      name.toLowerCase().includes('failure') ||
      name.toUpperCase().includes('AC ') ||
      name.toLowerCase().includes('television') ||
      name.toLowerCase().includes('leakage') ||
      name.toLowerCase().includes('refrigerator')

    const isAllowedDepartment =
      (department &&
        departmentImageRequirements.hasOwnProperty(department.name)) ||
      isEngineeringMaintenance ||
      (departmentImageRequirements.hasOwnProperty(
        'Engineering & Maintenance'
      ) &&
        isEngineeringMaintenance)

    const shouldShowImageUpload =
      isAllowedDepartment &&
      (isEngineeringMaintenance ||
        ServicesWithImageUpload[department.name]?.includes(name))

    const renderImageUpload = serviceName => {
      const formattedName = removeSpecialCharacters(serviceName)
      const isLoading = loadingStates[serviceName]

      return customServiceImages[formattedName] ? (
        <div className='custom-image-container'>
          <img
            src={customServiceImages[formattedName]}
            alt='Custom service image'
            className='custom-image'
          />
          <CloseOutlined
            className='custom-image-delete'
            onClick={() => showDeleteServiceConfirmation(id, serviceName)}
          />
        </div>
      ) : (
        <Tooltip title='Image size should be less than or equal to 2 MB'>
          <Upload
            accept='image/*'
            beforeUpload={async file => {
              try {
                if (!isFileSizeValid(file)) {
                  showErrorModal('Image size should not exceed 2MB')
                  return false
                }
                setLoadingStates(prev => ({ ...prev, [serviceName]: true }))
                await handleCustomServiceImageUpload(file, serviceName)
                return false
              } catch (error) {
                console.error('Error in beforeUpload:', error)
                showErrorModal('Failed to upload image: ' + error.message)
                return false
              } finally {
                setLoadingStates(prev => ({ ...prev, [serviceName]: false }))
              }
            }}
            showUploadList={false}
            disabled={!hotelInfo.enableDepartmentCustomImage}
          >
            <div className='uploadimgtypedeptimg'>
              {isLoading ? (
                <Spin />
              ) : (
                <Button disabled={!hotelInfo.enableDepartmentCustomImage}>
                  <img
                    className=''
                    src={getImage('images/uploadfig.svg')}
                    alt=''
                  />
                </Button>
              )}
            </div>
          </Upload>
        </Tooltip>
      )
    }

    return (
      <li key={id} value={id}>
        <DepartmentOrServiceName data={{ ...serviceData }} />
        <div className='d-flex align-items-center ml-auto'>
          <div className='tableactionbtn-grp'>
            <ManageEditIcon
              {...{
                ...serviceData,
                departmentEnabled,
                isDefaultDept,
                predefinedService,
                isDefaultService,
                deptId,
              }}
            />
            {shouldShowImageUpload && renderImageUpload(name)}
          </div>
          {!subServices && (
            <RequiedTime
              value={requiredTime}
              departmentId={deptId}
              serviceId={id}
            />
          )}
        </div>
        <div className='customSwitch'>
          <Switch
            disabled={!departmentEnabled}
            checked={serviceEnabled}
            onClick={() =>
              handleServiceSwitchClick(deptId, id, !serviceEnabled)
            }
          />
        </div>
        {subServices && (
          <Popover
            overlayStyle={{ maxWidth: '95%' }}
            className='tablepopover subtablepopover'
            overlayClassName={'tableDropdown'}
            trigger='click'
            placement='bottomLeft'
            content={() => (
              <ul className='list-unstyled'>
                {servicesNew[id]?.map((subService, idx) => (
                  <li key={idx}>
                    {translateTextI18N(subService.name)}
                    <div className='d-flex align-items-center ml-auto'>
                      {ServicesWithImageUpload['House Keeping']?.includes(
                        subService.name
                      ) && renderImageUpload(subService.name)}
                      <RequiedTime
                        value={subService.requiredTime}
                        departmentId={deptId}
                        serviceId={id}
                        subServiceId={subService.id}
                      />
                    </div>
                    <div className='customSwitch'>
                      <Switch
                        disabled={!serviceEnabled}
                        checked={subService.active}
                        onClick={() =>
                          handleSubServiceSwitchClick(
                            deptId,
                            id,
                            subService.id,
                            !subService.active
                          )
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          >
            <Button>
              <img alt='' src={getImage('images/arrow-right.svg')}></img>
            </Button>
          </Popover>
        )}
      </li>
    )
  }

  const content = (deptId, departmentEnabled, isDefaultDept) => {
    const department = defaultDepartments.find(dept => dept.id === deptId) || {}
    return (
      <ul className='list-unstyled'>
        {servicesNew[deptId]?.map((serviceData, idx) => (
          <ViewServices
            key={idx}
            {...{
              ...serviceData,
              departmentEnabled,
              isDefaultDept,
              deptId,
              department,
            }}
          />
        ))}
      </ul>
    )
  }

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('3'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Departments'
                breadcrumb={['Hotel Admin', 'Departments']}
              />
            </div>
            <div className='col-12'>
              <div className='row'>
                <div className='col-12  col-xl-5'>
                  {isDefaultDepartment && (
                    <CustomAlert
                      visible={departmentSuccessAlert}
                      message={translateTextI18N(departmentSuccessAlert)}
                      type='success'
                      showIcon={true}
                      classNames='mb-30 '
                    />
                  )}

                  <div className='table-wrp departmentTable mb-30'>
                    <Table
                      columns={departmentColumns}
                      dataSource={defaultDepartments}
                      pagination={false}
                      scroll={{ y: 250 }}
                      loading={loadingData || !defaultDepartments.length}
                      rowKey='id'
                    />
                  </div>

                  {!isDefaultDepartment && (
                    <CustomAlert
                      visible={departmentSuccessAlert}
                      message={translateTextI18N(departmentSuccessAlert)}
                      type='success'
                      showIcon={true}
                      classNames='mb-30 '
                    />
                  )}

                  <div className='table-wrp departmentTable mb-30'>
                    <Table
                      columns={customDepartmentColumns}
                      dataSource={customDepartmentsNew}
                      pagination={false}
                      scroll={{ y: 250 }}
                      loading={
                        loadingCustomData || !customDepartmentsNew.length
                      }
                      rowKey='id'
                    />
                  </div>

                  <div className='table-wrp departmentTable'>
                    <Table
                      columns={columns1}
                      dataSource={servicesList}
                      pagination={false}
                      scroll={{ y: 250 }}
                      rowKey='id'
                      loading={updatingServiceStatus || !servicesList.length}
                    />
                  </div>
                </div>
                <div className='col-12 col-md-6 col-xl-3'>
                  <CountCard
                    page='Dashboard'
                    title={totalDepartments}
                    desc='Total Departments'
                    image='images/count-departments.svg'
                    cardColorClassname='blue'
                  ></CountCard>
                  <CountCard
                    title={roomCount}
                    desc='Total Rooms'
                    cardColorClassname={cardColorClassName.BROWN}
                    image='images/count-rooms.svg'
                  ></CountCard>
                  <CountCard
                    title={occupiedRooms}
                    desc='Occupied Rooms'
                    cardColorClassname={cardColorClassName.GREEN}
                    image='images/count-ocrooms.svg'
                  ></CountCard>

                  <BookingCard />
                </div>
                <div className='col-12 col-md-6 col-xl-4'>
                  <RequestsCard />
                  <ReservationCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        title={translateTextI18N(
          `${Ternary(isEdit, 'Edit', 'Add')} ${getDepartmentOrService(
            serviceFlag,
            true
          )}`
        )}
        visible={showCustomDepartment}
        onCancel={() => handleCancel()}
        className='editCategoriesModal cmnModal'
        footer={null}
        centered
        maskClosable={false}
      >
        <Form
          layout='vertical'
          onFinish={values => {
            saveDepartment(values) // Save the department
            form.resetFields() // Clear the form fields after successful submission
            setNewDepartmentOrServiceName('') // Clear the state of newDepartmentOrServiceName
          }}
          form={form}
          validateTrigger
        >
          <div className='form-row'>
            <div className='col'>
              <div className='form-group cmn-input'>
                <Form.Item
                  name='deptname'
                  value={newDepartmentOrServiceName}
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N(
                        `Please enter ${getDepartmentOrService(
                          serviceFlag
                        )} name`
                      ),
                    },
                    fieldProps =>
                      validateAlphaNumeric(
                        fieldProps,
                        translateTextI18N(
                          `Please enter valid ${getDepartmentOrService(
                            serviceFlag
                          )} name`
                        )
                      ),
                    () =>
                      customDepartmentAndServiceValidation({
                        value: newDepartmentOrServiceName,
                        oldValue: departmentOrServiceData.name,
                        dataList: Ternary(
                          serviceFlag,
                          servicesNew[departmentId],
                          departmentsNew
                        ),
                        serviceFlag,
                        isEdit,
                        custDeptNo,
                        translateTextI18N,
                      }),
                  ]}
                >
                  <Input
                    placeholder={translateTextI18N(
                      `${getDepartmentOrService(serviceFlag, true)} name`
                    )}
                    value={newDepartmentOrServiceName}
                    onChange={e => {
                      const name = e.target.value
                      if (name !== translationData['en']) {
                        setTranslationData({})
                      } else {
                        setTranslationData(
                          departmentOrServiceData[translationDataKey] ?? {}
                        )
                      }
                      setNewDepartmentOrServiceName(name)
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-auto'>
              <Button
                className='cmnBtn dlticonBtn'
                style={GetTranlationStyle(
                  departmentOrServiceData[translationDataKey],
                  newDepartmentOrServiceName
                )}
                onClick={() => handleTranslationClick()}
              >
                <img
                  alt=''
                  src={GetTranslationImage(
                    departmentOrServiceData[translationDataKey],
                    newDepartmentOrServiceName
                  )}
                ></img>
              </Button>
            </div>
          </div>
          <div className='modalFooter'>
            <Button className='grayBtn' key='back' onClick={handleCancel}>
              {translateTextI18N('Cancel')}
            </Button>
            <Button
              className='blueBtn ml-3 ml-lg-4'
              key='submit'
              htmlType='submit'
              loading={showCustomLoader}
            >
              {translateTextI18N('Submit')}
            </Button>
          </div>
        </Form>

        {showCustomDepartmentTransalateModal && (
          <TranslateModal
            visible={showCustomDepartmentTransalateModal}
            onCancelClick={() => setShowCustomDepartmentTransalateModal(false)}
            onOkClick={data => {
              setTranslationData(data)
              setShowCustomDepartmentTransalateModal(false)
              setDepartmentOrServiceData({
                ...departmentOrServiceData,
                [translationDataKey]: data,
              })
            }}
            oldTranslatedData={departmentOrServiceData[translationDataKey]}
            text={newDepartmentOrServiceName}
          />
        )}
      </Modal>
      <Modal
        onOk={handleDeleteImage}
        onCancel={() => setDeleteModalVisible(false)}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={deleteModalVisible}
      >
        <DeleteModal
          title='Confirm Delete'
          message='Do you want to delete this custom image?'
        />

        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={() => setDeleteModalVisible(false)}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={handleDeleteImage}
            loading={deleteLoading}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>
      <Modal
        visible={errorModalVisible}
        onCancel={() => setErrorModalVisible(false)}
        footer={null}
        closeIcon={<CloseOutlined />}
        centered
        className='customModal errorModal'
      >
        <ErrorModal title={modalMessage} />
      </Modal>

      <Modal
        visible={successModalVisible}
        onCancel={() => setSuccessModalVisible(false)}
        footer={null}
        closeIcon={<CloseOutlined />}
        centered
        className='customModal successModal'
      >
        <SuccessModal title={modalMessage} />
      </Modal>
      <Modal
        onOk={handleDeleteServiceImage}
        onCancel={() => setDeleteServiceModalVisible(false)}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={deleteServiceModalVisible}
      >
        <DeleteModal
          title='Confirm Delete'
          message='Do you want to delete this custom service image?'
        />

        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={() => setDeleteServiceModalVisible(false)}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={handleDeleteServiceImage}
            loading={deleteLoading}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default Department
