/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useEffect, useState } from 'react'
import {
  Input,
  Modal,
  Table,
  Select,
  Button,
  Form,
  Upload,
  Switch,
  TimePicker,
  message,
  Spin,
  Space,
} from 'antd'
import moment from 'moment'
import ImgCrop from 'antd-img-crop'
import { useDispatch, useSelector } from 'react-redux'
import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import CountBrownCard from '../../Common/CountCard/CountBrownCard/CountBrownCard'
import CountBlueCard from '../../Common/CountCard/CountBlueCard/CountBlueCard'

import DeleteModal from '../../Common/Modals/DeleteModal'
import SuccessModal from '../../Common/Modals/SuccessModal'

import {
  GetRestaurants,
  UpdateRestaurant,
  CreateNewRestaurant,
  DeleteRestaurantProfile,
  EditRestaurantProfile,
  DeleteRestaurantMenu,
  GetMenu,
} from '../../../services/restaurants'
import {
  activeInactiveStatusList,
  ImageUploadHint,
  Option,
  PaginationOptions,
  Search,
  secondsToShowAlert,
  statusFilterLabel,
  timeFormat,
} from '../../../config/constants'
import {
  beforeCrop,
  getImage,
  isFilterValueSelected,
  Ternary,
  UplaodFileCommon,
  validateProfileImage,
} from '../../../config/utils'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import CountGreenCard from '../../Common/CountCard/CountGreenCard/CountGreenCard'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { GetCuisineList, GetCuisineMenu } from '../../../services/cuisineMenu'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import MenuUpload from './MenuUpload'
import MenuGallery from './MenuGallery'
import { AddGuestListener } from '../../../services/guest'
import useHotelAdminDashboardStat from '../../../hooks/useHotelAdminDashboardStat'

const dressCodeList = [
  { id: 'Business', name: 'Business' },
  { id: 'Formal', name: 'Formal' },
  { id: 'Semi formal', name: 'Semi formal' },
  { id: 'In-Formal', name: 'In-Formal' },
  { id: 'Casual', name: 'Casual' },
  { id: 'Smart-casual', name: 'Smart-casual' },
  { id: 'No-Dress code', name: 'No-Dress code' },
]

const cuisineFilterLabel = 'Cuisine'

export const GetMomentFromTime = time => {
  if (!time) return moment()

  const [hours, minutes] = time.split(':').map(v => +v)
  return moment().set('hours', hours).set('minutes', minutes)
}

const getRestaurantFunc = async data => {
  const {
    hotelId,
    setLoadingData,
    setRestaurants,
    setFilteredRestaurant,
    setCuisinelist,
  } = data
  try {
    if (!hotelId) return

    setLoadingData(true)

    let restaurantsList = await GetRestaurants(hotelId)
    setRestaurants(restaurantsList)
    setFilteredRestaurant(restaurantsList)

    const dataValue = await GetCuisineMenu(hotelId)
    const newCuisineList = GetCuisineList(dataValue)
    setCuisinelist(newCuisineList)
  } catch (error) {
    console.log({ error })
  } finally {
    setLoadingData(false)
  }
}

const onFinishFunc = async data => {
  const {
    hotelId,
    loadingData,
    setShowLoader,
    setCreateUserError,
    name,
    cuisineType,
    dressCode,
    openingTime,
    closingTime,
    description,
    seats,
    floor,
    userAction,
    status,
    previews,
    setIsModalVisible,
    setShowSuccessModal,
    getRestaurantsData,
    editingUserProfile,
    profileImage,
    profileImageUrl,
    profileImageName,
    deleteProfileImage,
    restaurantId,
  } = data
  try {
    if (loadingData) return

    setShowLoader(true)
    setCreateUserError('')

    const restaurant = {
      name,
      cuisineType,
      dressCode,
      openingTime,
      closingTime,
      description,
      seats: seats,
      floor: floor,
      status: userAction ? status : 'active',
      hotelId: hotelId,
      previews,
    }
    if (editingUserProfile) {
      const { success: editSuccess, message: editErrorMessage } =
        await EditRestaurantProfile({
          profileImage,
          restaurant,
          profileImageUrl,
          profileImageName,
          deleteProfileImage,
          restaurantId,
        })
      if (!editSuccess) {
        setCreateUserError(editErrorMessage)
        return
      }
    } else {
      const { success, message: createUserMessage } = await CreateNewRestaurant(
        profileImage,
        restaurant
      )
      if (!success) {
        setCreateUserError(createUserMessage)
        return
      }
    }

    setIsModalVisible(false)
    setShowSuccessModal(true)
    getRestaurantsData()
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
  } finally {
    setShowLoader(false)
  }
}

function handleErrorMessage(data) {
  const {
    profileImageError,
    createUserError,
    setCreateUserError,
    setProfileImageError,
  } = data
  if (createUserError)
    setTimeout(() => setCreateUserError(''), secondsToShowAlert)
  if (profileImageError)
    setTimeout(() => setProfileImageError(''), secondsToShowAlert)
}

const Restaurant = () => {
  const { hotelId } = useSelector(state => state)
  const dispatch = useDispatch()

  const { roomCount, totalDepartments, occupiedRooms } =
    useHotelAdminDashboardStat()

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [restaurants, setRestaurants] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  const [name, setName] = useState('')
  const [cuisineType, setCuisineType] = useState([])
  const [openingTime, setOpeningTime] = useState(null)
  const [closingTime, setClosingTime] = useState(null)
  const [description, setDescription] = useState('')
  const [floor, setFloor] = useState('')
  const [seats, setSeats] = useState('')
  const [dressCode, setDressCode] = useState('')
  const [restaurantId, setRestaurantId] = useState('')
  const [status, setStatus] = useState('')

  const [profileImage, setProfileImage] = useState()
  const [profileImageUrl, setProfileImageUrl] = useState()
  const [profileImageError, setProfileImageError] = useState('')
  const [resImageError, setResImageError] = useState('')

  const [filteredName, setFilteredName] = useState('')
  const [filteredStatus, setFilteredStatus] = useState(statusFilterLabel)
  const [filteredCuisine, setFilteredCuisine] = useState(cuisineFilterLabel)
  const [filteredRestaurant, setFilteredRestaurant] = useState([])

  const [form] = Form.useForm()
  const [showLoader, setShowLoader] = useState(false)

  const [isModalVisible, setIsModalVisible] = useState(false)

  const [editingUserProfile, setEditingUserProfile] = useState(false)
  const [profileImageName, setProfileImageName] = useState(false)
  const [deleteProfileImage, setDeleteProfileImage] = useState(false)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [userAction, setUserAction] = useState('')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [restaurantToDelete, setRestaurantToDelete] = useState()
  const [createUserError, setCreateUserError] = useState('')
  const [cuisineList, setCuisinelist] = useState([])
  const [menulist, setMenuList] = useState([])
  const [menuUploadData, setMenuUploadData] = useState(null)
  const [showDeleteMenuModal, setShowDeleteMenuModal] = useState(false)

  const [previews, setPreviews] = useState([])
  function getRestaurantsData() {
    getRestaurantFunc({
      hotelId,
      setLoadingData,
      setRestaurants,
      setFilteredRestaurant,
      setCuisinelist,
    })
  }

  useEffect(() => {
    getRestaurantsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (loadingData) setTimeout(() => setLoadingData(false), secondsToShowAlert)
  }, [loadingData])

  useEffect(() => {
    handleErrorMessage({
      profileImageError,
      createUserError,
      setCreateUserError,
      setProfileImageError,
    })
  }, [createUserError, profileImageError])

  useEffect(() => {
    if (!restaurants.length) return []
    const menu = GetMenu(cuisineList, restaurants)
    menu.unshift('All')
    setMenuList(menu)
  }, [restaurants, cuisineList])

  useEffect(() => {
    const filteredRestaurants = getfilteredRestaurant()
    setFilteredRestaurant(filteredRestaurants)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    restaurants,
    filteredStatus,
    filteredName,
    filteredCuisine,
    statusFilterLabel,
    cuisineFilterLabel,
    cuisineList,
  ])

  const getfilteredRestaurant = () => {
    if (!restaurants.length) return []

    let tmpfilteredRestaurant = [...restaurants]

    tmpfilteredRestaurant = tmpfilteredRestaurant.map(rest => {
      const copiedRestaurant = { ...rest }
      copiedRestaurant.cuisineName = cuisineList
        .filter(c => copiedRestaurant.cuisineType.includes(c.id))
        .map(c => c.name)
      copiedRestaurant.cuisineType = cuisineList
        .filter(c => copiedRestaurant.cuisineType.includes(c.id))
        .map(c => c.id)

      return copiedRestaurant
    })

    if (isFilterValueSelected(filteredCuisine, cuisineFilterLabel))
      tmpfilteredRestaurant = tmpfilteredRestaurant.filter(r =>
        r.cuisineName.includes(filteredCuisine)
      )

    if (filteredName !== '')
      tmpfilteredRestaurant = tmpfilteredRestaurant.filter(r =>
        r.name.toLowerCase().includes(filteredName.toLowerCase())
      )
    if (isFilterValueSelected(filteredStatus, statusFilterLabel))
      tmpfilteredRestaurant = tmpfilteredRestaurant.filter(
        r => r.status === filteredStatus
      )

    return tmpfilteredRestaurant
  }

  const resetFilter = () => {
    setFilteredStatus(statusFilterLabel)
    setFilteredName('')
    setFilteredCuisine(cuisineFilterLabel)
  }

  useEffect(() => {
    setUserAction(editingUserProfile)
    if (!isModalVisible) setEditingUserProfile(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible])

  useEffect(() => {
    AddGuestListener(hotelId, dispatch)
  }, [hotelId, dispatch])

  const showModal = () => {
    clearProfileImage()
    form.resetFields()
    setDescription('')
    setPreviews([])
    setIsModalVisible(true)
  }
  const clearResImage = (e, file1) => {
    const ref = `${file1}`
    e.preventDefault()
    let previewsList = previews.filter(preview => preview !== ref)
    setPreviews(previewsList)
  }
  const onFinish = async () => {
    onFinishFunc({
      hotelId,
      loadingData,
      setShowLoader,
      setCreateUserError,
      name,
      cuisineType,
      dressCode,
      openingTime,
      closingTime,
      description,
      seats,
      floor,
      userAction,
      status,
      previews,
      setIsModalVisible,
      setShowSuccessModal,
      getRestaurantsData,
      editingUserProfile,
      profileImage,
      profileImageUrl,
      profileImageName,
      deleteProfileImage,
      restaurantId,
    })
  }

  const handleCancel = () => {
    if (showLoader) return
    setIsModalVisible(false)
    setPreviews([])
  }

  const hideDeleteConfirmation = () => setShowDeleteConfirmation(false)

  const closingTimeFun = e => {
    if (e) setClosingTime(moment(e).format(timeFormat))
    else setClosingTime(null)
  }

  const openingTimeFun = e => {
    if (e) setOpeningTime(moment(e).format(timeFormat))
    else setOpeningTime(null)
  }

  const validateMenu = async () => {
    // validateMenuFunc({ file, row, setLoadingData, hotelId, getRestaurantsData })
  }

  const clearProfileImage = () => {
    setProfileImage(null)
    setProfileImageUrl(null)
    if (editingUserProfile && profileImageName !== '')
      setDeleteProfileImage(true)
  }

  const handleStatusChange = async (selectedStatus, id) => {
    try {
      setLoadingData(true)
      const { success } = await UpdateRestaurant(id, {
        status: selectedStatus ? 'active' : 'inactive',
      })
      setLoadingData(false)

      if (!success) message.error(`Problem updating user's status`)
      else getRestaurantsData()
    } catch (error) {
      console.log({ error })
      setLoadingData(false)
    }
  }

  const showMenuUploadPopup = row => {
    setMenuUploadData(row)
  }
  const deleteMenu = async () => {
    try {
      setShowDeleteConfirmation(false)

      setLoadingData(true)
      const { success, message: deleteUserProfileMessage } =
        await DeleteRestaurantMenu(restaurantToDelete.id)
      setLoadingData(false)
      setRestaurantToDelete(null)
      setShowDeleteMenuModal(false)

      if (success) {
        setSuccessMessage('Deleted successfully')
        setShowSuccessModal(true)
        setTimeout(() => {
          setShowSuccessModal(false)
          setSuccessMessage('')
        }, secondsToShowAlert)
        getRestaurantsData()
      } else {
        message.error(deleteUserProfileMessage)
      }
    } catch (error) {
      console.log(error)
      setRestaurantToDelete(null)
      message.error('Something went wrong! Please try again!')
    }
  }

  const editRestaurantProfile = restaurant => {
    try {
      setPreviews([])
      setLoadingData(true)
      let previewsNew = restaurant.previews
      setPreviews(previewsNew)
      setName(restaurant.name)
      setDescription(restaurant.description)
      setSeats(restaurant.seats)
      setFloor(restaurant.floor)
      setCuisineType(restaurant.cuisineType)
      setDressCode(restaurant.dressCode)
      setOpeningTime(restaurant.openingTime)
      setClosingTime(restaurant.closingTime)

      setProfileImageUrl(restaurant.profileImage)
      setRestaurantId(restaurant.id)
      setStatus(restaurant.status)

      setProfileImage(null)
      setProfileImageName(restaurant.profileImageName)
      setEditingUserProfile(true)
      setDeleteProfileImage(false)
      setIsModalVisible(true)
      const open = restaurant.openingTime
        ? moment(restaurant.openingTime, timeFormat)
        : null
      const close = restaurant.closingTime
        ? moment(restaurant.closingTime, timeFormat)
        : null

      form.setFieldsValue({
        name: restaurant.name,
        cuisineType: restaurant.cuisineType,
        description: restaurant.description,
        seats: restaurant.seats,
        floor: restaurant.floor,
        openingTime: open,
        closingTime: close,
        status: restaurant.status,
        dressCode: restaurant.dressCode,
      })
    } catch (error) {
      console.log(error)
      message.error('Something went wrong! Please try again!')
    }
  }

  const deleteRestaurantProfile = async () => {
    try {
      setShowDeleteConfirmation(false)
      setLoadingData(true)
      const { success, message: deleteUserProfileMessage } =
        await DeleteRestaurantProfile(restaurantToDelete)
      setLoadingData(false)
      if (success) {
        setSuccessMessage('Deleted successfully')
        setShowSuccessModal(true)
        setTimeout(() => {
          setShowSuccessModal(false)
          setSuccessMessage('')
        }, secondsToShowAlert)
        getRestaurantsData()
      } else {
        message.error(deleteUserProfileMessage)
      }
    } catch (error) {
      console.log(error)
      message.error('Something went wrong! Please try again!')
    }
  }

  const restaurantColumns = [
    {
      title: translateTextI18N('Restaurant'),
      dataIndex: 'name',
      width: 160,
      render: (userName, row) => (
        <div className='tableuser'>
          <figure>
            <img
              className='userImage'
              src={row.profileImage ? row.profileImage : 'images/cam.png'}
              height={25}
              width={25}
              alt=''
            ></img>
          </figure>
          <span>{userName}</span>
        </div>
      ),
    },
    {
      title: translateTextI18N('Cuisine'),
      dataIndex: 'cuisineName',
      width: 120,
      render: cuisineName => {
        if (!cuisineName) return null
        return <span>{cuisineName.join(', ')}</span>
      },
    },
    {
      title: translateTextI18N('Description'),
      dataIndex: 'description',
      width: 170,
    },
    {
      title: translateTextI18N('Seats'),
      className: 'text-center',
      dataIndex: 'seats',
      width: 105,
    },
    {
      title: translateTextI18N('Floor'),
      dataIndex: 'floor',
      width: 80,
    },
    {
      title: translateTextI18N('Menu Upload'),
      className: 'text-center menu-upload-td',
      dataIndex: 'menu',
      width: 140,
      render: (_, row) => {
        const menuAvailable = row.menu && row.menu.length > 0
        const linkStyle = !menuAvailable
          ? { color: '#00000040 !important', cursor: 'not-allowed' }
          : {}
        return (
          <>
            <a
              onClick={() => showMenuUploadPopup(row)}
              className='viewlink'
              rel='noopener noreferrer'
            >
              {translateTextI18N('Upload')}
            </a>
            {menuAvailable && <MenuGallery menu={row.menu} style={linkStyle} />}
            {!menuAvailable && (
              <a
                className='viewlink'
                rel='noopener noreferrer'
                disabled={true}
                style={linkStyle}
              >
                {translateTextI18N('View')}
              </a>
            )}
            <a
              onClick={() => {
                if (menuAvailable) {
                  setShowDeleteMenuModal(true)
                  setRestaurantToDelete(row)
                }
              }}
              style={linkStyle}
              className='viewlink'
              rel='noopener noreferrer'
              disabled={!row.menu || row.menu.length < 1}
            >
              {translateTextI18N('Delete')}
            </a>
          </>
        )
      },
    },
    {
      title: translateTextI18N('Dress Code'),
      dataIndex: 'dressCode',
      width: 80,
    },
    {
      title: translateTextI18N('Status'),
      dataIndex: 'status',
      width: 90,
      render: (st, row) => {
        return (
          <>
            <div className='customSwitch withtext'>
              <h6 style={{ minWidth: '40px' }}>
                {translateTextI18N(st === 'active' ? 'Active' : 'Inactive')}
              </h6>
              <Switch
                checked={st === 'active'}
                onChange={selectedStatus =>
                  handleStatusChange(selectedStatus, row.id)
                }
              />
            </div>
          </>
        )
      },
    },
    {
      title: translateTextI18N('Action'),
      dataIndex: 'Action',
      width: 100,
      render: (_, restaurant) => (
        <div className='tableactionbtn-grp'>
          <button onClick={() => editRestaurantProfile(restaurant)}>
            <img src={getImage('images/tedit.svg')}></img>
          </button>
          <button
            onClick={() => {
              setShowDeleteConfirmation(true)
              setRestaurantToDelete(restaurant)
            }}
          >
            <img src={getImage('images/tdelete.svg')}></img>
          </button>
        </div>
      ),
    },
  ]

  const getSuccessModalMessage = () => {
    if (successMessage) return successMessage
    return `Restaurant ${userAction ? 'edited' : 'added'} successfully`
  }

  const updateMenuData = () => {
    getRestaurantsData()
    setMenuUploadData(null)
  }

  const filterCuisines = (searchTerm, { children }) => {
    const searchIndex = children.toLowerCase().indexOf(searchTerm.toLowerCase())
    return searchIndex >= 0
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
                title='Restaurant'
                breadcrumb={['Hotel Admin', 'Dining', 'Restaurant']}
              />
            </div>
            <div className='col-12'>
              <div className='row'>
                <div className='col-12 col-md-4'>
                  <CountBlueCard
                    no={totalDepartments}
                    text='Total Departments'
                    imageSource='images/count-departments.svg'
                  />
                </div>
                <div className='col-12 col-md-4'>
                  <CountBrownCard
                    no={roomCount}
                    text='Total Rooms'
                  ></CountBrownCard>
                </div>
                <div className='col-12 col-md-4'>
                  <CountGreenCard
                    no={occupiedRooms}
                    text='Occupied Rooms'
                    imageSource='images/count-ocrooms.svg'
                  />
                </div>
              </div>
            </div>

            <div className='col-12 col-xl-12'>
              <div className='row'>
                <div className='col-12 col-xl-12'>
                  <div className='tablefilter-wrp'>
                    <div className='form-row'>
                      <div className='col-4 col-md-5 col-xl-3'>
                        <div className='searchbox'>
                          <Search
                            placeholder={translateTextI18N(
                              'Search by Restaurant'
                            )}
                            value={filteredName}
                            onChange={e => setFilteredName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className='col-4 col-md col-xl-2'>
                        <div className='cmnSelect-form'>
                          <Select
                            value={translateTextI18N(filteredCuisine)}
                            showSearch={true}
                            onChange={e => setFilteredCuisine(e)}
                          >
                            {menulist.map(cuisine => (
                              <Option value={cuisine} key={cuisine}>
                                {translateTextI18N(cuisine)}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </div>

                      <div className='col-4 col-md col-xl-2'>
                        <div className='cmnSelect-form'>
                          <Select
                            value={translateTextI18N(filteredStatus)}
                            onChange={e => setFilteredStatus(e)}
                          >
                            {activeInactiveStatusList.map(st => (
                              <Option value={st.id} key={st.id}>
                                {translateTextI18N(st.name)}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      <div className='col-4 col-md-auto'>
                        <Button
                          type='primary'
                          className='adduserbtn'
                          title='Reset Filters'
                          onClick={resetFilter}
                        >
                          <img src={getImage('images/clearicon.svg')}></img>
                        </Button>
                      </div>
                      <div className='col-4 col-md-auto ml-auto'>
                        <Button className='cmnBtn' onClick={showModal}>
                          {translateTextI18N('Add Restaurant')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-12 col-xl-12'>
                  <div className='table-wrp'>
                    <Table
                      columns={restaurantColumns}
                      dataSource={filteredRestaurant.map(item => {
                        return {
                          ...item,
                          cuisineType: item.cuisineType,
                          dressCode: translateTextI18N(item.dressCode),
                          status: translateTextI18N(item.status),
                        }
                      })}
                      pagination={PaginationOptions}
                      scroll={{ y: 382 }}
                      loading={loadingData}
                      rowKey='id'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        title={translateTextI18N(
          `${Ternary(editingUserProfile, 'Edit', 'Add')} Restaurant`
        )}
        visible={isModalVisible}
        onOk={onFinish}
        onCancel={handleCancel}
        className='addrestaurantModal cmnModal'
        footer={null}
        centered
      >
        <div className='imageUpload-wrp'>
          <figure>
            <div className='upload-figin'>
              <img
                src={Ternary(
                  profileImageUrl,
                  profileImageUrl,
                  getImage('images/cam.png')
                )}
                height='155'
                width='155'
              ></img>
            </div>
            {Ternary(
              profileImageUrl,
              <button className='removebtn' onClick={clearProfileImage}>
                <img src={getImage('images/close.svg')}></img>
              </button>,
              null
            )}
          </figure>
          <div className='uploadbtn-wrp'>
            <ImgCrop
              beforeCrop={file => beforeCrop(file, setProfileImageError)}
              rotate
            >
              <Upload
                accept='.png, .jpeg, .jpg'
                beforeUpload={file =>
                  validateProfileImage(
                    file,
                    setProfileImageError,
                    setProfileImage,
                    setProfileImageUrl
                  )
                }
                showUploadList={false}
              >
                <button>{translateTextI18N('Upload Photo')}</button>
              </Upload>
            </ImgCrop>
            <CustomAlert
              visible={profileImageError}
              message={translateTextI18N(profileImageError)}
              type='error'
              showIcon={true}
            />
            <p>
              {translateTextI18N(
                'Image should be in PNG or JPEG file with maximum of size 1mb'
              )}
            </p>
          </div>
        </div>

        <Form layout='vertical' onFinish={onFinish} form={form} validateTrigger>
          <div className='row'>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Restaurant Name')}
                  name='name'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N(
                        'Please enter restaurant name'
                      ),
                    },
                  ]}
                  value={name}
                >
                  <Input
                    maxLength={50}
                    placeholder={translateTextI18N('Restaurant name')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Cuisine')}
                  name='cuisineType'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select cuisine type'),
                    },
                  ]}
                >
                  <Select
                    allowClear
                    mode='multiple'
                    value={cuisineType}
                    showSearch={true}
                    onChange={e => setCuisineType(e)}
                    filterOption={filterCuisines}
                    getPopupContainer={triggerNode => {
                      return triggerNode.parentNode
                    }}
                  >
                    {cuisineList.map(cuisine => (
                      <Option value={cuisine.id} key={cuisine.id}>
                        {translateTextI18N(cuisine.name)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-row'>
                <div className='col-12 col-md-6'>
                  <div className='form-group cmn-input'>
                    <Form.Item
                      label={translateTextI18N('Opening Time')}
                      name='openingTime'
                      rules={[
                        {
                          required: true,
                          message: translateTextI18N(
                            'Please enter opening time'
                          ),
                        },
                      ]}
                    >
                      <TimePicker
                        value={openingTime}
                        format={timeFormat}
                        onChange={openingTimeFun}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className='col-12 col-md-6'>
                  <div className='form-group cmn-input'>
                    <Form.Item
                      label={translateTextI18N('Closing Time')}
                      name='closingTime'
                    >
                      <TimePicker
                        value={closingTime}
                        format={timeFormat}
                        onChange={closingTimeFun}
                        hideDisabledOptions
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Description')}
                  name='description'
                  value={description}
                >
                  <Input
                    maxLength={100}
                    placeholder={translateTextI18N(
                      'Enter restaurant information here..'
                    )}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-row'>
                <div className='col-12 col-md-6'>
                  <div className='form-group cmn-input'>
                    <Form.Item
                      label={translateTextI18N('Floor')}
                      name='floor'
                      rules={[
                        {
                          required: true,
                          message: translateTextI18N('Please enter floor'),
                        },
                      ]}
                      id='modal-floor'
                    >
                      <Input
                        placeholder={translateTextI18N('Floor')}
                        value={floor}
                        onChange={e => setFloor(e.target.value)}
                        id='modal-floor-input'
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className='col-12 col-md-6'>
                  <div className='form-group cmn-input'>
                    <Form.Item
                      id='modal-seat'
                      label={translateTextI18N('Seats')}
                      name='seats'
                      rules={[
                        {
                          required: true,
                          message: translateTextI18N('Please enter seats'),
                        },
                        {
                          pattern: '[0-9.]+',
                          message: translateTextI18N(
                            'Please enter a numeric value'
                          ),
                        },
                      ]}
                    >
                      <Input
                        placeholder={translateTextI18N('Seats')}
                        value={seats}
                        onChange={e => setSeats(e.target.value)}
                        id='modal-seat-input'
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Dress Code')}
                  name='dressCode'
                >
                  <Select
                    value={translateTextI18N(dressCode)}
                    showSearch={true}
                    onChange={e => setDressCode(e)}
                    getPopupContainer={triggerNode => {
                      return triggerNode.parentNode
                    }}
                  >
                    {dressCodeList.map(dress => (
                      <Option value={dress.id} key={dress.id}>
                        {translateTextI18N(dress.name)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
            {Ternary(
              loadingData,
              <div style={{ width: '100%', textAlign: 'center' }}>
                <Spin />
              </div>,
              null
            )}
            <div className='col-12 arabicstyle'>
              <p>{translateTextI18N('Add Images')}</p>
              <div className='restaurantupload-wrp'>
                <div className='form-row'>
                  {Ternary(
                    previews,
                    previews.map(file => (
                      <div className='col-3 col-sm-auto' id='preview'>
                        <figure>
                          <div className='rest-upload-fig' id='inside'>
                            <img
                              style={{ height: '70px', width: '70px' }}
                              className='img-fluid'
                              accept='image/png,image/jpeg,image/jpg'
                              src={file}
                            ></img>
                          </div>
                          <button
                            className='restaurantRemovebtn'
                            onClick={e => clearResImage(e, file)}
                          >
                            <img
                              className='img-fluid'
                              src={getImage('images/close.svg')}
                            ></img>
                          </button>
                        </figure>
                      </div>
                    )),
                    null
                  )}
                  {Ternary(
                    previews.length <= 4,
                    <div className='col-3 col-sm-auto' id='update'>
                      <div className='uploadimgtype'>
                        <button className='btn'>
                          <img
                            className='img-fluid'
                            src={getImage('images/uploadfig.svg')}
                          ></img>
                        </button>
                        <input
                          type='file'
                          name='file'
                          id='files'
                          accept='image/png,image/jpeg,image/jpg'
                          multiple='true'
                          onChange={e => {
                            UplaodFileCommon(
                              e,
                              setResImageError,
                              setLoadingData,
                              setPreviews,
                              previews
                            )
                            e.target.value = null
                          }}
                        />
                      </div>
                    </div>,
                    null
                  )}
                </div>
              </div>

              <p className='mt-2 upload-image-hint'>
                {translateTextI18N(ImageUploadHint)}
              </p>
            </div>
          </div>
          <br />
          <Space size='4'>
            <CustomAlert
              visible={resImageError}
              message={translateTextI18N(resImageError)}
              type='error'
              showIcon={true}
            />

            <CustomAlert
              visible={createUserError}
              message={translateTextI18N(createUserError)}
              type='error'
              showIcon={true}
            />
          </Space>
          <div className='modalFooter'>
            <Button className='grayBtn' key='back' onClick={handleCancel}>
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

      <Modal
        visible={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        className='successModal'
        footer={null}
        centered
      >
        <SuccessModal title={getSuccessModalMessage()}></SuccessModal>
      </Modal>

      <Modal
        onOk={deleteRestaurantProfile}
        onCancel={hideDeleteConfirmation}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={showDeleteConfirmation}
      >
        <DeleteModal
          title='Confirm Delete'
          message='Do you really want to delete ?'
        />

        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={hideDeleteConfirmation}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={deleteRestaurantProfile}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>

      <Modal
        onOk={deleteMenu}
        onCancel={() => {
          setShowDeleteMenuModal(false)
          setRestaurantToDelete(null)
        }}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={showDeleteMenuModal}
      >
        <DeleteModal
          title='Confirm Delete'
          message='Do you wish to delete all the uploaded Menus ?'
        />

        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={() => setShowDeleteMenuModal(false)}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={deleteMenu}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>

      {menuUploadData && (
        <MenuUpload
          accept='.jpeg, .pdf,.jpg'
          beforeUpload={file => {
            validateMenu(file, {})
          }}
          showUploadList={false}
          data={menuUploadData}
          index={0}
          setMenuUploadData={setMenuUploadData}
          updateMenuData={updateMenuData}
        />
      )}
    </>
  )
}

export default Restaurant
