/* eslint-disable array-callback-return */
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthContext } from '../Router/AuthRouteProvider'

export const googleApiKey = process.env.REACT_APP_GOOGLE_TRANSLATOR_KEY

export const useCustomI18NTranslatorHook = () => {
  const { t } = useTranslation()
  const appState = useContext(AuthContext)

  const { languageDictionary, currentLanguage } = appState

  async function updateDataToDB(text) {
    if (text) {
      let keywordList = JSON.parse(localStorage.getItem('keywords')) || []
      let idx = keywordList.findIndex(keywords => keywords.includes(text))
      if (idx < 0) {
        keywordList = [...keywordList, text]
      }
      localStorage.setItem('keywords', JSON.stringify(keywordList))
    }
  }

  function translateTextI18N(textString, options) {
    let find = languageDictionary?.find(item => item.id === currentLanguage)

    if (typeof textString === 'string' && textString !== '') {
      let curText = textString.trim()

      if (options) {
        if (Object.keys(options)?.length > 0) {
          return t(curText, options)
        }
      }

      if (find) {
        if (!find.data[curText]) {
          updateDataToDB(curText)
        } else {
          localStorage.removeItem(curText)
        }
      }

      return t(curText)
    }
    return t(textString)
  }
  return [translateTextI18N]
}

