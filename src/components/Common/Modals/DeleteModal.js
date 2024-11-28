import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const DeleteModal = props => {
  const { title = 'title ??', message = 'message ??' } = props
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <>
      <div className='deletetext-wrp'>
        <h2>{translateTextI18N(title, props?.options)}</h2>
        <h6>{translateTextI18N(message, props?.options)}</h6>
      </div>
    </>
  )
}

export default DeleteModal
