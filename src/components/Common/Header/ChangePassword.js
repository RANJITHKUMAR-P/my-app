import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Modal, Button, Form, Input } from 'antd'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import ResponseModal from '../Modals/ResponseModal'
import { patterns } from '../../../config/utils'
import {
  ChangeUserPassword,
  setUserDataOfAllAssociatedHotels,
  reauthenticate,
} from '../../../services/user'
import CustomAlert from '../CustomAlert/CustomAlert'
import ForceLogout from './ForceLogout'

const defaultResponseModal = {
  status: false,
  data: null,
}

function ChangePassword(props) {
  const { userInfo, isHotelAdmin, hotelInfo } = useSelector(state => state)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [resModal, setResModal] = useState(defaultResponseModal)
  const [loading, setLoading] = useState(false)
  const [forceLogout, setForceLogout] = useState(false)

  const [password, setPassword] = useState({
    oldPassword: '',
    newPassword: '',
    confimrPasssword: '',
  })

  const {
    isModalVisible,
    closeModal,
    setModal,
    modalVisibleData,
    forceChangedPassword,
    logout,
  } = props

  const onFinish = async () => {
    setLoading(true)

    const { success: status, msg: title } = await ChangeUserPassword({
      oldPassword: password.oldPassword,
      newPassword: password.confimrPasssword,
    })

    let res = { status, data: { status: status, title } }

    // Modal will not close in error case
    if (status) {
      // If ForceChangePassword is true then set it false
      await reauthenticate(password.confimrPasssword)
      await setUserDataOfAllAssociatedHotels({ userInfo, hotelInfo })
      setModal({ ...modalVisibleData, status: false })
    }
    setLoading(false)
    setResModal(res)
  }

  const handleCancel = () => {
    if (forceChangedPassword) {
      setForceLogout(true)
      return
    }
    closeModal()
  }

  const closeResponseModal = () => {
    setResModal(defaultResponseModal)
    closeModal()
  }

  const onPasswordChange = e => {
    e.preventDefault()
    setPassword({ ...password, [e.target.id]: e.target.value })
  }

  const [form] = Form.useForm()

  useEffect(() => {
    if (
      typeof resModal?.data?.status === 'boolean' &&
      !resModal?.data?.status
    ) {
      setTimeout(() => {
        let res = { ...resModal, data: null }
        setResModal(res)
      }, 3000)
    }
  }, [resModal, resModal?.data?.status])

  const oldVsNewPasswordMsg =
    'Old password and new password cannot be same. Please try another password'

  const newVsConfirmPasswordMsg = "The password entered doesn't match"

  return (
    <>
      <Modal
        title={translateTextI18N('Change Password')}
        visible={isModalVisible}
        centered
        onCancel={handleCancel}
        className='cmnModal'
        footer={null}
        maskClosable={false}
        wrapClassName={!isHotelAdmin ? 'change-password-dailogue' : ''}
      >
        <div className='form-wrap'>
          <Form layout='vertical' onFinish={onFinish} form={form}>
            <div className='row'>
              <div className='col-12 '>
                <div className='form-group cmn-input'>
                  <div className='row'>
                    <div className='col-12'>
                      <div className='form-group sign-field'>
                        <Form.Item
                          placeholder='Old Password'
                          name='oldPassword'
                          required
                          rules={[
                            {
                              required: true,
                              message: 'Enter Old Password',
                            },
                            {
                              pattern: patterns.password.regex,
                              message: patterns.password.message,
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value) return Promise.resolve()
                                form.setFields([
                                  {
                                    name: 'newPassword',
                                    errors: [
                                      getFieldValue('newPassword') === value
                                        ? oldVsNewPasswordMsg
                                        : '',
                                    ],
                                  },
                                ])
                                return Promise.resolve()
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            id='oldPassword'
                            placeholder='Old Password'
                            value={password.oldPassword}
                            onChange={e => onPasswordChange(e)}
                            maxLength='50'
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-group sign-field'>
                        <Form.Item
                          placeholder='New Password'
                          name='newPassword'
                          required
                          rules={[
                            {
                              required: true,
                              message: 'Enter New Password',
                            },
                            {
                              pattern: patterns.password.regex,
                              message: patterns.password.message,
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value) return Promise.resolve()
                                if (getFieldValue('oldPassword') === value) {
                                  return Promise.reject(
                                    new Error(oldVsNewPasswordMsg)
                                  )
                                }

                                form.setFields([
                                  {
                                    name: 'confirmPassword',
                                    errors: [
                                      getFieldValue('confirmPassword') !== value
                                        ? newVsConfirmPasswordMsg
                                        : '',
                                    ],
                                  },
                                ])

                                return Promise.resolve()
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            id='newPassword'
                            placeholder='New Password'
                            value={password.newPassword}
                            onChange={e => onPasswordChange(e)}
                            maxLength='50'
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-group sign-field'>
                        <Form.Item
                          placeholder='Confirm New Password'
                          name='confirmPassword'
                          required
                          rules={[
                            {
                              required: true,
                              message: 'Enter Confirm New Password',
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value) return Promise.resolve()
                                if (getFieldValue('newPassword') === value) {
                                  return Promise.resolve()
                                }
                                return Promise.reject(
                                  new Error(newVsConfirmPasswordMsg)
                                )
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            id='confimrPasssword'
                            placeholder='Confirm New Password'
                            name='confirmPassword'
                            value={password.confimrPasssword}
                            onChange={e => onPasswordChange(e)}
                          />
                        </Form.Item>
                      </div>
                    </div>
                    {resModal?.data && !resModal?.data?.status && (
                      <div className='col-12'>
                        <CustomAlert
                          visible={!resModal.data.status}
                          message={translateTextI18N(resModal.data.title)}
                          type='error'
                          showIcon={true}
                          classNames='mb-30 '
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='modalFooter'>
              <Button
                className='grayBtn'
                key='back'
                onClick={handleCancel}
                disabled={loading}
              >
                {translateTextI18N('Cancel')}
              </Button>

              <Button
                htmlType='submit'
                className='blueBtn ml-4'
                loading={loading}
              >
                {translateTextI18N('Submit')}
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      <ResponseModal
        visible={resModal.status}
        title={resModal.data?.title}
        success={resModal.data?.status}
        onCancel={closeResponseModal}
      />

      <ForceLogout
        visible={forceLogout}
        onCancel={() => {
          setForceLogout(false)
        }}
        onSubmit={() => {
          logout()
        }}
      />
    </>
  )
}

export default ChangePassword
