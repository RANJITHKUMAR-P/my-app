import React from 'react'
import { Button, Modal } from 'antd'

import DeleteModal from '../Modals/DeleteModal'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const ConfirmationDialog = props => {
  const {
    visible,
    onCancelClick,
    onOkClick,
    title,
    message,
    cancelButtonText = 'Cancel',
    okButtonText = 'Ok',
    isDisable = false,
  } = props
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <Modal
      onCancel={onCancelClick}
      className='deleteModal cmnModal'
      footer={null}
      centered
      visible={visible}
    >
      <DeleteModal title={title} message={message} {...props} />
      <div className='modalFooter-center'>
        <Button
          className='blueBtn'
          key='submit'
          onClick={onOkClick}
          disabled={isDisable}
        >
          {translateTextI18N(okButtonText)}
        </Button>
        <Button
          className='grayBtn ml-3 ml-lg-4'
          key='back'
          onClick={onCancelClick}
          disabled={isDisable}
        >
          {translateTextI18N(cancelButtonText)}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmationDialog
