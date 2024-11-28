/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from 'react'
import { Popover, Button, Badge } from 'antd'
import ReactHtmlParser from 'react-html-parser'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  AddNotificationsListener,
  UpdateNotification,
} from '../../../services/notification'
import { GetCurrentUser } from '../../../services/user'
import { FormatTimeago, getImage } from '../../../config/utils'
import { actions } from '../../../Store'
import {
  DEPARTMENT_REDIRECTION,
  ADMIN_REDIRECTION,
  notificationTypes,
} from '../../../config/constants'
import DepartmentAndServiceKeys from '../../../config/departmentAndServicekeys'

const NotificationItem = ({ index, element, defaultRequestType, openMenu }) => {
  return (
    <li
      key={index}
      onClick={() => openMenu(element)}
      className={element.readStatus ? '' : 'new'}
      style={{ cursor: 'pointer' }}
    >
      <div className='notificationtext'>
        {element.notificationType === 'RECURRING_REQUEST'
          ? defaultRequestType[element.notificationType]
          : element.notificationType === 'COMMENT_RECURRING_REQUEST'
          ? defaultRequestType[element.notificationType]
          : element.notificationType === 'REASSIGN_RECURRING_REQUEST'
          ? defaultRequestType[element.notificationType]
          : element.notificationType === 'STATUS_UPDATE_RECURRING_REQUEST'
          ? defaultRequestType[element.notificationType]
          : element.requestType
          ? defaultRequestType[element.requestType]
          : null}
        <div></div>
        {/* <strong>{ReactHtmlParser(element.message)}</strong> */}
        <div>{ReactHtmlParser(element.message)}</div>
        <span>{FormatTimeago(element.createdAt)} </span>
      </div>
    </li>
  )
}

const Notifications = ({ isHotelAdmin, userInfo = {} }) => {
  const {
    notifications,
    sideMenuOpenKeys,
    departmentAndServiceIdToInfo,
    servicesNew,
    isCustomDepartmentLogin,
    hotelInfo,
  } = useSelector(state => state)
  const [notificationCount, setNotificationCount] = useState('')

  const dispatch = useDispatch()
  const history = useHistory()

  const userid = GetCurrentUser() ? GetCurrentUser().uid : null

  useEffect(() => {
    AddNotificationsListener(userid, hotelInfo.hotelId, dispatch)
  }, [dispatch, userid, hotelInfo.hotelId])

  useEffect(() => {
    setNotificationCount(
      notifications.filter(request => request.readStatus === false).length
    )
  }, [notifications])

  function getServiceType({ element, serviceType }) {
    if (element?.requestPath) {
      const requestPathSplit = element?.requestPath.split('/')
      const deptId = requestPathSplit[3]
      const deptKey = departmentAndServiceIdToInfo[deptId].key

      if (!servicesNew?.[deptId]) return serviceType

      const service = servicesNew[deptId].find(i => i.name === serviceType)

      if (!service && deptKey != 'front-desk') {
        serviceType = 'more-request'
        return serviceType
      }

      const frontDesk = DepartmentAndServiceKeys.frontDesk
      const houseKeeping = DepartmentAndServiceKeys.houseKeeping

      if (frontDesk.key === deptKey) {
        const type = service?.frontDeskServiceType || null

        if (!type || type === frontDesk.type.OtherRequest) {
          serviceType = 'other'
        }
      } else if (houseKeeping.key === deptKey) {
        if (!service.default) {
          serviceType = 'housekeeping-morerequest'
        }
      } else {
        if (!service.default) {
          serviceType = 'more-request'
        }
      }
    }

    return serviceType
  }
  const openMenu = async element => {
    if (!element.readStatus) {
      let readstatus = true
      UpdateNotification(element.id, readstatus, userid)
    }

    if (
      ['escalation', 'warning'].includes(
        element?.notificationType?.toLowerCase()
      )
    ) {
      return
    }

    let serviceType, requestType
    let notificationTypesArr = Object.values(notificationTypes).map(i =>
      i.toUpperCase()
    )

    if ([...notificationTypesArr].includes(element?.notificationType)) {
      serviceType = element?.serviceType

      requestType = [
        'room service',
        'restaurant',
        'gym',
        'saloon',
        'spa',
      ].includes(element?.serviceType?.toLowerCase())
        ? element?.serviceType
        : element?.notificationType
    } else if (element?.notificationType === 'CHECKIN') {
      serviceType = 'CHECKIN'
      requestType = element?.notificationType
    }

    let redirection
    if (userInfo && userInfo.isDepartmentAdmin && !isCustomDepartmentLogin) {
      serviceType = getServiceType({ element, serviceType })
      redirection = DEPARTMENT_REDIRECTION[serviceType?.toLowerCase()]
    } else if (isCustomDepartmentLogin) {
      if (element?.notificationType === 'GUEST_FEEDBACK') {
        redirection = DEPARTMENT_REDIRECTION?.['FrontDeskGuest']
      } else {
        redirection = DEPARTMENT_REDIRECTION[requestType]
        if (!redirection && typeof element?.isGuestRequest === 'boolean') {
          redirection =
            DEPARTMENT_REDIRECTION[
              element?.isGuestRequest ? 'GUEST_REQUEST' : 'DEPARTMENT_REQUEST'
            ]
        }
      }
    } else if (isHotelAdmin) {
      if (element.notificationType === 'GUEST_FEEDBACK') {
        redirection = ADMIN_REDIRECTION['checkin']
      } else {
        redirection = ADMIN_REDIRECTION[requestType?.toLowerCase()]
      }
    }

    if (
      element?.notificationType === 'RECURRING_REQUEST' ||
      element?.notificationType === 'COMMENT_RECURRING_REQUEST' ||
      element?.notificationType === 'REASSIGN_RECURRING_REQUEST' ||
      element?.notificationType === 'STATUS_UPDATE_RECURRING_REQUEST'
    ) {
      redirection = DEPARTMENT_REDIRECTION?.['HouseKeepingTimeScheduler']
    }

    if (isHotelAdmin && !sideMenuOpenKeys?.includes('sub2')) {
      dispatch(actions.setSideMenuOpenKeys('sub2'))
    }
    history.push(redirection)
    dispatch(actions.setCurrentroute(redirection))
  }

  const defaultRequestType = {
    Urgent: <div className='urgentatg'>Urgent</div>,
    Escalation: <div className='escalationtag'>Escalated</div>,
    Warning: <div className='warningtag'>Warning</div>,
    Deferred: <div className='deferredtag'>Deferred</div>,
    Canceled: <div className='canceledtag'>Canceled</div>,
    Jobreturn: <div className='jobreturntag'>Jobreturn</div>,
    Reminder: <div className='remindertag'>Reminder</div>,
    RECURRING_REQUEST: <div className='recurringtag'>Daily TO-DO Task</div>,
    COMMENT_RECURRING_REQUEST: <div className='recurringCommenttag'>COMMENT</div>,
    REASSIGN_RECURRING_REQUEST: <div className='recurringReassigntag'>STAFF ASSIGNED</div>,
    STATUS_UPDATE_RECURRING_REQUEST: <div className='recurringStatusUpdatetag'>STATUS UPDATED</div>,
  }

  const content2 = (
    <ul className='list-unstyled'>
      {notifications.map((element, index) => (
        <NotificationItem
          key={index}
          index={index}
          element={element}
          defaultRequestType={defaultRequestType}
          openMenu={openMenu}
        />
      ))}
    </ul>
  )

  return (
    <>
      {isHotelAdmin && (
        <div className='notification-wrp'>
          <Badge
            count={notificationCount}
            size='small'
            offset={notificationCount < 10 ? [2, 0] : [4, 0]}
          >
            <Popover
              className='notificationPop'
              overlayClassName={'notificationDropdown'}
              trigger='click'
              placement='bottomLeft'
              content={content2}
              getPopupContainer={trigger => trigger.parentElement}
            >
              <Button>
                <svg
                  className='headericonsvg'
                  xmlns='https://www.w3.org/2000/svg'
                  width='16.574'
                  height='19.888'
                  viewBox='0 0 16.574 19.888'
                >
                  <g
                    id='bell_1_'
                    data-name='bell (1)'
                    transform='translate(-2)'
                  >
                    <path
                      id='Path_31904'
                      data-name='Path 31904'
                      d='M18.059,14.015a5.55,5.55,0,0,1-1.971-4.247V7.458a5.805,5.805,0,0,0-4.972-5.734V.829a.829.829,0,1,0-1.657,0v.895A5.8,5.8,0,0,0,4.486,7.458v2.31a5.557,5.557,0,0,1-1.979,4.254,1.45,1.45,0,0,0,.943,2.551H17.123a1.45,1.45,0,0,0,.936-2.558Z'
                      fill='#ffffff'
                    />
                    <path
                      id='Path_31905'
                      data-name='Path 31905'
                      d='M11.371,23.486A3.112,3.112,0,0,0,14.415,21H8.326A3.112,3.112,0,0,0,11.371,23.486Z'
                      transform='translate(-1.084 -3.598)'
                      fill='#ffffff'
                    />
                  </g>
                </svg>
              </Button>
            </Popover>
          </Badge>
        </div>
      )}
      {userInfo && userInfo.isDepartmentAdmin && (
        <div className='notification-wrp'>
          <Badge
            count={notificationCount}
            size='small'
            offset={notificationCount < 10 ? [2, 0] : [4, 0]}
          >
            <Popover
              className='notificationPop'
              overlayClassName={'notificationDropdown'}
              trigger='click'
              placement='bottomLeft'
              content={content2}
              getPopupContainer={trigger => trigger.parentElement}
            >
              <Button>
                <img src={getImage('images/bellicon.svg')}></img>
              </Button>
            </Popover>
          </Badge>
        </div>
      )}
    </>
  )
}

export default Notifications
