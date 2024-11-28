import React, { useEffect } from 'react'
import ViewOrder from '../../ViewOrder/ViewOrder'
import { addRatingEmojiConfigListener } from '../../../../services/config'
import { useDispatch } from 'react-redux'

function MasterLayout(props) {
  const dispatch = useDispatch()

  useEffect(() => {
    addRatingEmojiConfigListener({ dispatch })
  }, [dispatch])

  return (
    <div>
      {props.children}
      <ViewOrder />
    </div>
  )
}

export default MasterLayout
