/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { Select } from 'antd'

function Option({ value, change, list }) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  return (
    <Select value={translateTextI18N(value)} onChange={e => change(e)}>
      {list.map(({id, name, isEmoji}) => (
        <Option value={id} key={id}>
          {isEmoji ? String.fromCodePoint(name) : translateTextI18N(name)}
        </Option>
      ))}
    </Select>
  )
}

Option.defaulProps = {
  cardColorClassname: 'brown',
  title: '1',
  desc: 'Description',
  image: 'images/count-rquest-br.svg',
}

export default Option
