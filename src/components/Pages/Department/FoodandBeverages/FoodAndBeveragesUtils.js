import { Select } from 'antd'
import { GetInitialState } from '../../../../config/archivePaginationHelper'
import {
  AdminActionKey,
  CanceledLabel,
  CompletedLabel,
  Option,
  StatusButton,
  StatusLabelValue,
  rejectedLable,
} from '../../../../config/constants'
import {
  changeRequestStatus,
  GetFAndBStatusOptions,
  GetSuccessMessage,
  isFilterValueSelected,
  sendNotification,
  SetAutoClearProp,
  Ternary,
  UpdatedPageData,
} from '../../../../config/utils'
import { AcceptRejectRoomServiceOrder } from '../../../../services/foodAndBeverage'
import { AdminRequest } from '../../../../services/notification'
import { UpdateRequestStatus } from '../../../../services/requests'
import { GetCurrentUser } from '../../../../services/user'
import { inProgressLabel } from './../../../../config/constants'
import { timestampNow } from '../../../../config/firebase'

export const showModal = (orderData, setIsModalVisible, setOrder) => {
  setIsModalVisible(true)
  setOrder(orderData)
}

export const handleStatusChange = async updatedReqData => {
  const {
    setShowLoader,
    setSuccessMessage,
    setErrorMessage,
    userReqUpdateData,
  } = updatedReqData
  setShowLoader(true)
  const success = await UpdateRequestStatus(userReqUpdateData)
  if (success) {
    SetAutoClearProp(setSuccessMessage, 'Status updated successfully')
    await sendNotification(updatedReqData)
  } else {
    SetAutoClearProp(
      Ternary(setErrorMessage, setErrorMessage, setSuccessMessage),
      'Something went wrong! Please try again!'
    )
  }
  setShowLoader(false)
}

export const hideModal = setIsModalVisible => setIsModalVisible(false)

export const acceptRejectOrder = async data => {
  const {
    status,
    order,
    assignedById,
    assignedByName,
    assignedToId,
    assignedToName,
    completedTime,
    jobStartById,
    jobStartByName,
    jobEndById,
    jobEndByName,
    archivedHelperFunc,
    isArchived,
    rowIndex,
    setErrorMessage,
    setIsModalVisible,
    setSavingOrderStatus,
    setSuccessMessage,
    setSuccessMessageType = () => {},
  } = data
  setSavingOrderStatus(true)
  let updatedRequestData = {
    ...order,
    guestId: order.guestId,
    hotelId: order.hotelId,
    serviceName: order.service,
    departmentId: order.departmentId,
    isGuestRequest: order.isGuestRequest,
    fromDepartmentId: order.fromDepartmentId,
    status,
    adminAction: data[AdminActionKey],
    assignedById,
    assignedByName,
    assignedToId,
    assignedToName,
    request: order,
    jobStartById,
    jobStartByName,
    jobEndById,
    jobEndByName,
    completedTime,
  }
  const { success, message } = await AcceptRejectRoomServiceOrder(
    updatedRequestData
  )
  if (success) {
    if (isArchived) {
      archivedHelperFunc(rowIndex, updatedRequestData)
    }
    setSuccessMessageType?.('success')
    SetAutoClearProp(setSuccessMessage, GetSuccessMessage(status))
    const userid = GetCurrentUser().uid
    let template_variables = { '%request%': order.service, '%status%': status }
    AdminRequest(
      'ADMIN_REQUEST_CHANGE',
      template_variables,
      userid,
      order.guestId,
      order.hotelId,
      order.bookingReferance,
      order.requestType,
      order.departmentId,
      order.id
    )
  } else {
    setSuccessMessageType?.('error')
    SetAutoClearProp(setErrorMessage, message)
  }

  setSavingOrderStatus(false)
  hideModal(setIsModalVisible)
}

export const GetFAndBColumns = ({
  columns,
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
}) => {
  function onStatusChange({ row, updatedStatus, rowIndex }) {
    let commonProps = {
      requestId: row.id,
      updatedStatus,
      serviceName: row.service,
      requestReferenceId: row.bookingReferance,
      guestId: row.guestId,
      requestType: row.requestType,
      setShowLoader,
      setSuccessMessage,
      hotelId,
      rowIndex,
      userReqUpdateData: row,
      userInfo,

      data,
      page,
      UpdateData,
      selectedStatus,
      ResetData,
      FetchData,
      setSuccessMessageType,
    }

    changeRequestStatus({
      childIdToParentIds,
      commonProps,
      dispatch,
      row,
      staffHierarchyErrorLogs,
      userInfo,
      updatedStatus,
      handleStatusChange: handleStatusUpdate,
    })
  }

  let findIndex = columns?.findIndex(item => item?.title === 'Status')

  columns[findIndex] = {
    title: translateTextI18N('Status'),
    dataIndex: 'status',
    width: 100,
    render: (status, row, rowIndex) => {
      const isCompleted = [CompletedLabel].includes(status)
      const isCanceled = [CanceledLabel].includes(status)
      if (isCompleted || isCanceled) {
        return StatusButton({ status, translateTextI18N })
      }

      let options = GetFAndBStatusOptions(row)

      return (
        <Select
          disabled={isCompleted}
          className={options?.find(v => v.value === status)?.className || ''}
          value={translateTextI18N(status)}
          bordered={false}
          onChange={updatedStatus =>
            onStatusChange({ row, updatedStatus, rowIndex })
          }
        >
          {options?.map(option => (
            <Option value={option.value} key={option.value}>
              {translateTextI18N(option.name)}
            </Option>
          ))}
        </Select>
      )
    },
  }
  columns = columns.filter(c => c.dataIndex !== 'Action')

  return columns
}

const handleStatusUpdate = async updatedReqData => {
  const {
    data,
    FetchData,
    page,
    ResetData,
    rowIndex,
    selectedStatus,
    setShowLoader,
    setSuccessMessage,
    setSuccessMessageType,
    UpdateData,
    userReqUpdateData,
  } = updatedReqData
  setShowLoader(true)

  const reqUpdateDataByStatus = await UpdateRequestStatus(userReqUpdateData)
  if (reqUpdateDataByStatus) {
    UpdatedPageData({
      data,
      page,
      rowIndex,
      UpdateData,
      userReqUpdateData,
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

export const FAndBTabChange = ({ setSuccessMessage, setErrorMessage }) => {
  setSuccessMessage('')
  setErrorMessage('')
}

export function handleConfimOrRejectButton({
  acceptRejectOptions,
  buttonLable,
  order,
  setModalClickedButton,
  status,
  userInfo,
}) {
  setModalClickedButton(buttonLable)

  const loggedUserId = userInfo?.userId || userInfo?.id
  const loggedUserName = userInfo?.name

  let { assignedById, assignedByName, assignedToId, assignedToName } = order

  if (!assignedToId) {
    assignedById = loggedUserId
    assignedByName = loggedUserName
    assignedToId = assignedById
    assignedToName = assignedByName
  }

  let jobStartById = '',
    jobStartByName = '',
    jobEndById = '',
    jobEndByName = '',
    completedTime = null

  if ([inProgressLabel, rejectedLable].includes(status)) {
    jobStartById = loggedUserId
    jobStartByName = loggedUserName
  }

  if (status === rejectedLable) {
    jobEndById = loggedUserId
    jobEndByName = loggedUserName
    completedTime = timestampNow()
  }

  acceptRejectOrder({
    assignedById,
    assignedByName,
    assignedToId,
    assignedToName,
    completedTime,
    jobEndById,
    jobEndByName,
    jobStartById,
    jobStartByName,
    order,
    status,
    [AdminActionKey]: status,
    ...acceptRejectOptions,
  })
}
