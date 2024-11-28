import { Modal } from 'antd'
import React from 'react'
import ErrorModal from '../../Common/Modals/ErrorModal'
import SuccessModal from '../../Common/Modals/SuccessModal'

function StaffSuccessModal({
  getSuccessModalMessage,
  setShowSuccessModal,
  showSuccessModal,
  resStatus = true,
}) {
  return (
    <Modal
      open={showSuccessModal}
      visible={showSuccessModal}
      className='successModal'
      footer={null}
      centered
      onCancel={() => setShowSuccessModal(false)}
    >
      {resStatus ? (
        <SuccessModal title={getSuccessModalMessage()}></SuccessModal>
      ) : (
        <ErrorModal title={getSuccessModalMessage()} iconWidth='9' />
      )}
    </Modal>
  )
}

export default StaffSuccessModal
