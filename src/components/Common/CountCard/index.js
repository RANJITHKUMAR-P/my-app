/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { getImage } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

function CountCard(props) {
  const { cardColorClassname, title, desc, image } = props
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  return (
    <div className={`countcard-wrp Gr-${cardColorClassname}`}>
      <div>
        <h4>{title}</h4>
        <h6>{translateTextI18N(desc)}</h6>
      </div>
      <figure>
        <img src={getImage(image)}></img>
      </figure>
    </div>
  )
}

CountCard.defaulProps = {
  cardColorClassname: 'brown',
  title: '1',
  desc: 'Description',
  image: 'images/count-rquest-br.svg',
}

export default CountCard
