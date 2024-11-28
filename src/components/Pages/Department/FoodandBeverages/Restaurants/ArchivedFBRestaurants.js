import { Button, DatePicker } from 'antd'
import React, { useEffect, useReducer, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  commonTableProps,
  GetActionsHelper,
  GetFetchDataOptions,
  GetInitialState,
  reducer,
} from '../../../../../config/archivePaginationHelper'
import {
  FandBServiceStatus,
  RestaurantLabel,
  StatusLabel,
  ratingFilterLabel,
} from '../../../../../config/constants'
import { getImage, SelectDrops } from '../../../../../config/utils'
import {
  AddRestaurantListener,
  GetRestaurant,
} from '../../../../../services/restaurants'
import { useCustomI18NTranslatorHook } from '../../../../../utility/globalization'
import CustomAntdTable from '../../../../Common/CustomAntdTable'
import { GetFAndBColumns } from '../FoodAndBeveragesUtils'
import RatingFilter from '../../../../Common/Rating/RatingFilter'

const DateFormat = 'DD MMM YYYY'

const ArchivedFBRestaurants = ({
  fbrcolumns,
  setShowLoader,
  setSuccessMessage,
  setSuccessMessageType,
  successMessage,
  successMessageType,
  showLoader,
  resetArchive,
  setResetArchive,
}) => {
  const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
    useReducer(reducer, GetInitialState())
  const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
    GetActionsHelper(localDispatch)

  const [selectedStatus, setSelectedStatus] = useState(StatusLabel)
  const [selectedRestaurant, setSelectedRestaurant] = useState(RestaurantLabel)
  const [selectedSubmittedDate, setSelectedSubmittedDate] = useState(null)
  const [filteredRating, setFilteredRating] = useState(ratingFilterLabel)

  const [restaurantOptions, setRestaurantOptions] = useState([])

  const {
    restaurantsListenerAdded,
    restaurants,
    hotelInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
    userInfo,
  } = useSelector(state => state)
  const hotelId = hotelInfo?.hotelId
  const dispatch = useDispatch()

  useEffect(() => {
    AddRestaurantListener(hotelId, restaurantsListenerAdded, dispatch)
  }, [restaurantsListenerAdded, dispatch, hotelId])

  useEffect(() => {
    setRestaurantOptions(
      restaurants.map(r => ({ value: r.name, name: r.name }))
    )
  }, [restaurants])

  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const FetchData = useCallback(
    async (
      filterData = {},
      archiveState = { data, page, fetchingData, snapshotDocs }
    ) => {
      const { startAfter, continueFetching } = GetFetchDataOptions(archiveState)

      if (continueFetching) {
        await GetRestaurant({
          hotelId,
          SetFetching,
          SetData,
          page: archiveState.page,
          startAfter,
          fetchingData: archiveState.fetchingData,
          selectedRestaurant,
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
      selectedRestaurant,
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
    setSelectedRestaurant(RestaurantLabel)
    setSelectedStatus(StatusLabel)
    setSelectedSubmittedDate(null)
    setFilteredRating(ratingFilterLabel)
    await FetchData(
      {
        selectedRestaurant: null,
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

  fbrcolumns = GetFAndBColumns({
    columns: fbrcolumns,
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
    dispatch,
    childIdToParentIds,
    staffHierarchyErrorLogs,
    userInfo,
  })

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='row'>
            <div className='col-12 col-xl-7'>
              <div className='tablefilter-wrp' id='fbResTbl'>
                <div className='form-row'>
                  <div className='col-6 col-md-4 col-lg' id='filter1'>
                    <SelectDrops
                      list={restaurantOptions}
                      value={selectedRestaurant}
                      addAll
                      onChange={e =>
                        handlePaginationChange(
                          setSelectedRestaurant,
                          e,
                          'selectedRestaurant'
                        )
                      }
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
                      addAll
                      id='filter4'
                      list={FandBServiceStatus}
                      value={selectedStatus}
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
              <CustomAntdTable
                columns={fbrcolumns.map(item => {
                  return { ...item, title: translateTextI18N(item.title) }
                })}
                dataSource={data[page]}
                loading={fetchingData || showLoader}
                {...commonTableProps({
                  GoPrev,
                  GoNext,
                  fetchingData,
                  data,
                  page,
                })}
                message={successMessage}
                messageType={successMessageType}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ArchivedFBRestaurants
