import React from 'react'
import { Modal, Button, Steps } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { closeCommonModal } from '../../../services/requests'
import { FormatTimestamp, Ternary } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import _ from 'underscore'

const { Step } = Steps

function CommentItem(item) {
  return (
    <div className='customSteps'>
      <Steps progressDot direction='vertical'>
        <Step
          title={
            <div>
              <h5>
                {item.type} by {item.name}
              </h5>
              <h5>{FormatTimestamp(item.date)}</h5>
            </div>
          }
          description={item.description}
        />
      </Steps>
    </div>
  )
}

function ViewComments() {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const { commonModalData } = useSelector(state => state)
  let {
    comments = [],
    writeRequest = '',
    locationName,
    isGuestRequest = false,
  } = commonModalData?.data ?? {}

  return (
    <Modal
      className='cmnModal commentsModal commentsViewModal'
      title={translateTextI18N(
        Ternary(isGuestRequest, 'Comments', 'Comments/Location')
      )}
      footer={null}
      centered
      visible={commonModalData?.status}
      onOk={() => closeCommonModal(dispatch)}
      onCancel={() => closeCommonModal(dispatch)}
    >
      <div className='commentbox-wrp'>
        {writeRequest && (
          <>
            <h6>{translateTextI18N('Description')}</h6>
            <p>{writeRequest}</p>
          </>
        )}
        {Ternary(
          isGuestRequest,
          null,
          <>
            <h6>{translateTextI18N('Location')}</h6>
            <p>{locationName || translateTextI18N('Not Available')}</p>
          </>
        )}

        {_.clone(comments)
          ?.sort((a, b) => b?.date?.toDate() - a?.date?.toDate())
          ?.map((item, index) => (
            <CommentItem key={index} {...item} />
          ))}
      </div>
      <div className='modalFooter-center'>
        <Button
          className='blueBtn'
          key='submit'
          onClick={e => {
            e.preventDefault()
            closeCommonModal(dispatch)
          }}
        >
          {translateTextI18N('Close')}
        </Button>
      </div>
    </Modal>
  )
}

export default ViewComments
