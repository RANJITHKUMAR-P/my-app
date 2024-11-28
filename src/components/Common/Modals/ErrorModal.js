import React from 'react'
import { getImage } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const ErrorModal = ({ title, iconWidth = '16', showIcon = true }) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <>
      <div className='successtext-wrp' id='error'>
        {showIcon && (
          <img
            src={getImage('images/error.png')}
            alt='error'
            style={{ width: `${iconWidth}%` }}
            className={'mb-2'}
          />
        )}
        <h5 style={{ paddingTop: '19px' }}>{translateTextI18N(title)}</h5>
      </div>
    </>
  )
}

export default ErrorModal
