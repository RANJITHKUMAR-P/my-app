/* eslint-disable jsx-a11y/alt-text */
import { Button } from 'antd'
import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { getImage } from '../../../../config/utils'
import HotelImageCard from '../../../Common/HotelImageCard/HotelImageCard'

const IntermediateScreenOtp = () => {
  const history = useHistory()
  const { subDomain } = useSelector(state => state)

  const handleGoBack = () => {
    history.push(`/SignIn/${subDomain}`)
  }

  return (
    <>
      {' '}
      <div className='signin-wrp'>
        <HotelImageCard />
        <div id='welcomeId' className='formPart'>
          <div className='form-wrap'>
            <h3 id='welcomeId' style={{ marginBottom: '25px' }}>
              Welcome!!
            </h3>
            <h6>
              <p>Your Password has been changed successfully</p>
            </h6>
            <Button
              htmlType='button'
              className='continuebtn'
              onClick={handleGoBack}
              style={{ width: '190px' }}
            >
              Go Back To Sign In
            </Button>
          </div>
          <div id='welcomeId' className='powered-wrp'>
            <h6>Powered by</h6>
            <img src={getImage('images/inplassSmall.svg')}></img>
          </div>
        </div>
      </div>
    </>
  )
}

export default IntermediateScreenOtp
