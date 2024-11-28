import { Button, message, Modal } from 'antd'
import React, { useState } from 'react'
import { Ternary } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import AxiosHelper from '../../../utility/axiosHelper'
import { APIs, secondsToShowAlert } from '../../../config/constants'

function ConfirmResend({
  resendModalVisible,
  setResendModalVisible,
  setShowSuccessModal,
  setSuccessMessage,
  userToDelete,
}) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [resendNotifyLoader, setResendNotifyLoader] = useState(false)

  const resendNotify = () => {
    setResendNotifyLoader(true)

    AxiosHelper.post(APIs.GENERATE_TOKEN, {
      grantFor: 'NEW_STAFF',
      userId: userToDelete.id,
      hotelId: userToDelete.hotelId,
    })
      .then(() => {
        setResendNotifyLoader(false)
        setResendModalVisible(false)

        setSuccessMessage('Successfully Sent')
        setShowSuccessModal(true)
        setTimeout(() => {
          setShowSuccessModal(false)
          setSuccessMessage('')
        }, secondsToShowAlert)
      })
      .catch(err => {
        setResendNotifyLoader(false)
        setResendModalVisible(false)
        message.error(err)
      })
  }

  return (
    <Modal
      onOk={resendNotify}
      onCancel={() => setResendModalVisible(false)}
      className='deleteModal cmnModal'
      footer={null}
      centered
      visible={resendModalVisible}
    >
      <div className='deletetext-wrp'>
        <h2>{translateTextI18N('Confirm Resend')}</h2>
        <h6>
          {translateTextI18N(
            Ternary(
              userToDelete && !userToDelete.isEmailUser,
              'Do you really want to resend sms to confirm account',
              'Do you really want to resend email to confirm account'
            )
          )}
        </h6>
      </div>

      <div className='modalFooter'>
        <Button
          className='grayBtn'
          key='back'
          onClick={() => setResendModalVisible(false)}
        >
          {translateTextI18N('Cancel')}
        </Button>

        <Button
          className='blueBtn ml-3 ml-lg-4'
          loading={resendNotifyLoader}
          key='submit'
          onClick={resendNotify}
        >
          {translateTextI18N('Resend')}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmResend
