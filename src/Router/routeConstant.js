import SignIn from '../components/Pages/Authentication/SignIn/SignIn'
import SetNewPassword from '../components/Pages/Authentication/StaffVerify/SetNewPassword'
import Dashboard from '../components/Pages/Dashboard/Dashboard'
import Department from '../components/Pages/Department/Department'
import GuestInfo from '../components/Pages/GuestInfo/GuestInfo'
import HotelInfo from '../components/Pages/HotelInfo/HotelInfo'
import Reservations from '../components/Pages/Reservations/Reservations'
import Restaurant from '../components/Pages/Restaurant/Restaurant'
import RoomServiceMenu from '../components/Pages/RoomServiceMenu/RoomServiceMenu'
import ServiceRequests from '../components/Pages/ServiceRequests/ServiceRequests'
import OtpVerificationScreen from '../components/Pages/Authentication/StaffVerify/OtpVerification'
import ForgotPassword from '../components/Pages/Authentication/ForgotPassword/ForgotPassword'
import ConfirmPassword from '../components/Pages/Authentication/ConfirmPassword/ConfirmPassword'
import OtpVerification from '../components/Pages/Authentication/OtpVerification/OtpVerification'
import NotFound from '../components/Pages/NotFound/NotFound'
import LinkExpired from '../components/Pages/Authentication/LinkExpired/LinkExpired'
import TitleandPermissions from '../components/Pages/TitleandPermissions/TitleandPermissions'
import Staff from '../components/Pages/Staff/Staff'
import Promotions from '../components/Pages/Promotions/Promotions'
import TermsConditionsPrivacyPolicy from '../components/Pages/TermsConditions-PrivacyPolicy/TermsConditionsPrivacyPolicy'
import MyProfile from '../components/Pages/MyProfile/MyProfile'
import FrontDeskGuest from '../components/Pages/Department/FrontDesk/FrontDeskGuest'
import FrontDeskCheckInOut from '../components/Pages/Department/FrontDesk/FrontDeskCheckInOut'
import FrontDeskRequests from '../components/Pages/Department/FrontDesk/FrontDeskRequests'
import RoomType from '../components/Pages/Department/FrontDesk/RoomType'
import Rooms from '../components/Pages/Department/FrontDesk/Rooms'
import FBRoomservice from '../components/Pages/Department/FoodandBeverages/RoomService/FBRoomservice'
import FBRoomserviceTwo from '../components/Pages/Department/FoodandBeveragesTwo/RoomServiceTwo/FBRoomserviceTwo'
import FBRestaurants from '../components/Pages/Department/FoodandBeverages/Restaurants/FBRestaurants'
import Cuisine from '../components/Pages/Cuisine/Cuisine'
import HouseKeepingRequests from '../components/Pages/Department/HouseKeeping/HouseKeepingRequests'
import BookTaxi from '../components/Pages/Department/Concierge/BookTaxi'
import CarRental from '../components/Pages/Department/Concierge/CarRental'
import GetMyCar from '../components/Pages/Department/Concierge/GetMyCar'
import TravelDesk from '../components/Pages/Department/Concierge/TravelDesk'
import Maintanance from '../components/Pages/Maintanance/Maintanance'
import HotelShuttle from '../components/Pages/Department/Concierge/HotelShuttle'
import SpaWellnessRequests from '../components/Pages/Department/SpaWellness/SpaWellnessRequests'
import SpaWellnessBooking from '../components/Pages/Department/SpaWellness/SpaWellnessBooking'
import SpaWellnessDetailsInfo from '../components/Pages/Department/SpaWellness/SpaWellnessDetailsInfo'
import CallHotel from '../components/Pages/Department/CallHotel/CallHotel'
import IntermediateScreenOtp from '../components/Pages/Authentication/IntermediateScreen/IntermediateScreenOtp'
import { SPA_WELNESS } from '../config/constants'
import OrganizationChart from '../components/Pages/Staff/OrganizationChart'

import IncomingGuestRequest from '../components/Pages/IncomingAndRaisedRequests/IncomingGuestRequest'
import IncomingDepartmentRequest from '../components/Pages/IncomingAndRaisedRequests/IncomingDepartmentRequest'
import RaisedGuestRequest from '../components/Pages/IncomingAndRaisedRequests/RaisedGuestRequest'
import RaisedDepartmentRequest from '../components/Pages/IncomingAndRaisedRequests/RaisedDepartmentRequest'
import MoreRequests from '../components/Pages/MoreRequests/MoreRequests'
import Locations from '../components/Pages/Locations/Locations'
import Reports from '../components/Pages/Reports'
import Settings from '../components/Pages/Settings'
import HouseKeepingServices from '../components/Pages/HouseKeepingServices/HoueKeepingServices'
import Faq from '../components/Pages/Department/FrontDesk/faq'
import ChatWithIva from '../components/Pages/Chat/ChatWithIva'
import AllReports from '../components/Pages/AllHotelsReports'
import RecurringTaskScheduler from '../components/Pages/Department/HouseKeeping/TaskSchedule/RecurringTaskScheduler'
import HouseKeepingTimeScheduler from '../components/Pages/Department/HouseKeeping/TaskSchedule/HouseKeepingTimeScheduler'
import RoomView from '../components/Pages/RoomView/RoomView'

export const AuthPermission = { STAFF: 'staff', HOTELADMIN: 'hoteladmin' }

const SpaAndWelnessReservation = [
  SPA_WELNESS.RESERVATION.ALL,
  SPA_WELNESS.RESERVATION.SPA,
  SPA_WELNESS.RESERVATION.GYM,
  SPA_WELNESS.RESERVATION.SALON,
].map(path => ({
  exact: true,
  path,
  component: SpaWellnessRequests,
  isAuthenticated: true,
  permission: [AuthPermission.STAFF],
}))

const SpaAndWelnessBooking = [
  SPA_WELNESS.BOOKING.ALL,
  SPA_WELNESS.BOOKING.SPA,
  SPA_WELNESS.BOOKING.GYM,
  SPA_WELNESS.BOOKING.SALON,
].map(path => ({
  exact: true,
  path,
  component: SpaWellnessBooking,
  isAuthenticated: true,
  permission: [AuthPermission.STAFF],
}))

export const routeConstant = [
  {
    exact: true,
    path: [
      '/',
      // '/signin',
      // '/signin/:hotelName',
      // '/signIn',
      // '/signIn/:hotelName',
      // '/Signin',
      // '/Signin/:hotelName',
      '/SignIn',
      '/SignIn/:hotelName',
    ],
    component: SignIn,
    isAuthenticated: false,
  },
  {
    exact: true,
    path: ['/maintenance'],
    component: Maintanance,
    isAuthenticated: false,
  },
  {
    exact: true,
    path: ['/Organizationchart'],
    component: OrganizationChart,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/dept-confirm/:token',
    component: SetNewPassword,
    isAuthenticated: false,
  },
  {
    exact: true,
    path: '/dept-verify/:token',
    component: OtpVerificationScreen,
    isAuthenticated: false,
  },
  {
    exact: true,
    path: '/password-change-success',
    component: IntermediateScreenOtp,
    isAuthenticated: false,
  },
  {
    exact: true,
    path: '/ForgotPassword',
    component: ForgotPassword,
    isAuthenticated: false,
  },
  {
    exact: true,
    path: '/ResetPassword',
    component: ConfirmPassword,
    isAuthenticated: false,
  },
  {
    exact: true,
    path: '/OtpVerification',
    component: OtpVerification,
    isAuthenticated: false,
  },
  {
    exact: true,
    path: '/LinkExpired',
    component: LinkExpired,
    isAuthenticated: true,
  },
  {
    exact: true,
    path: '/Dashboard',
    component: Dashboard,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/HotelInfo',
    component: HotelInfo,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/Department',
    component: Department,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/GuestInfo',
    component: GuestInfo,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: ['/ServiceRequests', '/GuestRequests', '/DepartmentRequests'],
    component: ServiceRequests,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/Reservations',
    component: Reservations,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/RoomService',
    component: FBRoomservice,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/RoomServiceMenu',
    component: RoomServiceMenu,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/Cuisine',
    component: Cuisine,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/Restaurant',
    component: Restaurant,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/TitleandPermissions',
    component: TitleandPermissions,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/chatwithiva',
    component: ChatWithIva,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/Staff',
    component: Staff,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/Promotions',
    component: Promotions,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/HouseKeepingServices',
    component: HouseKeepingServices,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/RecurringTaskScheduler',
    component: RecurringTaskScheduler,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/HouseKeepingTimeScheduler',
    component: HouseKeepingTimeScheduler,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/RoomView',
    component: RoomView,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/TermsConditionsPrivacyPolicy',
    component: TermsConditionsPrivacyPolicy,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/MyProfile',
    component: MyProfile,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: '/FrontDeskGuest',
    component: FrontDeskGuest,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/FrontDeskCheckInOut',
    component: FrontDeskCheckInOut,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/HouseKeepingRequests',
    component: HouseKeepingRequests,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/BookTaxi',
    component: BookTaxi,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/CarRental',
    component: CarRental,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/GetMyCar',
    component: GetMyCar,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/TravelDesk',
    component: TravelDesk,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/HotelShuttle',
    component: HotelShuttle,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    alternatePath: ['/RoomUpgrade', '/OtherRequest', '/ScheduledTime'],
    path: '/RoomUpgrade',
    component: FrontDeskRequests,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    alternatePath: ['/RoomUpgrade', '/OtherRequest', '/ScheduledTime'],
    path: '/OtherRequest',
    component: FrontDeskRequests,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    alternatePath: ['/RoomUpgrade', '/OtherRequest', '/ScheduledTime'],
    path: '/ScheduledTime',
    component: FrontDeskRequests,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/faq',
    component: Faq,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/ChatWithIva',
    component: ChatWithIva,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/RoomType',
    component: RoomType,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/Rooms',
    component: Rooms,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/FoodAndBeverageRequests',
    component: FBRoomservice,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/FBRoomService',
    component: FBRoomservice,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/MedicalService',
    component: FBRoomserviceTwo,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/Reservation',
    component: FBRestaurants,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  ...SpaAndWelnessReservation,
  ...SpaAndWelnessBooking,
  {
    exact: true,
    path: '/SpaWellnessDetailsInfo',
    component: SpaWellnessDetailsInfo,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/more-requests',
    component: MoreRequests,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/CallHotel',
    component: CallHotel,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/incoming-guest-request',
    component: IncomingGuestRequest,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/incoming-department-request',
    component: IncomingDepartmentRequest,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/raised-guest-request',
    component: RaisedGuestRequest,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/raised-department-request',
    component: RaisedDepartmentRequest,
    isAuthenticated: true,
    permission: [AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/locations',
    component: Locations,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
  {
    exact: true,
    path: [
      '/reports/:reportId',
      '/reports/1',
      '/reports/2',
      '/reports/3',
      '/reports/4',
      '/reports/6',
    ],
    component: Reports,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: [
      '/allreports/:reportId',
      '/allreports/1',
      '/allreports/2',
      '/allreports/3',
      '/allreports/4',
      '/allreports/6',
    ],
    component: AllReports,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN, AuthPermission.STAFF],
  },
  {
    exact: true,
    path: '/Settings',
    component: Settings,
    isAuthenticated: true,
    permission: [AuthPermission.HOTELADMIN],
  },
]

// add NotFound route after all the routes
routeConstant.push({
  path: '*' || '/(.+)',
  component: NotFound,
  isAuthenticated: false,
})
