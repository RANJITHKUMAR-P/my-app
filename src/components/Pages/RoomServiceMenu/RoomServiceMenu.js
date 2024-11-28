/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import { Modal, Table, Button, Switch, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import { actions } from '../../../Store'

import Header from '../../Common/Header/Header'

import SideMenu from '../../Common/Sidemenu/Sidemenu'
import CountBlueCard from '../../Common/CountCard/CountBlueCard/CountBlueCard'
import DeleteModal from '../../Common/Modals/DeleteModal'
import { getImage, GetTranslatedName, Ternary } from '../../../config/utils'
import { AddCuisineListener } from '../../../services/cuisine'
import {
  DeleteFoodMenuItem,
  AddFoodMenuListener,
  UpdateFoodMenuItemAvailability,
} from '../../../services/foodMenu'
import {
  PaginationOptions,
  secondsToShowAlert,
} from '../../../config/constants'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import CountBrownCard from '../../Common/CountCard/CountBrownCard/CountBrownCard'
import CountGreenCard from '../../Common/CountCard/CountGreenCard/CountGreenCard'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import { AddGuestListener } from '../../../services/guest'
import useHotelAdminDashboardStat from '../../../hooks/useHotelAdminDashboardStat'
import AddMenu from './AddMenu'
import AddMealOfTheDay from './AddMealOfTheDay'
import ReadMore from '../../Common/ReadMore/ReadMore'

const translationConfirmationTitle = 'Submit without translation'
const translationConfirmationMessage =
  'Do you want to continue without translation ?'

function setMessages(data) {
  const {
    mealOfTheDaySuccessMessage,
    setMealOfTheDaySuccessMessage,
    foodMenuSuccessAlert,
    setFoodMenuSuccessAlert,
    showDeleteAlert,
    setShowDeleteAlert,
  } = data
  if (mealOfTheDaySuccessMessage)
    setTimeout(() => setMealOfTheDaySuccessMessage(''), secondsToShowAlert)
  if (foodMenuSuccessAlert)
    setTimeout(() => setFoodMenuSuccessAlert(''), secondsToShowAlert)
  if (showDeleteAlert)
    setTimeout(() => setShowDeleteAlert(false), secondsToShowAlert)
}

const deleteFoodMenuItemFunc = async data => {
  const {
    setShowDeletConfirmation,
    setShowLoader,
    foodMenuId,
    setShowDeleteAlert,
  } = data
  try {
    setShowDeletConfirmation(false)
    setShowLoader(true)
    const successDelete = await DeleteFoodMenuItem(foodMenuId)
    if (successDelete) setShowDeleteAlert(true)
    else message.error('Something went wrong! Please try again!')
  } catch (error) {
    message.error(error.message || 'Something went wrong! Please try again!')
  } finally {
    setShowLoader(false)
  }
}

const handleAvailabileChangeFunc = async ({ available, id, setShowLoader }) => {
  try {
    setShowLoader(true)
    const successUpdate = await UpdateFoodMenuItemAvailability(available, id)
    if (!successUpdate) message.error('Something went wrong! Please try again!')
  } catch (error) {
    message.error(error.message || 'Something went wrong! Please try again!')
  } finally {
    setShowLoader(false)
  }
}

const RoomServiceMenu = () => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [foodMenuToEdit, setFoodMenuToEdit] = useState({})
  const [editingFoodMenu, setEditingFoodMenu] = useState(false)
  const [showMealOfTheDay, setShowMealOfTheDay] = useState(false)

  const {
    hotelId,
    cuisineListenerAdded,
    cuisines,
    loadingFoodMenu,
    foodMenus,
    currentLanguage,
    hotelInfo,
  } = useSelector(state => state)

  const { roomCount, totalDepartments, occupiedRooms } =
    useHotelAdminDashboardStat()

  const dispatch = useDispatch()

  const [selectedCuisineId, setSelectedCuisineId] = useState(true)
  const [filteredfoodMenus, setFilteredfoodMenus] = useState([])

  const [showLoader, setShowLoader] = useState(false)
  const [mealOfTheDaySuccessMessage, setMealOfTheDaySuccessMessage] =
    useState('')
  const [foodMenuSuccessAlert, setFoodMenuSuccessAlert] = useState('')

  const [selectedCuisines, setSelectedCuisines] = useState([])
  const [foodMenuId, setFoodMenuId] = useState()
  const [showDeletConfirmation, setShowDeletConfirmation] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [localCuisines, setLocalCuisines] = useState([])
  const [curencyCode, setCode] = useState('')
  const [maxButtonWidth, setMaxButtonWidth] = useState(0)

  useEffect(() => {
    const maxNameLength = cuisines.reduce((max, cuisine) => {
      const nameLength = GetTranslatedName(
        cuisine,
        currentLanguage,
        'name'
      ).length
      return Math.max(max, nameLength)
    }, 0)

    const maxWidth = maxNameLength * 10
    setMaxButtonWidth(maxWidth)
  }, [cuisines, currentLanguage])

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey(['sub1', '8']))
    if (hotelId) {
      setCode(hotelInfo?.curencyCode)
    }
  }, [dispatch, hotelId, hotelInfo])

  useEffect(() => {
    AddCuisineListener(hotelId, cuisineListenerAdded, dispatch)
  }, [cuisineListenerAdded, dispatch, hotelId])

  useEffect(() => {
    AddFoodMenuListener(hotelId, dispatch)
  }, [dispatch, hotelId])

  useEffect(() => {
    setLocalCuisines(cuisines)
  }, [cuisines])

  useEffect(() => {
    setMessages({
      mealOfTheDaySuccessMessage,
      foodMenuSuccessAlert,
      showDeleteAlert,
      setMealOfTheDaySuccessMessage,
      setFoodMenuSuccessAlert,
      setShowDeleteAlert,
    })
  }, [mealOfTheDaySuccessMessage, foodMenuSuccessAlert, showDeleteAlert])

  useEffect(() => {
    if (
      localCuisines.length &&
      localCuisines.findIndex(c => c.id === selectedCuisineId) === -1
    )
      setSelectedCuisineId(localCuisines[0].id)
    setSelectedCuisines([
      Ternary(selectedCuisineId, selectedCuisineId, localCuisines[0]?.id),
    ])
    setFilteredfoodMenus(
      foodMenus.filter(f => f.cuisines.includes(selectedCuisineId))
    )
  }, [foodMenus, localCuisines, selectedCuisineId])

  useEffect(() => {
    AddGuestListener(hotelId, dispatch)
  }, [hotelId, dispatch])

  const handleAddMenuClick = () => {
    setIsModalVisible(true)
    setEditingFoodMenu(false)
  }

  const showMealOfTheDayModal = () => setShowMealOfTheDay(true)

  const handleCancel = () => {
    if (showLoader) return
    setLocalCuisines(cuisines)
    setIsModalVisible(false)
    setShowMealOfTheDay(false)
    setFoodMenuToEdit({})
  }

  const loadFoodMenuToEdit = _foodMenuItem => {
    setFoodMenuToEdit(_foodMenuItem)
    setIsModalVisible(true)
    setEditingFoodMenu(true)
    setSelectedCuisines(_foodMenuItem.cuisines)
  }

  const handleAvailabileChange = async (available, id) => {
    handleAvailabileChangeFunc({ available, id, setShowLoader })
  }

  const deleteFoodMenuItem = async () => {
    deleteFoodMenuItemFunc({
      setShowDeletConfirmation,
      setShowLoader,
      foodMenuId,
      setShowDeleteAlert,
    })
  }

  const RoomServiceMenuColumns = [
    {
      title: translateTextI18N('Dish'),
      dataIndex: 'dish',
      width: 230,
      render: (_, row) => (
        <div className='tableuser'>
          <figure>
            <img
              src={row.imageUrl ? row.imageUrl : getImage('images/dish.png')}
              alt=''
              width='35'
              height='35'
              className='userImage'
            ></img>
          </figure>
          <span>{GetTranslatedName(row, currentLanguage, 'dish')}</span>
        </div>
      ),
    },
    {
      title: translateTextI18N('Description'),
      dataIndex: 'description',
      width: 500,
      render: (_, row) => <ReadMore text={row.description} charLength={200} />,
    },
    {
      title: translateTextI18N('Price'),
      dataIndex: 'Price',
      width: 115,
      render: (_, row) => (
        <span>
          {curencyCode} {row.price}
        </span>
      ),
    },
    {
      title: translateTextI18N('Availability'),
      dataIndex: 'Availability',
      width: 115,
      render: (_, row) => (
        // add clas name "disabled" for disable text "open"
        <div className='customSwitch withtext'>
          <h6>{translateTextI18N('Available')}</h6>
          {/* add attribute "disabled" for disabling switch */}
          {/* <Switch  disabled defaultChecked /> */}
          <Switch
            checked={row.available}
            onChange={e => handleAvailabileChange(e, row.id)}
          />
        </div>
      ),
    },
    {
      title: translateTextI18N('Action'),
      dataIndex: 'Action',
      width: 115,
      render: (_, _foodMenuItem) => (
        <div className='tableactionbtn-grp'>
          <button onClick={() => loadFoodMenuToEdit(_foodMenuItem)}>
            <img src={getImage('images/tedit.svg')} alt=''></img>
          </button>
          <button
            onClick={() => {
              setFoodMenuId(_foodMenuItem.id)
              setShowDeletConfirmation(true)
            }}
          >
            <img src={getImage('images/tdelete.svg')} alt=''></img>
          </button>
        </div>
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
                title='Room Service Menu'
                breadcrumb={['Hotel Admin', 'Dining', 'Room Service Menu']}
              />
            </div>
            <div className='col-12'>
              <div className='row'>
                <div className='col-12 col-md-4'>
                  <CountBlueCard
                    id='roomService'
                    no={totalDepartments}
                    text='Total Departments'
                    imageSource='images/count-departments.svg'
                  />
                </div>
                <div className='col-12 col-md-4'>
                  <CountBrownCard
                    no={roomCount}
                    id='roomService'
                    text='Total Rooms'
                    imageSource='images/count-rooms.svg'
                  />
                </div>
                <div className='col-12 col-md-4'>
                  <CountGreenCard
                    no={occupiedRooms}
                    imageSource='images/count-ocrooms.svg'
                    id='roomService'
                    text='Occupied Rooms'
                  />
                </div>
              </div>
            </div>

            <div className='col-12 col-xl-12'>
              <div className='row'>
                <div className='col-12 col-xl-12'>
                  <div className='tablefilter-wrp'>
                    <div className='form-row justify-content-between'>
                      <div className='col'>
                        <div className='selectionBtn-grp meal-btn-container'>
                          {Ternary(
                            !cuisines.length,
                            null,
                            cuisines.map(cuisine => {
                              const cuisineName = GetTranslatedName(
                                cuisine,
                                currentLanguage,
                                'name'
                              )
                              return (
                                <Button
                                  className={`${Ternary(
                                    cuisine.id === selectedCuisineId,
                                    'active',
                                    ''
                                  )} whiteBtn mr-2`}
                                  onClick={() => {
                                    setSelectedCuisines([
                                      ...selectedCuisines,
                                      cuisine.id,
                                    ])
                                    setSelectedCuisineId(cuisine.id)
                                  }}
                                  key={cuisine.id}
                                  style={{
                                    minWidth: `${maxButtonWidth}px`,
                                    marginBottom: '3px',
                                    marginTop: '3px',
                                  }} // Set the minimum width dynamically
                                >
                                  {cuisineName}
                                </Button>
                              )
                            })
                          )}
                        </div>
                      </div>
                      <div className='col-auto'>
                        <Button
                          onClick={showMealOfTheDayModal}
                          className='whiteBtn mr-2 '
                        >
                          {translateTextI18N('Meals of the day')}
                        </Button>
                        <Button
                          onClick={handleAddMenuClick}
                          className='whiteBtn cmnBtn'
                        >
                          {translateTextI18N('Add Menu')}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className='d-flex'>
                    <CustomAlert
                      visible={showDeleteAlert}
                      message={translateTextI18N('Deleted successfully')}
                      type='success'
                      showIcon={true}
                      classNames='mb-30 '
                    />

                    <CustomAlert
                      visible={foodMenuSuccessAlert}
                      message={translateTextI18N(foodMenuSuccessAlert)}
                      type='success'
                      showIcon={true}
                      classNames='mb-30 '
                    />
                    <CustomAlert
                      visible={mealOfTheDaySuccessMessage}
                      message={translateTextI18N(mealOfTheDaySuccessMessage)}
                      type='success'
                      showIcon={true}
                      classNames='mb-30 '
                    />
                  </div>
                </div>
                <div className='col-12 col-xl-12'>
                  <div className='table-wrp'>
                    <Table
                      columns={RoomServiceMenuColumns}
                      dataSource={filteredfoodMenus}
                      pagination={PaginationOptions}
                      scroll={{ y: 385 }}
                      loading={Ternary(
                        loadingFoodMenu,
                        loadingFoodMenu,
                        showLoader
                      )}
                      rowKey='id'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isModalVisible ? (
        <AddMenu
          curencyCode={curencyCode}
          editingFoodMenu={editingFoodMenu}
          foodMenuId={foodMenuId}
          foodMenuToEdit={foodMenuToEdit}
          handleCancel={handleCancel}
          isModalVisible={isModalVisible}
          selectedCuisines={selectedCuisines}
          setFoodMenuId={setFoodMenuId}
          setFoodMenuSuccessAlert={setFoodMenuSuccessAlert}
          setFoodMenuToEdit={setFoodMenuToEdit}
          setIsModalVisible={setIsModalVisible}
          setSelectedCuisines={setSelectedCuisines}
          setShowLoader={setShowLoader}
          showLoader={showLoader}
          translationConfirmationMessage={translationConfirmationMessage}
          translationConfirmationTitle={translationConfirmationTitle}
        />
      ) : null}

      {showMealOfTheDay ? (
        <AddMealOfTheDay
          showMealOfTheDay={showMealOfTheDay}
          localCuisines={localCuisines}
          setLocalCuisines={setLocalCuisines}
          handleCancel={handleCancel}
          setShowMealOfTheDay={setShowMealOfTheDay}
          setMealOfTheDaySuccessMessage={setMealOfTheDaySuccessMessage}
          translationConfirmationTitle={translationConfirmationTitle}
          translationConfirmationMessage={translationConfirmationMessage}
        />
      ) : null}

      <Modal
        onCancel={() => setShowDeletConfirmation(false)}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={showDeletConfirmation}
      >
        <DeleteModal title='Confirm Delete' message='Do you want to delete ?' />

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
            onClick={deleteFoodMenuItem}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default RoomServiceMenu
