import { Modal } from 'antd'
import React from 'react'
import ErrorModal from './ErrorModal'

import SuccessModal from './SuccessModal'

const ResponseModal = ({ visible, title, onCancel, success = true }) => {
  return (
    <>
      <Modal
        visible={visible}
        className='successModal'
        footer={null}
        centered
        onCancel={() => onCancel()}
      >
        {success ? (
          <SuccessModal title={title} />
        ) : (
          <ErrorModal title={title} iconWidth='9' />
        )}
      </Modal>
    </>
  )
}

export default ResponseModal
