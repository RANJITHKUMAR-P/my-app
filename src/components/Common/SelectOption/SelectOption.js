/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import Option from '.'

const SelectOption = ({ value, change, list }) => {
  return <Option value={value} change={change} list={list}></Option>
}

export default SelectOption
