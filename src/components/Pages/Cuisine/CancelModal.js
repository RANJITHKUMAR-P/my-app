import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import {  Button } from 'antd'

const CancelModal = ({
  handleCancel,
  showLoader,
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <>
      <div className='modalFooter'>
        <Button className='grayBtn' key='back' onClick={handleCancel}>
          {translateTextI18N('Cancel')}
        </Button>
        <Button
          className='blueBtn ml-3 ml-lg-4'
          key='submit'
          htmlType='submit'
          loading={showLoader}
        >
          {translateTextI18N('Submit')}
        </Button>
      </div>
    </>
  )
}

export default CancelModal
