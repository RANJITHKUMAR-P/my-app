/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import { Alert, Form, Input, Button, Select } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import { SendResetPasswordEmail } from '../../../../services/user'
import HotelImageCard from '../../../Common/HotelImageCard/HotelImageCard'
import { actions } from '../../../../Store'
import {
  isEmail,
  GetContactNubmerPrefixOptions,
  countryCodeList,
  validateEmail,
  Ternary,
  getImage,
} from '../../../../config/utils'
import { useHistory } from 'react-router-dom'

const ForgotPassword = () => {
  const [state, setState] = useState({
    email: '',
    errors: '',
    disabledBtn: true,
    errorMsg: false,
    successMsg: false,
    errorMessageText: '',
  })
  const history = useHistory()
  const [form] = Form.useForm()
  const [showLoader, setShowLoader] = useState(false)
  const [showPrefixDropdown, setshowPrefixDropdown] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const { hotelInfo, subDomain, countryCode } = useSelector(s => s)
  const dispatch = useDispatch()

  useEffect(() => {
    if (countryCode === '') {
      dispatch(actions.setCountryCode(countryCodeList[0]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const handleForgotPasswordClick = async () => {
    try {
      setState({
        ...state,
        disabledBtn: true,
        successMsg: false,
        errorMsg: false,
      })
      setShowLoader(true)

      const prefix =
        countryCode?.charAt(0) === '+' ? countryCode.substring(1) : countryCode

      let emailOrPhone = isEmail(state.email)
        ? state.email.toLowerCase()
        : `${prefix}${state.email}`

      const { success, message } = await SendResetPasswordEmail({
        emailOrPhone,
        hotelId: hotelInfo?.hotelId,
        groupId: hotelInfo?.groupId,
      })

      if (success === false)
        setState({
          ...state,
          successMsg: false,
          errorMsg: true,
          disabledBtn: false,
          errorMessageText: Ternary(
            typeof message === 'string',
            message,
            'Please contact Admin for more information'
          ),
        })
      else
        setState({
          ...state,
          successMsg: true,
          errorMsg: false,
          disabledBtn: true,
          errorMessageText: '',
        })
    } catch (error) {
      console.log({ error })
    } finally {
      setShowLoader(false)
    }
  }

  const handleEmailChange = e => {
    let email = e.target.value.toLowerCase()
    const value = /^\d+$/.test(email)
    form.setFieldsValue({ email: e.target.value })
    value ? setshowPrefixDropdown(true) : setshowPrefixDropdown(false)
    let disabledBtn = true
    if (email.length > 6) disabledBtn = false

    setState({ ...state, email, disabledBtn })
  }

  useEffect(() => {
    if (!hotelInfo?.hotelId && !subDomain) {
      history.push('/NotFound')
    }
  }, [hotelInfo, subDomain, history])
  return (
    <>
      <div className='formLayout'>
        <div className='signin-wrp forgotpassword-wrp'>
          <HotelImageCard />
          <div className='formPart'>
            <div className='form-wrap'>
              <h1>Forgot password</h1>
              <h6>
                Enter your Email ID/Phone Number to receive a password reset
                link
              </h6>
              <Form
                layout='vertical'
                validateTrigger=''
                onFinish={handleForgotPasswordClick}
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
                            message:
                              'Email/Phone Number must be minimum 6 characters.',
                          },
                          fieldProps =>
                            validateEmail(fieldProps, showPrefixDropdown),
                        ]}
                      >
                        <Input.Group compact>
                          {getPrefixDropdown()}
                          <Input
                            placeholder='Email or Phone Number'
                            value={state.email}
                            onChange={handleEmailChange}
                            maxLength='50'
                          />
                        </Input.Group>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <Button
                  htmlType='submit'
                  block
                  disabled={state.disabledBtn}
                  className='continuebtn'
                  loading={showLoader}
                >
                  Send Reset Link
                </Button>
                <Form.Item>
                  {state.successMsg && (
                    <Alert
                      message='Please check your inbox and follow further instructions to reset your password'
                      type='success'
                      showIcon
                      className='mt-2'
                    />
                  )}
                  {state.errorMsg && (
                    <Alert
                      message={state.errorMessageText}
                      type='error'
                      showIcon
                      className='mt-2'
                    />
                  )}
                </Form.Item>
              </Form>
            </div>
            <div className='powered-wrp'>
              <h6>Powered by</h6>
              <img src={getImage('images/inplassSmall.svg')}></img>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ForgotPassword
