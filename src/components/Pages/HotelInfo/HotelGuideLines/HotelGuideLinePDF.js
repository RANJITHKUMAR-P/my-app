import React from 'react'
import { Button } from 'antd'
import { DeleteFilled } from '@ant-design/icons'
import { getImage } from '../../../../config/utils'

function HotelGuideLinePDF(props) {
  const { idx, name, createdAt, handleDelete, handleClickPDF } = props

  return (
    <>
      <div className='guidelineBox'>
        <figure>
          <img
            style={{ width: '100%', height: '100%' }}
            src={getImage('images/pdfimage.png')}
            alt=''
          ></img>
        </figure>
        <div
          className='guidelineDet'
          onClick={e => handleClickPDF(e, props, idx)}
        >
          <h5>{name}</h5>
          <h6>{createdAt}</h6>
        </div>
        <Button
          type='primary'
          shape='circle'
          icon={<DeleteFilled />}
          onClick={e => handleDelete(e, props, idx)}
        />
      </div>
    </>
  )
}

export default HotelGuideLinePDF
