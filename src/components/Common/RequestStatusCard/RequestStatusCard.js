/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Button, Skeleton } from 'antd'
import { string, oneOf } from 'prop-types'

import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { toTitleCase } from '../../../config/utils'

const RequestStatusCard = props => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { btnClassName, btnText, title, desc, loading } = props

  if (loading) {
    return <Skeleton />
  }

  return (
    <>
      <div className='requestStatusCard'>
        <h4>
          {toTitleCase(title)}
          <span>{desc}</span>
        </h4>
        <Button className={`statusBtn ${btnClassName}`}>{translateTextI18N(btnText)}</Button>
      </div>
    </>
  )
}

RequestStatusCard.defaultProps = {
  btnText: 'Pending',
  btnClassName: 'pendingBtn',
  title: 'Ryan Piterson',
  desc: 'Room No. 512 Front Desk',
  image: 'images/requestfig.png',
  loading: false,
}

RequestStatusCard.propTypes = {
  btnClassName: oneOf(['pendingBtn', 'completedBtn', 'inprogressBtn']),
  btnText: string.isRequired,
  title: string.isRequired,
  desc: string.isRequired,
  image: string.isRequired,
}

export default RequestStatusCard
