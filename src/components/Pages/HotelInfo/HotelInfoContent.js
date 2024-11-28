/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useMemo } from 'react'
import { GetRestaurants } from '../../../services/restaurants'
import { getImage, UpperCase, UpperCaseWithSpace } from '../../../config/utils'

import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { useSelector } from 'react-redux'
import {
  defaultModalData,
  loadProgress,
  secondsToShowAlert,
} from '../../../config/constants'
import { Alert, Button } from 'antd'
import HotelGuideLines from './HotelGuideLines'
import HotelGuideLineModal from './HotelGuideLines/HotelGuideLineModal'
import uniqid from 'unique-string'
import { updateHotelData } from '../../../services/hotels'
import { CopyOutlined } from '@ant-design/icons'
import HotelOverAllQuestions from './HotelOverAllQuestions'

const HotelInfoContent = ({ hotelInfo }) => {
  const [loading, setLoading] = useState(loadProgress.TOLOAD)
  const [restaurantCount, setRestaurantCount] = useState('')
  const [copied, setCopied] = useState('')
  const [apiCopied, setAPICopied] = useState('')
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [modalData, setModalData] = useState(defaultModalData)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const get = (key, defaultValue) => {
    return hotelInfo && hotelInfo[key] ? hotelInfo[key] : defaultValue
  }

  let { subDomain } = useSelector(state => state)

  useEffect(() => {
    async function onload() {
      let restauants = await GetRestaurants(get('hotelId', null))
      setRestaurantCount(restauants.length)
    }
    onload()
  }, [get, hotelInfo])

  const copyUrl = () => {
    navigator.clipboard.writeText(`${guestUrl}${subDomain}`)
    setCopied('Url Copied')
    setTimeout(() => {
      setCopied('')
    }, secondsToShowAlert)
  }

  const copyAPI = () => {
    navigator.clipboard.writeText(hotelInfo.hotelApiKey)
    setAPICopied('API Copied')
    setTimeout(() => {
      setAPICopied('')
    }, secondsToShowAlert)
  }

  const generateAPIKey = async () => {
    await updateHotelData(hotelInfo.hotelId, { hotelApiKey: uniqid() })
  }

  const hotelLocation = () => {
    let coordinates = get('coordinates', null)
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude}%2C${coordinates.longitude}`
  }

  const guestUrl = process.env.REACT_APP_GUEST_URL

  const handleOk = () => {
    setModalData(defaultModalData)
  }

  const handleCancel = () => {
    setModalData(defaultModalData)
  }

  const modalMemo = useMemo(() => {
    return (
      modalData.status && (
        <HotelGuideLineModal
          modalData={modalData}
          handleOk={handleOk}
          handleCancel={handleCancel}
          setModalData={setModalData}
          loading={loading}
          setLoading={setLoading}
        />
      )
    )
  }, [loading, modalData])

  return (
    <>
      <div className='profileCard'>
        <div className='row'>
          <div className='col-12 col-lg-auto'>
            <div className='profileMainDetails'>
              <div>
                <figure>
                  <img
                    className='img-fluid'
                    src={hotelInfo ? hotelInfo.hotelLogo : null}
                  ></img>
                </figure>
                <h4>{UpperCase(get('hotelName', ''))}</h4>
                <h5>{get('city', '')}</h5>
              </div>
              <p style={{ textAlign: 'justify' }}>{get('description', '')}</p>
            </div>
          </div>
          <div className='col-12 col-lg profileSubDetails-wrp'>
            <div className='profileSubDetails'>
              <ul className='list-unstyled'>
                <li>
                  <h6>{translateTextI18N('Hotel Email')}</h6>
                  <span>{get('emailId', '')}</span>
                </li>
                <li>
                  <h6>{translateTextI18N('Hotel Contact Number')}</h6>
                  <span>
                    {get('countryCode', '')} {get('contactNumber', '')}
                  </span>
                </li>
                <li>
                  <h6>{translateTextI18N('Hotel Website')}</h6>
                  <span>
                    <a
                      href={get('website', '')}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {get('website', '')}
                    </a>
                  </span>
                </li>
                <li>
                  <h6>{translateTextI18N('Class')}</h6>
                  <span>
                    {hotelInfo ? UpperCaseWithSpace(hotelInfo.className) : null}
                  </span>
                </li>
                {hotelInfo && hotelInfo.coordinates && (
                  <li>
                    <h6>{translateTextI18N('Location')}</h6>
                    <span>
                      <a
                        href={hotelLocation()}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {translateTextI18N('View map')}{' '}
                        <img src={getImage('images/google-maps.svg')}></img>
                      </a>
                    </span>
                  </li>
                )}
                <li>
                  <h6>{translateTextI18N('Restaurants')}</h6>
                  <span>{restaurantCount}</span>
                </li>
                <li>
                  <h6>{translateTextI18N('Rooms')}</h6>
                  <span>{get('roomCount', '')}</span>
                </li>
              </ul>

              <ul className='list-unstyled'>
                <li>
                  <h6>{translateTextI18N('Subscription')} </h6>
                  <span>
                    {hotelInfo ? UpperCase(hotelInfo.subscription) : null}
                  </span>
                </li>
                {/* <li>
                  <h6>{translateTextI18N('Valid Till')}</h6>
                  <span>{'30th July 2025'}</span>
                </li> */}
              </ul>
              <ul className='list-unstyled'>
                <li>
                  <h6 className='w-50'>
                    {translateTextI18N('URL for QR code generation')}
                  </h6>
                  <Button onClick={copyUrl} className='cmnBtn'>
                    {translateTextI18N('Copy URL')}
                  </Button>
                </li>

                <li>
                  <span>
                    <a
                      href={`${guestUrl}${subDomain}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >{`${guestUrl}${subDomain}`}</a>
                  </span>
                </li>
                {copied ? (
                  <Alert
                    style={{ textAlign: 'center', marginTop: '5px' }}
                    message={copied}
                    type='success'
                  />
                ) : null}
              </ul>
              {hotelInfo?.integrationType === 'ANTLAB' ? (
                <ul className='list-unstyled'>
                  <li>
                    <h6 className='w-50'>
                      {translateTextI18N('Generate API Key')}
                    </h6>
                    <Button onClick={generateAPIKey} className='cmnBtn'>
                      {translateTextI18N('Generate')}
                    </Button>
                  </li>

                  {hotelInfo.hotelApiKey ? (
                    <li>
                      <span> {hotelInfo.hotelApiKey}</span>

                      <CopyOutlined onClick={copyAPI} className='copyBtn' />
                    </li>
                  ) : null}

                  {apiCopied ? (
                    <Alert
                      style={{ textAlign: 'center', marginTop: '5px' }}
                      message={apiCopied}
                      type='success'
                    />
                  ) : null}
                </ul>
              ) : null}
            </div>

            <HotelGuideLines
              modalData={modalData}
              setModalData={setModalData}
              loading={loading}
              setLoading={setLoading}
            ></HotelGuideLines>

            <HotelOverAllQuestions
              modalData={modalData}
              setModalData={setModalData}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
          <div className='col-12 col-xl-auto'>
            <div className='profileGallery'>
              {hotelInfo &&
                hotelInfo.previews &&
                hotelInfo.previews.map(file => (
                  <figure>
                    <img src={file}></img>
                  </figure>
                ))}
            </div>
          </div>
        </div>
      </div>

      {modalMemo}
    </>
  )
}

export default HotelInfoContent
