/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Breadcrumb } from 'antd'
import { useSelector } from 'react-redux'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const PageNamecard = ({ title, breadcrumb }) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const hotelInfo = useSelector(state => state.hotelInfo)
  return (
    <>
      <div className='Pagenamecard-wrp'>
        <div>
          <h1>{translateTextI18N(title)}</h1>
          <Breadcrumb>
            {Array.isArray(breadcrumb)
              ? breadcrumb.map((item, idx) => {
                  return (
                    <Breadcrumb.Item key={idx}>
                      {typeof item === 'object' ? item.hotelName : translateTextI18N(item)}
                    </Breadcrumb.Item>
                  )
                })
              : null}
          </Breadcrumb>
        </div>
        <figure>
          {hotelInfo && hotelInfo.hotelLogo && (
            <img src={hotelInfo.hotelLogo} width='75' height='75'></img>
          )}
        </figure>
      </div>
    </>
  )
}

export default PageNamecard
