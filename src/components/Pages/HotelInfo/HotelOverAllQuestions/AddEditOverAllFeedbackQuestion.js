import { Button, Form, Input, Modal } from 'antd'

import { useDispatch, useSelector } from 'react-redux'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import { Ternary, useIsMountedRef } from '../../../../config/utils'
import { actions } from '../../../../Store'
import { defaultCommonModalData } from '../../../../config/constants'
import { viewResponseModal } from '../../../../services/requests'
import { saveHotelOverAllFeedbackQuestion } from '../../../../services/hotels'

function AddEditOverAllFeedbackQuestion() {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { hotelInfo, commonModalData, overAllFeedbackQuestion } = useSelector(
    state => state
  )
  const hotelId = hotelInfo.hotelId

  const { data = null } = commonModalData

  let questionId = useMemo(() => {
    let questId = ''
    if (data?.data?.questionId) {
      questId = data.data.questionId
    }
    return questId
  }, [data])

  const resetModalField = useCallback(() => {
    setQuestion('')

    form.resetFields([])
    form.setFieldsValue({ question: '' })
  }, [form])

  const closeModal = useCallback(() => {
    resetModalField()
    dispatch(actions.setCommonModalData(defaultCommonModalData))
  }, [dispatch, resetModalField])

  const isMountedRef = useIsMountedRef()

  useEffect(() => {
    if (isMountedRef.current && data?.props?.isEdit && questionId) {
      const currQuestion = overAllFeedbackQuestion.data?.[questionId]?.question
      form.setFieldsValue({ question: currQuestion })
      setQuestion(currQuestion)
    }
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (!isMountedRef.current) {
        resetModalField()
      }
    }
  }, [
    data?.props?.isEdit,
    form,
    isMountedRef,
    overAllFeedbackQuestion.data,
    questionId,
    resetModalField,
  ])

  const onFinish = useCallback(async () => {
    try {
      setIsLoading(true)

      let data = { question }

      if (!questionId) {
        const indexes = Object.values(overAllFeedbackQuestion.data || {}).map(
          i => i.index
        )
        let maxIndex = Math.max(...indexes)
        data['index'] = ++maxIndex
      }

      const { success, message } = await saveHotelOverAllFeedbackQuestion({
        hotelId,
        questionId,
        data,
      })

      setTimeout(() => {
        viewResponseModal({
          dispatch,
          data: { status: success, message },
        })
      }, 10)

      if (success) {
        closeModal()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [
    closeModal,
    dispatch,
    hotelId,
    overAllFeedbackQuestion.data,
    question,
    questionId,
  ])

  const onQuestionChange = useCallback(e => {
    e.preventDefault()
    setQuestion(e.target.value)
  }, [])

  return (
    <Modal
      title={translateTextI18N(
        `${Ternary(questionId, 'Edit', 'Add')} OverAll Feedback Question`
      )}
      visible={commonModalData?.status}
      centered
      onOk={closeModal}
      onCancel={closeModal}
      className='addLocationmodal cmnModal'
      footer={null}
      maskClosable={false}
    >
      <Form
        layout='vertical'
        initialValues={{ question }}
        onFinish={onFinish}
        footer={null}
        form={form}
      >
        <div className='row' id='myprofile-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Question')}
                name='question'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please enter your question'),
                  },
                  () => ({
                    validator(_, value) {
                      if (
                        Object.values(overAllFeedbackQuestion.data || {})?.find(
                          q => q?.question === value
                        )
                      ) {
                        return Promise.reject(
                          translateTextI18N('Question already exist.')
                        )
                      }

                      return Promise.resolve()
                    },
                  }),
                ]}
                value={question}
                id='question'
              >
                <Input
                  id='question'
                  value={question}
                  onChange={onQuestionChange}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={closeModal}
            disabled={isLoading}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            htmlType='submit'
            disabled={
              Object.values(overAllFeedbackQuestion.data || {})?.find(
                q => q?.question === question
              ) || isLoading
            }
          >
            {translateTextI18N('Submit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddEditOverAllFeedbackQuestion
