import { Button } from 'antd'
import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

function AddRequestButton({ loading, onClick, requestRaised = false }) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  if (!requestRaised) return null

  return (
    <div className='col-4 col-md-auto ml-auto'>
      <Button className='cmnBtn' onClick={onClick} loading={loading}>
        {translateTextI18N('Add Request')}
      </Button>
    </div>
  )
}

export default AddRequestButton
