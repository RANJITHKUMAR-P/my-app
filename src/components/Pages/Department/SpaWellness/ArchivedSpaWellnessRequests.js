/* eslint-disable jsx-a11y/alt-text */
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { Button } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import {
  ratingFilterLabel,
  RequestStatus,
  serviceFilterLabel,
  statusFilterLabel,
  StatusLabel,
  StatusLabelValue,
} from '../../../../config/constants'
import {
  GetAddViewCommentColumn,
  getCommonColumns,
  getImage,
  getJobStartEndImageAndName,
  isFilterValueSelected,
  SelectDrops,
  sendNotification,
  SetAutoClearProp,
  setColumnOrder,
  swapColumns,
  Ternary,
  TranslateColumnHeader,
  UpdatedPageData,
} from '../../../../config/utils'
import {
  commonTableProps,
  GetActionsHelper,
  GetFetchDataOptions,
  GetInitialState,
  reducer,
} from '../../../../config/archivePaginationHelper'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'
import { getSpaAndWellnessReservation } from '../../../../services/reservation'
import { UpdateRequestStatus } from '../../../../services/requests'
import CustomAntdTable from '../../../Common/CustomAntdTable'
import { spaAndWellnessDepartments } from '../HouseKeeping/Common'
import RatingFilter from '../../../Common/Rating/RatingFilter'
import RequestImageUpload from '../../../Common/RequestImageUpload'

const ArchivedSpaWellnessRequests = ({
  swcolumns,
  translateTextI18N,
  pathname,
  resetArchive,
  setResetArchive,
  assignStaffCol,
}) => {
  const dispatch = useDispatch()
  const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
    useReducer(reducer, GetInitialState())
  const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
    GetActionsHelper(localDispatch)

  const [selectedService, setSelectedService] = useState(serviceFilterLabel)
  const [selectedStatus, setSelectedStatus] = useState(statusFilterLabel)
  const [showLoader, setShowLoader] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [successMessageType, setSuccessMessageType] = useState('')
  const [filteredRating, setFilteredRating] = useState(ratingFilterLabel)

  const { hotelInfo, userInfo, childIdToParentIds, staffHierarchyErrorLogs } =
    useSelector(state => state)
  const hotelId = hotelInfo.hotelId
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  const allReservation = pathname === '/SpaAndWellnessReservation'

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  const handleStatusChange = async updatedReqData => {
    const { rowIndex, userReqUpdateData } = updatedReqData

    setShowLoader(true)
    const reqUpdateDataByStatus = await UpdateRequestStatus(userReqUpdateData)

    if (reqUpdateDataByStatus) {
      UpdatedPageData({
        data,
        page,
        rowIndex,
        userReqUpdateData,
        UpdateData,
      })

      // If we have alredy filtered data according to perticular status then we need to fetch the data again
      // as the data with the new status does not belong to the current filer

      if (isFilterValueSelected(selectedStatus, StatusLabelValue)) {
        ResetData()
        FetchData({}, { ...GetInitialState() })
      }

      setSuccessMessageType('success')
      SetAutoClearProp(setSuccessMessage, 'Status updated successfully')
      await sendNotification(updatedReqData)
    } else {
      setSuccessMessageType('error')
      SetAutoClearProp(
        setSuccessMessage,
        'Something went wrong! Please try again!'
      )
    }
    setShowLoader(false)
  }

  const FetchData = useCallback(
    async (
      filterData = {},
      archiveState = { data, page, fetchingData, snapshotDocs }
    ) => {
      const { startAfter, continueFetching } = GetFetchDataOptions(archiveState)

      if (continueFetching) {
        await getSpaAndWellnessReservation({
          hotelId,
          SetFetching,
          SetData,
          page: archiveState.page,
          startAfter,
          fetchingData: archiveState.fetchingData,
          selectedService,
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
      selectedService,
      selectedStatus,
      snapshotDocs,
    ]
  )

  useEffect(() => {
    if (resetArchive) {
      resetFilterValue()
      setResetArchive(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetArchive])

  const resetFilterValue = useCallback(async () => {
    const serviceKeys = {
      '/SpaReservation':
        DepartmentAndServiceKeys.spaAndWellness.services.spa.key,
      '/GymReservation':
        DepartmentAndServiceKeys.spaAndWellness.services.gym.key,
      '/SalonReservation':
        DepartmentAndServiceKeys.spaAndWellness.services.saloon.key,
    }

    let serviceKey = serviceKeys?.[pathname] ?? serviceFilterLabel

    ResetData()
    setSelectedService(Ternary(allReservation, serviceFilterLabel, serviceKey))
    setSelectedStatus(StatusLabel)
    setFilteredRating(ratingFilterLabel)
    await FetchData(
      {
        selectedService: Ternary(
          allReservation,
          serviceFilterLabel,
          serviceKey
        ),
        selectedStatus: null,
        filteredRating: null,
      },
      { ...GetInitialState() }
    )
  }, [FetchData, ResetData, allReservation, pathname])

  const handlePaginationChange = (setFunc, value, filterPropName) => {
    setFunc(value)
    ResetData()
    FetchData({ [filterPropName]: value }, { ...GetInitialState() })
  }

  const { statusCol, getRatinAndFeedbackCol } = getCommonColumns({
    translateTextI18N,
    dispatch,
    handleStatusChange,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  })

  swcolumns = [
    ...swcolumns,
    assignStaffCol,
    GetAddViewCommentColumn({
      dispatch,
      translateTextI18N,
      userInfo,
    }),
    ...getJobStartEndImageAndName({ translateTextI18N, showImageUploadPopup }),
    statusCol,
    ...getRatinAndFeedbackCol(),
  ]

  swcolumns = swapColumns(swcolumns, 'createdAt', 'assignedToName')
  swcolumns = setColumnOrder(swcolumns, 'assignedToName', 'status')

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-7'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              {Ternary(
                allReservation,
                <div className='col-6 col-md-4 col-md'>
                  <SelectDrops
                    visible={allReservation}
                    list={spaAndWellnessDepartments}
                    value={selectedService}
                    addAll
                    onChange={e =>
                      handlePaginationChange(
                        setSelectedService,
                        e,
                        'selectedService'
                      )
                    }
                  />
                </div>,
                null
              )}

              <div className='col-6 col-md-4 col-md'>
                <SelectDrops
                  list={RequestStatus}
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
                  <img src={getImage('images/clearicon.svg')}></img>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className='col-12 col-xl-12'>
          <div className='table-wrp'>
            <CustomAntdTable
              columns={TranslateColumnHeader(swcolumns)}
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
      {visibleImageUpload && (
        <RequestImageUpload
          visibleImageUpload={visibleImageUpload}
          row={requestRowInfo}
          setVisibleImageUpload={setVisibleImageUpload}
          imageUploadType={imageUploadType}
          FetchData={FetchData}
        />
      )}
    </>
  )
}

export default ArchivedSpaWellnessRequests
