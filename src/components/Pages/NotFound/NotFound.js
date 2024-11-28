/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import LottieAnimation from './LottieAnimation'
import home from '../../../config/animation.json'
import { routeConstant } from '../../../Router/routeConstant'
import { useHistory } from 'react-router-dom'
import { GetCurrentUser } from '../../../services/user'
import { useSelector } from 'react-redux'
import WelcomeLoader from '../../Common/WelcomeLoader/WelcomeLoader'

const NotFound = ({ message }) => {
  const { subDomain } = useSelector(state => state)
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  useEffect(() => {
    let findIdx = routeConstant.findIndex(item => item.path.includes(window.location.pathname))
    if (findIdx !== -1) {
      if (!GetCurrentUser()) {
        history.push(`/SignIn/${subDomain}`)
      }
    }
    setLoading(true)
  }, [history, subDomain])

  return loading ? (
    <div className='example'>
      <LottieAnimation lotti={home} height={560} width={300} />
      <div className='content-loader'>
        <h5>{message}</h5>
      </div>
    </div>
  ) : (
    <WelcomeLoader />
  )
}

export default NotFound
