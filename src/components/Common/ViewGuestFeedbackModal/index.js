import React, { useMemo } from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, Skeleton } from 'antd'
import { closeCommonModal } from '../../../services/requests'
import { Ternary, formatDateAndTime } from '../../../config/utils'
import RatingList from '../Rating/RatingList'
import { actions } from '../../../Store'

function ViewGuestFeedbackModal() {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const {
    commonModalData,
    hotelFeedbacks,
    feedbackQuestionnaire,
    feedbackLoading,
  } = useSelector(state => state)
  const { status = false, data = null } = commonModalData
  const guestId = useMemo(() => data?.id || data?.guestId, [data])

  const {
    calcAvgRating = 0,
    feedback = '',
    feedBackDateTime = null,
  } = useMemo(() => {
    let data = {
      calcAvgRating: 0,
      feedback: '',
      feedBackDateTime: null,
    }

    if (!hotelFeedbacks?.data?.[guestId]) return data

    let hotelFeedbackData = hotelFeedbacks.data[guestId]

    data = { ...hotelFeedbackData }
    data.feedBackDateTime = formatDateAndTime(
      hotelFeedbackData.feedBackDateTime
    )

    return data
  }, [guestId, hotelFeedbacks.data])
  const checkedInTime = formatDateAndTime(data.checkedInTime)
  const checkedOutTime = formatDateAndTime(data.checkedOutTime)

  function closeClicked() {
    closeCommonModal(dispatch)
    dispatch(actions.setFeedbackQuestionnaire([]))
  }

  return (
    <Modal
      className='cmnModal commentsModal commentsViewModal'
      title={translateTextI18N('Overall Feedback')}
      footer={null}
      centered
      visible={status}
      onOk={() => closeClicked()}
      onCancel={() => closeClicked()}
    >
      <Skeleton loading={feedbackLoading}>
        <div className='d-flex justify-content-around'>
          <div>
            <p>Guest Name:</p>
            <p>{data.fullName}</p>
          </div>
          <div>
            <p>Check-in Date:</p>
            <p>{checkedInTime}</p>
          </div>
          <div>
            <p>Check-out Date:</p>
            <p>{checkedOutTime}</p>
          </div>
        </div>
        <div className='d-flex justify-content-around mt-5'>
          <div className='commentbox-wrp'>
            <h6>{translateTextI18N('Feedback Rating')} </h6>
            {feedbackQuestionnaire.map(i => {
              return (
                <>
                  <p>{translateTextI18N(i.question)}</p>
                  <p>
                    <RatingList selecteRating={i.rating} />
                  </p>
                </>
              )
            })}
          </div>
          <div className='commentbox-wrp'>
            <h6>{translateTextI18N('Overall Rating')} </h6>
            <p>
              {Ternary(
                calcAvgRating,
                <RatingList selecteRating={calcAvgRating} />
              )}
            </p>
            <h6>{translateTextI18N('Feedback comment')} </h6>
            <p>{Ternary(feedback, feedback, '')}</p>
            <h6> {translateTextI18N('Feedback Time')} </h6>
            <p>
              {Ternary(
                feedBackDateTime,
                formatDateAndTime(feedBackDateTime),
                ''
              )}
            </p>
          </div>
        </div>
      </Skeleton>
    </Modal>
  )
}

export default ViewGuestFeedbackModal
