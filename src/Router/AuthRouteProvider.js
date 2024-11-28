/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable react-hooks/exhaustive-deps /
import { createContext, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ConfigProvider } from 'antd'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { TileModal } from '../components/Common/Modals/TiledModal'
import { auth } from '../config/firebase'
import { CurrentHotelListener, GetHotelLogo } from '../services/hotels'
import { ServicesListener } from '../services/service'
import { CurrentUserListener, GetCurrentUser, Logout } from '../services/user'
import { actions } from '../Store'
import { antDLanguages, locale_languages } from '../config/language'
import {
  CreateLanguageDictionaryItem,
  GetLanguageDictionary,
} from '../services/languageDictionary'
import { ChangeTheme } from '../config/utils'
import WelcomeLoader from '../components/Common/WelcomeLoader/WelcomeLoader'
import { getFirestoreConfig, setFirestoreConfig } from '../services/config'
import { LoginStatus, unsubscribeFirebaseListeners } from '../config/constants'
import {
  MaintenanceListerner,
  unsubMaintenanceListner,
} from '../services/maintenance'
import Maintanance from '../components/Pages/Maintanance/Maintanance'
import { DefaultGuestFeedbackListener } from '../services/guest'

export const AuthContext = createContext()

function GetLoadContainer(data) {
  const {
    userInfo,
    currentHotelListenerAdded,
    dispatch,
    servicesListenerAdded,
  } = data
  if (userInfo) {
    const { hotelId } = userInfo
    if (!currentHotelListenerAdded) {
      dispatch(actions.setCurrentHotelListenerAdded())
      if (hotelId) CurrentHotelListener(hotelId, dispatch)
    }
    if (!servicesListenerAdded) {
      dispatch(actions.setServicesListenerAdded())
      if (hotelId) ServicesListener(hotelId, dispatch)
    }
    DefaultGuestFeedbackListener(hotelId, dispatch)
  }
}

const redirectToLogin = ({ subDomain, dispatch, userInfo }) => {
  return Logout({
    userInfo,
    success: () => {
      let url = `/SignIn/${subDomain}`
      dispatch(actions.clearStateAfterForceLogout())
      window.location.href = url
    },
    error: null,
    dispatch,
  })
}

const forcefullLogout = data => {
  const { userInfo, subDomain, dispatch } = data
  if (userInfo && userInfo.isDelete) {
    // Forcefully logout the user
    return TileModal(
      'Your account has been deleted',
      'Please reach out to Hotel Admin for more information',
      () => {
        return redirectToLogin({ subDomain, dispatch, userInfo })
      }
    )
  } else if (
    userInfo &&
    userInfo.hotelStatus === 'inactive' &&
    GetCurrentUser()
  ) {
    // Forcefully logout the user
    return TileModal(
      'Your hotel is temporarily inactive',
      'Your hotel is currently inactive .Please reach out to Inplass Admin for more information',
      () => {
        return redirectToLogin({ subDomain, dispatch, userInfo })
      }
    )
  } else if (userInfo && userInfo.status === 'inactive') {
    // Forcefully logout the user
    return TileModal(
      'Your account is temporarily inactive',
      'Your login is currently inactive .Please reach out to Hotel Admin for more information',
      () => {
        return redirectToLogin({ subDomain, dispatch, userInfo })
      }
    )
  }
}

function AuthRouteProvider(props) {
  const dispatch = useDispatch()
  const appState = useSelector(state => state)
  const [firebaseConnected, setFirebaseConnected] = useState(false)
  const {
    userInfo,
    currentHotelListenerAdded,
    servicesListenerAdded,
    subDomain,
    themecolor,
    themefontColor,
    isAppLoaded,
    gettingHotelLogo,
    currentLanguage,
    flatLanguageData,
    previousLanguage,
    googleLangCode,
    isLanguageListenerAdded,
    hotelInfo,
    config,
    production,
    isLoggedIn,
  } = appState

  const { showMaintenancePage } = production

  useEffect(() => {
    i18n.use(initReactI18next).init({
      resources: flatLanguageData,
      lng: currentLanguage,
      keySeparator: false,
      interpolation: {
        escapeValue: false,
      },
      fallbackLng: 'en',
    })
  }, [currentLanguage, flatLanguageData])

  const addLanguageDictionaryLister = () => {
    dispatch(GetLanguageDictionary(isLanguageListenerAdded))
  }

  const updateTranslation = async () => {
    const firestoreConfig = await getFirestoreConfig()
    if (config.translationVersion !== firestoreConfig.translationVersion) {
      locale_languages.forEach(async item => {
        await CreateLanguageDictionaryItem(item.name, item)
      })
      addLanguageDictionaryLister()
      await setFirestoreConfig({
        translationVersion: config.translationVersion,
      })
    } else {
      addLanguageDictionaryLister()
    }
  }

  useEffect(() => {
    if (auth?.currentUser) {
      updateTranslation()
    }
  }, [auth?.currentUser])

  useEffect(() => {
    dispatchSetLanguage({ currentLanguage, previousLanguage, googleLangCode })
  }, [currentLanguage, previousLanguage])

  useEffect(() => {
    forcefullLogout({ userInfo, subDomain, dispatch, hotelInfo })
    GetLoadContainer({
      userInfo,
      currentHotelListenerAdded,
      dispatch,
      servicesListenerAdded,
    })
  }, [
    currentHotelListenerAdded,
    dispatch,
    servicesListenerAdded,
    subDomain,
    userInfo,
    hotelInfo,
  ])

  useEffect(() => {
    if (window.location.pathname.toLowerCase().includes('signin')) {
      GetHotelLogo(dispatch)
    }

    const authChange = async () => {
      auth.onAuthStateChanged(async _user => {
        setFirebaseConnected(true)
        const email = auth?.currentUser?.email
        const srcOfLogin = localStorage.getItem('srcOfLogin')

        if (!srcOfLogin || srcOfLogin !== 'login') {
          if (email) {
            if (hotelInfo?.hotelId) {
              CurrentUserListener({
                id: auth?.currentUser?.uid,
                hotelId: hotelInfo?.hotelId,
                dispatch,
              })
            }
          } else {
            dispatch(actions.reset())
            unsubscribeFirebaseListeners()
          }
        }
        dispatch(actions.setAppLoaded(true))
      })
    }

    authChange()
  }, [])

  useEffect(() => {
    ChangeTheme({ themecolor, themefontColor })
  }, [themecolor, themefontColor])

  useEffect(() => {
    MaintenanceListerner(dispatch)
  }, [dispatch])

  const authValue = useMemo(
    () => ({
      ...appState,
      changeSelectedKey,
      switchLanguage: dispatchSetLanguage,
      dispatch,
      hideSubMenu,
      showSubMenu,
    }),
    [appState, hideSubMenu, showSubMenu, dispatchSetLanguage]
  )

  useEffect(() => {
    const Updated_AppVersion = production?.appVersion
    const appVersion = localStorage.getItem('appVersion') || '1'
    if (
      Updated_AppVersion &&
      appVersion &&
      appVersion !== Updated_AppVersion &&
      !showMaintenancePage &&
      typeof unsubMaintenanceListner === 'function'
    ) {
      localStorage.setItem('appVersion', Updated_AppVersion)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [production?.appVersion])

  if (
    !firebaseConnected ||
    gettingHotelLogo ||
    isLoggedIn === LoginStatus.WAITING
  ) {
    return <WelcomeLoader msg='AppRouterProvider 184' />
  }

  function changeSelectedKey(e) {
    dispatch(actions.setSideMenuSelectedKey(String(e.key)))
  }

  function hideSubMenu() {
    dispatch(actions.setIsSideMenuOpen(false))
    document.body.style.overflow = 'auto'
  }
  function showSubMenu() {
    dispatch(actions.setIsSideMenuOpen(true))
    document.body.style.overflow = 'hidden'
  }

  function dispatchSetLanguage(lang) {
    dispatch(
      actions.setLanguageConfig({
        currentLanguage: lang.currentLanguage,
        previousLanguage: lang.previousLanguage,
        googleLangCode: lang.googleLangCode,
        //  messages: languageDictionary?.find(item => item.id === lang.currentLanguage)?.data,
      })
    )
  }

  if (showMaintenancePage) return <Maintanance />

  return isAppLoaded ? (
    <AuthContext.Provider value={authValue}>
      <ConfigProvider locale={antDLanguages[currentLanguage || 'en']}>
        {props.children}
      </ConfigProvider>
    </AuthContext.Provider>
  ) : (
    <WelcomeLoader msg='AuthRouteProvider 227' />
  )
}

export default AuthRouteProvider
