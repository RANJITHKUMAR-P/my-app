import React, { useEffect, useState } from 'react'
import { Input, Modal, Button, Spin } from 'antd'
import { useSelector } from 'react-redux'

import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import {
  GetTranslationData,
  GetTranslatiterationData,
} from '../../../config/utils'

async function getAllTranslation(
  languageDictionary,
  text,
  setTranslatedData,
  setFetchingTranslation
) {
  try {
    setFetchingTranslation(true)
    const [translationData, transliterationData] = await Promise.all([
      GetTranslationData(languageDictionary, text),
      GetTranslatiterationData(text),
    ])
    let  translations = { ...translationData, ...transliterationData }
    translations = Object.keys(translations).reduce((acc, lang) => {
      acc[lang] = translations[lang] || ''
      return acc
    }, {})
    setTranslatedData(translations)
  } catch (error) {
    console.log('❌ error ', error)
  } finally {
    setFetchingTranslation(false)
  }
}

const TranslateModal = ({
  visible,
  onCancelClick,
  onOkClick,
  oldTranslatedData = {},
  text,
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { languageDictionary } = useSelector(state => state)

  const [translatedData, setTranslatedData] = useState(oldTranslatedData)
  const [translatedText, setTranslatedText] = useState(oldTranslatedData['en'])
  const [fetchingTranslation, setFetchingTranslation] = useState(false)

  useEffect(() => {
    if (
      visible &&
      text &&
      (!Object.values(oldTranslatedData).filter(v => v).length ||
        !translatedText ||
        text !== translatedText)
    ) {
      getAllTranslation(
        languageDictionary,
        text,
        setTranslatedData,
        setFetchingTranslation
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageDictionary, text, visible])

  return (
    <Modal
      className='deleteModal cmnModal'
      onCancel={onCancelClick}
      visible={visible}
      footer={null}
      maskClosable={false}
    >
      <div className='row'>
        {fetchingTranslation ? (
          <div className='modal-loader'>
            <div className='spinnerLoader'>
              <Spin />
            </div>
          </div>
        ) : (
          languageDictionary.map(({ id: languageId, name, value }) => {
            return (
              <div key={languageId} className='form-group cmn-input col-6'>
                {name} - {value}
                <Input
                  value={translatedData[languageId]}
                  onChange={e =>
                    setTranslatedData({
                      ...translatedData,
                      [languageId]: e.target.value,
                    })
                  }
                />
              </div>
            )
          })
        )}
      </div>
      {fetchingTranslation ? null : (
        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={onCancelClick}>
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={() => {
              setTranslatedText(text)
              onOkClick(translatedData)
            }}
          >
            {translateTextI18N('Submit')}
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default TranslateModal
