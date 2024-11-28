import React from 'react'
import { getImage } from '../../../config/utils'

const ClearImage = ({ onClick, visible }) => {
  if (visible) {
    return (
      <span className='removebtn' onClick={onClick}>
        <img
          className='img-fluid'
          src={getImage('images/close.svg')}
          alt=''
        ></img>
      </span>
    )
  }

  return null
}

export default ClearImage
