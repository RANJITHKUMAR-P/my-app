import React, { useContext, useEffect, useState } from 'react'
import { Table, Button, message } from 'antd'

import Header from '../../../Common/Header/Header'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'
import { useDispatch, useSelector } from 'react-redux'
import {
  AcceptRejectCheckIn,
  AddGuestListener,
} from '../../../../services/guest'
import PageNamecard from '../../../Common/PageNameCard/PageNameCard'
import { GetCurrentUser } from '../../../../services/user'
import {
  PaginationOptions,
  pendingLable,
  rejectedLable,
  secondsToShowAlert,
} from '../../../../config/constants'
import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import ConfirmationDialog from '../../../Common/ConfirmationDialog/ConfirmationDialog'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import { AdminRequest } from '../../../../services/notification'
import { actions } from '../../../../Store'
import { AuthContext } from '../../../../Router/AuthRouteProvider'
import { getCommonColumns, getFeedbackColumn } from '../../../../config/utils'

const GetButtonTextAndClass = row => {
  const disabled = row.status !== pendingLable ? 'disabled' : ''
  let acceptButtonText = 'ACCEPT'
  let rejectButtonText = 'REJECT'

  if (row.status !== pendingLable) {
    acceptButtonText = ''
    rejectButtonText = ''
    if (row.status === rejectedLable) {
      rejectButtonText = 'REJECTED'
    } else {
      acceptButtonText = 'ACCEPTED'
    }
  }

  return { disabled, acceptButtonText, rejectButtonText }
}

const FrontDeskCheckInOut = () => {
  const { hotelId, userInfo } = useContext(AuthContext)
  const [showLoader, setShowLoader] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [requestId, setRequestId] = useState(false)
  const [requestRoomNumber, setRequestRoomNumber] = useState('')
  const [requestReferenceId, setReferenceId] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [confirmationTitle, setConfirmationTitle] = useState('')
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)

  const { checkInCheckOutRequests, loadingGuests, hotelFeedbacks } =
    useSelector(state => state)

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('1'))
  }, [dispatch])

  useEffect(() => {
    AddGuestListener(hotelId, dispatch)
  }, [dispatch, hotelId])

  const setMessage = (setMessageFunc, messageText) => {
    setMessageFunc(translateTextI18N(messageText ?? ''))
    setTimeout(() => setMessageFunc(''), secondsToShowAlert)
  }

  const acceptRejctClick = async (
    id,
    roomNumber,
    referenceId,
    action,
    title,
    messageText
  ) => {
    setRequestId(id)
    setRequestRoomNumber(roomNumber)
    setReferenceId(referenceId)
    setAccepted(action)
    setConfirmationTitle(title)
    setConfirmationMessage(messageText)
    setShowConfirmationDialog(true)
  }

  const acceptRejectCheckIn = async () => {
    try {
      if (showLoader) return
      setShowConfirmationDialog(false)
      setShowLoader(true)

      const { success, message: acceptCheckInMessage } =
        await AcceptRejectCheckIn(
          hotelId,
          requestId,
          accepted,
          requestRoomNumber,
          checkInCheckOutRequests
        )
      if (success) {
        let status
        let templateName
        if (accepted === true) {
          templateName = 'ACCEPTED_CHECKIN_STATUS'
          status = 'accepted'
        } else {
          templateName = 'REJECTED_CHECKIN_STATUS'
          status = 'rejected'
        }
        const userid = GetCurrentUser().uid
        let template_variables = { '%status%': status }

        AdminRequest(
          templateName,
          template_variables,
          userid,
          requestId,
          hotelId,
          requestReferenceId,
          null,
          userInfo.departmentId
        )

        setMessage(
          setSuccessMessage,
          `Guest check in ${accepted ? 'accepted successfully' : 'rejected'} `
        )
      } else {
        setMessage(setErrorMessage, acceptCheckInMessage)
      }
    } catch (error) {
      message.error(error.message || 'Something went wrong! Please try again!')
    } finally {
      setShowLoader(false)
    }
  }

  const {
    guestFullName,
    serialNumberCol,
    bookingReferanceCol,
    roomNumberCol,
    submittedTimeCol,
  } = getCommonColumns({
    translateTextI18N,
  })

  const { feedbackCol } = getFeedbackColumn({
    translateTextI18N,
    dispatch,
    hotelFeedbacks,
  })

  bookingReferanceCol.width = 130
  roomNumberCol.width = 100
  guestFullName.width = 170

  const frontDeskColumns = [
    serialNumberCol,
    guestFullName,
    roomNumberCol,
    bookingReferanceCol,
    submittedTimeCol,
    {
      title: translateTextI18N('Status'),
      dataIndex: 'Status',
      className: '',
      width: 180,
      render: (_, row) => {
        const { disabled, acceptButtonText, rejectButtonText } =
          GetButtonTextAndClass(row)

        return (
          <div>
            <Button
              className={`statusBtn completedBtn ${disabled}`}
              onClick={() => {
                if (!disabled) {
                  acceptRejctClick(
                    row.id,
                    row.roomNumber,
                    row.bookingReferance,
                    true,
                    'Accept Guest',
                    `Are you sure you want to accept the guest`
                  )
                }
              }}
            >
              {translateTextI18N(acceptButtonText)}
            </Button>
            <Button
              className={`statusBtn rejectBtn ml-2 ${disabled}`}
              onClick={() => {
                if (!disabled) {
                  acceptRejctClick(
                    row.id,
                    row.roomNumber,
                    row.bookingReferance,
                    false,
                    'Reject Guest',
                    `Are you sure you want to reject this request ?`
                  )
                }
              }}
            >
              {translateTextI18N(rejectButtonText)}
            </Button>
          </div>
        )
      },
    },
    feedbackCol,
  ]
  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp' id='frontDeskMain'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='Front Desk'
                breadcrumb={[
                  'Department Admin',
                  'Front Desk',
                  'Check in & Check Out',
                ]}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row ml-2 mb-2' id='frontDeskAlerts'>
                <CustomAlert
                  visible={successMessage}
                  message={successMessage}
                  type='success'
                  showIcon={true}
                />
                <CustomAlert
                  visible={errorMessage}
                  message={errorMessage}
                  type='error'
                  showIcon={true}
                />
              </div>
              <div className='row' id='frontDeskData'>
                <div className='col-12 col-xl-12'>
                  <div className='table-wrp'>
                    <Table
                      columns={frontDeskColumns}
                      dataSource={checkInCheckOutRequests}
                      pagination={PaginationOptions}
                      scroll={{ y: 580 }}
                      loading={showLoader || loadingGuests}
                      rowKey='id'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ConfirmationDialog
        visible={showConfirmationDialog}
        onCancelClick={() => setShowConfirmationDialog(false)}
        onOkClick={acceptRejectCheckIn}
        title={confirmationTitle}
        message={confirmationMessage}
        okButtonText='Confirm'
      />
    </>
  )
}

export default FrontDeskCheckInOut
