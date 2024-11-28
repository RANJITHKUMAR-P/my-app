/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Spin } from 'antd'

import OverAllFeedbackQuestionList from './OverAllFeedbackQuestionList'
import { commonModalType, loadProgress } from '../../../../config/constants'
import { hotelOverAllFeedbackQuestionListener } from '../../../../services/hotels'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import { actions } from '../../../../Store'

const HotelOverAllQuestions = () => {
  const {
    hotelInfo,
    overAllFeedbackQuestion: {
      activeQuestionCount = 0,
      loadingStatus = loadProgress.TOLOAD,
    },
  } = useSelector(state => state)

  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  useEffect(() => {
    if (hotelInfo?.hotelId) {
      hotelOverAllFeedbackQuestionListener(dispatch, hotelInfo?.hotelId)
    }
  }, [dispatch, hotelInfo.hotelId])

  const addQuestion = useCallback(
    e => {
      e.preventDefault()

      dispatch(
        actions.setCommonModalData({
          status: true,
          data: { data: null, props: { isEdit: false } },
          type: commonModalType.AddEditOverAllFeedbackQuestionModal,
        })
      )
    },
    [dispatch]
  )

  return (
    <>
      <div className='hotelGuidelines'>
        <div className='guidelinesHaed'>
          <h4>{translateTextI18N('OverAll Feedback Questions')}</h4>
          <Button
            className='cmnBtn'
            onClick={addQuestion}
            disabled={
              loadingStatus !== loadProgress.LOADED || activeQuestionCount >= 10
            }
          >
            {translateTextI18N('Add Question')}
          </Button>
        </div>

        <div className='position-relative'>
          {loadingStatus === loadProgress.LOADED ? (
            <OverAllFeedbackQuestionList />
          ) : (
            <div className='spinnerLoader'>
              <Spin />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default HotelOverAllQuestions
