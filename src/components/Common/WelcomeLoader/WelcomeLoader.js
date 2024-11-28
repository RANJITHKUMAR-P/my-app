import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { auth } from '../../../config/firebase'
import { CurrentUserListener } from '../../../services/user'

const WelcomeLoader = ({
  msg = '...............',
  allowUserListener = false,
}) => {
  const { hotelInfo } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    if (
      window?.switchHotel === false &&
      auth?.currentUser?.uid &&
      allowUserListener
    ) {
      CurrentUserListener({
        id: auth?.currentUser?.uid,
        dispatch,
        hotelId: hotelInfo?.hotelId,
      })
    }
  }, [allowUserListener, dispatch, hotelInfo])

  return (
    <>
      <div className='loaderContainer content' style={{ height: '100vh' }}>
        <div className='loaderWrapper'>
          <div className='loaderRail '> {msg} </div>
        </div>
      </div>
    </>
  )
}

export default WelcomeLoader
