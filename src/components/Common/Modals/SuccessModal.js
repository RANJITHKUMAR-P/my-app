import React from 'react'
import SucessSVG from '../../../assets/svg/sucess_svg'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const SuccessModal = ({ title }) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <>
      <div className='successtext-wrp'>
        <SucessSVG />
        <h5 style={{ paddingTop: '19px' }}>{translateTextI18N(title)}</h5>
      </div>
    </>
  )
}

export default SuccessModal
