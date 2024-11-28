import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { Button, DatePicker } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import {
  commonTableProps,
  GetActionsHelper,
  GetFetchDataOptions,
  GetInitialState,
  reducer,
} from '../../../../../config/archivePaginationHelper'
import {
  CuisineLabel,
  FandBServiceStatus,
  StatusLabel,
  ratingFilterLabel,
  translationDataKey,
} from '../../../../../config/constants'
import { getImage, SelectDrops } from '../../../../../config/utils'
import { AddCuisineListener } from '../../../../../services/cuisine'
import { GetRoomServiceRequests } from '../../../../../services/foodAndBeverage'
import { AddFoodMenuListener } from '../../../../../services/foodMenu'
import CustomAlert from '../../../../Common/CustomAlert/CustomAlert'
import CustomAntdTable from '../../../../Common/CustomAntdTable'
import { GetFAndBColumns } from '../FoodAndBeveragesUtils'
import RatingFilter from '../../../../Common/Rating/RatingFilter'

const DateFormat = 'DD MMM YYYY'

const GetFilteredData = ({
  roomServices,
  cuisines,
  foodMenus,
  loadingFoodMenu,
  loadingCuisines,
}) => {
  if (loadingFoodMenu || loadingCuisines) return []

  if (!Array.isArray(roomServices)) return []

  let filteredData = [...roomServices]

  filteredData = filteredData.map(request => {
    const copiedRequest = { ...request }

    const orderCuisineIds = []
    copiedRequest.menuDetail = copiedRequest?.menuDetail?.map(m => {
      let menuItemCopy = { ...m }
      let dishName = ''

      orderCuisineIds.push(menuItemCopy?.cuisineId || '')
      const foodMenu = foodMenus.find(f => f.id === m.id)
      if (foodMenu) {
        dishName = foodMenu.dish
        if (translationDataKey in foodMenu) {
          menuItemCopy[translationDataKey] = foodMenu[translationDataKey]
        }
      }
      menuItemCopy.name = dishName
      return menuItemCopy
    })

    const cuisineNames = cuisines
      .filter(c => orderCuisineIds.includes(c.id))
      .map(c => c.name)
    copiedRequest.orderType = cuisineNames.join(', ')
    copiedRequest.cuisines = cuisineNames
    return copiedRequest
  })

  return filteredData
}

const ArchiveRoomService = ({
  fbcolumns,
  errorMessage,
  successMessage,
  setSuccessMessage,
  translateTextI18N,
  setSuccessMessageType,
  resetArchive,
  setResetArchive,
}) => {
  const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
    useReducer(reducer, GetInitialState())

  const [filteredRoomService, setFilteredRoomService] = useState([])

  const [showLoader, setShowLoader] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(StatusLabel)
  const [selectedSubmittedDate, setSelectedSubmittedDate] = useState(null)
  const [selectedCuisine, setSelectedCuisine] = useState(CuisineLabel)
  const [filteredRating, setFilteredRating] = useState(ratingFilterLabel)

  const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
    GetActionsHelper(localDispatch)

  const [cuisineOptions, setCuisineOptions] = useState([])

  const {
    loadingFoodMenu,
    foodMenus,
    cuisineListenerAdded,
    cuisines,
    loadingCuisines,
    isHotelAdmin,
    hotelInfo,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const hotelId = hotelInfo.hotelId

  const dispatch = useDispatch()

  useEffect(() => {
    AddCuisineListener(hotelId, cuisineListenerAdded, dispatch)
  }, [cuisineListenerAdded, dispatch, hotelId])

  useEffect(() => {
    setShowLoader(true)
    const filteredData = GetFilteredData({
      roomServices: data[page],
      cuisines,
      foodMenus,
      loadingFoodMenu,
      loadingCuisines,
    })
    setFilteredRoomService(filteredData)
    setShowLoader(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuisines, data[page], foodMenus, loadingCuisines, loadingFoodMenu])

  useEffect(() => {
    AddFoodMenuListener(hotelId, dispatch)
  }, [dispatch, hotelId])

  useEffect(() => {
    setCuisineOptions(cuisines.map(c => ({ value: c.name, name: c.name })))
  }, [cuisines])

  const FetchData = useCallback(
    async (
      filterData = {},
      archiveState = { data, page, fetchingData, snapshotDocs }
    ) => {
      const { startAfter, continueFetching } = GetFetchDataOptions(archiveState)

      if (continueFetching) {
        await GetRoomServiceRequests({
          hotelId,
          SetFetching,
          SetData,
          page: archiveState.page,
          startAfter,
          fetchingData: archiveState.fetchingData,
          selectedCuisine,
          selectedSubmittedDate,
          selectedStatus,
          filteredRating,
          ...filterData,
        })
      }
    },
    [
      SetData,
      SetFetching,
      data,
      fetchingData,
      filteredRating,
      hotelId,
      page,
      selectedCuisine,
      selectedStatus,
      selectedSubmittedDate,
      snapshotDocs,
    ]
  )

  useEffect(() => {
    FetchData({}, { data, page, fetchingData, snapshotDocs })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, page])

  useEffect(() => {
    if (resetArchive) {
      resetFilterValue()
      setResetArchive(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetArchive])

  const resetFilterValue = useCallback(async () => {
    ResetData()
    setSelectedCuisine(CuisineLabel)
    setSelectedStatus(StatusLabel)
    setSelectedSubmittedDate(null)
    setFilteredRating(ratingFilterLabel)
    await FetchData(
      {
        selectedCuisine: null,
        selectedSubmittedDate: null,
        selectedStatus: null,
        filteredRating: null,
      },
      { ...GetInitialState() }
    )
  }, [FetchData, ResetData])

  const handlePaginationChange = (setFunc, value, filterPropName) => {
    setFunc(value)
    ResetData()
    FetchData({ [filterPropName]: value }, { ...GetInitialState() })
  }

  fbcolumns = GetFAndBColumns({
    columns: fbcolumns({ setShowLoader }),
    translateTextI18N,
    setShowLoader,
    data,
    page,
    UpdateData,
    selectedStatus,
    ResetData,
    FetchData,
    setSuccessMessageType,
    setSuccessMessage,
    hotelId,
    isHotelAdmin,
    dispatch,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  }).map(item => ({ ...item, title: translateTextI18N(item.title) }))

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='row'>
            <div className='col-12 col-xl-7'>
              <div className='tablefilter-wrp' id='rsmsetbl'>
                <div className='form-row'>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectDrops
                      list={cuisineOptions}
                      value={selectedCuisine}
                      addAll
                      onChange={e =>
                        handlePaginationChange(
                          setSelectedCuisine,
                          e,
                          'selectedCuisine'
                        )
                      }
                    />
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <div className='cmnSelect-form'>
                      <DatePicker
                        format={DateFormat}
                        value={selectedSubmittedDate}
                        placeholder={translateTextI18N('Ordered Date')}
                        onChange={e => {
                          const date = e ? e.startOf('day') : null
                          handlePaginationChange(
                            setSelectedSubmittedDate,
                            date,
                            'selectedSubmittedDate'
                          )
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-6 col-md-4 col-lg'>
                    <SelectDrops
                      list={FandBServiceStatus}
                      value={selectedStatus}
                      addAll
                      onChange={e =>
                        handlePaginationChange(
                          setSelectedStatus,
                          e,
                          'selectedStatus'
                        )
                      }
                    />
                  </div>
                  <RatingFilter
                    {...{
                      handlePaginationChange,
                      setFilteredRating,
                      filteredRating,
                    }}
                  />

                  <div className='col-6 col-md-auto '>
                    <Button
                      type='primary'
                      className='adduserbtn'
                      onClick={resetFilterValue}
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
                />
                <CustomAlert
                  visible={errorMessage}
                  message={errorMessage}
                  type='error'
                  showIcon={true}
                  classNames='mt-2 mb-2'
                />
              </div>
              <div className='table-wrp' id='tblRS'>
                <CustomAntdTable
                  columns={fbcolumns}
                  dataSource={filteredRoomService}
                  loading={fetchingData || showLoader}
                  {...commonTableProps({
                    GoPrev,
                    GoNext,
                    fetchingData,
                    data,
                    page,
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ArchiveRoomService
