/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { useSelector } from 'react-redux'
import QuestionListItem from './QuestionListItem'
import { Sort } from '../../../../config/utils'

export default function OverAllFeedbackQuestionList() {
  const { overAllFeedbackQuestion } = useSelector(state => state)

  return (
    <div className='guidelinesList-wrp'>
      {Sort(Object.values(overAllFeedbackQuestion.data || {}), 'index').map(
        (item, idx) => {
          let data = { idx, ...item }
          return !item.isDelete && <QuestionListItem key={item.id} {...data} />
        }
      )}
    </div>
  )
}
