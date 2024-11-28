import React from 'react'
import { drpAssignOrNotAssign } from '../../../config/constants'
import { SelectDrops } from '../../../config/utils'

const SelectAssignOrNotAssign = props => {
  const { value, onChange } = props
  return (
    <SelectDrops
      list={drpAssignOrNotAssign}
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

export default SelectAssignOrNotAssign
