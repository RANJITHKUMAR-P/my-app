import React from 'react'
import { Alert } from 'antd'

import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const CustomAlert = ({ visible, message, type, showIcon, classNames }) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  return visible ? (
    <Alert
      message={translateTextI18N(message)}
      type={type}
      showIcon={showIcon}
      className={`text-left ${classNames}`}
    />
  ) : null
}
export default CustomAlert
