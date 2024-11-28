import moment from 'moment'
import { APIs, Collections, entityTypes } from '../config/constants'
import Axios from '../utility/axiosHelper'
import { GetAxiosHeaders, getRequestCollection } from '../config/utils'
import { db } from '../config/firebase'
import { actions } from '../Store'
import { GetCurrentUser } from './user'
import { updatationData } from './common'

export const scheduleRecurringNotificationCron = async ({
  requestData,
  notificationData,
}) => {
  const headers = await GetAxiosHeaders()
  const {
    departmentId,
    hotelId,
    requestType,
    requestId,
    isGuestRequest,
    locationId,
    isLocationUsed,
  } = requestData

  const notification_type = 'RECURRING_REQUEST'
  const template_variables = {
    '%serviceName%': notificationData.service,
    '%assignedByStaffName%': notificationData.staffName,
  }
  const data = {
    assignedToName: notificationData?.assignedToName,
    assignedToStaffId: notificationData?.assignedToStaffId,
    currentLanguage: notificationData?.currentLanguage,
    department: notificationData?.department,
    departmentId: notificationData?.departmentId,
    department_type: notificationData?.departmentKey,
    entityType: entityTypes.REQUEST,
    hotel_id: hotelId,
    notification_type,
    referenceId: '123',
    requestType,
    service_type: notificationData.service,
    staff_id: notificationData.staff_id,
    template_variables,
    notificationSendingType: notificationData?.notificationSendingType,
    scheduleEndDate: notificationData?.scheduleEndDate,
    scheduleStartDate: notificationData?.scheduleStartDate,
    serviceId: notificationData?.serviceId,
    serviceKey: notificationData?.serviceKey,
    recurringCronName: notificationData?.recurringCronName,
    scheduleStartDate: notificationData?.scheduleStartDate,
    scheduleEndDate: notificationData?.scheduleEndDate,
  }

  const jobDetails = {
    ...data,
    guest_id: '',
    requestPath: '',
  }
  Axios.post(
    APIs.SCHEDULE_CRON,
    {
      jobDetails,
    },
    { headers }
  )
    .then(() => {
      // intentionaly left blank
    })
    .catch(err => {
      throw err
    })
}

export const updateRecurringNotificationCron = async () => {
  const headers = await GetAxiosHeaders()
  Axios.post(APIs.SCHEDULE_CRON, {}, { headers })
    .then(() => {
      // intentionaly left blank
    })
    .catch(err => {
      throw err
    })
}

export const deleteRecurringNotificationCron = async () => {
  const headers = await GetAxiosHeaders()
  Axios.post(APIs.SCHEDULE_CRON, {}, { headers })
    .then(() => {
      // intentionaly left blank
    })
    .catch(err => {
      throw err
    })
}
