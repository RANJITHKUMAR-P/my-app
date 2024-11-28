/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import CountCard from '..'
import { cardColorClassName } from '../../../../config/constants'

const CountBrownCard = ({ no = 0, text = '', imageSource = 'images/count-rooms.svg' }) => {
  return (
    <CountCard
      title={no}
      desc={text}
      image={imageSource}
      cardColorClassname={cardColorClassName.BROWN}
    ></CountCard>
  )
}

export default CountBrownCard
