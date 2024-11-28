import React from 'react'
import { LightgalleryItem } from 'react-lightgallery'
import { DeleteFilled } from '@ant-design/icons'
import { Button } from 'antd'

function HotelGuideLineImage(props) {
  const { idx, name, url, createdAt } = props
  return (

      <div className='guidelineBox'>
        <LightgalleryItem group={'group1'} src={url}>
          <figure>
            <img src={url} style={{ width: '100%', height: '100%' }} alt='' />
          </figure>
          <div className='guidelineDet'>
            <h5>{name}</h5>
            <h6>{createdAt}</h6>
          </div>
        </LightgalleryItem>

        <Button
          type='primary'
          shape='circle'
          icon={<DeleteFilled />}
          onClick={e => props?.handleDelete(e, props, idx)}
        />
     
    </div>
  )
}

export default HotelGuideLineImage
