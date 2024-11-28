/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { Form, Button, Spin } from 'antd'
import HotelImageCard from '../../../Common/HotelImageCard/HotelImageCard'
import { useHistory, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import OtpInput from 'react-otp-input'
import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import {
  APIs,
  PAGELOADER,
  secondsToShowAlert,
  SpinLoading,
} from '../../../../config/constants'
import Axios from '../../../../utility/axiosHelper'
import {
  getImage,
  maskUsername,
  phoneWithPrefix,
  Ternary,
} from '../../../../config/utils'
import { LoadingOutlined } from '@ant-design/icons'
import { actions } from '../../../../Store'

const antIcon = <LoadingOutlined style={{ fontSize: 20 }} spin />

function OtpVerification() {
  const token = useParams()?.token || null
  const dispatch = useDispatch()
  const history = useHistory()
  const { newPassword, fetchTokenData, pageLoading, otpData } = useSelector(
    state => state
  )
  const [otp, setOtp] = useState('')
  const [showLoader, setShowLoader] = useState(false)
  const [error, setError] = useState('')
  const [resendOtpLoader, setResendOtpLoader] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    return () => {
      dispatch(actions.setOTPData(null))
    }
  }, [])

  useEffect(() => {
    setIsPageLoaded(
      pageLoading === PAGELOADER.LOADED &&
        fetchTokenData.loading === PAGELOADER.LOADED
    )
  }, [fetchTokenData.loading, pageLoading])

  useEffect(() => {
    if (isPageLoaded) {
      if (!token || !fetchTokenData.data || !newPassword) {
        history.replace(`/dept-confirm/${token}`)
      }
    }
  }, [token, fetchTokenData, pageLoading])

  const onFinish = () => {
    if (otp.length < 6) {
      updateError('Please Enter OTP')
      return
    }
    setShowLoader(true)
    Axios.post(APIs.VALIDATE_TOKEN, {
      userId: fetchTokenData.data?.userId,
      otp,
      userToken: token,
      newPassword,
    })
      .then(() => {
        setShowLoader(false)
        updateSuccess(
          'Password Updated Successfully. Please login with new password'
        )
        setTimeout(() => {
          history.replace(`/password-change-success`)
          dispatch(actions.clearConfirmParams())
        }, secondsToShowAlert)
      })
      .catch(err => {
        console.log(err)
        setShowLoader(false)
        updateError(err.message)
      })
  }

  const sendOtpAgain = () => {
    setResendOtpLoader(true)
    Axios.post(APIs.GENERATE_TOKEN, {
      grantFor: 'FORCE_CHANGE_PASSWORD',
      userId: fetchTokenData?.data?.userId,
      hotelId: fetchTokenData?.data?.hotelId,
    })
      .then(() => {
        setResendOtpLoader(false)
        history.replace(`/dept-verify/${token}`)
      })
      .catch(err => {
        console.log(err)
        setResendOtpLoader(false)
        updateError(err.message)
      })
  }
  const updateSuccess = message => {
    setSuccess(message)
    setTimeout(() => setSuccess(''), secondsToShowAlert)
  }
  const updateError = errorMessage => {
    setError(errorMessage)
    setTimeout(() => setError(''), secondsToShowAlert)
  }

  return isPageLoaded ? (
    <>
      <div className='signin-wrp otpverification-wrp'>
        <HotelImageCard />
        <div className='formPart'>
          <div className='form-wrap'>
            <h1>OTP Verification</h1>
            <h6>
              Please enter the verification code we have sent to{' '}
              <p style={{ color: '#40a9ff' }}>
                {maskUsername(
                  Ternary(
                    otpData?.userEmail,
                    otpData?.userEmail,
                    phoneWithPrefix(otpData) || ''
                  )
                )}
              </p>
            </h6>
            <Form layout='vertical' onFinish={onFinish}>
              <div className='form-row'>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  containerStyle='col form-group sign-field otp-input'
                  isInputNum={true}
                />
              </div>
              <div className='form-row'>
                <a type='link' loading={resendOtpLoader} onClick={sendOtpAgain}>
                  Resend OTP
                </a>
                <Spin indicator={antIcon} spinning={resendOtpLoader} />
              </div>
              <label style={{ float: 'right' }}> </label>

              <Button
                className='continuebtn'
                block
                loading={showLoader}
                htmlType='submit'
              >
                Submit
              </Button>
              <CustomAlert
                visible={error}
                message={error}
                type='error'
                showIcon={true}
                classNames='mt-2'
              />
              <CustomAlert
                visible={success}
                message={success}
                type='success'
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
    <SpinLoading />
  )
}

export default OtpVerification
