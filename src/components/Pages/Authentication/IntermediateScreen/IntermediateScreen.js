/* eslint-disable jsx-a11y/alt-text */
import { Button } from 'antd'
import React from 'react'
import { useSelector } from 'react-redux'
import { getImage } from '../../../../config/utils'

const IntermediateScreen = ({ isSuperAdmin = false }) => {
  const { subDomainData } = useSelector(state => state)

  const handleButtonClick = () => {
    let location = process.env.REACT_APP_SUPER_ADMIN_URL
    if (isSuperAdmin) {
      window.location.href = location
    } else {
      window.location.href = `/SignIn/${subDomainData.subDomain}`
    }
  }

  return (
    <>
      <div className='formPart'>
        <div className='form-wrap'>
          <h3 style={{ marginBottom: '25px' }}>Welcome!!</h3>
          <h6>
            <p>Your Password has been changed successfully</p>
          </h6>
          <Button
            htmlType='button'
            className='continuebtn'
            onClick={handleButtonClick}
            style={{ width: '190px' }}
          >
            Go Back To Sign In
          </Button>
        </div>
        <div className='powered-wrp'>
          <h6>Powered by</h6>
          <img src={getImage('images/inplassSmall.svg')}></img>
        </div>
      </div>
    </>
  )
}

export default IntermediateScreen
