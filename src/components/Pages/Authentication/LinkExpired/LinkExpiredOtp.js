/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { getImage } from '../../../../config/utils'
import HotelImageCard from '../../../Common/HotelImageCard/HotelImageCard'

const LinkExpiredOtp = () => {
  return (
    <>
      <HotelImageCard />
      <div id='welcomeId' className='formPart'>
        <div className='form-wrap'>
          <h3 style={{ marginBottom: '25px' }}>Sorry :(</h3>
          <h6 style={{ marginBottom: '25px' }}>
            The confirm account link has expired.
          </h6>
          <h6 style={{ marginBottom: '25px' }}>
            Please reach out to Admin for new confirmation link.
          </h6>
        </div>
        <div id='welcomeId' className='powered-wrp'>
          <h6>Powered by</h6>
          <img src={getImage('images/inplassSmall.svg')}></img>
        </div>
      </div>
    </>
  )
}

export default LinkExpiredOtp
