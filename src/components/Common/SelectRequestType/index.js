import React from 'react'
import { drpRequestTypes } from '../../../config/constants'
import { SelectDrops } from '../../../config/utils'

const SelectRequestType = props => {
  const { value, onChange } = props
  return (
    <SelectDrops
      list={Object.values(drpRequestTypes)}
      value={value}
      addAll
      onChange={(...args) => {
        let { value, children } = args[1]
        onChange({ id: value, name: children })
      }}
      nameKey='name'
      valueKey='id'
    />
  )
}

export default SelectRequestType
