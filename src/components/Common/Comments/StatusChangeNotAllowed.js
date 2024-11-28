import { Modal } from 'antd'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closeCommonModal } from '../../../services/requests'
import ErrorModal from '../Modals/ErrorModal'

function StatusChangeNotAllowed() {
  const dispatch = useDispatch()
  const {
    commonModalData: { status, data },
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
        title={`You cannot change the status as it is assigned to ${
          data || 'someone else'
        }.`}
        iconWidth='9'
      />
    </Modal>
  )
}

export default StatusChangeNotAllowed
