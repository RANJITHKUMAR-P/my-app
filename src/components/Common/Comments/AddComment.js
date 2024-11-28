import React from 'react'
import { Modal, Button, Form, Input, TimePicker, DatePicker } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import {
  closeCommonModal,
  updateRequestComment,
} from '../../../services/requests'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { auth, timestampNow } from '../../../config/firebase'
import { FormatDate, sendNotification } from '../../../config/utils'
import {HotelAdminRole} from '../../../config/constants'
const { TextArea } = Input

function AddComment() {
  const dispatch = useDispatch()
  const [comment, setComment] = React.useState('')
  const [time, setTime] = React.useState('')
  const [date, setDate] = React.useState('')
  const [showLoader, setShowLoader] = React.useState(false)

  const { commonModalData, userInfo } = useSelector(state => state)
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const hideModal = () => closeCommonModal(dispatch)

  async function handleOk() {
    let typeLabel = commonModalData?.data?.data?.status
    setShowLoader(true)
    let commentData = {
      type: typeLabel, //dynamic type cancel or defer status
      userId: auth?.currentUser?.uid,
      name: userInfo?.name,
      date: timestampNow(),
      description: comment,
      deferredTime: time,
      deferredDate: date,
    }
    let userReqUpdateData = { ...commonModalData.data.data }
    if (commonModalData?.data?.data?.['comments']) {
      userReqUpdateData['comments'] = [
        ...commonModalData.data.data['comments'],
        commentData,
      ]
    } else {
      userReqUpdateData['comments'] = [commentData]
    }

    userReqUpdateData['reasonForReturn'] = commentData.description
    userReqUpdateData['loggedUserName'] = userInfo?.name
    let notificationProps = {
      requestId: userReqUpdateData.requestId,
      updatedStatus: userReqUpdateData.status,
      serviceName: userReqUpdateData.service,
      requestReferenceId: userReqUpdateData.bookingReferance,
      guestId: userReqUpdateData.guestId,
      hotelId: userReqUpdateData.hotelId,
      requestType: userReqUpdateData.requestType,
      rowIndex: userReqUpdateData.srNo,
      userInfo,
      userReqUpdateData,
    }

    let res = await updateRequestComment(userReqUpdateData)

    if (res) {
      if (userReqUpdateData.status === 'Canceled') {
        if (userReqUpdateData.from === 'guest' && userInfo.departmentId !== 'management') {
          // Request is from guest, send notification
          sendNotification(notificationProps);
        } else if (userReqUpdateData.from === 'HOP' && userInfo?.roles?.[0] === HotelAdminRole) {
          // Request is from HOP and user role is hotel admin, send notification
          sendNotification(notificationProps);
        }
      }
      commonModalData?.data?.handleStatusChange(userReqUpdateData)
      hideModal()
      setShowLoader(false)
    }
  }

  return (
    <Modal
      className='cmnModal commentsModal'
      title='Add Comment'
      footer={null}
      centered
      visible={commonModalData?.status}
      onOk={hideModal}
      onCancel={hideModal}
    >
      <Form layout='vertical' onFinish={handleOk}>
        {commonModalData?.data?.data?.status === 'Deferred' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Item
                id='time'
                name='time'
                rules={[{ required: true, message: 'Time is mandatory!' }]}
              >
                <TimePicker
                  id='time'
                  key={'timeKey'}
                  name='time'
                  onChange={e => {
                    const inputDate = new Date(e._d)
                    const formattedTime = `${inputDate.getHours()}:${String(
                      inputDate.getMinutes()
                    ).padStart(2, '0')}`
                    setTime(formattedTime)
                  }}
                  format='HH:mm'
                  style={{ marginRight: '8px' }}
                />
              </Form.Item>
              <Form.Item
                id='date'
                name='date'
                rules={[{ required: true, message: 'Date is mandatory!' }]}
              >
                <DatePicker
                  key={'dateKey'}
                  name='date'
                  onChange={e => {
                    const formattedDate = FormatDate(e)
                    setDate(formattedDate)
                  }}
                  id='date'
                />
              </Form.Item>
            </div>
          </>
        )}
        <div className='row'>
          <div className='col-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                id='comment'
                name='comment'
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || value.trim() === '') {
                        return Promise.reject('Comment is mandatory!');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <TextArea
                  id='comment'
                  name='comment'
                  rows={10}
                  onChange={e => {
                    setComment(e.target.value)
                  }}
                  placeholder={translateTextI18N('Comments...')}
                />
              </Form.Item>
            </div>
          </div>
        </div>

        <div className='modalFooter' id='mdFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={() => {
              closeCommonModal(dispatch)
            }}
            id='mdFooterCancel'
            disabled={showLoader && comment.length === 0}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            htmlType='submit'
            key='submit'
            loading={showLoader}
            disabled={showLoader && comment.length === 0}
            id='mdFooterSubmit'
          >
            {translateTextI18N('Submit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddComment
