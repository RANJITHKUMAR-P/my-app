import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Steps } from 'antd'
import { closeCommonModal } from './../../../services/requests'

const { Step } = Steps

function ViewStaffHierarchyLog() {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const { commonModalData } = useSelector(state => state)

  return (
    <Modal
      className='cmnModal commentsModal commentsViewModal'
      title={translateTextI18N(`Error - Please contact admin team`)}
      footer={null}
      centered
      visible={commonModalData?.status}
      onOk={() => closeCommonModal(dispatch)}
      onCancel={() => closeCommonModal(dispatch)}
    >
      <div className='commentbox-wrp'>
        {commonModalData?.data?.map(item => (
          <div className='customSteps' key={item}>
            <Steps progressDot direction='vertical'>
              <Step
                title={
                  <div>
                    <h5>{item}</h5>
                  </div>
                }
              />
            </Steps>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default ViewStaffHierarchyLog
