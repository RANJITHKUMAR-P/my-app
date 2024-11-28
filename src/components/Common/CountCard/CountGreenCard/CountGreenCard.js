/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import CountCard from '..'
import { cardColorClassName } from '../../../../config/constants'

const CountGreenCard = ({ no = 0, text = '', imageSource = 'images/count-departments.svg' }) => {
  return (
    <CountCard
      title={no}
      desc={text}
      image={imageSource}
      cardColorClassname={cardColorClassName.GREEN}
    ></CountCard>
  )
}

export default CountGreenCard
