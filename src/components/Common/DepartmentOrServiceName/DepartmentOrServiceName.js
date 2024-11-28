import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  ManagementDeptObject,
  translationDataKey,
} from '../../../config/constants'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

function DepartmentOrServiceName({ data, nameKey = 'name' }) {
  const [translatedName, setTranslatedName] = useState('')

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { currentLanguage } = useSelector(state => state)

  useEffect(() => {
    if (typeof data === 'object') {
      const { predefined, default: isDefault, [nameKey]: name } = data || {}
      const translationData = data?.[translationDataKey] || {}

      if (
        predefined ||
        isDefault ||
        name.toLowerCase() === ManagementDeptObject.name.toLowerCase()
      ) {
        setTranslatedName(name ? translateTextI18N(name) : '')
      } else {
        setTranslatedName(translationData[currentLanguage] || name)
      }
    }

    if (typeof data === 'string') {
      setTranslatedName(translateTextI18N(data))
    }
  }, [currentLanguage, data, nameKey, translateTextI18N])

  return translatedName
}

export default DepartmentOrServiceName
