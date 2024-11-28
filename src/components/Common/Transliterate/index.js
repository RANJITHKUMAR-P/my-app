/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export const Transliterate = ({ value }) => {
  const appState = useSelector(state => state)
  const { currentLanguage } = appState
  const [options, setOptions] = useState([])

  useEffect(() => {
    getSuggestions(value, currentLanguage)
  }, [value, currentLanguage])

  const getSuggestions = async (word, lang) => {
    // fetch suggestion from api
    // const url = `https://www.google.com/inputtools/request?ime=transliteration_en_${lang}&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&text=${lastWord}`;
    const url = `https://inputtools.google.com/request?text=${word}&itc=${lang}-t-i0-und&num=13&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`
    try {
      const res = await fetch(url)
      const data = await res.json()
      if (!data.includes('INVALID_INPUT_METHOD_NAME')) {
        if (data && data[0] === 'SUCCESS') {
          let found = data[1][0][1]
          found = found.slice(0, 5)
          setOptions(found)
        }
      } else {
        setOptions([word])
      }
    } catch (e) {
      console.error('There was an error with transliteration', e)
    }
  }
  return options ? options[0] : value
}
