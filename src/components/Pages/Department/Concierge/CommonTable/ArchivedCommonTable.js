import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { Button } from 'antd'

import {
  RequestStatus,
  RequestTypeLabelValue,
  StatusLabelValue,
  ratingFilterLabel,
  requestTypeOptionsValue,
} from '../../../../../config/constants'
import {
  getCommonColumns,
  getImage,
  GetStatusColumn,
  isFilterValueSelected,
  SelectDrops,
  sendNotification,
  SetAutoClearProp,
  setColumnOrder,
  UpdatedPageData,
} from '../../../../../config/utils'
import {
  getConciergeServiceRequests,
  UpdateRequestStatus,
} from '../../../../../services/requests'
import CustomAntdTable from '../../../../Common/CustomAntdTable'
import {
  commonTableProps,
  GetActionsHelper,
  GetFetchDataOptions,
  GetInitialState,
  reducer,
} from '../../../../../config/archivePaginationHelper'
import { useDispatch, useSelector } from 'react-redux'
import RatingFilter from '../../../../Common/Rating/RatingFilter'

const RequestTypeKeyLabel = RequestTypeLabelValue
const StatusLabel = StatusLabelValue
const conciergeRequestTypeOptions = requestTypeOptionsValue

const ArchivedCommonTable = ({
  ConciergeServiceKey,
  defaultColumnsList,
  translateTextI18N,
  resetArchive,
  setResetArchive,
}) => {
  const dispatch = useDispatch()
  const [successMessage, setSuccessMessage] = useState('')
  const [successMessageType, setSuccessMessageType] = useState('')
  const [showLoader, setShowLoader] = useState(false)
  const [filteredRating, setFilteredRating] = useState(ratingFilterLabel)

  const [{ data, page, fetchingData, snapshotDocs }, localDispatch] =
    useReducer(reducer, GetInitialState())
  const { ResetData, GoNext, GoPrev, SetFetching, SetData, UpdateData } =
    GetActionsHelper(localDispatch)

  const [conciergeSelectedRequestTypeKey, setConciergeSelectedRequestType] =
    useState(RequestTypeKeyLabel)
  const [conciergeSelectedStatusKey, setConciergeSelectedStatus] =
    useState(StatusLabel)

  const {
    hotelInfo,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const hotelId = hotelInfo.hotelId

  const FetchData = useCallback(
    async (
      filterData = {},
      archiveState = { data, page, fetchingData, snapshotDocs }
    ) => {
      const { startAfter, continueFetching } = GetFetchDataOptions(archiveState)

      if (continueFetching) {
        await getConciergeServiceRequests({
          hotelId,
          SetFetching,
          SetData,
          page: archiveState.page,
          startAfter,
          fetchingData: archiveState.fetchingData,
          ConciergeServiceKey,
          conciergeSelectedRequestTypeKey,
          conciergeSelectedStatusKey,
          filteredRating,
          ...filterData,
        })
      }
    },
    [
      ConciergeServiceKey,
      SetData,
      SetFetching,
      conciergeSelectedRequestTypeKey,
      conciergeSelectedStatusKey,
      data,
      fetchingData,
      filteredRating,
      hotelId,
      page,
      snapshotDocs,
    ]
  )

  useEffect(() => {
    setSuccessMessage('')
    setSuccessMessageType('')
  }, [])

  const handleStatusChange = async updatedReqData => {
    setShowLoader(true)

    const { rowIndex, userReqUpdateData } = updatedReqData

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
      if (isFilterValueSelected(conciergeSelectedStatusKey, StatusLabelValue)) {
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

  const resetFilterValue = () => {
    ResetData()
    setConciergeSelectedRequestType(RequestTypeKeyLabel)
    setConciergeSelectedStatus(StatusLabel)
    setFilteredRating(ratingFilterLabel)
    FetchData(
      {
        conciergeSelectedRequestTypeKey: null,
        conciergeSelectedStatusKey: null,
        filteredRating: null,
      },
      { ...GetInitialState() }
    )
  }

  const handlePaginationChange = (setFunc, value, filterPropName) => {
    setFunc(value)
    ResetData()
    FetchData({ [filterPropName]: value }, { ...GetInitialState() })
  }

  const { getRatinAndFeedbackCol } = getCommonColumns({
    translateTextI18N,
    dispatch,
  })

  defaultColumnsList = [
    ...defaultColumnsList,
    GetStatusColumn({
      dispatch,
      handleStatusChange,
      hotelId,
      setErrorMessage: () => {},
      setShowLoader,
      setSuccessMessage,
      statusOptions: RequestStatus,
      translateTextI18N,
      userInfo,
      staffListForLoggedManager,
      childIdToParentIds,
      staffHierarchyErrorLogs,
    }),
    ...getRatinAndFeedbackCol(),
  ]

  defaultColumnsList = setColumnOrder(
    defaultColumnsList,
    'assignedToName',
    'status'
  ).filter(c => c.dataIndex !== 'Action')

  return (
    <>
      <div className='row'>
        <div className='col-12 col-xl-12'>
          <div className='tablefilter-wrp'>
            <div className='form-row'>
              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  list={conciergeRequestTypeOptions}
                  value={conciergeSelectedRequestTypeKey}
                  addAll
                  onChange={e =>
                    handlePaginationChange(
                      setConciergeSelectedRequestType,
                      e,
                      'conciergeSelectedRequestTypeKey'
                    )
                  }
                />
              </div>

              <div className='col-6 col-md-4 col-lg'>
                <SelectDrops
                  list={RequestStatus}
                  value={conciergeSelectedStatusKey}
                  addAll
                  onChange={e =>
                    handlePaginationChange(
                      setConciergeSelectedStatus,
                      e,
                      'conciergeSelectedStatusKey'
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
                  <img alt='clear' src={getImage('images/clearicon.svg')}></img>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='col-12 col-xl-12'>
          <CustomAntdTable
            columns={defaultColumnsList.map(item => ({
              ...item,
              title: translateTextI18N(item.title),
            }))}
            dataSource={data[page]}
            loading={fetchingData || showLoader}
            {...commonTableProps({ GoPrev, GoNext, fetchingData, data, page })}
            message={successMessage}
            messageType={successMessageType}
          />
        </div>
      </div>
    </>
  )
}

export default ArchivedCommonTable
