/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Alert } from 'antd'

import { secondsToShowAlert } from '../../../../config/constants'
import HotelImageCard from '../../../Common/HotelImageCard/HotelImageCard'
import IntermediateScreen from '../IntermediateScreen/IntermediateScreen'
import { getImage, patterns } from '../../../../config/utils'

const ChangePasswordComp = ({
  title,
  oobCode,
  triggerFn,
  success,
  successFlag,
  userEmail,
  isSuperAdmin,
}) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [disabledBtn, setDisabledBtn] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue({
      password,
      confirmPassword,
    })
  }, [])

  const successCallback = () => {
    setShowLoader(false)
    setError('')
    setDisabledBtn(true)
    setShowSuccessMessage(true)
    success?.()
  }

  const errorCallback = err => {
    setShowLoader(false)
    setError(err)
    setDisabledBtn(false)
    setShowSuccessMessage(false)
    setTimeout(() => setError(''), secondsToShowAlert)
  }
  const onFinish = () => {
    setDisabledBtn(true)
    setShowLoader(true)
    triggerFn({
      oobCode,
      password,
      userEmail,
      success: successCallback,
      error: errorCallback,
    })
  }

  return (
    <>
      <HotelImageCard />
      {successFlag ? (
        <IntermediateScreen isSuperAdmin={isSuperAdmin} />
      ) : (
        <div className='formPart'>
          <div className='form-wrap'>
            <h1>{title}</h1>

            <Form
              layout='vertical'
              validateTrigger=''
              onFinish={onFinish}
              form={form}
            >
              <div className='row'>
                <div className='col-12'>
                  <div className='form-group sign-field'>
                    <Form.Item
                      placeholder='New Password'
                      name='password'
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Enter your password',
                        },
                        {
                          pattern: patterns.password.regex,
                          message: patterns.password.message,
                        },
                      ]}
                    >
                      <Input.Password
                        placeholder='New Password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        maxLength='50'
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className='col-12'>
                  <div className='form-group sign-field'>
                    <Form.Item
                      placeholder='Confirm your password'
                      name='confirmPassword'
                      required
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('password') === value) {
                              return Promise.resolve()
                            }
                            return Promise.reject(
                              new Error(`The password entered doesn't match`)
                            )
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        placeholder='Confirm your password'
                        name='confirmPassword'
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
              <Button
                htmlType='submit'
                className='continuebtn'
                block
                disabled={disabledBtn}
                loading={showLoader}
              >
                CONFIRM
              </Button>
            </Form>
            {showSuccessMessage && (
              <Alert
                message='Your Password has been changed successfully. Redirecting to sign-in.'
                type='success'
                showIcon
                className='mt-2'
              />
            )}
            {error && (
              <Alert message={error} type='error' showIcon className='mt-2' />
            )}
          </div>
          <div className='powered-wrp'>
            <h6>Powered by</h6>
            <img src={getImage('images/inplassSmall.svg')}></img>
          </div>
        </div>
      )}
    </>
  )
}

export default ChangePasswordComp
