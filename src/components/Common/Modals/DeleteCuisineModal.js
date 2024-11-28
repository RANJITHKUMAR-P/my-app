import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const DeleteCuisineModal = props => {
  const { title = 'title ??', message = 'message ??' ,extraInfo='extraInfo ??' } = props
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <>
      <div className='deletetext-wrp'>
        <h2>{translateTextI18N(title, props?.options ?? {})}</h2>
        <h6>{translateTextI18N(message)}</h6>
        {extraInfo&&  <h6>{translateTextI18N(extraInfo)}</h6>}
      </div>
    </>
  )
}

export default DeleteCuisineModal
