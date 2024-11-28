import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GetToken } from '../../../../services/user'
import {
  GetDomainDetailsByHotelId,
  unSubGetDomain,
} from '../../../../services/domain'
import { getQueryParams } from '../../Functions/reusable'
import { useParams } from 'react-router-dom'
import { GetHotelLogo } from '../../../../services/hotels'
import ProductionDetailsToast from '../../ProductionDetailsToast/ProductionDetailsToast'
import GlobalMsg from '../../GlobalMsg/GlobalMsg'

function PublicLayout(props) {
  const { hotelInfo } = useSelector(state => state)
  const params = useParams()
  const dispatch = useDispatch()
  const qHotelId = getQueryParams('refId')

  useEffect(() => {
    async function onLoad() {
      if (params?.token) {
        await GetToken(params?.token, dispatch)
      }
    }

    onLoad()
  }, [dispatch, params?.token])

  useEffect(() => {
    if (
      hotelInfo?.hotelId &&
      !qHotelId &&
      !window.location.pathname.toLowerCase().includes('signin')
    ) {
      unSubGetDomain?.()
      GetDomainDetailsByHotelId(hotelInfo?.hotelId, dispatch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelInfo?.hotelId, qHotelId])

  useEffect(() => {
    if (qHotelId) {
      unSubGetDomain?.()
      GetDomainDetailsByHotelId(qHotelId, dispatch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qHotelId])

  useEffect(() => {
    if (window.location.pathname.toLowerCase().includes('signin')) {
      GetHotelLogo(dispatch)
    }
  }, [dispatch])

  return (
    <>
      <GlobalMsg />
      <ProductionDetailsToast />
      {props.children}
    </>
  )
}

export default PublicLayout
