/* eslint-disable jsx-a11y/alt-text */
import { Button } from 'antd'
import React from 'react'
import HotelImageCard from '../../../Common/HotelImageCard/HotelImageCard'
import { useHistory } from 'react-router'
import { getImage } from '../../../../config/utils'

const LinkExpired = () => {
  let history = useHistory()

  const handleGoBack = () => {
    let continueUrl = ''
    if (window.location?.hostname !== 'localhost') {
      continueUrl = process.env.REACT_APP_HOSTNAME
      const query = new URLSearchParams(history.location.search)
      if (query.get('continueUrl')) {
        continueUrl = query.get('continueUrl')
      }
    }
    window.location.replace(`${continueUrl}/ForgotPassword`)
  }

  return (
    <>
      <HotelImageCard />
      <div className='formPart'>
        <div className='form-wrap'>
          <h3 style={{ marginBottom: '25px' }}>Sorry :(</h3>
          <h6 style={{ marginBottom: '25px' }}>
            The password reset link has expired.
          </h6>
          <h6 style={{ marginBottom: '25px' }}>
            Please click the below button to go back to Forgot password page to
            request for new link.
          </h6>
          <Button
            htmlType='button'
            className='continuebtn'
            onClick={handleGoBack}
            style={{ width: '190px' }}
          >
            Go Back
          </Button>{' '}
        </div>
        <div className='powered-wrp'>
          <h6>Powered by</h6>
          <img src={getImage('images/inplassSmall.svg')}></img>
        </div>
      </div>
    </>
  )
}

export default LinkExpired
