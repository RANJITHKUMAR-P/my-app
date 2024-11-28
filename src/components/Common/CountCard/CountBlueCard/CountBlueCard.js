/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import CountCard from '..'
import { cardColorClassName } from '../../../../config/constants'

const CountBlueCard = ({ no = 0, text = '', imageSource = 'images/count-service.svg' }) => {
  return (
    <CountCard
      title={no}
      desc={text}
      image={imageSource}
      cardColorClassname={cardColorClassName.BLUE}
    ></CountCard>
  )
}

export default CountBlueCard
