import React from 'react'
import { Translate } from 'react-auto-translate'
import { Trans } from 'react-i18next'
import { TranslateTextType } from '../../../config/constants'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

function TranslateText(props) {
  const { id, text, type, children } = props
  switch (type) {
    case TranslateTextType.I18N: {
      return text ? <Trans i18nKey={id}>{text}</Trans> : ''
    }
    case TranslateTextType.GOOGLE:
    default:
      if (children || text) {
        return <Translate>{children ? children : text}</Translate>
      }
      return null
  }
}

TranslateText.defaultProps = {
  type: TranslateTextType.GOOGLE,
}

export default TranslateText

function TranslateTextI18N(props) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  return translateTextI18N(props.children)
}

export { TranslateTextI18N }
