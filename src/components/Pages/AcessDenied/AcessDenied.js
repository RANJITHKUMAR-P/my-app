import React from 'react'
import { getImage } from '../../../config/utils'

const Example = () => {
  return (
    <div>
      <div className='access-denied'>
        <img alt='success' src={getImage('images/LockImage.svg')}></img>
      </div>
      <div className='content-loader'>
        <h5>
          Sorry...Looks like Inplass currently doesn't provide you access to the
          Admin Panel
        </h5>
      </div>
    </div>
  )
}

export default Example
