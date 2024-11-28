import { Button, Modal } from 'antd'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { WarningOutlined } from '@ant-design/icons'

function ForceLogout({ visible, onCancel, onSubmit }) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <Modal
      onCancel={() => onCancel()}
      className='deleteModal warningModal cmnModal'
      footer={null}
      centered
      visible={visible}
    >
      <div className='deletetext-wrp'>
        <h2>{translateTextI18N('Change Password')}</h2>
        <h6>
          <WarningOutlined />
          {translateTextI18N(
            'The action will invalidate your current session and you will need to relogin'
          )}
        </h6>
      </div>

      <div className='modalFooter'>
        <Button className='grayBtn' key='back' onClick={() => onCancel()}>
          {translateTextI18N('Cancel')}
        </Button>

        <Button
          className='blueBtn ml-3 ml-lg-4'
          key='submit'
          onClick={() => onSubmit()}
        >
          {translateTextI18N('Confirm')}
        </Button>
      </div>
    </Modal>
  )
}

export default ForceLogout
