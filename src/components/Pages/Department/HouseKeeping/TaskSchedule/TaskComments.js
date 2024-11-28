import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Input, Tooltip, Popconfirm, message } from 'antd'
import {
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  CheckCircleFilled,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import firebase from 'firebase/app'
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { useCustomI18NTranslatorHook } from '../../../../../utility/globalization'
import { Collections } from '../../../../../config/constants'
import { getRequestPath } from '../../../../../services/user'
import { CommentActivityNotificaion } from '../../../../../services/notification'

const { TextArea } = Input

const TaskComments = ({
  visible,
  onCancel,
  task,
  isStatusChange,
  setStatusChangeComment,
  onStatusChange,
  changingStatus,
  getTitleFunction,
}) => {
  const [form] = Form.useForm()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedComment, setSelectedComment] = useState(null)
  const { hotelInfo, userInfo } = useSelector(state => state)
  const [note, setNote] = useState('')
  const hotelId = hotelInfo.hotelId
  const departmentId = task?.departmentId
  const id = task?.id
  const requestPath = getRequestPath({
    hotelId,
    departmentId,
    requestId: id,
  })

  useEffect(() => {
    if (visible && task && !isStatusChange) {
      fetchComments()
    }
  }, [visible, task, isStatusChange])

  const fetchComments = async () => {
    try {
      const db = firebase.firestore()
      const querySnapshot = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('hotelId', '==', hotelInfo.hotelId)
        .where('departmentKey', '==', task.departmentKey)
        .where('serviceKey', '==', task.serviceKey)
        .where('requestId', '==', task.docId || task.id)
        .get()

      if (!querySnapshot.empty) {
        const taskDoc = querySnapshot.docs[0]
        const taskData = taskDoc.data()
        setComments(taskData.comments || [])
        setNote(taskData.note || '')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleAddComment = async values => {
    try {
      setLoading(true)
      if (isStatusChange) {
        await onStatusChange(
          task.docId || task.id,
          changingStatus,
          values.comment
        )
        onCancel() // Close the modal
      } else {
        const newComment = {
          id: uuidv4(),
          staffId: userInfo.id || 'unknown',
          staffName: userInfo.name || 'Unknown Staff',
          date: firebase.firestore.Timestamp.now(),
          description: values.comment,
          type: 'Commented',
        }
        const db = firebase.firestore()

        if (
          !hotelInfo.hotelId ||
          !task.departmentKey ||
          !task.serviceKey ||
          (!task.docId && !task.id)
        ) {
          console.error('Missing required fields:', {
            hotelId: hotelInfo.hotelId,
            departmentKey: task.departmentKey,
            serviceKey: task.serviceKey,
            requestId: task.docId || task.id,
          })
          throw new Error('Missing required fields for query')
        }

        let query = db
          .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
          .where('hotelId', '==', hotelInfo.hotelId)

        if (task.departmentKey)
          query = query.where('departmentKey', '==', task.departmentKey)
        if (task.serviceKey)
          query = query.where('serviceKey', '==', task.serviceKey)
        if (task.docId || task.id)
          query = query.where('requestId', '==', task.docId || task.id)

        const querySnapshot = await query.get()

        if (!querySnapshot.empty) {
          const taskDoc = querySnapshot.docs[0]
          const currentComments = taskDoc.data().comments || []
          const updatedComments = [...currentComments, newComment]

          await taskDoc.ref.update({
            comments: updatedComments,
          })

          setComments(prevComments => [...prevComments, newComment])
          let payload = {
            requestData: taskDoc.data(),
            activity: 'Daily To-Do Task',
            userInfo,
            comment: values.comment,
            requestPath,
          }
          await CommentActivityNotificaion(payload)
          form.resetFields()
          message.success({
            icon: <CheckCircleFilled style={{ color: 'lightgreen' }} />,
            content: 'Comment added successfully',
          })
        } else {
          throw new Error('No matching document found')
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      message.error(
        isStatusChange ? 'Failed to update status' : 'Failed to add comment'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEditComment = async () => {
    try {
      setLoading(true)
      const updatedComment = {
        ...selectedComment,
        description: form.getFieldValue('comment'),
        date: firebase.firestore.Timestamp.now(),
        type: 'Updated',
      }

      const updatedComments = comments.map(c =>
        c.id === updatedComment.id ? updatedComment : c
      )

      const db = firebase.firestore()
      const querySnapshot = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('hotelId', '==', hotelInfo.hotelId)
        .where('departmentKey', '==', task.departmentKey)
        .where('serviceKey', '==', task.serviceKey)
        .where('requestId', '==', task.docId || task.id)
        .get()

      if (!querySnapshot.empty) {
        const taskDoc = querySnapshot.docs[0]
        await taskDoc.ref.update({ comments: updatedComments })

        setComments(updatedComments)
        resetForm()
        message.success({
          icon: <CheckCircleFilled style={{ color: 'lightgreen' }} />,
          content: 'Comment updated successfully',
        })
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      message.error('Failed to update comment')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async comment => {
    try {
      setLoading(true)
      const updatedComments = comments.filter(c => c.id !== comment.id)

      const db = firebase.firestore()
      const querySnapshot = await db
        .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .where('hotelId', '==', hotelInfo.hotelId)
        .where('departmentKey', '==', task.departmentKey)
        .where('serviceKey', '==', task.serviceKey)
        .where('requestId', '==', task.docId || task.id)
        .get()

      if (!querySnapshot.empty) {
        const taskDoc = querySnapshot.docs[0]
        await taskDoc.ref.update({ comments: updatedComments })

        setComments(updatedComments)
        message.success({
          icon: <CheckCircleFilled style={{ color: 'lightgreen' }} />,
          content: 'Comment deleted successfully',
        })
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      message.error('Failed to delete comment')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    form.resetFields()
    setEditMode(false)
    setSelectedComment(null)
  }

  const CommentItem = ({ comment }) => (
    <div className='comment-timeline'>
      {comment.type === 'Note' ? (
        <>
          <b className='commentedName'>Notes</b>
          <p>{comment.description}</p>
        </>
      ) : (
        <>
          <b className='commentedName'>
            {comment.staffId === task.staffId ? 'You' : comment.staffName}
          </b>
          {comment.type.startsWith('Status changed') ? (
            <span>{comment.type} on </span>
          ) : (
            <span>
              {comment.type === 'Commented'
                ? ' commented on '
                : ' updated comment on '}
            </span>
          )}
          <b className='commentedDate'>
            {moment(comment.date.toDate()).format('DD MMM YYYY - hh:mm A')}
          </b>
          <p>{comment.description}</p>
          <div style={{ float: 'right' }}>
            <Tooltip title='Edit comment'>
              <EditOutlined
                className='viewlink'
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setEditMode(true)
                  setSelectedComment(comment)
                  form.setFieldsValue({ comment: comment.description })
                }}
              />
            </Tooltip>
            <Popconfirm
              placement='top'
              title='Are you sure to delete this comment?'
              onConfirm={() => handleDeleteComment(comment)}
              okText='Yes'
              cancelText='No'
            >
              <DeleteOutlined
                className='viewlink'
                style={{ cursor: 'pointer' }}
              />
            </Popconfirm>
          </div>
        </>
      )}
    </div>
  )

  const constructTitle = () => {
    let title = task?.service || 'Task'

    if (task?.location) {
      title += ` - Room/Location: ${task.location}`
    }

    if (task?.staffName) {
      title += ` - Reported By: ${task.staffName}`
    }

    if (task?.department) {
      title += ` (${task.department})`
    }

    return title
  }

  const modalTitle = getTitleFunction
    ? getTitleFunction(task)
    : constructTitle()

  const renderModalContent = () => {
    if (isStatusChange) {
      return (
        <Form layout='vertical' onFinish={handleAddComment}>
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
                          return Promise.reject('Comment is mandatory!')
                        }
                        return Promise.resolve()
                      },
                    },
                  ]}
                >
                  <TextArea
                    id='comment'
                    name='comment'
                    rows={10}
                    onChange={e => {
                      setStatusChangeComment(e.target.value)
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
              onClick={onCancel}
              id='mdFooterCancel'
              disabled={loading}
            >
              {translateTextI18N('Cancel')}
            </Button>

            <Button
              className='blueBtn ml-3 ml-lg-4'
              htmlType='submit'
              key='submit'
              loading={loading}
              disabled={loading}
              id='mdFooterSubmit'
            >
              {translateTextI18N('Submit')}
            </Button>
          </div>
        </Form>
      )
    } else {
      return (
        <>
          <div className='form-group cmnt-view-add-inline'>
            <Form
              form={form}
              onFinish={editMode ? handleEditComment : handleAddComment}
              layout='inline'
              style={{ alignItems: 'center' }}
            >
              <Form.Item
                name='comment'
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || value.trim() === '') {
                        return Promise.reject('Comment is mandatory!')
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
                style={{ width: editMode ? '88%' : '92%' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <TextArea
                    rows={2}
                    maxLength={250}
                    placeholder={translateTextI18N('Max 250 Characters...')}
                  />
                  {editMode && (
                    <Button
                      onClick={resetForm}
                      className='viewlink'
                      icon={<CloseOutlined style={{ color: 'white' }} />}
                      type='primary'
                    />
                  )}
                  <Button
                    htmlType='submit'
                    className='viewlink'
                    icon={<SendOutlined style={{ color: 'white' }} />}
                    type='primary'
                    loading={loading}
                  />
                </div>
              </Form.Item>
            </Form>
          </div>

          <div style={{ height: '400px', overflowY: 'scroll' }}>
            {note && (
              <div className='comment-timeline'>
                <b className='commentedName'>Notes</b>
                <p>{note}</p>
              </div>
            )}
            {comments
              .sort((a, b) => b.date.toDate() - a.date.toDate())
              .map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
          </div>

          <div className='modalFooter-center'>
            <Button className='blueBtn' onClick={onCancel}>
              {translateTextI18N('Close')}
            </Button>
          </div>
        </>
      )
    }
  }

  return (
    <Modal
      className={`cmnModal commentsModal ${
        isStatusChange ? '' : 'commentsViewModal'
      }`}
      title={
        isStatusChange ? (
          'Add Comment'
        ) : (
          <span style={{ fontSize: '18px' }}>{modalTitle}</span>
        )
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      closable={true}
    >
      {renderModalContent()}
    </Modal>
  )
}

export default TaskComments
