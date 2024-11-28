import { Radio } from 'antd'
import React from 'react'
import { colors } from '../../../config/constants'

function ColorRadioButtons(props) {
  return colors.map((color, idx) => (
    <Radio.Button
      value={color}
      style={{ backgroundColor: color }}
      onChange={e => {
        props.onHandleChange(props.id, e.target.value)
      }}
      key={`${props.id}${idx}`}
    ></Radio.Button>
  ))
}
export default ColorRadioButtons
