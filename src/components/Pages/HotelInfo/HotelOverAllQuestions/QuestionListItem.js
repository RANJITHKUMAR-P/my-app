import React, { useCallback, useMemo } from 'react'
import { Button } from 'antd'
import { DeleteFilled, EditFilled } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '../../../../Store'
import { commonModalType } from '../../../../config/constants'
import { deleteHotelOverAllFeedbackQuestion } from '../../../../services/hotels'
import { Sort, deepCloneObject } from '../../../../config/utils'

function QuestionListItem(props) {
  const dispatch = useDispatch()
  const {
    overAllFeedbackQuestion: { activeQuestionCount = 0, data },
  } = useSelector(state => state)
  const { hotelId, id, idx, question, index } = props

  const isMinQuestion = useMemo(
    () => activeQuestionCount < 2,
    [activeQuestionCount]
  )

  const editQuestion = useCallback(
    e => {
      e.preventDefault()

      dispatch(
        actions.setCommonModalData({
          status: true,
          data: { data: { questionId: id }, props: { isEdit: true } },
          type: commonModalType.AddEditOverAllFeedbackQuestionModal,
        })
      )
    },
    [dispatch, id]
  )

  const deleteQuestion = useCallback(
    e => {
      e.preventDefault()
      if (isMinQuestion) return

      const props = {
        onDeleteAPI: async () => {
          let tmpData = deepCloneObject(data || {})

          delete tmpData[id]

          // Update indexes for questions with greater index values
          if (index < 10) {
            for (const itemId in tmpData) {
              const item = tmpData[itemId]
              if (item.index > index) {
                item['updated'] = true
                item.index--
              }
            }
          }

          let updatedQuestionList = Sort(Object.values(tmpData), 'index')

          updatedQuestionList = updatedQuestionList
            .filter(i => i?.updated)
            .map(({ updated, ...rest }) => rest)

          updatedQuestionList = [
            ...updatedQuestionList,
            {
              ...data[id],
              index: '',
              isDelete: true,
            },
          ]

          return await deleteHotelOverAllFeedbackQuestion({
            hotelId,
            updatedQuestionList,
          })
        },
        title: 'Confirm Delete ',
        description: 'Do you want to delete the overall feedback question?',
      }

      dispatch(
        actions.setCommonModalData({
          status: true,
          data: { props },
          type: commonModalType.ConfirmDelete,
        })
      )
    },
    [data, dispatch, hotelId, id, index, isMinQuestion]
  )

  return (
    <>
      <div className='guidelineBox'>
        <div className='guidelineDet'>
          <h5>{question}</h5>
        </div>
        <Button
          type='primary'
          shape='circle'
          icon={<EditFilled />}
          onClick={e => editQuestion(e, props, idx)}
        />
        {activeQuestionCount > 1 && (
          <Button
            type='primary'
            shape='circle'
            icon={<DeleteFilled />}
            disabled={isMinQuestion}
            onClick={e => deleteQuestion(e)}
          />
        )}
      </div>
    </>
  )
}

export default QuestionListItem
