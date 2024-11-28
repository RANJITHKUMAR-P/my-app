/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Logout } from '../../../services/user'
import { maintenance } from '../../../config/images'

const Maintanance = () => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector(state => state)

  async function onLoad() {
    await Logout({ userInfo, dispatch })
  }
  useEffect(() => {
    onLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className='maintenance-wrp'>
        <div>
          <figure>
            <img className='img-fluid' src={maintenance}></img>
          </figure>
          <h1>Website under maintenance</h1>
          <h3>
            Inplass web and mobile applications will not be available during
            this time. Our apology for the inconvenience.
          </h3>
        </div>
      </div>
    </>
  )
}

export default Maintanance
