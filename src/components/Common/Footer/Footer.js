/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { getImage } from '../../../config/utils'

const Footer = () => {
  return (
    <>
      <footer>
        <div className='container-wrp'>
          <div className='row align-items-center justify-content-end'>
            <h6>Powered by</h6>
            <img src={getImage('images/inplassSmall.svg')}></img>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
