import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { useDispatch, useSelector } from 'react-redux'
import { Modal } from 'antd'
import { closeCommonModal } from '../../../services/requests'

function ViewModal() {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const { commonModalData } = useSelector(state => state)
  const { text = '', heading = '' } = commonModalData.data
  return (
    <Modal
      className='cmnModal commentsModal commentsViewModal'
      title={translateTextI18N(heading)}
      footer={null}
      centered
      visible={commonModalData?.status}
      onOk={() => closeCommonModal(dispatch)}
      onCancel={() => closeCommonModal(dispatch)}
    >
      <div className='commentbox-wrp'>{text}</div>
    </Modal>
  )
}

export default ViewModal
