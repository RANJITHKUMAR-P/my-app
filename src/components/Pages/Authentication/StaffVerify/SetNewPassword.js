import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { APIs, PAGELOADER, SpinLoading } from '../../../../config/constants'
import { Encrypt } from '../../../../config/utils'
import { actions } from '../../../../Store'
import ChangePasswordComp from '../ConfirmPassword/ChangePasswordComp'
import AxiosHelper from '../../../../utility/axiosHelper'
import LinkExpiredOtp from '../LinkExpired/LinkExpiredOtp'

const SetNewPassword = () => {
  let token = useParams()?.token || null
  const dispatch = useDispatch()
  const setNewPasswordState = useSelector(state => state)
  const { pageLoading, fetchTokenData } = setNewPasswordState
  const [expired, setExpired] = useState(false)
  const history = useHistory()
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  useEffect(() => {
    setIsPageLoaded(
      pageLoading === PAGELOADER.LOADED &&
        fetchTokenData.loading === PAGELOADER.LOADED
    )
  }, [fetchTokenData.loading, pageLoading])

  useEffect(() => {
    if (isPageLoaded) {
      if (!fetchTokenData.data) {
        setExpired(true)
      }
    }
  }, [pageLoading, fetchTokenData, isPageLoaded])

  const getOtp = ({ password, success, error }) => {
    if (!fetchTokenData?.data?.userId) return
    dispatch(actions.setNewPassword(Encrypt(password)))
    AxiosHelper.post(APIs.GENERATE_TOKEN, {
      grantFor: 'FORCE_CHANGE_PASSWORD',
      userId: fetchTokenData?.data?.userId,
      hotelId: fetchTokenData?.data?.hotelId,
    })
      .then(res => {
        dispatch(actions.setOTPData(res?.data))
        success?.()
      })
      .catch(err => {
        error?.(err.message)
      })
  }

  const successFun = () => {
    history.push(`/dept-verify/${token}`)
  }

  const errorfun = () => {
    console.log('error')
  }

  return (
    <>
      <div className='signin-wrp'>
        {isPageLoaded ? (
          [
            expired ? (
              <LinkExpiredOtp key='setnewpassword' />
            ) : (
              <ChangePasswordComp
                key='setnewpassword'
                triggerFn={getOtp}
                title='Set a new password'
                success={successFun}
                oobCode={token}
                error={errorfun}
              />
            ),
          ]
        ) : (
          <SpinLoading />
        )}
      </div>
    </>
  )
}

export default SetNewPassword
