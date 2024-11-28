import { Button } from 'antd'
import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

function AddServiceRequestButton({ loading, onClick, requestRaised = false, type }) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  if (!requestRaised) return null

  if (type !== 'Department Requests') return null;

  return (
    <div className='col-4 col-md-auto ml-auto'>
      <Button className='cmnBtn' onClick={onClick} loading={loading}>
        {translateTextI18N('Add Bulk Request')}
      </Button>
    </div>
  )
}

export default AddServiceRequestButton
