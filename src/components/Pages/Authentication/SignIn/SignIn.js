/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Checkbox, Select } from 'antd'
import { useHistory } from 'react-router'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import {
  CurrentUserListener,
  GetCurrentUser,
  GetUserEmailOrPhone,
  Login,
  Logout,
} from '../../../../services/user'
import {
  DefaultURL,
  HotelAdminRole,
  loadProgress,
  LoginStatus,
  searchingDomainMessages,
  secondsToShowAlert,
  SuperAdminRole,
  messages,
} from '../../../../config/constants'
import HotelImageCard from '../../../Common/HotelImageCard/HotelImageCard'
import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import {
  getEmailOrPhone,
  isEmail,
  GetContactNubmerPrefixOptions,
  countryCodeList,
  validateEmail,
  patterns,
  getImage,
} from '../../../../config/utils'
import NotFound from '../../NotFound/NotFound'
import AcessDenied from '../../AcessDenied/AcessDenied'
import { actions } from '../../../../Store'
import WelcomeLoader from '../../../Common/WelcomeLoader/WelcomeLoader'
import { auth } from '../../../../config/firebase'

const tailLayout = {
  wrapperCol: {
    offset: 0,
    span: 24,
  },
}

const InvalidUrl = (
  <NotFound message='Oops !!! The page could not be loaded. Please recheck the URL and try again' />
)

const AccessDenied = (
  <>
    <AcessDenied />
  </>
)

const GetSideMenuData = sideMenus => {
  let linkTo = ''
  let selectedKey = ''
  let openKeys = ''

  if (sideMenus.subMenu) {
    openKeys = String(sideMenus.index)
    selectedKey = String(sideMenus.subMenu[0].index)
    linkTo = sideMenus.subMenu[0].linkTo
  } else {
    selectedKey = String(sideMenus.index)
    linkTo = sideMenus.linkTo
  }

  return { linkTo, selectedKey, openKeys }
}

const loadSignInPage = ({
  gettingHotelLogo,
  gettingTitleAndPermission,
  location,
  subDomain,
  loginSuccess,
  isHotelAdmin,
  sideMenus,
  subDomainNotFound,
  hotelInfo,
  dispatch,
}) => {
  let response = {
    return: '',
    redirect: '',
  }

  if (gettingHotelLogo || gettingTitleAndPermission) {
    response.return = <WelcomeLoader />
    return response
  }

  if (location?.pathname?.toLowerCase() === '/signin' && subDomain) {
    response.redirect = `/SignIn/${subDomain}`
    return response
  }

  if (window.location?.hostname !== 'localhost') {
    if (!subDomain.length || (subDomain.length > 0 && subDomainNotFound)) {
      response.return = <WelcomeLoader />
      window.location.replace(DefaultURL)
      return response
    }
  }

  if (hotelInfo?.status?.toLowerCase() === 'inactive') {
    response.return = AccessDenied
  }

  if (loginSuccess && GetCurrentUser()) {
    if (isHotelAdmin) {
      response.redirect = '/Dashboard'
    } else if (sideMenus.length) {
      const { linkTo, selectedKey, openKeys } = GetSideMenuData(sideMenus[0])
      dispatch(actions.setSideMenuSelectedKey(selectedKey))
      dispatch(actions.setSideMenuOpenKeys(openKeys))
      response.redirect = linkTo
    }
  } else if (
    subDomainNotFound ||
    location?.pathname?.toLowerCase() === '/signin'
  ) {
    response.return = InvalidUrl
  }
  return response
}

function loadSignInRedirection({ subDomainNotFound, option, history }) {
  if (subDomainNotFound) {
    if (option.return) return option.return
    if (option.redirect) history.push(option.redirect)
  }
}

function updateCountryCode(countryCode, dispatch) {
  if (countryCode === '') {
    dispatch(actions.setCountryCode(countryCodeList[0]))
  }
}

function isValidUser({ userInfo, hotelInfo }) {
  let userError = '',
    isValid = false
  const userNotFound =
    'Username entered is not associated with this hotel. Kindly recheck'

  if (!userInfo) {
    userError = userNotFound
  } else if (userInfo?.missingPermission) {
    userError = messages.MISSING_PERMISSONS
  } else if (userInfo?.hotelStatus === 'inactive') {
    userError =
      'Your hotel is currently inactive. Please reach out to Inplass Admin for more information'
  } else if (userInfo?.status === 'inactive') {
    userError =
      'Your login is temporarily inactive. Please contact Admin for more information'
  } else if (
    userInfo?.roles?.[0] !== HotelAdminRole &&
    !userInfo?.emailVerified
  ) {
    userError = 'Please verify your account.'
  } else if (userInfo?.hotelId !== hotelInfo?.hotelId) {
    userError = userNotFound
  } else {
    isValid = true
  }

  return { userError, isValid }
}

function isDomainLoaded(searchingDomain, searchingDomainMessage) {
  return (
    searchingDomain === loadProgress.LOADED &&
    searchingDomainMessage === searchingDomainMessages.SUCCESS
  )
}

function setErrorMsg(msg) {
  if (msg?.code === 'auth/user-not-found') {
    msg.message = 'Username or Password is invalid.'
  }
}

const SignIn = ({ location }) => {
  let {
    gettingHotelLogo,
    subDomainNotFound,
    subDomain,
    gettingTitleAndPermission,
    isHotelAdmin,
    sideMenus,
    hotelInfo,
    countryCode,
    searchingDomain,
    searchingDomainMessage,
  } = useSelector(state => state)
  const { groupId, hotelId } = hotelInfo || {}

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [showLoader, setShowLoader] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [showPrefixDropdown, setshowPrefixDropdown] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const [option, setOption] = useState({})
  const [form] = Form.useForm()

  const history = useHistory()
  const dispatch = useDispatch()

  const updateError = errorMessage => {
    setError(errorMessage)
    setTimeout(() => setError(''), secondsToShowAlert)
  }

  useEffect(() => {
    const response = loadSignInPage({
      gettingHotelLogo,
      gettingTitleAndPermission,
      location,
      subDomain,
      loginSuccess,
      isHotelAdmin,
      sideMenus,
      subDomainNotFound,
      hotelInfo,
      dispatch,
    })
    setOption(response)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gettingHotelLogo,
    gettingTitleAndPermission,
    location,
    subDomain,
    history,
    loginSuccess,
    isHotelAdmin,
    sideMenus,
    subDomainNotFound,
    hotelInfo,
  ])

  useEffect(() => {
    loadSignInRedirection({ subDomainNotFound, option, history })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option, subDomainNotFound])

  useEffect(() => {
    updateCountryCode(countryCode, dispatch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoginClick = async () => {
    setShowLoader(true)
    let userInfo

    const successCallback = async () => {
      if (userInfo?.roles.includes(SuperAdminRole)) {
        updateError('You are not allowed to login to Hotel Admin')
        await Logout({ userInfo, dispatch })
        setShowLoader(false)
        return
      }
      setShowLoader(false)
      setLoginSuccess(true)
      dispatch(actions.setIsLoggedIn(LoginStatus.LOGGED_IN))
      localStorage.removeItem('srcOfLogin')
    }

    const errorCallback = msg => {
      setErrorMsg(msg)
      setShowLoader(false)
      updateError(msg.message)
      localStorage.removeItem('srcOfLogin')
    }

    const prefix = countryCode.replace('+', '')
    let emailOrPhone = isEmail(email)
      ? email.toLowerCase()
      : `${prefix}${email}@${groupId}.com`

    const validateUser = async () => {
      let { _email, _phone } = getEmailOrPhone(email)
      userInfo = await GetUserEmailOrPhone({
        email: _email,
        phone: _phone,
        prefix,
        hotelId: hotelInfo.hotelId,
        groupId: hotelInfo.groupId,
        dispatch,
      })

      const { userError, isValid } = isValidUser({ userInfo, hotelInfo })
      if (!isValid) {
        setShowLoader(false)
        updateError(userError)
        dispatch(actions.setGettingHotelLogo(false))
        await Logout({ userInfo, dispatch, setLoader: false })
      } else {
        if (hotelInfo?.hotelId && auth?.currentUser) {
          CurrentUserListener({
            id: auth?.currentUser?.uid,
            hotelId: hotelInfo.hotelId,
            dispatch,
          })
        }
      }
      return isValid
    }
    localStorage.setItem('srcOfLogin', 'login')
    Login({
      rememberMe,
      email: emailOrPhone,
      password,
      success: successCallback,
      error: errorCallback,
      validateUser,
      hotelId,
    })
  }
  //only number input are taken
  const handleSearch = value => {
    const validInput = value.replace(/[^\d+]/g, '')
    const sliceLimit = validInput.includes('+') ? 4 : 3
    setSearchValue(validInput.slice(0, sliceLimit))
  }

  const getPrefixDropdown = () => {
    return showPrefixDropdown ? (
      <div className='countrycode'>
        <Select
          showSearch={true}
          style={{
            width: 100,
            padding: '0.1px',
          }}
          value={countryCode}
          onChange={e => {
            dispatch(actions.setCountryCode(e))
          }}
          onSearch={handleSearch}
          searchValue={searchValue}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          optionFilterProp='children'
        >
          {countryCodeList.map(code => (
            <Select.Option key={code} value={code}>
              {code}
            </Select.Option>
          ))}
        </Select>
      </div>
    ) : null
  }

  return isDomainLoaded(searchingDomain, searchingDomainMessage) ? (
    <>
      <div className='signin-wrp'>
        <HotelImageCard />
        <div className='formPart'>
          <div className='form-wrap'>
            <h1>Log In</h1>
            <Form
              layout='vertical'
              validateTrigger=''
              onFinish={handleLoginClick}
              form={form}
            >
              <div className='row'>
                <div className='col-12'>
                  <div className='form-group sign-field'>
                    <Form.Item
                      name='email'
                      placeholder='email'
                      required
                      rules={[
                        {
                          min: 6,
                          message: 'Field must be minimum 6 characters.',
                        },
                        fieldProps =>
                          validateEmail(fieldProps, showPrefixDropdown),
                      ]}
                    >
                      <Input.Group compact>
                        {getPrefixDropdown()}
                        <Input
                          placeholder='Email or Phone Number'
                          value={email}
                          onChange={e => {
                            const emailValue = e.target.value
                              .trim()
                              .toLowerCase()
                            const value = /^\d+$/.test(emailValue)
                            setshowPrefixDropdown(!!value)
                            setEmail(emailValue)
                            form.setFieldsValue({ email: emailValue })
                          }}
                        />
                      </Input.Group>
                    </Form.Item>
                  </div>
                </div>
                <div className='col-12'>
                  <div className='form-group sign-field'>
                    <Form.Item
                      placeholder='password'
                      name='password'
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Enter your password',
                        },
                        {
                          pattern: patterns.password.regex,
                          message: 'Incorrect password',
                        },
                      ]}
                    >
                      <Input.Password
                        placeholder='Password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className='col-12 d-flex justify-content-between'>
                  <Form.Item
                    {...tailLayout}
                    name='remember'
                    onChange={e => setRememberMe(e.target.checked)}
                    valuePropName='checked'
                  >
                    <Checkbox value={rememberMe}>Remember me</Checkbox>
                  </Form.Item>
                  <Link className='forgotlink' to='/ForgotPassword'>
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <Button
                className='continuebtn'
                block
                loading={showLoader}
                htmlType='submit'
              >
                Log In
              </Button>
              <CustomAlert
                visible={error}
                message={error}
                type='error'
                showIcon={true}
                classNames='mt-2'
              />
            </Form>
          </div>
          <div className='powered-wrp'>
            <h6>Powered by</h6>
            <img src={getImage('images/inplassSmall.svg')}></img>
          </div>
        </div>
      </div>
    </>
  ) : (
    <WelcomeLoader />
  )
}

export default SignIn
