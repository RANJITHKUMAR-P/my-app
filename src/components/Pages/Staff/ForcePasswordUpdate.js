import { useState } from 'react'
import { Button, Modal } from 'antd'
import { useSelector } from 'react-redux'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import DeleteModal from '../../Common/Modals/DeleteModal'

function ForcePasswordUpdate({
  userToDelete,
  visible,
  onCancel,
  forcePasswordUpdateDb,
}) {
  const [loader, setLoader] = useState(false)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { hotelInfo } = useSelector(state => state)

  async function submitClick() {
    setLoader(true)
    const userId = userToDelete.userId
    await forcePasswordUpdateDb({
      user: {
        id: userId,
        userId,
        hotelId: userToDelete.hotelId,
        isForceChangePassword: true,
        resetPasswordByHotelId: hotelInfo.hotelId,
      },
      type: 'reset',
      setLoader,
    })
  }

  return (
    <Modal
      onOk={submitClick}
      onCancel={() => onCancel()}
      className='deleteModal cmnModal'
      footer={null}
      centered
      visible={visible}
    >
      <DeleteModal
        title='Reset Password'
        message='Do you really want to reset password ?'
      />

      <div className='modalFooter'>
        <Button
          className='grayBtn'
          key='back'
          onClick={() => onCancel()}
          disabled={loader}
        >
          {translateTextI18N('Cancel')}
        </Button>

        <Button
          className='blueBtn ml-3 ml-lg-4'
          key='submit'
          onClick={submitClick}
          disabled={loader}
        >
          {translateTextI18N('Confirm')}
        </Button>
      </div>
    </Modal>
  )
}

export default ForcePasswordUpdate
