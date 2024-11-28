/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { getParameterByName } from '../../../Common/Functions/reusable'
import { useHistory } from 'react-router'

import {
  resetUserPassword,
  CheckIfResetPasswordCodeIsNotExpired,
  IsSuperAdmin,
} from '../../../../services/user'
import ChangePasswordComp from './ChangePasswordComp'
import { Spin } from 'antd'
import LinkExpired from '../LinkExpired/LinkExpired'
import { getDomainByHotelId } from '../../../../services/domain'
import { useDispatch } from 'react-redux'
const Loading = (
  <div className='page-center'>
    <Spin size='large' />
  </div>
)

const ConfirmPassword = () => {
  const history = useHistory()
  const [oobCode, setOobCode] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [expired, setExpired] = useState(false)
  const [successFlag, setSuccessFlag] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    let sApiKey = getParameterByName('apiKey')
    let code = getParameterByName('oobCode')

    if (!code || !sApiKey) {
      history.push('/SignIn')
      return
    }
    setOobCode(code)
    CheckCode(code)
  }, [])

  const CheckCode = async code => {
    await getDomainByHotelId({ dispatch, hotelId: getParameterByName('refId') })
    const { success, email } = await CheckIfResetPasswordCodeIsNotExpired(
      code
    ).catch(_err => {
      setPageLoading(false)
    })
    setPageLoading(false)
    if (!success) setExpired(true)
    const superAdmin = await IsSuperAdmin(email)
    setIsSuperAdmin(superAdmin)
    setUserEmail(email)
  }

  const successCb = () => {
    setSuccessFlag(true)
  }

  return (
    <>
      <div className='signin-wrp'>
        {pageLoading
          ? Loading
          : [
              expired ? (
                <LinkExpired key='changepassword' />
              ) : (
                <ChangePasswordComp
                  key='changepassword'
                  triggerFn={resetUserPassword}
                  title='Confirm new password'
                  userEmail={userEmail}
                  success={successCb}
                  oobCode={oobCode}
                  isSuperAdmin={isSuperAdmin}
                  successFlag={successFlag}
                />
              ),
            ]}
      </div>
    </>
  )
}

export default ConfirmPassword
