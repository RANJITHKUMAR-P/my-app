/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unused-vars */
/* eslint-disable strict */
'use strict'

import React, { useEffect, useState } from 'react'
import reactCSS from 'reactcss'

import Chrome from 'react-color'
import { getImage } from '../../../config/utils'

function ColorPicker(props) {
  const [colorConfig, setColorConfig] = useState({
    displayColorPicker: false,
    color: {
      r: '241',
      g: '112',
      b: '19',
      a: '1',
    },
    combinedColor: 'Choose a custom color',
  })

  const { displayColorPicker, color, combinedColor } = colorConfig

  useEffect(() => {
    setColorConfig({
      ...colorConfig,
      combinedColor: props.colorCode,
    })
  }, [props.colorCode])

  const handleClick = () => {
    setColorConfig({ ...colorConfig, displayColorPicker: !displayColorPicker })
  }

  const handleClose = () => {
    setColorConfig({ ...colorConfig, displayColorPicker: false })
  }

  const handleChange = currentcolor => {
    const { r, g, b, a } = currentcolor.rgb
    const currentCombinedColor = `rgba(${r}, ${g}, ${b}, ${a})`
    setColorConfig({
      ...colorConfig,
      color: currentcolor.rgb,
      combinedColor: currentCombinedColor,
    })
    props.onHandleChange(currentCombinedColor)
  }

  const styles = reactCSS({
    default: {
      color: {
        background: combinedColor,
        // background: `url("images/nocolor.svg")`
      },
    },
  })

  return (
    <>
      <div className='colorpickerfield' onClick={handleClick}>
        <span className='pickericon'>
          <img src={getImage('images/color-picker.svg')}></img>
        </span>
        <span className='colorcode'>{combinedColor}</span>
        <div className='colordisplay' style={styles.color}></div>
      </div>
      {displayColorPicker ? (
        <div className='colorpopup'>
          <div className='colorpopupCover' onClick={handleClose} />
          <Chrome disableAlpha color={color} onChange={handleChange} />
        </div>
      ) : null}
    </>
  )
}

export default ColorPicker
