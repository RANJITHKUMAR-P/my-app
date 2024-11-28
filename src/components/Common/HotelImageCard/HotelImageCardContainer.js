import { Space, Spin } from 'antd'
import React from 'react'
import { Ternary } from '../../../config/utils'

function HotelImageCardContainer({ wallpaperUrl, logoUrl }) {
  return (
    <div
      className={'bgPart ' + (wallpaperUrl ? 'fade-in' : '')}
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
    >
      {!wallpaperUrl && !logoUrl ? (
        <Space size='middle'>
          <Spin size='large' />
        </Space>
      ) : (
        <figure>
          <div
            className={'hotelLogo ' + Ternary(logoUrl, 'fade-in', '')}
            style={{
              backgroundImage: `url(${logoUrl})`,
              height: '120px',
              width: '190px',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          ></div>
        </figure>
      )}
    </div>
  )
}

export default HotelImageCardContainer
