import React, { useMemo } from 'react'
import { getImage, Ternary } from '../../../config/utils'

function Node(props) {
  return useMemo(() => {
    const { name, profileImage, title, department } = props.userdata
    return (
      <div className='orgchartCard'>
        <figure className='white-background'>
          <img
            className='img-fluid round-image '
            alt=''
            src={Ternary(
              profileImage,
              profileImage,
              getImage('images/hierarchy-placeholder.png')
            )}
          ></img>
        </figure>
        <h5>{name}</h5>
        <h6>{department}</h6>
        <h6>{title}</h6>
      </div>
    )
  }, [props?.userdata])
}

export default Node
