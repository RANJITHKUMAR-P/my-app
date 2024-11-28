import { Button, Modal } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import {
  AdminActionKey,
  confirmLabel,
  inProgressLabel,
  rejectedLable,
  rejectLabel,
  unAssignTaskErrorMsg,
} from '../../../config/constants'
import { useDispatch, useSelector } from 'react-redux'
import { handleConfimOrRejectButton } from '../../Pages/Department/FoodandBeverages/FoodAndBeveragesUtils'
import { actions } from '../../../Store'
import { GetSuccessMessage } from './../../../config/utils'
import { auth } from '../../../config/firebase'
import DepartmentAndServiceKeys from '../../../config/departmentAndServicekeys'
import ViewReservationeOrder from './ViewReservationOrder'
import ViewRoomServiceOrder from './ViewRoomServiceOrder'

function ViewOrder() {
  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const {
    viewOrderModal,
    userInfo,
    childIdToParentIds,
    isManagementStaff,
    isHotelAdmin,
  } = useSelector(state => state)

  const [savingOrderStatus, setSavingOrderStatus] = useState(false)
  const [modalClickedButton, setModalClickedButton] = useState('')

  const hideModal = useCallback(() => {
    dispatch(actions.setViewOrderModal({ isModalVisible: false, props: {} }))
  }, [dispatch])

  const {
    isModalVisible = false,
    requestData = null,
    props = null,
  } = viewOrderModal

  const [blockStatusChange, setBlockStatusChange] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  const assignTaskValidation = useCallback(
    isTaskAssigned => {
      if (isHotelAdmin) {
        return {
          block: false,
          errorMsg: null,
        }
      }

      if (isManagementStaff) {
        const isCurrentUserIsManagerOfTaskAssigned = childIdToParentIds?.[
          isTaskAssigned
        ]?.includes(auth.currentUser.uid)

        if (isCurrentUserIsManagerOfTaskAssigned) {
          return {
            block: false,
            errorMsg: null,
          }
        } else {
          return {
            block: true,
            errorMsg: `You can not accept/reject order as assigned to ${requestData.assignedToName}`,
          }
        }
      }

      return {
        block: false,
        errorMsg: null,
      }
    },
    [
      childIdToParentIds,
      isHotelAdmin,
      isManagementStaff,
      requestData?.assignedToName,
    ]
  )

  const validateBlockStatus = useCallback(
    isTaskAssigned => {
      if (!isTaskAssigned) {
        if (isHotelAdmin || isManagementStaff) {
          return { block: true, errorMsg: unAssignTaskErrorMsg }
        }
      } else {
        return assignTaskValidation(isTaskAssigned)
      }

      return { block: false, errorMsg: null }
    },
    [assignTaskValidation, isHotelAdmin, isManagementStaff]
  )

  useEffect(() => {
    if (requestData) {
      const valViewOrder = validateBlockStatus(requestData.assignedToId)
      setBlockStatusChange(valViewOrder.block)
      setErrorMsg(valViewOrder.errorMsg)
    }
    return () => {
      setSavingOrderStatus(false)
      setModalClickedButton('')
    }
  }, [requestData, validateBlockStatus])

  const handleOnClick = useCallback(
    (buttonLable, status) => {
      const acceptRejectOptions = {
        ...props,
        setSavingOrderStatus,
        GetSuccessMessage,
        setIsModalVisible: hideModal,
      }

      handleConfimOrRejectButton({
        acceptRejectOptions,
        buttonLable,
        order: requestData,
        setModalClickedButton,
        status,
        userInfo,
      })
    },
    [hideModal, props, requestData, userInfo]
  )

  if (!requestData) return null

  const fAndB = DepartmentAndServiceKeys.foodAndBeverage.services
  let commonProps = { requestData, blockStatusChange, errorMsg }

  const viewOrderDetail = {
    [fAndB.restaurant.key]: {
      Component: <ViewReservationeOrder {...commonProps} />,
      modalClassName: '',
    },
    [fAndB.roomService.key]: {
      Component: <ViewRoomServiceOrder {...commonProps} />,
      modalClassName: 'room-service-modal',
    },
  }[requestData.serviceKey]

  if (!viewOrderDetail) return null
  console.log(errorMsg)
  return (
    <Modal
      title={translateTextI18N('Order Details')}
      visible={isModalVisible}
      onOk={() => hideModal()}
      onCancel={() => hideModal()}
      className={`orderdetailsModal ${viewOrderDetail.modalClassName} cmnModal`}
      footer={null}
      centered
    >
      {viewOrderDetail.Component}

      <div className='modalFooter'>
        {AdminActionKey in requestData ? null : (
          <>
            <Button
              className='grayBtn'
              key='back'
              onClick={() => handleOnClick(rejectedLable, rejectedLable)}
              loading={savingOrderStatus && modalClickedButton === rejectLabel}
              disabled={savingOrderStatus || blockStatusChange}
            >
              <th>{translateTextI18N(rejectLabel)}</th>
            </Button>
            <Button
              className='blueBtn ml-3 ml-lg-4'
              key='submit'
              onClick={() => handleOnClick(confirmLabel, inProgressLabel)}
              loading={savingOrderStatus && modalClickedButton === confirmLabel}
              disabled={savingOrderStatus || blockStatusChange}
            >
              <th>{translateTextI18N(confirmLabel)}</th>
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}

export default ViewOrder
