import { Modal } from 'antd'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeCommonModal } from '../../../services/requests'
import ErrorModal from '../Modals/ErrorModal'

function YouCannotCancel() {
  const dispatch = useDispatch()
  const {
    commonModalData: { status},
  } = useSelector(state => state)

  return (
    <Modal
      visible={status}
      onCancel={() => closeCommonModal(dispatch)}
      className='successModal'
      footer={null}
      centered
    >
      <ErrorModal
        title={`You don't have permission to cancel this request`}
        iconWidth='9'
      />
    </Modal>
  )
}

export default YouCannotCancel
