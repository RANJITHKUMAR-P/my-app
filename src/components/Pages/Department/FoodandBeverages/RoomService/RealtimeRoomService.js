import { Button, DatePicker, Table } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  columnsToExcludeFromRealTime,
  CuisineLabel,
  drpAssignOrNotAssign,
  drpRequestTypes,
  FandBServiceStatus,
  FilterByAssignStatus,
  getRealtimeStatus,
  PaginationOptions,
  SortByRequestType,
  StatusLabel,
  translationDataKey,
} from '../../../../../config/constants'
import DepartmentAndServiceKeys from '../../../../../config/departmentAndServicekeys'
import {
  getImage,
  isFilterValueSelected,
  SelectDrops,
  sortByCreatedAt,
  Ternary,
} from '../../../../../config/utils'
import { AddCuisineListener } from '../../../../../services/cuisine'
import { AddRoomServiceListener } from '../../../../../services/foodAndBeverage'
import { AddFoodMenuListener } from '../../../../../services/foodMenu'
import CustomAlert from '../../../../Common/CustomAlert/CustomAlert'
import SelectAssignOrNotAssign from '../../../../Common/SelectAssignOrNotAssign'
import SelectRequestType from '../../../../Common/SelectRequestType'

const DateFormat = 'DD MMM YYYY'

const statusOptions = getRealtimeStatus(FandBServiceStatus)

const isLoading = (loadingRoomServices, loadingFoodMenu, loadingCuisines) =>
  loadingRoomServices || loadingFoodMenu || loadingCuisines

const FilterData = (
  filteredData,
  selectedStatus,
  selectedCuisine,
  selectedSubmittedDate
) => {
  let copiedData = [...filteredData]

  if (isFilterValueSelected(selectedStatus, StatusLabel))
    copiedData = copiedData.filter(r => r.status === selectedStatus)

  if (isFilterValueSelected(selectedCuisine, CuisineLabel))
    copiedData = copiedData.filter(r => r.cuisines.includes(selectedCuisine))

  if (selectedSubmittedDate) {
    copiedData = copiedData.filter(r => {
      if (!r.createdAt) return false
      const submittedMoment = moment(r.createdAt.toDate()).startOf('day')
      return selectedSubmittedDate.isSame(submittedMoment)
    })
  }
  return copiedData
}

const GetFilteredData = ({
  roomServices,
  cuisines,
  foodMenus,
  selectedStatus,
  selectedCuisine,
  loadingRoomServices,
  loadingFoodMenu,
  loadingCuisines,
  selectedSubmittedDate,
  filterByAssignOrNotAssign,
  sortByRequestType,
}) => {
  let filteredData1 = [...roomServices]

  if (!isLoading(loadingRoomServices, loadingFoodMenu, loadingCuisines)) {
    filteredData1 = filteredData1.map(request => {
      const copiedRequest1 = { ...request }

      const orderCuisineIds = []
      copiedRequest1.menuDetail = copiedRequest1?.menuDetail?.map(m => {
        let menuItemCopy = { ...m }
        let dishName = ''

        orderCuisineIds.push(menuItemCopy?.cuisineId || '')
        const foodMenu2 = foodMenus.find(f => f.id === m.id)
        if (foodMenu2) {
          dishName = foodMenu2.dish
          if (translationDataKey in foodMenu2) {
            menuItemCopy[translationDataKey] = foodMenu2[translationDataKey]
          }
        }
        menuItemCopy.name = dishName
        return menuItemCopy
      })

      const cuisineNames = cuisines
        .filter(c => orderCuisineIds.includes(c.id))
        .map(c => c.name)
      copiedRequest1.orderType = cuisineNames.join(', ')
      copiedRequest1.cuisines = cuisineNames

      return copiedRequest1
    })

    filteredData1 = FilterData(
      filteredData1,
      selectedStatus,
      selectedCuisine,
      selectedSubmittedDate
    )
  }

  if (isFilterValueSelected(filterByAssignOrNotAssign, FilterByAssignStatus)) {
    filteredData1 = filteredData1.filter(r =>
      Ternary(
        filterByAssignOrNotAssign === drpAssignOrNotAssign[0].id,
        r?.assignedToId,
        !r?.assignedToId
      )
    )
  }

  if (isFilterValueSelected(sortByRequestType, SortByRequestType)) {
    return drpRequestTypes?.[sortByRequestType]?.filterFunc(filteredData1)
  }

  return filteredData1.sort(sortByCreatedAt)
}

const RealtimeRoomService = ({
  fbcolumns,
  errorMessage,
  successMessage,
  translateTextI18N,
}) => {
  const [filteredRoomService, setFilteredRoomService] = useState([])

  const [showLoader, setShowLoader] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(StatusLabel)
  const [selectedCuisine, setSelectedCuisine] = useState(CuisineLabel)
  const [selectedSubmittedDate, setSelectedSubmittedDate] = useState(null)

  const [cuisineOptions, setCuisineOptions] = useState([])

  const [filterByAssignOrNotAssign, setFilterByAssignOrNotAssign] =
    useState(FilterByAssignStatus)
  const [sortByRequestType, setSortByRequestType] = useState(SortByRequestType)

  const {
    loadingRoomServices,
    roomServices,
    loadingFoodMenu,
    foodMenus,
    cuisineListenerAdded,
    loadingCuisines,
    cuisines,
    hotelInfo,
  } = useSelector(state => state)

  const hotelId = hotelInfo.hotelId

  const dispatch = useDispatch()

  useEffect(() => {
    AddFoodMenuListener(hotelId, dispatch)
  }, [dispatch, hotelId])

  useEffect(() => {
    AddRoomServiceListener(hotelId, dispatch)
  }, [dispatch, hotelId])

  useEffect(() => {
    setShowLoader(true)
    const filteredData = GetFilteredData({
      roomServices,
      cuisines,
      foodMenus,
      selectedStatus,
      selectedCuisine,
      loadingRoomServices,
      loadingFoodMenu,
      loadingCuisines,
      selectedSubmittedDate,
      filterByAssignOrNotAssign,
      sortByRequestType,
    })
    setFilteredRoomService(filteredData)
    setShowLoader(false)
  }, [
    roomServices,
    cuisines,
    foodMenus,
    selectedStatus,
    selectedCuisine,
    loadingRoomServices,
    loadingFoodMenu,
    loadingCuisines,
    selectedSubmittedDate,
    filterByAssignOrNotAssign,
    sortByRequestType,
  ])

  useEffect(() => {
    AddCuisineListener(hotelId, cuisineListenerAdded, dispatch)
  }, [cuisineListenerAdded, dispatch, hotelId])

  useEffect(() => {
    setCuisineOptions(cuisines.map(c => ({ value: c.name, name: c.name })))
  }, [cuisines])

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='row'>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp' id='rsmsetbl'>
                <div className='form-row'>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectDrops
                      list={cuisineOptions}
                      value={selectedCuisine}
                      addAll
                      onChange={e => setSelectedCuisine(e)}
                    />
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <DatePicker
                        format={DateFormat}
                        value={selectedSubmittedDate}
                        placeholder={translateTextI18N('Ordered Date')}
                        onChange={e => {
                          if (e) setSelectedSubmittedDate(e.startOf('day'))
                          else setSelectedSubmittedDate(null)
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectDrops
                      list={statusOptions}
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
                          .roomService.key
                      }
                    />
                  </div>

                  <div className='col-6 col-md-4 col-lg'>
                    <SelectRequestType
                      value={sortByRequestType}
                      onChange={e => setSortByRequestType(e?.id)}
                      id={
                        DepartmentAndServiceKeys.foodAndBeverage.services
                          .roomService.key
                      }
                    />
                  </div>

                  <div className='col-6 col-md-auto '>
                    <Button
                      type='primary'
                      className='adduserbtn'
                      onClick={() => {
                        setSelectedStatus(StatusLabel)
                        setSelectedCuisine(CuisineLabel)
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
                  message={successMessage}
                  type='success'
                  showIcon={true}
                  classNames='mt-2 mb-2'
                  id='successMessage'
                />
                <CustomAlert
                  visible={errorMessage}
                  message={errorMessage}
                  type='error'
                  showIcon={true}
                  classNames='mt-2 mb-2'
                  id='errorMessage'
                />
              </div>
              <div className='table-wrp' id='tblRS'>
                <Table
                  columns={fbcolumns({ setShowLoader })
                    .filter(
                      c => !columnsToExcludeFromRealTime.includes(c?.dataIndex)
                    )
                    .map(item => {
                      return { ...item, title: translateTextI18N(item.title) }
                    })}
                  dataSource={filteredRoomService}
                  pagination={PaginationOptions}
                  scroll={{ y: 382 }}
                  loading={
                    showLoader ||
                    loadingRoomServices ||
                    loadingFoodMenu ||
                    loadingCuisines
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

export default RealtimeRoomService
