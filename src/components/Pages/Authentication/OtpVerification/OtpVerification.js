/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unused-vars */
import React from 'react'
import { Form, Input, Button } from 'antd'
import HotelImageCard from '../../../Common/HotelImageCard/HotelImageCard'
import { getImage } from '../../../../config/utils'

function OtpVerification() {
  return (
    <>
      <div className='signin-wrp otpverification-wrp'>
        <HotelImageCard />
        <div className='formPart'>
          <div className='form-wrap'>
            <h1>OTP Verification</h1>
            <h6>
              Please enter the verification code we have sent to{' '}
              <a>xxxxxxxxxx54</a>
            </h6>
            <Form layout='vertical'>
              <div className='form-row'>
                {Array.from({ length: 5 }, function (_v, k) {
                  return (
                    <div className='col' key={k}>
                      <div className='form-group sign-field'>
                        <Form.Item>
                          <Input />
                        </Form.Item>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button className='resendBtn'>Resend OTP</button>
              <Button className='continuebtn' block>
                Confirm
              </Button>
              <button className='backtosignBtn'>
                <img src={getImage('images/backarrow.svg')}></img>Back to Sign
                In
              </button>
            </Form>
          </div>
          <div className='powered-wrp'>
            <h6>Powered by</h6>
            <img src={getImage('images/inplassSmall.svg')}></img>
          </div>
        </div>
      </div>
    </>
  )
}

export default OtpVerification
