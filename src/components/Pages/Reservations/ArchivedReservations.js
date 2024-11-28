/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { Button, DatePicker } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import { actions } from '../../../Store'
import {
  StatusLabel,
  departmentFilterLabel,
  serviceFilterLabel,
  FandBServiceStatus,
  ratingFilterLabel,
} from '../../../config/constants'
import {
  arrangeAssignToAndStatusCol,
  getImage,
  getViewOrderDetail,
  isFilterValueSelected,
  SelectDrops,
  sendNotification,
  SetAutoClearProp,
} from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { getReservation } from '../../../services/reservation'
import {
  GetActionsHelper,
  GetFetchDataOptions,
  GetInitialState,
  reducer,
} from '../../../config/archivePaginationHelper'
import CustomAntdTable from '../../Common/CustomAntdTable'
import {
  getServiceNames,
  reservationDepartments,
} from '../Department/HouseKeeping/Common'
import DepartmentAndServiceKeys from '../../../config/departmentAndServicekeys'
import CustomAlert from './../../Common/CustomAlert/CustomAlert'
import { UpdateRequestStatus } from './../../../services/requests'
import { UpdatedPageData } from './../../../config/utils'
import RatingFilter from '../../Common/Rating/RatingFilter'

const DateFormat = 'DD MMM YYYY'

const ArchivedReservations = ({ columns, resetArchive, setResetArchive }) => {
  const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
    useReducer(reducer, GetInitialState())

  const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
    GetActionsHelper(localDispatch)

  const [selectedDepartment, setSelectedDepartment] = useState(
    departmentFilterLabel
  )
  const [selectedService, setSelectedService] = useState(serviceFilterLabel)
  const [selectedStatus, setSelectedStatus] = useState(StatusLabel)
  const [selectedReservationDate, setSelectedReservationDate] = useState('')

  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [showLoader, setShowLoader] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [filteredRating, setFilteredRating] = useState(ratingFilterLabel)
  const {
    hotelInfo,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const hotelId = hotelInfo?.hotelId

  const FetchData = useCallback(
    async (
      filterData = {},
      archiveState = {
        data,
        page,
        fetchingData,
        snapshotDocs,
      }
    ) => {
      const { startAfter, continueFetching } = GetFetchDataOptions(archiveState)

      if (continueFetching) {
        await getReservation({
          hotelId,
          SetFetching,
          SetData,
          page: archiveState.page,
          startAfter,
          fetchingData: archiveState.fetchingData,
          selectedStatus,
          selectedService,
          selectedReservationDate,
          selectedDepartment,
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
      selectedDepartment,
      selectedReservationDate,
      selectedService,
      selectedStatus,
      snapshotDocs,
    ]
  )

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('7'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (resetArchive) {
      resetFilter()
      setResetArchive(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetArchive])

  useEffect(() => {
    FetchData({}, { data, page, fetchingData, snapshotDocs })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, page])

  const resetFilter = () => {
    setSelectedDepartment(departmentFilterLabel)
    setSelectedService(serviceFilterLabel)
    setSelectedStatus(StatusLabel)
    setSelectedReservationDate(null)
    setFilteredRating(ratingFilterLabel)
    ResetData()
    FetchData(
      {
        selectedStatus: null,
        selectedService: null,
        selectedReservationDate: null,
        selectedDepartment: null,
        filteredRating: null,
      },
      { ...GetInitialState() }
    )
  }

  const handlePaginationChange = (
    setFunc,
    value,
    filterPropName,
    optionFilter = {}
  ) => {
    setFunc(value)
    ResetData()
    FetchData(
      { [filterPropName]: value, ...optionFilter },
      { ...GetInitialState() }
    )
  }

  const reservationServiceNames = useMemo(() => {
    let sl = []
    const { foodAndBeverage, spaAndWellness } = DepartmentAndServiceKeys

    if (isFilterValueSelected(selectedDepartment, departmentFilterLabel)) {
      if (selectedDepartment === foodAndBeverage.name) {
        sl = [...getServiceNames(foodAndBeverage.services)]
      } else if (selectedDepartment === spaAndWellness.name) {
        sl = [...getServiceNames(spaAndWellness.services)]
      }
    } else {
      sl = [
        ...getServiceNames(foodAndBeverage.services),
        ...getServiceNames(spaAndWellness.services),
      ]
    }

    sl = sl.filter(
      item => item.name !== foodAndBeverage.services.roomService.name
    )

    return sl
  }, [selectedDepartment])

  const reservationColumns = useMemo(() => {
    function updateArchivedTableData({
      rowIndex,
      userReqUpdateData,
      data,
      page,
    }) {
      UpdatedPageData({
        data,
        page,
        rowIndex,
        userReqUpdateData,
        UpdateData,
      })

      // If we have already filtered data according to perticular status then we need to fetch the data again
      // as the data with the new status does not belong to the current filer
      if (isFilterValueSelected(selectedStatus, StatusLabel)) {
        ResetData()
        FetchData({}, { ...GetInitialState() })
      }
    }

    async function handleStatusChange(updatedReqData) {
      setShowLoader(true)
      try {
        const { rowIndex, userReqUpdateData } = updatedReqData

        const reqUpdateDataByStatus = await UpdateRequestStatus(
          userReqUpdateData
        )
        if (reqUpdateDataByStatus) {
          updateArchivedTableData({
            rowIndex,
            userReqUpdateData,
            data,
            page,
          })
          SetAutoClearProp(setSuccessMessage, 'Status updated successfully')
          await sendNotification(updatedReqData)
        } else {
          SetAutoClearProp(
            setErrorMessage,
            'Something went wrong! Please try again!'
          )
        }
      } catch (error) {
        console.error(error)
      } finally {
        setShowLoader(false)
      }
    }

    let findDetailIndex = columns.findIndex(c => c.dataIndex === 'Detail')
    if (findDetailIndex > -1) {
      columns[findDetailIndex].render = (_, row, rowIndex) => {
        return getViewOrderDetail({
          row,
          rowIndex,
          translateTextI18N,
          setErrorMessage,
          setSuccessMessage,
          dispatch,
          isArchived: true,
          archivedHelperFunc: (rowIndex, userReqUpdateData) =>
            updateArchivedTableData({
              rowIndex,
              userReqUpdateData,
              data,
              page,
            }),
        })
      }
    }

    return arrangeAssignToAndStatusCol(columns, {
      dispatch,
      handleStatusChange,
      hotelId,
      setErrorMessage,
      setShowLoader,
      setSuccessMessage,
      translateTextI18N,
      userInfo,
      staffListForLoggedManager,
      childIdToParentIds,
      staffHierarchyErrorLogs,
    })
  }, [
    FetchData,
    ResetData,
    UpdateData,
    childIdToParentIds,
    columns,
    data,
    dispatch,
    hotelId,
    page,
    selectedStatus,
    staffHierarchyErrorLogs,
    staffListForLoggedManager,
    translateTextI18N,
    userInfo,
  ])

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='row'>
            <div className='col-12 col-xl-10'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form'>
                      <DatePicker
                        id='filter2'
                        format={DateFormat}
                        value={selectedReservationDate}
                        placeholder={translateTextI18N('Reserved Date')}
                        onChange={e => {
                          const date = e ? e.startOf('day') : null
                          handlePaginationChange(
                            setSelectedReservationDate,
                            date,
                            'selectedReservationDate'
                          )
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form'>
                      <SelectDrops
                        addAll
                        list={reservationDepartments}
                        value={selectedDepartment}
                        onChange={e => {
                          setSelectedService(serviceFilterLabel)

                          handlePaginationChange(
                            setSelectedDepartment,
                            e,
                            'selectedDepartment',
                            {
                              selectedService: serviceFilterLabel,
                            }
                          )
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form'>
                      <SelectDrops
                        addAll
                        list={reservationServiceNames}
                        value={selectedService}
                        onChange={e => {
                          handlePaginationChange(
                            setSelectedService,
                            e,
                            'selectedService'
                          )
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form'>
                      <SelectDrops
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
                  </div>
                  <RatingFilter
                    {...{
                      handlePaginationChange,
                      setFilteredRating,
                      filteredRating,
                    }}
                  />

                  <div className='col-4 col-md-auto'>
                    <Button
                      type='primary'
                      className='adduserbtn'
                      onClick={resetFilter}
                    >
                      <img src={getImage('images/clearicon.svg')}></img>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row ml-2 mb-2' id='reservation-arch'>
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
              <div className='table-wrp'>
                <CustomAntdTable
                  columns={reservationColumns}
                  dataSource={data[page]}
                  loading={fetchingData || showLoader}
                  previous={GoPrev}
                  next={GoNext}
                  disableNext={
                    fetchingData || (data[page + 1]?.length ?? 0) === 0
                  }
                  disablePrev={fetchingData || page === 1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ArchivedReservations
