/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from 'react'
import { Menu, Dropdown, Tooltip } from 'antd'
import { CaretDownOutlined, MenuOutlined } from '@ant-design/icons'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import LogoutIcon from '../Icons/Logouticon'
import ProfileIcon from '../Icons/Profileicon'
import Languageicon from '../Icons/Languageicon'
import PlaceHolder from '../../../assets/backgroundimages/Placeholder.svg'
import { GetCurrentUser, Logout, UpdateUser } from '../../../services/user'
import Notifications from '../Notifications/Notifications'
import ThemeChange from '../ThemeChange/ThemeChange'

import { actions } from '../../../Store'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import StaffMyProfile from './StaffMyProfile'
import { AddPlayerId, DeletePlayerId } from '../../../services/notification'
import {
  handleMyProfileOnClick,
  GetAxiosHeaders,
  Ternary,
} from '../../../config/utils'
import {
  HotelAdminRole,
  LoginStatus,
  resetThemeColor,
  unsubscribeList,
} from '../../../config/constants'
import ProductionDetailsToast from '../ProductionDetailsToast/ProductionDetailsToast'
import ChangeLanguage from './ChangeLanguage'
import ChangePassword from './ChangePassword'
import ChangePasswordIcon from '../../../assets/svg/ChangePasswordIcon'
import { TileModal } from '../Modals/TiledModal'
import SwitchHotel from './SwitchHotel'
import { getUserAssociatedHotels } from '../../../services/hotels'
import SwitchHotelIcon from '../../../assets/svg/SwitchHotelIcon'
import { AuthContext } from './../../../Router/AuthRouteProvider'

const headerModalData = {
  SwitchHotel: 'SwitchHotel',
  ChangePassword: 'ChangePassword',
  ChangeLanguage: 'ChangeLanguage',
  StaffMyProfile: 'StaffMyProfile',
}

const defaultModalVisible = {
  status: false,
  data: null,
  type: '',
}

const Header = () => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    hotelInfo,
    userInfo,
    isHotelAdmin,
    showSubMenu,
    themecolor,
    hotelsByGroupId,
  } = useContext(AuthContext)

  const [modalVisible, setModalVisible] = useState(defaultModalVisible)
  const [onsubscribe, setonsubscribe] = useState(false)
  const [isTileOpen, setIsTileOpen] = useState(false)

  const OneSignal = window.OneSignal
  const deleteplayerId = async (userId, headers) => {
    OneSignal.push(function () {
      OneSignal.getUserId().then(async function (playerId) {
        if (playerId != null) {
          DeletePlayerId('user', 'web', userId, playerId, headers)
        }
      })
    })
  }

  const addplayerId = async playerId => {
    const userId = GetCurrentUser().uid
    AddPlayerId('user', 'web', userId, playerId)
  }

  useEffect(() => {
    const srcOfLogin = localStorage.getItem('srcOfLogin')
    if (
      (!srcOfLogin || srcOfLogin !== 'login') &&
      !isTileOpen &&
      userInfo?.isLoggedIn === LoginStatus.WAITING &&
      userInfo?.resetPasswordByHotelId &&
      userInfo?.resetPasswordMode &&
      ((userInfo?.resetPasswordMode === 'changePassword' &&
        userInfo?.resetPasswordByHotelId !== hotelInfo.hotelId) ||
        userInfo?.resetPasswordMode === 'resetPasswordMode')
    ) {
      setModal(defaultModalVisible)
      setIsTileOpen(true)
      async function onSubmit() {
        const userId = GetCurrentUser()?.uid
        const headers = await GetAxiosHeaders()
        await deleteplayerId(userId, headers)

        dispatch(actions.setIsLoggedIn(LoginStatus.WAITING))

        await UpdateUser(userInfo.userId, {
          hotelId: userInfo.hotelId,
          isLoggedIn: LoginStatus.LOGGED_OUT,
        })

        return Logout({ userInfo, success, dispatch })
      }

      return TileModal(
        'Your account password has been reset.',
        'Your account password has been reset. Please login with your new credentials',
        onSubmit
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelInfo.hotelId, isTileOpen, userInfo])

  useEffect(() => {
    if (
      !modalVisible.type &&
      ![headerModalData.ChangeLanguage, headerModalData.SwitchHotel].includes(
        modalVisible.type
      )
    ) {
      let data = { ...defaultModalVisible }
      if (
        !userInfo.roles.includes(HotelAdminRole) &&
        userInfo?.isForceChangePassword &&
        userInfo.resetPasswordByHotelId === hotelInfo.hotelId
      ) {
        data = {
          status: true,
          data: { forceChangedPassword: true },
          type: headerModalData.ChangePassword,
        }
        setModalVisible(data)
      } else if (
        !userInfo?.isForceChangePassword &&
        !userInfo.resetPasswordMode
      ) {
        setModalVisible(data)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo])

  useEffect(() => {
    OneSignal.push(function () {
      OneSignal.once('subscriptionChange', function (isSubscribed) {
        if (isSubscribed) {
          setonsubscribe(true)
          OneSignal.getUserId().then(function (playerId) {
            addplayerId(playerId)
          })
        }
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onsubscribe])

  useEffect(() => {
    const handler = e => {
      const { command, payload } = e.data

      if (command === 'notification.clicked') {
        const url = new URL(payload.url)
        history.push(url.pathname)
        dispatch(actions.setCurrentroute(url.pathname))
      }
    }
    navigator?.serviceWorker?.addEventListener('message', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const success = () => {
    Object.entries(unsubscribeList).forEach(([key, func]) => {
      if (typeof func === 'function') {
        func()
      }
      unsubscribeList[key] = null
    })

    resetThemeColor()
    dispatch(actions.reset())
  }

  const disableChangeLanguage =
    !window.location.origin.includes('localhost') &&
    ['prod', 'uat'].includes(process.env.REACT_APP_ENV.toLowerCase())

  async function logout() {
    const userid = GetCurrentUser()?.uid
    const headers = await GetAxiosHeaders()
    deleteplayerId(userid, headers)

    Logout({
      success,
      userInfo: {
        ...userInfo,
        resetPasswordByHotelId: '',
        resetPasswordMode: '',
      },
      dispatch,
    })
  }

  const { hotelId = '' } = hotelInfo

  useEffect(() => {
    getUserAssociatedHotels({ hotelId, dispatch })
  }, [dispatch, hotelId])

  let menuProps = {}

  if (!isHotelAdmin) {
    menuProps.disabled = !userInfo?.currentUserTitle
  }

  const menu = (
    <Menu {...menuProps}>
      <Menu.Item key='1' icon={<ProfileIcon></ProfileIcon>}>
        <Link
          to={'#'}
          onClick={e =>
            handleMyProfileOnClick({
              e,
              isHotelAdmin,
              history,
              setIsStaffModalVisible: () =>
                setModalVisible({
                  status: true,
                  type: headerModalData.StaffMyProfile,
                }),
            })
          }
        >
          {translateTextI18N('My Profile')}
        </Link>
      </Menu.Item>
      <Menu.Item
        key='3'
        icon={<Languageicon></Languageicon>}
        onClick={e => {
          setModalVisible({
            status: true,
            type: headerModalData.ChangeLanguage,
          })
        }}
        disabled={disableChangeLanguage}
      >
        {Ternary(
          disableChangeLanguage,
          <Tooltip
            placement='bottomRight'
            title='Please subscribe to avail this feature'
            color={themecolor}
          >
            {translateTextI18N('Language')}
          </Tooltip>,
          translateTextI18N('Language')
        )}
      </Menu.Item>
      <Menu.Item
        key='4'
        icon={<ChangePasswordIcon />}
        onClick={e => {
          setModalVisible({
            status: true,
            type: headerModalData.ChangePassword,
          })
        }}
      >
        {translateTextI18N('Change Password')}
      </Menu.Item>

      {userInfo?.hotelAssociationCount > 1 && hotelsByGroupId.length > 0 && (
        <Menu.Item
          key='5'
          icon={<SwitchHotelIcon />}
          onClick={e => {
            setModalVisible({
              status: true,
              type: headerModalData.SwitchHotel,
            })
          }}
        >
          {translateTextI18N('Switch Hotel')}
        </Menu.Item>
      )}
      <Menu.Item
        key='6'
        icon={<LogoutIcon></LogoutIcon>}
        onClick={async () => logout()}
      >
        {translateTextI18N('Log Out')}
      </Menu.Item>
    </Menu>
  )

  const closeModal = useCallback(() => {
    setModalVisible(defaultModalVisible)
  }, [])

  const setModal = useCallback(data => {
    setModalVisible(data)
  }, [])

  const modalMemo = useMemo(() => {
    const modal = {
      [headerModalData.ChangePassword]: (
        <ChangePassword
          isModalVisible={modalVisible.status}
          setModal={setModal}
          closeModal={closeModal}
          modalVisibleData={modalVisible}
          forceChangedPassword={
            modalVisible.data?.forceChangedPassword || false
          }
          logout={logout}
        />
      ),
      [headerModalData.SwitchHotel]: (
        <SwitchHotel
          isModalVisible={modalVisible.status}
          setModal={setModal}
          closeModal={closeModal}
          modalVisibleData={modalVisible}
        />
      ),
      [headerModalData.ChangeLanguage]: (
        <ChangeLanguage
          isModalVisible={modalVisible.status}
          setModal={setModal}
          closeModal={closeModal}
          modalVisibleData={modalVisible}
        />
      ),
      [headerModalData.StaffMyProfile]: (
        <StaffMyProfile
          isModalVisible={modalVisible.status}
          closeModal={closeModal}
        />
      ),
    }

    return modal[modalVisible.type]
  }, [closeModal, logout, modalVisible, setModal])

  const headerMemo = useMemo(() => {
    return (
      <>
        <ProductionDetailsToast visible={false} />
        <header>
          <div className='container-wrp'>
            <div className='row align-items-center justify-content-between'>
              <div className='col-auto'>
                <div className='logo-wrp'>
                  <span>
                    {hotelInfo?.hotelName || ''}
                    <small>{hotelInfo?.city || ''}</small>
                  </span>
                </div>
              </div>
              <div className='col-auto '>
                <div className='headericons-grp'>
                  <ul className='list-unstyled'>
                    <li>
                      <ThemeChange />
                    </li>
                    <li>
                      <Notifications
                        isHotelAdmin={isHotelAdmin}
                        userInfo={userInfo}
                      />
                    </li>

                    <li>
                      <div className='headerUser'>
                        <figure>
                          <img
                            src={Ternary(
                              userInfo?.profileImage,
                              userInfo.profileImage,
                              PlaceHolder
                            )}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                            }}
                          ></img>
                        </figure>
                        <div>
                          <Dropdown
                            className='dropdown-wrp'
                            overlay={menu}
                            placement='bottomRight'
                          >
                            <a
                              className='ant-dropdown-link'
                              onClick={e => e.preventDefault()}
                            >
                              <span className='usernamespan'>
                                {userInfo?.name}
                              </span>
                              <CaretDownOutlined />
                            </a>
                          </Dropdown>
                        </div>
                      </div>
                    </li>
                    <li
                      className='d-md-none mobmenuicon'
                      onClick={e => {
                        e.preventDefault()
                        showSubMenu()
                      }}
                    >
                      <MenuOutlined />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </header>

        {modalMemo}
      </>
    )
  }, [
    hotelInfo?.city,
    hotelInfo?.hotelName,
    isHotelAdmin,
    menu,
    modalMemo,
    showSubMenu,
    userInfo,
  ])

  return headerMemo
}

export default Header
