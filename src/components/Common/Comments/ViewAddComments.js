import React, { useEffect } from 'react'
import {
  Modal,
  Button,
  Steps,
  Input,
  Form,
  Tooltip,
  Popconfirm,
  message,
} from 'antd'
import {
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  CheckCircleFilled,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import {
  getCurrentRequestInfo,
  UpdateRequestStatus,
  closeCommonModal,
  updateRequestComment,
} from '../../../services/requests'
import { FormatTimestamp } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import _ from 'underscore'
import { auth, timestampNow } from '../../../config/firebase'
import {
  CommentedLabel,
  UpdatedLabel,
  DeletedLabel,
  ReturnedLabel,
  WriteRequestLabel,
  DeferredLabel,
  CanceledLabel,
} from '../../../config/constants'
import { getRequestPath } from '../../../services/user'
import { v4 as uuidv4 } from 'uuid'
import { CommentActivityNotificaion } from '../../../services/notification'
import { actions } from '../../../Store'

const { Step } = Steps
const { TextArea } = Input

function ViewAddComments() {

  const confirmText = 'Are you sure to delete this comment?'
  const [form] = Form.useForm()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const [comment, setComment] = React.useState('')
  const [newComments, setNewComments] = React.useState([])
  const [commentsToShow, setCommentsToShow] = React.useState([])
  const [showLoader, setShowLoader] = React.useState(false)
  const [editMode, setEditMode] = React.useState(false)
  const [selectedCommentRow, setSelectedCommentRow] = React.useState({})
  const [rowUpdated, setRowUpdated] = React.useState(false)
  const {
    commonModalData,
    userInfo,
    hotelId,
    selectedRequest: { comments },
  } = useSelector(state => state)

  let {
    locationName,
    isGuestRequest = false,
    id = '',
    departmentId,
    service,
    roomNumber,
    guest,
    department,
    createdByName,
    fromDepartmentName,
    writeRequest,
    createdBy,
    createdAt,
  } = commonModalData?.data?.row ?? {}
  const requestPath = getRequestPath({
    hotelId,
    departmentId,
    requestId: id,
  })

  useEffect(() => {
    return () => {
      dispatch(actions.setSelectedRequest({}))
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    let tempItems = []
    if (writeRequest) {
      tempItems.push({
        userId: createdBy,
        name: createdByName,
        type: 'Write Request',
        date: createdAt,
        description: writeRequest,
      })
    }
    if (comments?.length > 0) {
      comments.forEach(element => {
        tempItems.push(element)
      })
    }
    setCommentsToShow(tempItems)
    tempItems = tempItems.filter(item => item.type !== 'Write Request')
    setNewComments(tempItems)
    // eslint-disable-next-line
  }, [comments, writeRequest])

  useEffect(() => {
    getCurrentRequestInfo({
      dispatch,
      hotelId,
      departmentId,
      rowId: id,
    })
    // eslint-disable-next-line
  }, [dispatch, id, rowUpdated])

  let title = service
  if (isGuestRequest) {
    if (locationName || roomNumber) {
      title += ' - Room/Location : '
      title += locationName?.length > 0 ? locationName : roomNumber
    }
    title = title + ` - Reported By : ${createdByName ?? guest} `
    if (fromDepartmentName) {
      title = title + ` (${fromDepartmentName}) `
    }
  } else {
    if (locationName) {
      title = title + ' - Room/Location : ' + locationName
    }
    title = title + ` - Reported By : ${createdByName} (${department})`
  }

  function CommentedText(item) {
    return (
      <div className='comment-timeline'>
        <b className='commentedName'>
          {item.userId === userInfo.userId
            ? translateTextI18N('You')
            : item.name}
        </b>
        {item.type === CommentedLabel ? translateTextI18N('Commented on') : ''}
        {item.type === WriteRequestLabel
          ? translateTextI18N('Write request on')
          : ''}
        {item.type === UpdatedLabel
          ? translateTextI18N('Update comment on')
          : ''}
        {item.type === DeletedLabel
          ? translateTextI18N('Deleted comment on')
          : ''}
        {item.type === ReturnedLabel ? translateTextI18N('Returned on') : ''}
        {item.type === DeferredLabel ? translateTextI18N('Deferred on') : ''}
        {item.type === CanceledLabel ? translateTextI18N('Canceled on') : ''}
        <b className='commentedDate'>{FormatTimestamp(item.date)}</b>
        {item.deferredDate && (
          <b style={{ marginLeft: '20px' }} className='commentedDate'>
            To Date - {FormatTimestamp(item.deferredDate)} -{' '}
            {item.deferredTime}
          </b>
        )}

        {item.type === DeletedLabel ? (
          <p style={{ textDecoration: 'line-through' }}>
            {translateTextI18N(item.description)}
          </p>
        ) : (
          <p>{translateTextI18N(item.description)}</p>
        )}
        {item.type !== DeletedLabel &&
          item.type !== ReturnedLabel &&
          item.type !== WriteRequestLabel &&
          item.userId === userInfo.userId ? (
          <>
            <div style={{ float: 'right' }}>
              <Tooltip title='Edit comment'>
                <EditOutlined
                  className='viewlink'
                  style={{ cursor: 'pointer' }}
                  onClick={e => {
                    e.preventDefault()
                    commentEditMode(item)
                  }}
                />
              </Tooltip>
              <Popconfirm
                placement='top'
                title={confirmText}
                onConfirm={e => {
                  e.preventDefault()
                  promptConfirm(item)
                }}
                onCancel={promptCancel}
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
        ) : null}
      </div>
    )
  }

  function CommentItem(item) {
    return item.type === CommentedLabel ||
      UpdatedLabel ||
      DeletedLabel ||
      WriteRequestLabel ||
      ReturnedLabel ? (
      CommentedText(item)
    ) : (
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

  const promptConfirm = async item => {
    setShowLoader(true)
    let filterItem = newComments.find(p => p.id === item.id)
    let newArr = [...newComments]
    let objIndex = newArr.findIndex(obj => obj.id === item.id)
    filterItem = {
      ...filterItem,
      type: DeletedLabel,
      isDeleted: true,
      date: timestampNow(),
    }
    newArr[objIndex] = filterItem

    let userReqUpdateData = { ...commonModalData.data?.row }
    if (commonModalData?.data?.row['comments']) {
      userReqUpdateData['comments'] = newArr
    }
    handleSubmit(userReqUpdateData, DeletedLabel, item.description)
  }

  const promptCancel = () => {
    reset()
  }

  function commentEditMode(item) {
    setSelectedCommentRow(item)
    form.setFieldsValue({ comment: item.description })
    setComment(item.description)
    setEditMode(!editMode)
  }

  async function handleOk() {
    setShowLoader(true)
    const commentType = editMode ? UpdatedLabel : CommentedLabel
    let userReqUpdateData = { ...commonModalData.data?.row }
    let commentData = {
      type: commentType,
      userId: auth?.currentUser?.uid,
      name: userInfo?.name,
      date: timestampNow(),
      description: comment,
      isDeleted: false,
      id: uuidv4(),
    }
    if (editMode) {
      commentData = { ...selectedCommentRow }
      let newArr = [...newComments]
      let objIndex = newArr.findIndex(obj => obj.id === commentData.id)
      commentData = {
        ...commentData,
        date: timestampNow(),
        type: UpdatedLabel,
        description: comment,
      }
      newArr[objIndex] = commentData

      if (commonModalData?.data?.row['comments']) {
        userReqUpdateData['comments'] = newArr
      }
    } else {
      if (newComments) {
        userReqUpdateData['comments'] = [...newComments, commentData]
      } else {
        userReqUpdateData['comments'] = [commentData]
      }
    }
    handleSubmit(userReqUpdateData, commentType, comment)
  }

  async function handleSubmit(userReqUpdateData, commentType, curComment) {
    let res1 = await updateRequestComment(userReqUpdateData)
    if (res1) {
      const success = await UpdateRequestStatus(userReqUpdateData)
      if (success) {
        let payload = {
          requestData: userReqUpdateData,
          activity: commentType,
          userInfo,
          comment: curComment,
          requestPath,
        }
        await CommentActivityNotificaion(payload)

        if (commentType === CommentedLabel) {
          message.success({
            icon: <CheckCircleFilled style={{ color: 'lightgreen' }} />,
            content: (
              <div
                style={{
                  display: 'flex',
                }}
              >
                Comment Added successfully
              </div>
            ),
          })
        } else if (commentType === UpdatedLabel) {
          message.success({
            icon: <CheckCircleFilled style={{ color: 'lightgreen' }} />,
            content: (
              <div
                style={{
                  display: 'flex',
                }}
              >
                Comment Updated successfully
              </div>
            ),
          })
        } else if (commentType === DeletedLabel) {
          message.success({
            icon: <CheckCircleFilled style={{ color: 'lightgreen' }} />,
            content: (
              <div
                style={{
                  display: 'flex',
                }}
              >
                Comment Deleted successfully
              </div>
            ),
          })
        }
        setRowUpdated(!rowUpdated)
        reset()
        setShowLoader(false)
      }
    }
  }

  const reset = () => {
    form.setFieldsValue({ comment: '' })
    setComment('')
    setEditMode(false)
    setSelectedCommentRow({})
  }

  function onCloseModal() {
    closeCommonModal(dispatch)
  }

  return (
    <Modal
      className='cmnModal commentsModal commentsViewModal'
      title={<span style={{ fontSize: '18px' }}>{title}</span>}
      footer={null}
      centered
      visible={commonModalData?.status}
      onOk={() => closeCommonModal(dispatch)}
      onCancel={onCloseModal}
      style={{
        top: 20,
      }}
    >
      <div className='form-group cmnt-view-add-inline'>
        <Form
          layout='inline'
          style={{ alignItems: 'center' }}
          form={form}
          onFinish={handleOk}
        >
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
                value={comment}
                id='comment'
                name='comment'
                rows={2}
                onChange={e => {
                  setComment(e.target.value)
                }}
                maxLength={250}
                placeholder={translateTextI18N('Max 250 Characters...')}
              />

              <div style={{ display: !editMode ? 'none' : null }}>
                <Button
                  onClick={reset}
                  className='viewlink'
                  icon={<CloseOutlined style={{ color: 'white' }} />}
                  type='primary'
                />
              </div>

              <Button
                htmlType='submit'
                className='viewlink'
                icon={<SendOutlined style={{ color: 'white' }} />}
                type='primary'
                loading={showLoader}
              />
            </div>
          </Form.Item>
        </Form>
      </div>
      <div style={{ height: '400px', overflowY: 'scroll' }}>
        {_.clone(commentsToShow)
          ?.sort((a, b) => b?.date?.toDate() - a?.date?.toDate())
          ?.map((item, index) => (
            <CommentItem key={JSON.stringify(item)} {...item} />
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

export default ViewAddComments
