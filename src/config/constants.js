/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
import { Select, Input, Button, Spin } from 'antd'
import {
  departmentServiceRequest,
  guestServiceRequest,
} from '../services/requests'

export const { Option } = Select
export const { Search, TextArea } = Input

export const secondsToShowAlert = 3000

export const departmentFilterLabel = 'Department'
export const requestTypeFilterLabel = 'Request Type'
export const serviceFilterLabel = 'Services'
export const statusState = 'true'
export const defaultPublish = 'Not Published'
export const RequestTypeLabelValue = 'Request Type'
export const ServiceLabelValue = 'Service'
export const StatusLabelValue = 'Status'
export const StaffLabelValue = 'Staff'
export const VarianceLabelValue = 'Variance'
export const ResponseTimeLabelValue = 'Response Time'
export const AssignedToLabelValue = 'Assigned To'
export const ReportGroupByValue = 'Group By'

export const CompletedLabel = 'Completed'
export const DoneLabel = 'Done'
export const DeferredLabel = 'Deferred'
export const CanceledLabel = 'Canceled'
export const CommentedLabel = 'Commented'
export const UpdatedLabel = 'Updated'
export const DeletedLabel = 'Deleted'
export const ReturnedLabel = 'Returned'
export const WriteRequestLabel = 'Write Request'
export const DNDLabel = 'DND'
export const checkoutLabel = 'CheckOut'
export const outOfServiceLabel = 'Out Of Service'
export const guestRefusedLabel = 'Guest Refused'
export const delayedLabel = 'Delayed'


export const RoomUpgradePathName = '/RoomUpgrade'
export const OtherRequestPathName = '/OtherRequest'
export const scheduledTimePathName = '/ScheduledTime'

export const pendingLable = 'Pending'
export const checkInLable = 'Check In'
export const acceptedLable = 'Accepted'
export const rejectedLable = 'Rejected'
export const checkOutLable = 'Check Out'
export const inProgressLabel = 'In Progress'

export const rejectLabel = 'Reject'
export const confirmLabel = 'Confirm'

export const HotelAdminRole = 'HotelAdmin'
export const SuperAdminRole = 'SuperAdmin'

export const urgentValue = 'Urgent'
export const normalValue = 'Normal'

export const ADMIN_REQUEST_CHANGE = 'ADMIN_REQUEST_CHANGE'

export const FilterByAssignStatus = 'Filter By Assign'

export const SortByRequestType = 'Sort by Request Type'
export const SortBy = 'Sort By'
export const SortOrder = 'Sort Order'
export const Location = 'Location'

export const requestTypeOptionsValue = [
  { name: normalValue, value: normalValue },
  { name: urgentValue, value: urgentValue },
]

export const APIs = {
  ADD_PLAYER_ID: '/api/v1/notification/player/add',
  ADMIN_REQUEST: '/api/v1/notification/admin-request',
  CHANGE_PASSWORD: 'api/v1/staff/update-password',
  CONFIRM_PASSWORD: '/api/v1/staff/confirm-password',
  COPY_USER: '/api/v1/user/copy',
  CREATEORUPDATE: '/api/v1/staff/createOrUpdate',
  DELETE_PLAYER_ID: '/api/v1/notification/player/delete',
  DELETE_USER: '/DeleteUser',
  DEPARTMENT_REQUEST: '/api/v1/notification/department-request',
  GENERATE_TOKEN: '/api/v1/staff/get-otp',
  GET_HOTEL_BY_EMAILID: '/api/v1/staff/get-hotel-by-email',
  GETDOMAINBYHOTELID: 'api/v1/domain/getDomainByHotelId',
  GUEST_OR_DEPARTMENT_REQUEST: '/api/v1/notification/bulk-guest-dept-request',
  GUEST_REQUEST: '/api/v1/notification/guest-request',
  HARD_DELETE_USER: '/api/v1/user/delete',
  MANAGER_REQUEST: '/api/v1/notification/manager-request',
  PROMOTIONS_REQUEST: '/api/v1/notification/promotion-request',
  SEND_RESET_PASSWORD: '/api/v1/staff/send-reset-password-mail',
  STAFF_ASSIGNED_NOTIFICATION: '/api/v1/notification/staff-assigned',
  UPDATE_LOCATION: '/api/v1/staff/updateLocation',
  SCHEDULE_CRON: '/api/v1/cron/schedule-cron',
  UPDATE_CRON: '/api/v1/cron/update-cron',
  DELETE_CRON: '/api/v1/cron/delete-cron',
  VALIDATE_TOKEN: '/api/v1/staff/validate-token',
  VALIDATE_USER_IS_SUPERADMIN: '/api/v1/staff/validate-user',
  COMMENT_ACTIVITY: '/api/v1/notification/comment-activity',
  DEFERRED_NOTIFICATION: '/api/v1/notification/deferredNotification',
  DAILY_TASK_STATUS_UPDATE_NOTIFICATION: '/api/v1/notification/dailyTaskStatusUpdateNotification',
  GET_ROOMS: '/api/v1/pms/getHotelRooms',
  OUT_OF_SERVICE_ROOMS: '/api/v1/pms/outOfServiceRooms',
  CANCELED_NOTIFICATION: '/api/v1/notification/canceledNotification',
  UPDATE_DASHBOARD_COUNT: '/api/v1/dashboard/updateDashboardCount',
  UPDATE_DASHBOARD_COUNT_REQUEST_ASSIGNMNET:
    '/api/v1/dashboard/updateDashboardCountByRequestAssignment',
}
export const DEPARTMENT_REDIRECTION = {
  'airport dropoff': '/ScheduledTime',
  'book taxi': '/BookTaxi',
  'car rental': '/CarRental',
  'change room': '/RoomUpgrade',
  'change/upgrade room': '/RoomUpgrade',
  'checkin': '/FrontDeskCheckInOut',
  'checkout and request bill': '/ScheduledTime',
  'clean tray': '/HouseKeepingRequests',
  'doctor on a call': '/OtherRequest',
  'extend stay': '/OtherRequest',
  'extra bed': '/OtherRequest',
  'get my car': '/GetMyCar',
  'gym': '/GymReservation',
  'hotle shuttle': '/HotelShuttle',
  'maintenance - air conditioner': '/HouseKeepingRequests',
  'maintenance - electric': '/HouseKeepingRequests',
  'maintenance - light': '/HouseKeepingRequests',
  'maintenance - others': '/HouseKeepingRequests',
  'maintenance - refrigerator': '/HouseKeepingRequests',
  'maintenance - television': '/HouseKeepingRequests',
  'maintenance - water leakage': '/HouseKeepingRequests',
  'housekeeping-morerequest': '/more-requests',
  'more-request': '/more-requests',
  'other': '/OtherRequest',
  'pick laundry': '/HouseKeepingRequests',
  'replacement - bed linen': '/HouseKeepingRequests',
  'replacement - linen bed': '/HouseKeepingRequests',
  'replacement - minibar': '/HouseKeepingRequests',
  'replacement - others': '/HouseKeepingRequests',
  'replacement - pillow': '/HouseKeepingRequests',
  'replacement - toiletries': '/HouseKeepingRequests',
  'requests-department_request': '/incoming-department-request',
  'requests-guest_request': '/incoming-guest-request',
  'restaurant': '/Reservation',
  'room cleaning': '/HouseKeepingRequests',
  'room service': '/FBRoomService',
  'room service Two': '/FBRoomServiceTwo',
  'saloon': '/SalonReservation',
  'spa': '/SpaReservation',
  'travel desk': '/TravelDesk',
  'upgrade room': '/RoomUpgrade',
  'wake up call': '/ScheduledTime',
  'DEPARTMENT_REQUEST': '/incoming-department-request',
  'GUEST_REQUEST': '/incoming-guest-request',
  'FrontDeskGuest': '/FrontDeskGuest',
  'HouseKeepingTimeScheduler': '/HouseKeepingTimeScheduler',
}
export const ADMIN_REDIRECTION = {
  'checkin': '/GuestInfo',
  'department_request': '/DepartmentRequests',
  'guest_request': '/GuestRequests',
  'gym': '/Reservations',
  'restaurant': '/Reservations',
  'room service': '/RoomService',
  'saloon': '/Reservations',
  'spa': '/Reservations',
}

export const Collections = {
  CHECK_IN_OUT_COUNT: 'checkInOutCount',
  CONFIG: 'config',
  CUISINEMENU: 'cuisineMenu',
  CUISINES: 'cuisines',
  DEFAULT_DEPARTMENT_TO_MENUS: 'defaultDepartmentToMenus',
  DEPARTMENT_REQUEST_STAT: 'departmentRequestStat',
  DEPARTMENT_REQUEST: 'departmentRequest',
  DEPARTMENTS: 'departments',
  DOMAIN: 'domain',
  FOODMENU: 'foodMenu',
  GUEST_OVERVIEW: 'guestOverview',
  GUEST_REQUEST: 'guestRequest',
  USER_REQUESTS: 'userRequests',
  ASSIGN_BY_MANAGER: 'assignByManager',
  ASSIGN_BY_SELF: 'assignBySelf',
  GUEST: 'guest',
  GYM: 'gym',
  HOTEL_ADMIN_DASHBOARD: 'hotelAdminDashboard',
  HOTELGUIDELINES: 'hotelGuidelines',
  HOTELS: 'hotels',
  HOTELSHUTTLE: 'hotelShuttle',
  LANGUAGEDICTIONARY: 'languagedictionary',
  MOBILE_DASHBOARD: 'mobile_dashboard',
  NOTIFICATION_USERS: 'notification-users',
  NOTIFICATIONS: 'Notifications',
  ORDERS: 'orders',
  PRIVACYPOLICY: 'privacyPolicy',
  PROMOTIONS: 'promotions',
  HOUSEKEEPINGSERVICES: 'houseKeepingServices',
  RELEASE: 'release',
  REQUEST_INFO_DEPARTMENT_REQUEST: 'request_info_department_request',
  REQUEST_INFO_DEPARTMENT: 'request_info_department',
  REQUEST_INFO: 'request_info',
  REQUESTS: 'requests',
  RESTAURANT: 'restaurant',
  ROLES: 'roles',
  ROOM_TYPE: 'roomType',
  SALOON: 'saloon',
  SERVICES: 'services',
  SPA: 'spa',
  SUBSCRIPTION: 'subscription',
  TERMSANDCONDITIONS: 'termsAndConditions',
  TITLE_AND_PERMISSIONS: 'titleAndPermissions',
  TITLEANDPERMISSIONSSERVICES: 'titleAndPermissionsServices',
  TOKEN: 'tokens',
  USERHOTELS: 'userHotels',
  USERS: 'users',
  LOCATIONTYPES: 'locationTypes',
  HOTELLOCATIONTYPES: 'hotelLocationTypes',
  LOCATIONS: 'locations',
  HOTELLOCATIONS: 'hotelLocations',
  OVERALLFEEDBACKQUESTIONS: 'overallFeedbackQuestions',
  HOTELOVERALLFEEDBACKQUESTIONS: 'hotelOverallFeedbackQuestions',
  HOTELFEEDBACKS: 'hotelFeedbacks',
  VERSIONS: 'versions',
  SUPERADMINSETTINGS: 'superAdminSettings',
  SUPERADMIN_GUESTSETTINGS: 'superAdmin_GuestSettings',
  ADMINSETTINGS: 'adminSettings',
  ADMIN_GUESTSETTINGS: 'admin_GuestSettings',
  ADMIN_FEEDBACK_NOTIFICATION_SETTINGS: 'adminFeedbackNotificationSettings',
  COUNTER: '_counter_shards_',
}

export const PromoStatusList = [
  { value: 'all', name: 'All' },
  { value: 'true', name: 'Published' },
  { value: 'false', name: 'Not Published' },
]

export const guestStatusList = [
  { id: 'all', name: 'All' },
  { id: checkInLable, name: checkInLable },
  { id: checkOutLable, name: checkOutLable },
]

export const serviceStatusList = [
  { id: 'all', name: 'All' },
  { id: pendingLable, name: pendingLable },
  { id: inProgressLabel, name: inProgressLabel },
  { id: CompletedLabel, name: CompletedLabel },
  { id: DeferredLabel, name: DeferredLabel },
  { id: CanceledLabel, name: CanceledLabel },
]

export const requestTypeList = [
  { id: 'all', name: 'All' },
  { id: urgentValue, name: urgentValue },
  { id: normalValue, name: normalValue },
]

export const activeInactiveStatusList = [
  { id: 'all', name: 'All' },
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
]

export const serviceList = [
  { name: 'Services', value: 'Services' },
  { name: 'Lucy', value: 'lucy' },
  { name: 'Yiminghe', value: 'yiminghe' },
]

export const statusFilterLabel = 'Status'
export const ratingFilterLabel = 'Rating'
export const B = 'Rating'

/* Table */
export const serviceRequestColumn = {
  title: 'Service Type',
  dataIndex: 'ServiceType',
  className: 'disabled',
  width: 100,
}

export const serviceRequestTypes = {
  PENDING: pendingLable,
  INPROGRESS: inProgressLabel,
  COMPLETED: CompletedLabel,
}

export const departmentList = [
  { name: 'Department', value: 'Department' },
  { name: 'Lucy', value: 'lucy' },
  { name: 'Yiminghe', value: 'yiminghe' },
]

export const notificationList = [
  'Escalated',
  urgentValue,
  'Reminder',
  'Warning',
  'Jobreturn',
  normalValue,
  'Deferred',
]

export const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const cardColorClassName = {
  GREEN: 'green',
  BLUE: 'blue',
  BROWN: 'brown',
}

export const TranslateTextType = {
  I18N: 'I18N',
  GOOGLE: 'GOOGLE',
}

export const Weeks = Array(52)
  .fill()
  .map((_, index) => ({ name: `Week ${index + 1}`, value: index }))

export const Months = [
  { name: 'January', value: 0, short_name: 'Jan' },
  { name: 'February', value: 1, short_name: 'Feb' },
  { name: 'March', value: 2, short_name: 'Mar' },
  { name: 'April', value: 3, short_name: 'Apr' },
  { name: 'May', value: 4, short_name: 'May' },
  { name: 'June', value: 5, short_name: 'Jun' },
  { name: 'July', value: 6, short_name: 'Jul' },
  { name: 'August', value: 7, short_name: 'Aug' },
  { name: 'September', value: 8, short_name: 'Sep' },
  { name: 'October', value: 9, short_name: 'Oct' },
  { name: 'November', value: 10, short_name: 'Nov' },
  { name: 'December', value: 11, short_name: 'Dec' },
]

export const Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const colors = [
  '#1480CD',
  '#1BBA3A',
  '#F9D948',
  '#F5943F',
  '#F66C6C',
  '#EF8AB8',
  '#6C6C6C',
  '#FFFFFF',
]

export const RequestStatus = [
  { value: pendingLable, name: pendingLable, className: 'stpending' },
  { value: inProgressLabel, name: inProgressLabel, className: 'stinprogress' },
  { value: CompletedLabel, name: CompletedLabel, className: 'stdone' },
  { value: DeferredLabel, name: DeferredLabel, className: 'stdeffered' },
  { value: CanceledLabel, name: CanceledLabel, className: 'stcancelled' },
]

export const realTimeServiceStatus = [
  { value: 'all', name: 'All' },
  { value: pendingLable, name: pendingLable, className: 'stpending' },
  { value: inProgressLabel, name: inProgressLabel, className: 'stinprogress' },
]

export const FandBServiceStatus = [
  { value: pendingLable, name: pendingLable, className: 'stpending' },
  { value: inProgressLabel, name: inProgressLabel, className: 'stinprogress' },
  { value: rejectedLable, name: rejectedLable, className: 'stpending' },
  { value: CompletedLabel, name: CompletedLabel, className: 'stdone' },
  { value: DeferredLabel, name: DeferredLabel, className: 'stdeffered' },
  { value: CanceledLabel, name: CanceledLabel, className: 'stcancelled' },
]

export const GuestCheckInOutStatusList = [
  { name: checkInLable, value: checkInLable, className: 'checkin' },
  { name: checkOutLable, value: checkOutLable, className: 'checkout' },
]

export const requestCounterkeys = {
  [pendingLable]: 'pending',
  [inProgressLabel]: 'inprogress',
  [rejectedLable]: 'rejected',
  [CompletedLabel]: 'completed',
}

export const StatusLabel = 'Status'
export const CuisineLabel = 'Meals of the day'
export const RestaurantLabel = 'Restaurant'

export const AdminActionKey = 'adminAction'

export const validateAlphaNumeric = (_fieldProps, message) => ({
  validator(_, value) {
    const first = /[A-Za-z]/.test(value)
    const second = /[A-Za-z0-9 ]/.test(value)

    if ((first && second) || value.length === 0) return Promise.resolve()
    return Promise.reject(new Error(message))
  },
})

export const ContactNumberValidation = translateTextI18N => [
  {
    min: 6,
    message: translateTextI18N(
      'Contact number should be minimum of 6 characters long'
    ),
  },
]

export const statusToIndex = {
  [pendingLable]: 1,
  [inProgressLabel]: 2,
  [acceptedLable]: 3,
  [checkInLable]: 4,
  [rejectedLable]: 5,
  [CompletedLabel]: 6,
  [checkOutLable]: 7,
  [CanceledLabel]: 8,
}

export const StatusToClass = {
  [inProgressLabel]: 'inprogressBtn',
  [pendingLable]: 'pendingBtn',
  [rejectedLable]: 'rejectBtn',
  [CompletedLabel]: 'completedBtn',
  [DeferredLabel]: 'deferredBtn',
  Deferred: 'deferredBtn',
  [CanceledLabel]: 'cancelledBtn',
}

export const StatusButton = ({ status, translateTextI18N }) => (
  <Button className={`statusBtn ${StatusToClass[status]}`}>
    {translateTextI18N(status)}
  </Button>
)

export const StatusColumnObject = translateTextI18N => {
  return {
    title: translateTextI18N('Status'),
    dataIndex: 'status',
    width: 100,
    render: status => StatusButton({ status, translateTextI18N }),
  }
}

export const translationDataKey = 'translation'
export const escalationTimeKey = 'requiredTime'
export const defaultEscalationTime = '00:30'

export const transliterateLanguageIds = ['ar', 'hi', 'ml', 'ru', 'ur']

export const SPA_WELNESS = {
  BOOKING: {
    ALL: '/SpaAndWellnessBooking',
    SPA: '/SpaBooking',
    GYM: '/GymBooking',
    SALON: '/SalonBooking',
  },
  RESERVATION: {
    ALL: '/SpaAndWellnessReservation',
    SPA: '/SpaReservation',
    GYM: '/GymReservation',
    SALON: '/SalonReservation',
  },
}

export const ServiceLabel = 'Service'

export const ENTITY_TYPE = {
  GUEST: 'GUEST',
  REQUEST: 'REQUEST',
}

export const ImageUploadHint =
  'Image should be in PNG or JPEG file with maximum of size 1mb'

export const RoomServiceRegEx = /[^A-Z0-9 \/-]/gi

export const DateTimeColumnWidth = 150

export const DefaultURL = 'https://getinplass.com/'

export const loadProgress = {
  TOLOAD: 'toLoad',
  LOADING: 'loading',
  LOADED: 'loaded',
}

export const searchingDomainMessages = {
  LOADING: 'Loading...',
  NOT_AVAILABLE: 'Hotel is not available.',
  INVALID: 'The requested URL is currently unavailable.',
  SUCCESS: 'Success',
}

export const archivedData = 'Archived Data'
export const realTimeData = 'Realtime Data'

export const DiningSubMenuConfig = [
  {
    key: '8',
    index: '8',
    iconSrc: 'images/FoodMenu.svg',
    linkTo: '/RoomServiceMenu',
    formattedId: 'Room Service Menu',
    parentKey: 'sub1',
  },
  {
    key: '9',
    index: '9',
    iconSrc: 'images/KitchenOrders.svg',
    linkTo: '/RoomService',
    formattedId: 'Room Service',
    parentKey: 'sub1',
  },
  {
    key: '10',
    index: '10',
    iconSrc: 'images/Cuisine.svg',
    linkTo: '/Cuisine',
    formattedId: 'Cuisine',
    parentKey: 'sub1',
  },
  {
    key: '11',
    index: '11',
    iconSrc: 'images/Restaurant.svg',
    linkTo: '/Restaurant',
    formattedId: 'Restaurant',
    parentKey: 'sub1',
  },
]

export const IncomingRequestSideMenu = {
  iconSrc: 'images/ServiceRequests.svg',
  index: '101',
  id: '101',
  linkTo: '',
  name: 'Requests Received',
  refDefaultDepartmentId: '',
  subMenu: [
    {
      key: '1011',
      index: '1011',
      id: '1011',
      iconSrc: 'images/GuestInfo.svg',
      linkTo: `/incoming-guest-request`,
      name: 'Guest Requests',
      parentKey: 'sub2',
    },
    {
      key: '1012',
      index: '1012',
      id: '1012',
      iconSrc: 'images/ServiceRequests.svg',
      linkTo: `/incoming-department-request`,
      name: 'Department Requests',
      parentKey: 'sub2',
    },
    {
      key: '10122',
      index: '10122',
      id: '10122',
      iconSrc: 'images/medicalIcon.png',
      linkTo: `/medicalService`,
      name: 'Medical Service',
      parentKey: 'sub2',
    },
  ],
}

export const ServiceRequestSubMenuConfig = [
  {
    key: '5',
    index: '5',
    iconSrc: 'images/GuestInfo.svg',
    linkTo: `/GuestRequests`,
    formattedId: 'Guest Requests',
    parentKey: 'sub2',
  },
  {
    key: '6',
    index: '6',
    iconSrc: 'images/ServiceRequests.svg',
    linkTo: `/DepartmentRequests`,
    formattedId: 'Department Requests',
    parentKey: 'sub2',
  },
]

export const ReportSubMenuConfig = [
  {
    key: 'r1',
    index: 'r1',
    id: 'r1',
    iconSrc: 'images/ReqSummary.svg',
    linkTo: `/reports/1`,
    formattedId: 'Request Summary',
    parentKey: 'sub3',
    name: 'Request Summary',
  },
  {
    key: 'r2',
    index: 'r2',
    id: 'r2',
    iconSrc: 'images/ReqResponse.svg',
    linkTo: `/reports/2`,
    formattedId: 'Request Response',
    parentKey: 'sub3',
    name: 'Request Response',
  },
  {
    key: 'r3',
    id: 'r3',
    index: 'r3',
    iconSrc: 'images/ReqStatus.svg',
    linkTo: `/reports/3`,
    formattedId: 'Request Status',
    parentKey: 'sub3',
    name: 'Request Status',
  },
  {
    key: 'r4',
    index: 'r4',
    id: 'r4',
    iconSrc: 'images/SATPlanned.svg',
    linkTo: `/reports/4`,
    formattedId: 'Scheduled & Planned Task',
    parentKey: 'sub3',
    name: 'Scheduled & Planned Task',
  },
  {
    key: 'r6',
    index: 'r6',
    id: 'r6',
    iconSrc: 'images/calender.svg',
    linkTo: `/reports/6`,
    formattedId: 'Usage Report',
    parentKey: 'sub3',
    name: 'Usage Report',
  },
]
export const AllReportSubMenuConfig = [
  {
    key: 'r1',
    index: 'r1',
    id: 'r1',
    iconSrc: 'images/ReqSummary.svg',
    linkTo: `/allreports/1`,
    formattedId: 'Request Summary',
    parentKey: 'sub3',
    name: 'Request Summary',
  },
  {
    key: 'r2',
    index: 'r2',
    id: 'r2',
    iconSrc: 'images/ReqResponse.svg',
    linkTo: `/allreports/2`,
    formattedId: 'Request Response',
    parentKey: 'sub3',
    name: 'Request Response',
  },
  {
    key: 'r3',
    id: 'r3',
    index: 'r3',
    iconSrc: 'images/ReqStatus.svg',
    linkTo: `/allreports/3`,
    formattedId: 'Request Status',
    parentKey: 'sub3',
    name: 'Request Status',
  },
  {
    key: 'r4',
    index: 'r4',
    id: 'r4',
    iconSrc: 'images/SATPlanned.svg',
    linkTo: `/allreports/4`,
    formattedId: 'Scheduled & Planned Task',
    parentKey: 'sub3',
    name: 'Scheduled & Planned Task',
  },
  {
    key: 'r6',
    index: 'r6',
    id: 'r6',
    iconSrc: 'images/calender.svg',
    linkTo: `/allreports/6`,
    formattedId: 'Usage Report',
    parentKey: 'sub3',
    name: 'Usage Report',
  },
]

export const RaisedRequestSideMenu = {
  iconSrc: 'images/add-file.svg',
  index: '102',
  id: '102',
  linkTo: '',
  name: 'Add Request',
  refDefaultDepartmentId: '',
  subMenu: [
    {
      key: '1021',
      index: '1021',
      id: '1021',
      iconSrc: 'images/GuestInfo.svg',
      linkTo: `/raised-guest-request`,
      name: 'Guest Request',
      parentKey: 'sub2',
    },
    {
      key: '1021',
      index: '1022',
      id: '1022',
      iconSrc: 'images/ServiceRequests.svg',
      linkTo: `/raised-department-request`,
      name: 'Department Request',
      parentKey: 'sub2',
    },
  ],
}

export const ReportSideMenu = {
  iconSrc: 'images/Reports.svg',
  index: 'sub3',
  id: 'sub3',
  linkTo: '',
  name: 'Reports',
  refDefaultDepartmentId: '',
  subMenu: ReportSubMenuConfig,
}
export const FaqSideMenu = {
  iconSrc: 'images/faq.png',
  index: 'sub4',
  id: 'sub4',
  linkTo: '/faq',
  name: 'FAQ',
  refDefaultDepartmentId: '',
  //subMenu: ReportSubMenuConfig,
}
export const ChatSideMenu = {
  iconSrc: 'images/ivawhite.png',
  index: 'sub5',
  id: 'sub5',
  linkTo: '/ChatWithIva',
  name: 'Chat With IVA',
  refDefaultDepartmentId: '',
  //subMenu: ,
}
export const CustomDepartmentSideMenu = [
  IncomingRequestSideMenu,
  RaisedRequestSideMenu,
]

export const ManagementDeptSideMenu = [
  ...CustomDepartmentSideMenu,
  {
    id: '98',
    index: '98',
    iconSrc: 'images/titlepermissions.svg',
    linkTo: '/TitleandPermissions',
    name: 'Title & Permissions',
  },
  {
    id: '13',
    index: '13',
    iconSrc: 'images/Users.svg',
    linkTo: '/Staff',
    name: 'Staff',
  },
]

export const CancelRequest = [
  {
    key: '101223',
    index: '101223',
    id: '101223',
    iconSrc: 'images/medicalIcon.png',
    linkTo: `/cancelRequest`,
    name: 'Cancel Request',
    parentKey: 'sub2',
  },
]

export const defaultPageSize = 10

export const PaginationOptions = {
  hideOnSinglePage: false,
  //pageSize: 100,
  size: 'small',
  // showSizeChanger: true,
  // pageSizeOptions: ['10', '15', '20'],
}

export const emailErrorMessge = 'Email ID must be in the format name@domain.com'

export const LoginStatus = {
  LOGGED_OUT: 'LOGGED_OUT',
  WAITING: 'WAITING',
  LOGGED_IN: 'LOGGED_IN',
}

export const PAGELOADER = {
  TOLOAD: 'TOLOAD',
  WAITING: 'WAITING',
  LOADED: 'LOADED',
}

export let unsubscribeList = {}

export const unsubscribeFirebaseListeners = () => {
  Object.entries(unsubscribeList).forEach(([key, func]) => {
    if (typeof func === 'function') {
      func()
    }
    unsubscribeList[key] = null
  })
}

export const SpinLoading = () => {
  return (
    <div className='page-center'>
      <Spin size='large' />
    </div>
  )
}

export const resetThemeColor = () => {
  const root = document.documentElement
  root?.style.setProperty('--themecolor', '#1780CD')
  root?.style.setProperty('--themefontColor', '#ffffff')
}

export const MODAL_TYPES = {
  PDFVIEWER: 'PDFVIEWER',
  IMAGEVIEWER: 'IMAGEVIEWER',
  DELETE: 'DELETE',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
}

export const defaultModalData = {
  status: false,
  data: null,
  modalType: null,
  isOpen: false,
  isEdit: false,
  isLoading: false,
}

export const resActionType = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
}

export const defaultResActionData = {
  status: false,
  type: '',
  message: '',
}

export const ManagementDeptObject = { id: 'management', name: 'Management' }

export const defaulltManagementKey = {
  management: {
    key: ManagementDeptObject.id,
    name: ManagementDeptObject.name,
    services: [],
  },
}

export const realTimeStatusList = [pendingLable, inProgressLabel]
export const getRealtimeStatus = list => {
  return list.filter(item => realTimeStatusList.includes(item.name))
}

export const ManagerType = {
  NewManager: 'NewManager',
  SubstitureManager: 'SubstitureManager',
  DeleteInActiveManager: 'DeleteInActiveManager',
}

export const recurringTaskScheduler = [
  {
    key: '50',
    index: '50',
    id: '50',
    iconSrc: 'images/medicalIcon.png',
    linkTo: `/recurringTaskScheduler`,
    name: 'Recurring Task Scheduler',
    parentKey: 'sub2',
  },
]
export const ListView = [
  {
    key: '51',
    index: '51',
    id: '51',
    iconSrc: 'images/medicalIcon.png',
    linkTo: `/ListView`,
    name: 'List View',
    parentKey: 'sub2',
  },
]
export const RoomView = [
  {
    key: '52',
    index: '52',
    id: '52',
    iconSrc: 'images/medicalIcon.png',
    linkTo: `/RoomView`,
    name: 'Room View',
    parentKey: 'sub2',
  },
]

export const menuToServices = {
  31: ['change-upgrade-room'],
  32: ['extra-bed', 'doctor-on-a-call', 'extend-stay', 'view-bill'],
  33: ['checkout-and-request-bill', 'airport-dropoff', 'wake-up-call'],
  41: ['book-taxi'],
  42: ['car-rental'],
  43: ['get-my-car'],
  44: ['travel-desk'],
  71: ['spa', 'gym', 'saloon'],
  72: ['spa'],
  73: ['gym'],
  74: ['saloon'],
  11: ['room-service'],
  12: ['restaurant'],
}

export const commonModalType = {
  AddComment: 'addComment',
  ViewBill: 'viewBill',
  EditComment: 'editComment',
  ViewComment: 'viewComment',
  ViewAddComment: 'viewAddComment',

  StatusChangeNotAllowed: 'StatusChangeNotAllowed',
  YouCannotCancel: 'YouCannotCancel',

  AssignRequest: 'assignrequest',

  ResponseModal: 'responsemodal',

  AddLocation: 'addLocation',
  EditLocation: 'editLocation',
  DeleteLocation: 'deleteLocation',

  AddLocationType: 'addLocationType',
  EditLocationType: 'editLocationType',
  DeleteLocationType: 'deleteLocationType',
  ViewStaffHierarchy: 'ViewStaffHierarchy',
  ViewModal: 'ViewModal',
  AddEditOverAllFeedbackQuestionModal: 'AddEditOverAllFeedbackQuestionModal',
  ConfirmDelete: 'ConfirmDelete',
  ViewHotelFeedback: 'ViewHotelFeedback',
}

export const defaultCommonModalData = {
  status: false,
  data: null,
  type: '',
}

export const allowedMealsOfTheDay = 100

export const RequestTypes = {
  GuestRequest: 'Guest Requests',
  DepartmentRequest: 'Department Requests',
  All: 'All',
}

export const ServiceRequestURL = {
  ServiceRequest: '/ServiceRequests',
  GuestRequest: '/GuestRequests',
  DepartmentRequest: '/DepartmentRequests',
}

const { GuestRequest, DepartmentRequest } = ServiceRequestURL

export const cServiceRequests = {
  [GuestRequest]: {
    url: GuestRequest,
    pageTitle: RequestTypes.GuestRequest,
    realTimeAPI: data => guestServiceRequest(data),
    subMenuIndex: '5',
  },
  [DepartmentRequest]: {
    type: DepartmentRequest,
    pageTitle: RequestTypes.DepartmentRequest,
    realTimeAPI: data => departmentServiceRequest(data),
    url: DepartmentRequest,
    subMenuIndex: '6',
  },
}

export const timeFormat = 'HH:mm'
export const dateFormat = 'DD MMM YYYY'

export const upgradeRoomValue = 'Upgrade Room'
export const changeRoomValue = 'Change Room'

export const changeUpgradeRoomOptions = [
  { name: upgradeRoomValue, value: upgradeRoomValue },
  { name: changeRoomValue, value: changeRoomValue },
]

export const frontDeskServiceTypes = {
  RoomUpgrade: 'RoomUpgrade',
  ScheduledTime: 'ScheduledTime',
  OtherRequest: 'OtherRequest',
}

export const messages = {
  MISSING_PERMISSONS:
    'Your account permissions are changed. Please reach out to Hotel Admin for more information',
}

export const whiteBoxStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  height: '130%',
  display: 'flex',
}

export const statusColors = {
  'DND': '#20B2AA',
  'In Progress': '#FF8000',
  'CheckOut': '#A52A2A',
  'Completed': '#059E4D',
  'Delayed': '#8B4513',
  'Out Of Service': '#708090',
  'Pending': '#FF4500',
  'Guest Refused': '#8B4689',
}
export const roomContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  padding: '16px',
}

export const roomWrapperStyle = {
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 'calc(10% - 16px)',
  minWidth: '120px',
  maxWidth: '200px',
}

export const defaultManagerProps = {
  sub: false, // weather selected manager is substitute
  subOf: [], // selected manager is substiture of all ids in array
  subId: '', // substitute manager id for this manager
}

export const MaximumAllowedManager = 4

export const notificationTypes = {
  DEFERRED: 'Deferred',
  CANCELED: 'Canceled',
  DND: 'DND',
  CHECKOUT: 'Checkout',
  OUT_OF_SERVICE:'Out of Service',
  GUEST_REFUSED: 'Guest Refused',
  DELAYED:'Delayed',
  DEPARTMENT_REQUEST: 'DEPARTMENT_REQUEST',
  GUEST_REQUEST: 'GUEST_REQUEST',
  JOBRETURN: 'JOBRETURN',
  STAFFASSIGNED: 'STAFFASSIGNED',
  COMMENTED: 'COMMENTED',
  COMMENT_UPDATE: 'COMMENT_UPDATE',
  COMMENT_DELETE: 'COMMENT_DELETE',
  COMMENT_GUEST_REQUEST: 'COMMENT_GUEST_REQUEST',
  COMMENT_DEPARTMENT_REQUEST: 'COMMENT_DEPARTMENT_REQUEST',
  RECURRING_REQUEST: 'RECURRING_REQUEST',
  COMMENT_RECURRING_REQUEST: 'COMMENT_RECURRING_REQUEST',
  REASSIGN_RECURRING_REQUEST: 'REASSIGN_RECURRING_REQUEST',
  STATUS_UPDATE_RECURRING_REQUEST: 'STATUS_UPDATE_RECURRING_REQUEST'

}

export const entityTypes = {
  REQUEST: 'REQUEST',
}

export const drpAssignOrNotAssign = [
  {
    id: 'assigned',
    name: 'Assigned',
  },
  {
    id: 'notAssigned',
    name: 'Not Assigned',
  },
]

export const drpRequestTypes = {
  new: {
    id: 'new',
    name: 'Newest First',
    filterFunc: request => request.sort((a, b) => b.createdAt - a.createdAt),
  },
  old: {
    id: 'old',
    name: 'Oldest First',
    filterFunc: request => request.sort((a, b) => a.createdAt - b.createdAt),
  },
  urgent: {
    id: 'urgent',
    name: 'Urgent First',
    filterFunc: request =>
      request.sort((a, b) => sortByRequestType('Urgent', a, b)),
  },
  normal: {
    id: 'normal',
    name: 'Normal First',
    filterFunc: request =>
      request.sort((a, b) => sortByRequestType('Normal', a, b)),
  },
}

function sortByRequestType(type, a, b) {
  if (a?.requestType === type && b?.requestType !== type) return -1
  if (a?.requestType !== type && b?.requestType === type) return 1
  return 0
}

export const defaultLocationTypeColumns = [
  {
    title: '#',
    width: 10,
    render: (...args) => ++args[2],
  },
  {
    title: 'Location Type Name',
    dataIndex: 'name',
    width: 20,
    render: name => name,
  },
]

export const guestLogoOrNameConfig = {
  name: 'name',
  logo: 'logo',
  both: 'both',
}

export const guestLogoOrNameAlignmentConfig = {
  left: 'left',
  centre: 'centre',
}

export const columnsToExcludeFromRealTime = [
  'completedTime',
  'rating',
  'feedback',
  'feedBackDateTime',
  'Completed By',
  'feedbackData',
  'feedBackDateTimeData',
]
export const columnsToExcludeFromArchived = ['Action']
export const unAssignTaskErrorMsg = 'Please assign a task to the staff.'

export const departmentWithOutServiceObj = {
  id: 'Requests',
  name: 'Requests',
  value: 'Requests',
}

export const defaultRequestStatusList = [
  {
    id: 'Rejected',
    name: 'Rejected',
  },
  {
    id: 'Pending',
    name: 'Pending',
  },
  {
    id: 'In Progress',
    name: 'In Progress',
  },
  {
    id: 'Deferred',
    name: 'Deferred',
  },
  {
    id: 'Completed',
    name: 'Completed',
  },
]

export const variancesArr = [
  {
    id: 'equals',
    name: 'Equals',
  },

  {
    id: '>=',
    name: '>=',
  },
  {
    id: '>',
    name: '>',
  },
  {
    id: '<=',
    name: '<=',
  },
  {
    id: '<',
    name: '<',
  },
]

export const defaultReportGroupingParameters = [
  { id: 'date_range', name: 'Date Range' },
  { id: 'week_range', name: 'Week Range' },
  { id: 'month_range', name: 'Month Range' },
]

export const IVA_BACKEND_URL = 'https://iva.inplass.com/chat'

export const PDF_FORMAT = {
  ORIENTATION: 'landscape',
  UNIT: 'pt',
  PAGE_FORMAT: 'a4',
  PAGE_MARGIN: 35,
  FONT: 'helvetica',
  // Color Constants
  DARK_GREY: [56, 59, 56], // #383B38 - Used for hotel name text
  LIGHT_GREY: [128, 128, 128], // #808080 - Used for page numbers
  TABLE_HEADER: [159, 157, 159], // #9F9D9F - Table header background
  TABLE_HEADER_TEXT: [54, 53, 54], // #363536 - Table header text
  TABLE_ROW: [215, 213, 215], // #D7D5D7 - Default table row background
  TABLE_ALT_ROW: [226, 224, 226], // #E2E0E2 - Alternate table row background
}
