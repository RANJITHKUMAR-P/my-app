/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { PAGELOADER } from '../../../config/constants'
import HotelImageCardContainer from './HotelImageCardContainer'

const HotelImageCard = () => {
  const [logoUrl, setLogoUrl] = useState('')
  const [wallpaperUrl, setWallpaperUrl] = useState('')
  const hotelImageCardState = useSelector(state => state)
  const { hotelLogo, hotelWallpaper, pageLoading, gettingHotelLogo } =
    hotelImageCardState

  useEffect(() => {
    if (PAGELOADER.LOADED === pageLoading && !gettingHotelLogo) {
      setLogoUrl(hotelLogo)
      setWallpaperUrl(hotelWallpaper)
    }
  }, [gettingHotelLogo, hotelLogo, hotelWallpaper, pageLoading])

  return (
    <HotelImageCardContainer logoUrl={logoUrl} wallpaperUrl={wallpaperUrl} />
  )
}

export default HotelImageCard
