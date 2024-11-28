import {
  createSlice,
  configureStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit'
import _ from 'underscore'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage/session'

import {
  checkInLable,
  checkOutLable,
  DiningSubMenuConfig,
  loadProgress,
  LoginStatus,
  PAGELOADER,
  searchingDomainMessages,
  defaulltManagementKey,
  defaultCommonModalData,
  ManagementDeptObject,
  HotelAdminRole,
} from '../config/constants'
import {
  AddIndex,
  ChangeTheme,
  Sort,
  sortByCreatedAt,
  countryCodeList,
  Ternary,
  showStickyBar,
  hideStickyBar,
  getChildIdToParentIds,
  checkCyclicRecursion,
} from '../config/utils'
import { langClassName, langList } from '../config/language'
import DepartmentAndServiceKeys from '../config/departmentAndServicekeys'
import {
  getManagerHierarchyList,
  getIdToInfo,
  getManagerList,
} from './../config/utils'

const CalcDepartmentAndServiceData = (state, data) => {
  const keyToId = { ...state.departmentAndServiceKeyToId }
  const keyToName = { ...state.departmentAndServiceKeyToName }
  const keyToStatus = { ...state.departmentAndServiceKeyToStatus }
  const idToInfo = {
    ...state.departmentAndServiceIdToInfo,
    ...defaulltManagementKey,
  }

  data?.forEach(s => {
    const { key, id, name, active } = s
    keyToId[key] = id
    keyToName[key] = name
    keyToStatus[key] = active
    idToInfo[id] = { ...s }
  })

  state.departmentAndServiceKeyToId = keyToId
  state.departmentAndServiceKeyToName = keyToName
  state.departmentAndServiceKeyToStatus = keyToStatus
  state.departmentAndServiceIdToInfo = idToInfo

  const dept =
    state?.departmentAndServiceIdToInfo[state?.userInfo?.departmentId]
  const deptName = dept?.default ? dept?.name : ''
  SetPageTitle(state, deptName)
}

const SetPageTitle = (state, newTitle) => {
  let pageTitle = ''
  if (state.isHotelAdmin) {
    pageTitle = 'Hotel Admin'
  } else if (newTitle) {
    pageTitle = newTitle
  } else {
    pageTitle =
      state?.departmentAndServiceIdToInfo[state?.userInfo?.departmentId]
        ?.name || document.title
  }
  document.title = pageTitle
}

const SetSideMenuToParentKey = (sideMenuData = []) => {
  let data = sideMenuData.reduce((acc, curr) => {
    if (curr.subMenu) {
      const parentKey = String(curr.index)
      curr.subMenu.forEach(s => (acc[s.linkTo] = [parentKey, String(s.index)]))
    }
    return acc
  }, {})

  // for hotel admin
  DiningSubMenuConfig.forEach(s => (data[s.linkTo] = [s.parentKey, s.key]))

  return data
}

const concierge_ServiceKeys = DepartmentAndServiceKeys.concierge.services

function filterGroupUser({ state, staffList = [], groupStaffList = [] }) {
  const tempStaffList = staffList.length ? staffList : state.staffList
  const tempGroupStaffList = groupStaffList.length
    ? groupStaffList
    : state.groupStaffList

  if (!tempStaffList.length || !tempGroupStaffList.length) return

  const staffListIds = tempStaffList.map(s => s.userId)

  state.groupStaffList = tempGroupStaffList.filter(
    s => !staffListIds.includes(s.userId)
  )
}

const initialState = {
  config: {
    translationVersion: '9',
  },
  hotelId: '',
  userInfo: null,
  isCustomDepartmentLogin: false,
  hotelInfo: null,
  gettingHotelLogo: false,
  hotelLogo: null,
  hotelWallpaper: null,
  subDomain: '',
  subDomainData: '',
  subDomainNotFound: false,
  currentHotelListenerAdded: false,
  servicesListenerAdded: false,

  sideMenuSelectedKey: '',
  sideMenuOpenKeys: [],
  services: [],
  notifications: [],
  isNotificationListener: false,

  loadingCuisines: false,
  cuisineListenerAdded: false,
  cuisines: [],
  cuisneIdToName: {},

  loadingFoodMenu: false,
  foodMenuListenerAdded: false,
  foodMenus: [],

  loadingPromoMenu: false,
  loadingPromoMenuTwo: false,
  promoMenuListenerAdded: false,
  promoMenuListenerAddedTwo: false,
  promoMenus: [],
  promoMenusTwo: [],

  languageDictionary: [],
  flatLanguageData: {},

  themecolor: '#1780CD',
  themefontColor: '#ffffff',

  currentLanguage: localStorage.getItem('language') || 'en',
  previousLanguage: 'en',
  messages: {},

  customDepartmentImages: {},
  customServiceImages: {},

  titleAndPermissionListenerAdded: false,
  titleAndPermission: [],

  gettingTitleAndPermission: false,

  isHotelAdmin: false,
  sideMenus: [],
  sideMenuToParentKey: SetSideMenuToParentKey([]),

  roomTypeListenerAdded: false,
  roomTypes: [],
  rooms: [],
  outOfServiceRooms: [],
  roomsLoading: false,
  outOfServiceRoomsLoading: false,

  loadingGuests: false,
  guestListenerAdded: false,
  guests: [],
  guestIdToInfo: {},
  occupiedRooms: 0,
  checkInCheckOutRequests: [],

  loadingFrontDeskRequests: false,
  frontDeskRequestsListenerAdded: false,
  houseKeepingRequestsListenerAdded: false,
  loadingConciergeRequests: false,
  conciergeRequestsListenerAdded: {
    [concierge_ServiceKeys.bookTaxi.key]: false,
    [concierge_ServiceKeys.carRental.key]: false,
    [concierge_ServiceKeys.getMyCar.key]: false,
    [concierge_ServiceKeys.travelDesk.key]: false,
  },
  frontDeskRequests: [],
  houseKeepingRequests: [],
  recurringTaskRequests: [],
  loadingHouseKeepingRequests: false,
  loadingRecurringTaskRequests: false,
  conciergeRequests: {
    [concierge_ServiceKeys.bookTaxi.key]: [],
    [concierge_ServiceKeys.carRental.key]: [],
    [concierge_ServiceKeys.getMyCar.key]: [],
    [concierge_ServiceKeys.travelDesk.key]: [],
  },
  departments: [],
  departmentIds: [],
  defaultDepartments: [],
  houseKeepingDepartmentId: '',
  conciergeDepartmentId: '',
  serviceListenerAdded: false,

  loadingService: false,
  service: [],

  loadingGuestService: false,
  guestService: [],

  loadingDeptService: false,
  deptService: [],

  recurringPermissions: {
    canRecurringScheduler: null,
    canListView: null,
    canTaskSheetManagementView: null,
  },

  userId: '',
  newPassword: null,
  fakedb: {},

  loadingRoomServices: false,
  roomServiceListenerAdded: false,
  roomServices: [],

  loadingRestaurantReservationServices: false,
  restaurantReservationServiceListenerAdded: false,
  restaurantReservations: [],

  loadingRestaurants: false,
  restaurantsListenerAdded: false,
  restaurants: [],

  checkedInGuestListenerAdded: false,
  checkedInGuests: [],
  isAppLoaded: false,
  flatSideMenus: [],
  isCurrentUserListenerAdded: false,

  departmentsNew: [],
  departmentAndServiceIdToInfo: {},
  departmentListenerAdded: false,
  servicesNew: {},
  customDepartmentsNew: [],
  customDepartmentListenerAdded: false,
  departmentAndServiceKeyToId: {},
  departmentAndServiceKeyToName: {},
  departmentAndServiceKeyToStatus: {},

  appVersion: '',
  currentUserTitle: '',
  loadingReservations: false,
  reservationListenerAdded: false,
  reservations: [],
  googleLangCode: localStorage.getItem('language') || 'en',

  isStaffListenerAdded: false,
  staffList: [],
  managerList: [],
  isLanguageListenerAdded: false,
  staffLoading: true,
  currentRoute: '',

  groupStaffLoading: true,
  groupStaffList: [],

  spa: [],
  spaListenerAdded: false,
  LoadingSpa: true,
  saloon: [],
  saloonListenerAdded: false,
  LoadingSaloon: true,
  gym: [],
  gymListenerAdded: false,
  LoadingGym: true,
  searchingHotel: loadProgress.TOLOAD,
  searchingHotelMessage: searchingDomainMessages.LOADING,
  isSideMenuOpen: false,
  archivedServiceRequestData: [],
  loadingArchivedServiceRequest: false,
  lastVisitedArchivedServiceRequest: -1,
  archivedServiceListenerAdded: false,

  checkinAndCheckoutCountListenerAdded: false,
  checkInCount: 0,
  checkOutCount: 0,

  staffCountListenerAdded: false,
  staffCount: { active: 0, inactive: 0 },

  loadingDashboardServiceRequest: false,
  dashboardServiceRequestListenerAdded: false,
  dashboardServiceRequestPending: [],
  dashboardServiceRequestInprogress: [],
  dashboardServiceRequestCompleted: [],

  loadingBookings: false,
  bookingListenerAdded: false,
  bookings: [],
  unauthorized: false,
  isLoggedIn: LoginStatus.LOGGED_OUT,
  pageLoading: PAGELOADER.TOLOAD,
  tokenDetail: null,
  searchingDomain: loadProgress.TOLOAD,
  searchingDomainMessage: searchingDomainMessages.LOADING,
  countryCode: countryCodeList?.[0] ?? '',
  hotelAdminDashboardStat: {
    occupiedRooms: 0,
    reservationCompleted: 0,
    reservationInProgress: 0,
    reservationPending: 0,
    reservationRejected: 0,
    roomCount: 0,
    staffActiveCount: 0,
    staffInactiveCount: 0,
    totalDepartments: 0,
  },
  hotelAdminDashboardStatListenerAdded: false,
  overViewChartDataListenerAdded: false,
  ovewViewChartData: {},
  hotelGuideLines: {
    data: [],
    loadingStatus: loadProgress.TOLOAD,
  },
  managerToStaffList: {},
  userIdToInfo: {},
  production: {
    enableStickyBar: false,
    showMaintenancePage: false,
    fromDate: null,
    toDate: null,
    appVersion: '',
  },
  commonModalData: defaultCommonModalData,
  fetchTokenData: {
    loading: PAGELOADER.TOLOAD,
    data: null,
  },
  otpData: null,
  fetchDeptService: {
    loading: true,
    data: [],
  },

  incomingGuestRequest: [],
  loadingIncomingGuestRequest: true,

  incomingDepartmentRequest: [],
  loadingIncomingDepartmentRequest: true,

  incomingAllRequest: [],
  loadingIncomingAllRequest: true,

  raisedGuestRequest: [],
  loadingRaisedGuestRequest: true,

  raisedDepartmentRequest: [],
  loadingRaisedDepartmentRequest: true,

  raisedAllRequest: [],
  loadingRaisedAllRequest: true,

  addRaisedRequestModalStatus: false,

  enableGlobalConfig: { status: false, msg: '' },

  staffListForLoggedManager: [],
  locationTypeIdToInfo: {},
  locationIdToInfo: {},
  allLocationsReports: [],
  hotelsByGroupId: [],
  headerModalData: defaultCommonModalData,

  managerIdToStaffIds: {},
  grandParentToGrandChild: {},
  childIdToParentIds: {},
  staffHierarchyErrorLogs: {},
  imageViewer: {},
  ratingConfig: {},
  viewOrderModal: {},
  isManagementStaff: false,
  overAllFeedbackQuestion: {
    data: [],
    activeQuestionCount: 0,
    loadingStatus: loadProgress.TOLOAD,
  },
  hotelFeedbacks: {
    data: [],
    loadingStatus: loadProgress.TOLOAD,
  },
  selectedRequest: {},
  commentsLoading: false,
  requestComments: [],
  feedbackQuestionnaire: [],
  feedbackLoading: false,
  guestSettingsList: [],
  guestSettingsLoading: false,
  existingLevelsAllocatedFeedbackSettingsLoading: false,
  existingLevelsAllocatedFeedbackSettings: [],
  levelBasedDisable: false,
}

const slice = createSlice({
  name: 'InPlass Hotel Admin',
  initialState,
  reducers: {
    setHotelFeedbacks: (state, action) => {
      state.hotelFeedbacks.loadingStatus = action.payload.loadingStatus

      if (action.payload?.data) {
        state.hotelFeedbacks.data = action.payload?.data
      }
    },
    setOverAllFeedbackQuestion: (state, action) => {
      state.overAllFeedbackQuestion.loadingStatus = action.payload.loadingStatus

      if (action.payload?.data) {
        state.overAllFeedbackQuestion.data = action.payload?.data
        state.overAllFeedbackQuestion.activeQuestionCount = Object.values(
          action.payload?.data || {}
        ).filter(ques => !ques.isDelete).length
      }
    },
    setViewOrderModal: (state, action) => {
      state.viewOrderModal = action.payload
    },
    setImageViewer: (state, action) => {
      state.imageViewer = action.payload
    },
    setHeaderModalData: (state, action) => {
      state.headerModalData = action.payload
    },
    setHotelsByGroupId: (state, actions) => {
      state.hotelsByGroupId = actions.payload
    },
    setLocations: (state, actions) => {
      state.locationIdToInfo = actions.payload
    },
    setAllLocationsReports: (state, actions) => {
      state.allLocationsReports = actions.payload
    },
    setLocationTypes: (state, actions) => {
      state.locationTypeIdToInfo = actions.payload
    },
    setStaffListForLoggedManager: (state, action) => {
      const staffListForLoggedManager = Sort(action.payload, 'name')

      const { userIdToInfo, managerIdToStaffIds } = getIdToInfo(
        staffListForLoggedManager,
        state
      )

      const isCyclicGraph = checkCyclicRecursion({
        managerIdToStaffIds,
        userIdToInfo,
      })

      if (isCyclicGraph.errorLog.length) {
        state.staffHierarchyErrorLogs = isCyclicGraph
      } else {
        state.staffHierarchyErrorLogs = {}
        state.grandParentToGrandChild =
          getManagerHierarchyList(managerIdToStaffIds)

        state.staffListForLoggedManager = staffListForLoggedManager
        state.childIdToParentIds = getChildIdToParentIds(
          staffListForLoggedManager
        )
      }
    },
    setEnableGlobalConfig: (state, action) => {
      state.enableGlobalConfig = action.payload
    },
    setAddRaisedRequestModalStatus: (state, action) => {
      state.addRaisedRequestModalStatus = action.payload
    },
    setFetchDeptService: (state, action) => {
      state.fetchDeptService.loading = action.payload.loading

      if (action.payload?.data) {
        state.fetchDeptService.data = action.payload?.data
      }
    },
    setOTPData: (state, action) => {
      state.otpData = action.payload
    },
    setSubDomainData: (state, action) => {
      state.subDomainData = action.payload
    },
    setSearchingDomain: (state, action) => {
      state.searchingDomain = action.payload.searchingDomain
      state.searchingDomainMessage = action.payload.searchingDomainMessage
    },
    setFetchToken(state, action) {
      state.fetchTokenData = action.payload
    },
    setPageLoading: (state, action) => {
      state.pageLoading = action.payload
    },
    setCommonModalData: (state, action) => {
      state.commonModalData = action.payload
    },
    setIsSideMenuOpen: (state, action) => {
      state.isSideMenuOpen = action.payload
    },
    setProduction: (state, action) => {
      const data = { ...state.production, ...action.payload }
      state.production = data
      if (data.enableStickyBar) {
        showStickyBar()
      } else {
        hideStickyBar()
      }
    },
    setAppVersion: (state, action) => {
      state.appVersion = action.payload
    },
    setSearchingHotel: (state, action) => {
      state.searchingHotel = action.payload.searchingHotel
      state.searchingHotelMessage = action.payload.searchingHotelMessage
    },
    setCurrentUserTitle: (state, action) => {
      state.currentUserTitle = action.payload
    },
    setCurrentroute: (state, action) => {
      state.currentRoute = action.payload
      if (action.payload in state.sideMenuToParentKey) {
        const sideMenuData = state.sideMenuToParentKey[action.payload]
        if (sideMenuData) {
          const menuCollapsed = !state.sideMenuOpenKeys.some(
            i => i === sideMenuData[0]
          )
          if (menuCollapsed) {
            state.sideMenuOpenKeys = [
              ...new Set([...state.sideMenuOpenKeys, sideMenuData[0]]),
            ]
          }
          state.sideMenuSelectedKey = sideMenuData
        }
      }
    },
    setAppLoaded: (state, action) => {
      state.isAppLoaded = action.payload
    },
    setCurrentUserListenerStatus: (state, action) => {
      state.isCurrentUserListenerAdded = action.payload
    },
    reset: (state, action) => {
      const setLogout = action.payload?.setLogout || true

      state.isHotelAdmin = initialState.isHotelAdmin
      state.isCustomDepartmentLogin = initialState.isCustomDepartmentLogin
      state.gettingTitleAndPermission = initialState.gettingTitleAndPermission
      state.gettingHotelLogo = initialState.gettingHotelLogo
      state.sideMenus = initialState.sideMenus
      state.sideMenuToParentKey = initialState.sideMenuToParentKey
      state.isCurrentUserListenerAdded = false
      state.isNotificationListener = initialState.isNotificationListener

      if (setLogout) state.isLoggedIn = LoginStatus.LOGGED_OUT

      state.userInfo = initialState.userInfo

      const { hotelId, groupId } = state.hotelInfo || {}
      state.hotelInfo = state?.hotelInfo?.hotelId ? { hotelId, groupId } : null
    },
    setUserId: (state, action) => {
      state.userId = action.payload
    },
    setNewPassword: (state, action) => {
      state.newPassword = action.payload
    },
    clearConfirmParams: state => {
      state.userId = null
      state.newPassword = null
      state.userInfo = null
      state.fetchTokenData = {
        loading: PAGELOADER.TOLOAD,
        data: null,
      }
    },
    clearStateAfterForceLogout: state => {
      state.services = initialState.services
      state.userInfo = initialState.userInfo
      state.sideMenus = initialState.sideMenus
      state.sideMenuToParentKey = initialState.sideMenuToParentKey
      state.subDomainNotFound = initialState.subDomainNotFound
      state.isCurrentUserListenerAdded = initialState.isCurrentUserListenerAdded
      state.isLoggedIn = LoginStatus.LOGGED_OUT
    },
    setUserInfo: (state, action) => {
      const themecolor = action.payload?.themecolor
        ? action.payload?.themecolor
        : '#1780CD'
      const themefontColor = action.payload?.themefontColor
        ? action.payload?.themefontColor
        : '#ffffff'
      ChangeTheme({ themecolor, themefontColor })

      if (action.payload.currentUserTitle) {
        state.currentUserTitle = action.payload.currentUserTitle
      }

      state.userInfo = action.payload
      state.hotelId = action.payload?.hotelId
      state.themecolor = themecolor
      state.themefontColor = themefontColor
      state.currentLanguage = action.payload?.currentLanguage
        ? action.payload?.currentLanguage
        : 'en'
      state.previousLanguage = action.payload?.previousLanguage
        ? action.payload?.previousLanguage
        : 'en'
      state.isCustomDepartmentLogin =
        action.payload?.customDepartmentStaff ?? false

      state.isHotelAdmin =
        action.payload?.roles?.includes(HotelAdminRole) ?? false
      state.isManagementStaff =
        action.payload?.departmentId === ManagementDeptObject.id ?? false

      localStorage.setItem('tmplanguage', state.currentLanguage)
      SetPageTitle(state)
    },
    setHotelInfo: (state, action) => {
      state.hotelInfo = { ...state.hotelInfo, ...action.payload }
    },
    setHotelId: (state, action) => {
      state.hotelId = action.payload
    },
    setSideMenuSelectedKey: (state, action) => {
      state.sideMenuSelectedKey = action.payload
      if (
        Array.isArray(action.payload) &&
        action.payload.length &&
        action.payload?.[0]
      ) {
        state.sideMenuOpenKeys = [action.payload[0]]
      }
    },
    setServices: (state, action) => {
      const sortedServies = Sort(action.payload, 'index')
      state.services = sortedServies
      state.loadingService = false
      CalcDepartmentAndServiceData(state, action.payload)
    },
    setLoadingServices: state => {
      state.loadingService = true
    },
    setSideMenuOpenKeys: (state, action) => {
      let findIndex = state.sideMenuOpenKeys.findIndex(
        item => item === action.payload
      )
      if (findIndex === -1) {
        state.sideMenuOpenKeys = [...state.sideMenuOpenKeys, action.payload]
      } else {
        state.sideMenuOpenKeys = state.sideMenuOpenKeys.filter(
          item => item !== action.payload
        )
      }
    },
    setCustomSideMenuOpenKeys: (state, action) => {
      state.sideMenuOpenKeys = action.payload
    },
    setDefaultSideMenuOpenKeys: (state, _action) => {
      state.sideMenuOpenKeys = []
    },
    setLoadingCuisines: (state, action) => {
      state.loadingCuisines = action.payload
    },
    setCuisineListenerAdded: (state, action) => {
      state.cuisineListenerAdded = action.payload
    },
    setCuisines: (state, action) => {
      const sortedCuisines = Sort(action.payload, 'index')
      state.cuisines = sortedCuisines
    },
    setLoadingFoodMenu: (state, action) => {
      state.loadingFoodMenu = action.payload
    },
    setFoodMenuListenerAdded: (state, action) => {
      state.foodMenuListenerAdded = action.payload
    },
    setFoodMenus: (state, action) => {
      const sortedFoodMenus = Sort(action.payload, 'dish')
      state.foodMenus = sortedFoodMenus
    },
    setLoadingPromoMenu: (state, action) => {
      state.loadingPromoMenu = action.payload
    },
    setLoadingPromoMenuTwo: (state, action) => {
      state.loadingPromoMenuTwo = action.payload
    },
    setPromoMenuListenerAdded: (state, action) => {
      state.promoMenuListenerAdded = action.payload
    },
    setPromoMenuListenerAddedTwo: (state, action) => {
      state.promoMenuListenerAddedTwo = action.payload
    },
    setPromoMenus: (state, action) => {
      const sortedPromoMenus = Sort(action.payload, 'subject')
      state.promoMenus = sortedPromoMenus
    },
    setPromoMenusTwo: (state, action) => {
      const sortedPromoMenus = Sort(action.payload, 'subject')
      state.promoMenusTwo = sortedPromoMenus
    },
    setFetchLanguageDictionary: (state, action) => {
      state.languageDictionary = action.payload.languageList
      state.flatLanguageData = action.payload.flatLanguageData
    },
    setGettingHotelLogo: (state, action) => {
      state.gettingHotelLogo = action.payload
    },
    setHotelLogo: (state, action) => {
      let hotelWallpaper = action.payload.hotelWallpaper
      let wallpaperImg = Ternary(
        hotelWallpaper && hotelWallpaper.length > 0,
        hotelWallpaper?.[0],
        '../images/defaultSignInBackground.png'
      )

      state.hotelLogo = action.payload.hotelLogo
      state.hotelWallpaper = wallpaperImg
      state.gettingHotelLogo = false
    },

    setCustomDepartmentImages: (state, action) => {
      state.customDepartmentImages = action.payload
    },
    setCustomDepartmentImage: (state, action) => {
      const { departmentId, imageUrl } = action.payload
      state.customDepartmentImages[departmentId] = imageUrl
    },
    deleteCustomDepartmentImage: (state, action) => {
      const departmentId = action.payload
      delete state.customDepartmentImages[departmentId]
    },
    setCustomServiceImages: (state, action) => {
      state.customServiceImages = action.payload
    },
    setCustomServiceImage: (state, action) => {
      const { serviceName, imageUrl } = action.payload
      state.customServiceImages[serviceName] = imageUrl
    },
    deleteCustomServiceImage: (state, action) => {
      const serviceName = action.payload
      delete state.customServiceImages[serviceName]
    },
    setLanguageConfig: (state, action) => {
      state.currentLanguage = action.payload?.currentLanguage
        ? action.payload?.currentLanguage
        : 'en'
      state.previousLanguage = action.payload?.previousLanguage
        ? action.payload?.previousLanguage
        : 'en'
      state.messages = action.payload?.messages ? action.payload?.messages : {}
      state.googleLangCode = action.payload?.googleLangCode
        ? action.payload?.googleLangCode
        : 'en'
      localStorage.setItem('language', action.payload.currentLanguage ?? 'en')
      localStorage.setItem('tmplanguage', action.payload.googleLangCode ?? 'en')

      let sClassName = ''
      switch (action.payload?.currentLanguage) {
        case langList.ml:
          sClassName = langClassName.ml
          break
        case langList.ar:
          sClassName = langClassName.ar
          break
        case langList.ur:
          sClassName = langClassName.ar
          break
        default:
          break
      }
      document.body.classList.remove(langClassName.ar)
      document.body.classList.remove(langClassName.ml)
      document.body.classList.remove(langClassName.ur)
      if (sClassName) document.body.classList.add(sClassName)
    },
    setSubDomain: (state, action) => {
      state.subDomain = action.payload
    },
    setCurrentHotelListenerAdded: state => {
      state.currentHotelListenerAdded = true
    },
    setServicesListenerAdded: state => {
      state.servicesListenerAdded = true
    },
    setSubDomainNotFound: (state, action) => {
      state.subDomainNotFound = action.payload
      state.gettingHotelLogo = false
    },
    setTitleAndPermissionListenerAdded: state => {
      state.titleAndPermissionListenerAdded = true
    },
    setTitleAndPermission: (state, action) => {
      state.titleAndPermission = action.payload
    },
    setGettingTitleAndPermission: (state, action) => {
      state.gettingTitleAndPermission = action.payload
    },
    setIsHotelAdmin: (state, action) => {
      state.isHotelAdmin = action.payload
      state.sideMenus = initialState.sideMenus
      state.sideMenuToParentKey = initialState.sideMenuToParentKey
      SetPageTitle(state)
    },
    setSideMenus: (state, action) => {
      state.sideMenus = action.payload.sideMenus
      state.isHotelAdmin = false
      state.flatSideMenus = action.payload.flatSideMenus

      state.sideMenuToParentKey = SetSideMenuToParentKey(
        action.payload.sideMenus
      )
    },
    setThemeColor: (state, action) => {
      state.themecolor = action.payload
    },
    setThemeFontColor: (state, action) => {
      state.themefontColor = action.payload
    },
    setRoomTypeListenerAdded: (state, action) => {
      state.roomTypeListenerAdded = action.payload
    },
    setRoomTypes: (state, action) => {
      state.roomTypes = AddIndex(action.payload)
    },
    setRooms: (state, action) => {
      state.rooms = action.payload
    },
    setRoomsLoading: (state, action) => {
      state.roomsLoading = action.payload
    },
    setOutOfServiceRooms: (state, action) => {
      state.outOfServiceRooms = action.payload
    },
    setOutOfServiceRoomsLoading: (state, action) => {
      state.outOfServiceRoomsLoading = action.payload
    },
    setLoadingGuests: (state, action) => {
      state.loadingGuests = action.payload
    },
    setGuestListenerAdded: (state, action) => {
      state.guestListenerAdded = action.payload
    },
    setGuests: (state, action) => {
      const guests = action.payload.filter(
        g => g.status === checkInLable || g.status === checkOutLable
      )
      state.guests = AddIndex(guests)
      state.occupiedRooms = guests.filter(
        i => i.status === checkInLable && i.isDelete === false
      ).length
      state.checkInCheckOutRequests = AddIndex(
        action.payload.sort(sortByCreatedAt)
      )

      const guestIdToInfo = {}
      guests.forEach(g => (guestIdToInfo[g.id] = { ...g }))
      state.guestIdToInfo = guestIdToInfo
    },
    setFrontDeskRequestsListenerAdded: (state, action) => {
      state.frontDeskRequestsListenerAdded = action.payload
    },
    setLoadingFrontDeskRequests: (state, action) => {
      state.loadingFrontDeskRequests = action.payload
    },
    setHouseKeepingRequestsListenerAdded: (state, action) => {
      state.houseKeepingRequestsListenerAdded = action.payload
    },
    setConciergeRequestsListenerAdded: (state, action) => {
      state.conciergeRequestsListenerAdded[action.payload.key] =
        action.payload.value
      state.loadingConciergeRequests = true
    },
    setFrontDeskRequests: (state, action) => {
      state.frontDeskRequests = AddIndex(action.payload)
      state.loadingFrontDeskRequests = false
    },
    setHouseKeepingRequests: (state, action) => {
      state.houseKeepingRequests = AddIndex(action.payload)
    },
    setLoadingHouseKeepingRequests: (state, action) => {
      state.loadingHouseKeepingRequests = action.payload
    },
    setRecurringTaskRequests: (state, action) => {
      state.recurringTaskRequests = AddIndex(action.payload)
    },
    setLoadingRecurringTaskRequests: (state, action) => {
      state.loadingRecurringTaskRequests = action.payload
    },
    setConciergeRequests: (state, action) => {
      state.conciergeRequests[action.payload.key] = AddIndex(
        action.payload.data
      )
      state.loadingConciergeRequests = false
    },
    setServiceListenerAdded: (state, action) => {
      state.serviceListenerAdded = action.payload
    },
    setGuestService: (state, action) => {
      state.guestService = AddIndex(action.payload)
      state.loadingGuestService = false
    },
    setRecurringPermissions: (state, action) => {
      state.recurringPermissions = action.payload
    },
    setDeptService: (state, action) => {
      state.deptService = AddIndex(action.payload)
      state.loadingDeptService = false
    },
    setLoadingGuestServices: state => {
      state.loadingGuestService = true
    },
    setLoadingDeptServices: state => {
      state.loadingDeptService = true
    },
    setDepartments: (state, action) => {
      state.departments = AddIndex(action.payload)
      state.departmentIds = action?.payload?.map(item => item.id)
      CalcDepartmentAndServiceData(state, action.payload)
    },
    setHouseKeepingDepartmentId: (state, action) => {
      state.houseKeepingDepartmentId = action.payload
    },
    setConciergeDepartmentId: (state, action) => {
      state.conciergeDepartmentId = action.payload
    },
    setFakeDb: (state, action) => {
      state.fakedb = action.payload
    },
    setLoadingRoomServices: (state, action) => {
      state.loadingRoomServices = action.payload
    },
    setRoomServiceListenerAdded: (state, action) => {
      state.roomServiceListenerAdded = action.payload
    },
    setRoomServices: (state, action) => {
      state.roomServices = AddIndex(action.payload)
      state.loadingRoomServices = false
    },
    setCheckedInGuestListenerAdded: (state, action) => {
      state.checkedInGuestListenerAdded = action.payload
    },
    setCheckedInGuests: (state, action) => {
      state.checkedInGuests = action.payload
    },
    setRestaurantsListenerAdded: (state, action) => {
      state.restaurantsListenerAdded = action.payload
    },
    setLoadingRestaurants: (state, action) => {
      state.loadingRestaurants = action.payload
    },
    setRestaurants: (state, action) => {
      state.restaurants = AddIndex(action.payload)
      state.loadingRestaurants = false
    },
    setLoadingRestaurantReservationServices: (state, action) => {
      state.loadingRestaurantReservationServices = action.payload
    },
    setRestaurantReservationServiceListenerAdded: (state, action) => {
      state.restaurantReservationServiceListenerAdded = action.payload
    },
    setRestaurantReservations: (state, action) => {
      state.restaurantReservations = action.payload
    },
    setNotificationListener: (state, action) => {
      state.isNotificationListener = action.payload
    },
    setNotification: (state, action) => {
      state.notifications = action.payload
    },
    setDepartmentListenerAdded: (state, action) => {
      state.departmentListenerAdded = action.payload
    },
    setDepartmentsNew: (state, action) => {
      state.departmentsNew = action.payload
      state.defaultDepartments = action.payload.filter(
        data => data.default ?? true
      )
      CalcDepartmentAndServiceData(state, action.payload)
      SetPageTitle(state)
    },
    setCustomDepartmentListenerAdded: (state, action) => {
      state.customDepartmentListenerAdded = action.payload
    },
    setCustomDepartments: (state, action) => {
      state.customDepartmentsNew = action.payload
    },
    setServicesNew: (state, action) => {
      const clone = _.clone(state.servicesNew)
      const { id, data } = action.payload
      clone[id] = data
      state.servicesNew = clone
      CalcDepartmentAndServiceData(state, data)
    },
    setLoadingReservations: (state, action) => {
      state.loadingReservations = action.payload
    },
    setReservationListenerAdded: (state, action) => {
      state.reservationListenerAdded = action.payload
    },
    setReservations: (state, action) => {
      state.reservations = action.payload
    },
    setIsStaffListnerAdded: (state, action) => {
      state.isStaffListenerAdded = action.payload
    },
    setStaffList: (state, action) => {
      const { managerToStaffList, userIdToInfo, managerIdToStaffIds } =
        getIdToInfo(action.payload, state)
      const staffList = Sort(action.payload, 'name')
      state.staffList = staffList
      state.managerList = getManagerList(action.payload, userIdToInfo)
      state.managerToStaffList = managerToStaffList
      state.managerIdToStaffIds = managerIdToStaffIds

      const isCyclicGraph = checkCyclicRecursion({
        managerIdToStaffIds,
        userIdToInfo,
      })

      if (isCyclicGraph.errorLog.length) {
        state.staffHierarchyErrorLogs = isCyclicGraph
      } else {
        state.staffHierarchyErrorLogs = {}
        state.grandParentToGrandChild =
          getManagerHierarchyList(managerIdToStaffIds)
        state.childIdToParentIds = getChildIdToParentIds(staffList)
      }
      state.userIdToInfo = userIdToInfo
      filterGroupUser({ state, staffList: action.payload })
    },
    setGroupStaffList: (state, action) => {
      state.groupStaffList = Sort(action.payload, 'name')
      state.groupStaffLoading = false
      filterGroupUser({ state, groupStaffList: action.payload })
    },
    setManagerList: (state, action) => {
      state.managerList = Sort(action.payload, 'managerName')
    },
    setLoadingStaff: (state, action) => {
      state.staffLoading = action.payload
    },
    setGroupStaffLoading: (state, action) => {
      state.groupStaffLoading = action.payload
    },
    setLanguageListerner: (state, action) => {
      state.isLanguageListenerAdded = action.payload
    },
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload
    },
    setSpa: (state, action) => {
      state.spa = action.payload
      state.LoadingSpa = false
    },
    setSpaListenerAdded: (state, action) => {
      state.spaListenerAdded = action.payload
    },
    setSaloon: (state, action) => {
      state.saloon = action.payload
      state.LoadingSaloon = false
    },
    setSaloonListenerAdded: (state, action) => {
      state.saloonListenerAdded = action.payload
    },
    setGym: (state, action) => {
      state.gym = action.payload
      state.LoadingGym = false
    },
    setGymListenerAdded: (state, action) => {
      state.gymListenerAdded = action.payload
    },
    setCheckinAndCheckoutCountListenerAdded: (state, action) => {
      state.checkinAndCheckoutCountListenerAdded = action.payload
    },
    setCheckInCount: (state, action) => {
      state.checkInCount = action.payload
    },
    setCheckOutCount: (state, action) => {
      state.checkOutCount = action.payload
    },
    setStaffCountListenerAdded: (state, action) => {
      state.staffCountListenerAdded = action.payload
    },
    setStaffCount: (state, action) => {
      state.staffCount = action.payload
    },
    setLoadingDashboardServiceRequest: (state, action) => {
      state.loadingDashboardServiceRequest = action.payload
    },
    setDashboardServiceRequestListenerAdded: (state, action) => {
      state.dashboardServiceRequestListenerAdded = action.payload
    },
    setDashboardServiceRequestPending: (state, action) => {
      state.dashboardServiceRequestPending = action.payload
      state.loadingDashboardServiceRequest = false
    },
    setDashboardServiceRequestInprogress: (state, action) => {
      state.dashboardServiceRequestInprogress = action.payload
      state.loadingDashboardServiceRequest = false
    },
    setDashboardServiceRequestCompleted: (state, action) => {
      state.dashboardServiceRequestCompleted = action.payload
      state.loadingDashboardServiceRequest = false
    },
    setLoadingBookings: (state, action) => {
      state.loadingBookings = action.payload
    },
    setBookingListenerAdded: (state, action) => {
      state.bookingListenerAdded = action.payload
      state.loadingBookings = true
    },
    setBookings: (state, action) => {
      state.bookings = action.payload
      state.loadingBookings = false
    },
    setUnauthorized: (state, action) => {
      state.unauthorized = action.payload
    },
    setCountryCode: (state, action) => {
      state.countryCode = action.payload
    },
    setHotelAdminDashboardStat: (state, action) => {
      state.hotelAdminDashboardStat = {
        ...state.hotelAdminDashboardStat,
        ...action.payload,
      }
    },
    setHotelAdminDashboardStatListenerAdded: (state, action) => {
      state.hotelAdminDashboardStatListenerAdded = action.payload
    },
    setOverViewChartDataListenerAdded: (state, action) => {
      state.overViewChartDataListenerAdded = action.payload
    },
    setOvewViewChartData: (state, action) => {
      state.ovewViewChartData = action.payload
    },
    setHotelGuideLines: (state, action) => {
      state.hotelGuideLines = action.payload
    },
    setIncomingGuestRequest: (state, action) => {
      state.loadingIncomingGuestRequest = false
      state.incomingGuestRequest = action.payload
    },
    setIncomingDepartmentRequest: (state, action) => {
      state.loadingIncomingDepartmentRequest = false
      state.incomingDepartmentRequest = action.payload
    },
    setIncomingAllRequest: (state, action) => {
      state.loadingIncomingAllRequest = false
      state.incomingAllRequest = action.payload
    },
    setRaisedGuestRequest: (state, action) => {
      state.loadingRaisedGuestRequest = false
      state.raisedGuestRequest = action.payload
    },
    setRaisedDepartmentRequest: (state, action) => {
      state.loadingRaisedDepartmentRequest = false
      state.raisedDepartmentRequest = action.payload
    },
    setRaisedAllRequest: (state, action) => {
      state.loadingRaisedAllRequest = false
      state.raisedAllRequest = action.payload
    },
    setRatingConfig: (state, action) => {
      state.ratingConfig = action.payload
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload
    },
    setCommentsLoading: (state, action) => {
      state.commentsLoading = action.payload
    },
    setFeedbackQuestionnaire: (state, action) => {
      state.feedbackQuestionnaire = action.payload
    },
    setFeedbackLoading: (state, action) => {
      state.feedbackLoading = action.payload
    },
    setGuestSettingsList: (state, action) => {
      state.guestSettingsList = action.payload
    },
    setGuestSettingsLoading: (state, action) => {
      state.guestSettingsLoading = action.payload
    },
    setExistingLevelsAllocatedFeedbackSettingsLoading: (state, action) => {
      state.existingLevelsAllocatedFeedbackSettingsLoading = action.payload
    },
    setExistingLevelsAllocatedFeedbackSettings: (state, action) => {
      state.existingLevelsAllocatedFeedbackSettings = action.payload
    },
    setLevelBasedDisable: (state, action) => {
      state.levelBasedDisable = action.payload
    },
  },
  extraReducers: {
    // for thunk events
  },
})

const persistConfig = {
  key: 'InPlass Hotel Admin',
  version: 1,
  storage,
  whitelist: [
    'sideMenuSelectedKey',
    'sideMenuOpenKeys',
    'sideMenus',
    'currentRoute',
    'userInfo',
    'hotelInfo',
    'isLoggedIn',
    'countryCode',
    'subDomain',
    'flatSideMenus',
    'sideMenus',
    'isSideMenuOpen',
  ],
}

const { reducer } = slice
const persistedReducer = persistReducer(persistConfig, reducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
})

export const { actions } = slice
export const persistor = persistStore(store)
export default store
