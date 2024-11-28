import { Button, DatePicker, Table } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  drpAssignOrNotAssign,
  drpRequestTypes,
  FandBServiceStatus,
  FilterByAssignStatus,
  getRealtimeStatus,
  PaginationOptions,
  RestaurantLabel,
  SortByRequestType,
  StatusLabel,
} from '../../../../../config/constants'
import DepartmentAndServiceKeys from '../../../../../config/departmentAndServicekeys'
import {
  getImage,
  isFilterValueSelected,
  SelectDrops,
  sortByCreatedAt,
  Ternary,
} from '../../../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../../../utility/globalization'
import CustomAlert from '../../../../Common/CustomAlert/CustomAlert'
import SelectAssignOrNotAssign from '../../../../Common/SelectAssignOrNotAssign'
import SelectRequestType from '../../../../Common/SelectRequestType'

const DateFormat = 'DD MMM YYYY'

const isLoading = (
  loadingRestaurantReservationServices,
  loadingRestaurants,
  loadingGuests
) => loadingRestaurantReservationServices || loadingRestaurants || loadingGuests

const FilterData = ({
  filteredData,
  selectedStatus,
  selectedRestaurant,
  selectedSubmittedDate,
  filterByAssignOrNotAssign,
  sortByRequestType,
}) => {
  let copiedData = [...filteredData]

  if (isFilterValueSelected(selectedStatus, StatusLabel))
    copiedData = copiedData.filter(r => r.status === selectedStatus)

  if (isFilterValueSelected(selectedRestaurant, RestaurantLabel))
    copiedData = copiedData.filter(r => r.restaurantName === selectedRestaurant)

  if (selectedSubmittedDate) {
    copiedData = copiedData.filter(r => {
      if (!r.createdAt) return false
      const submittedMoment = moment(r.createdAt.toDate()).startOf('day')
      return selectedSubmittedDate.isSame(submittedMoment)
    })
  }

  if (isFilterValueSelected(filterByAssignOrNotAssign, FilterByAssignStatus)) {
    copiedData = copiedData.filter(r =>
      Ternary(
        filterByAssignOrNotAssign === drpAssignOrNotAssign[0].id,
        r?.assignedToId,
        !r?.assignedToId
      )
    )
  }

  if (isFilterValueSelected(sortByRequestType, SortByRequestType)) {
    return drpRequestTypes?.[sortByRequestType]?.filterFunc(copiedData)
  }

  return copiedData.sort(sortByCreatedAt)
}

const GetRestaurantDescription = restaurant => {
  const { name, openingTime, closingTime } = restaurant
  let description = `${name} (${openingTime}`
  if (closingTime) description += ` - ${closingTime}`
  description += ')'
  return description
}

const GetFilteredData = ({
  filterByAssignOrNotAssign,
  loadingRestaurantReservationServices,
  loadingRestaurants,
  restaurantReservations,
  restaurants,
  selectedRestaurant,
  selectedStatus,
  selectedSubmittedDate,
  sortByRequestType,
}) => {
  let filteredData = [...restaurantReservations]

  if (!isLoading(loadingRestaurantReservationServices, loadingRestaurants)) {
    filteredData = filteredData.map(request => {
      const copiedRequest = { ...request }
      const restaurant = restaurants.find(
        r => r.id === copiedRequest.restaurantId
      )
      if (restaurant) {
        copiedRequest.restaurantDescription =
          GetRestaurantDescription(restaurant)
        copiedRequest.restaurantName = restaurant.name
      }

      return copiedRequest
    })

    filteredData = FilterData({
      filteredData,
      selectedStatus,
      selectedRestaurant,
      selectedSubmittedDate,
      filterByAssignOrNotAssign,
      sortByRequestType,
    })
  }
  return filteredData
}

const RealTimeFBRestaurants = ({
  fbrcolumns,
  errorMessage,
  successMessage,
  showLoader,
  setShowLoader,
  restaurantOptions,
}) => {
  const [filteredRoomService, setFilteredRoomService] = useState([])
  const [selectedStatus, setSelectedStatus] = useState(StatusLabel)
  const [selectedRestaurant, setSelectedRestaurant] = useState(RestaurantLabel)
  const [selectedSubmittedDate, setSelectedSubmittedDate] = useState(null)

  const [filterByAssignOrNotAssign, setFilterByAssignOrNotAssign] =
    useState(FilterByAssignStatus)
  const [sortByRequestType, setSortByRequestType] = useState(SortByRequestType)

  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const {
    loadingRestaurantReservationServices,
    loadingRestaurants,
    restaurantReservations,
    restaurants,
  } = useSelector(state => state)

  useEffect(() => {
    setShowLoader(true)
    const filteredData = GetFilteredData({
      filterByAssignOrNotAssign,
      loadingRestaurantReservationServices,
      loadingRestaurants,
      restaurantReservations,
      restaurants,
      selectedRestaurant,
      selectedStatus,
      selectedSubmittedDate,
      sortByRequestType,
    })
    setFilteredRoomService(filteredData)
    setShowLoader(false)
  }, [
    filterByAssignOrNotAssign,
    loadingRestaurantReservationServices,
    loadingRestaurants,
    restaurantReservations,
    restaurants,
    selectedRestaurant,
    selectedStatus,
    selectedSubmittedDate,
    setShowLoader,
    sortByRequestType,
  ])

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='row'>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp' id='fbResTbl'>
                <div className='form-row'>
                  <div className='col-6 col-md-4 col-lg' id='filter1'>
                    <SelectDrops
                      list={restaurantOptions}
                      value={selectedRestaurant}
                      addAll
                      onChange={e => setSelectedRestaurant(e)}
                    />
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form' id='filter3'>
                      <DatePicker
                        id='filter2'
                        format={DateFormat}
                        value={selectedSubmittedDate}
                        placeholder={translateTextI18N('Submitted Date')}
                        onChange={e => {
                          if (e) setSelectedSubmittedDate(e.startOf('day'))
                          else setSelectedSubmittedDate(null)
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectDrops
                      id='filter4'
                      list={getRealtimeStatus(FandBServiceStatus)}
                      value={selectedStatus}
                      addAll
                      onChange={e => setSelectedStatus(e)}
                    />
                  </div>

                  <div className='col-6 col-md-4 col-lg'>
                    <SelectAssignOrNotAssign
                      value={filterByAssignOrNotAssign}
                      onChange={e => setFilterByAssignOrNotAssign(e?.id)}
                      id={
                        DepartmentAndServiceKeys.foodAndBeverage.services
                          .restaurant.key
                      }
                    />
                  </div>

                  <div className='col-6 col-md-4 col-lg'>
                    <SelectRequestType
                      value={sortByRequestType}
                      onChange={e => setSortByRequestType(e?.id)}
                      id={
                        DepartmentAndServiceKeys.foodAndBeverage.services
                          .restaurant.key
                      }
                    />
                  </div>

                  <div className='col-6 col-md-auto '>
                    <Button
                      type='primary'
                      className='adduserbtn'
                      onClick={() => {
                        setSelectedStatus(StatusLabel)
                        setSelectedRestaurant(RestaurantLabel)
                        setSelectedSubmittedDate(null)

                        setFilterByAssignOrNotAssign(FilterByAssignStatus)
                        setSortByRequestType(SortByRequestType)
                      }}
                    >
                      <img src={getImage('images/clearicon.svg')} alt=''></img>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row ml-2 mb-2' id='frontDeskAlerts1'>
                <CustomAlert
                  visible={successMessage}
                  message={translateTextI18N(successMessage)}
                  type='success'
                  showIcon={true}
                  classNames='mt-2 mb-2'
                />
                <CustomAlert
                  visible={errorMessage}
                  message={translateTextI18N(errorMessage)}
                  type='error'
                  showIcon={true}
                  classNames='mt-2 mb-2'
                />
              </div>

              <div className='table-wrp'>
                <Table
                  columns={fbrcolumns
                    .filter(c => c.dataIndex !== 'completedTime')
                    .map(item => ({
                      ...item,
                      title: translateTextI18N(item.title),
                    }))}
                  dataSource={filteredRoomService}
                  pagination={PaginationOptions}
                  scroll={{ y: 382 }}
                  loading={
                    showLoader ||
                    loadingRestaurantReservationServices ||
                    loadingRestaurants
                  }
                  rowKey='id'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RealTimeFBRestaurants
