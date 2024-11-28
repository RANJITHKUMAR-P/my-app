/* eslint-disable no-useless-escape */
import React, { useState, useEffect } from 'react'
import { Input, Select, Modal, Button, Form, Alert, Spin, Space } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import { EditHotelProfile } from '../../../services/hotels'
import Header from '../../Common/Header/Header'
import { actions } from '../../../Store'
import SuccessModal from '../../Common/Modals/SuccessModal'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import {
  emailErrorMessge,
  guestLogoOrNameAlignmentConfig,
  guestLogoOrNameConfig,
  Option,
} from '../../../config/constants'
import {
  geoPointToString,
  isValidUrl,
  SanitizeNumber,
  Ternary,
  UplaodFileCommon,
} from '../../../config/utils'
import CountryList from '../../../config/CountryList'
import ClassList from '../../../config/ClassList'
import stateList from '../../../config/stateList.json'
import HotelInfoContent from './HotelInfoContent'
import AddHotelImage from './AddHotelImage'
import AddHotelLogo from './AddHotelLogo'
import HotelInfoCurrency from './HotelInfoCurrency'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const HotelInfo = () => {
  const { hotelInfo } = useSelector(state => state)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [loadingData, setLoadingData] = useState(false)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [hotelName, setHotelName] = useState('')
  const [hotelSubName, setHotelSubName] = useState('')
  const [hotelId, setHotelId] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [emailId, setHotelEmail] = useState('')
  const [hotelLogoUrl, setHotelLogoUrl] = useState()
  const [hotelLogoError, setHotelLogoError] = useState('')
  const [hotelLogo, setHotelLogo] = useState()
  const [website, setWebsite] = useState('')
  const [city, setCity] = useState('')
  const [locationUrl, setLocation] = useState('')
  const [coordinates, setCoordinates] = useState('')
  const [countryName, setCountry] = useState('')
  const [className, setClass] = useState('')
  const [stateName, setStateName] = useState('')
  const [description, setDescription] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [roomCount, setRoomCount] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [currency, setCurrency] = useState('')
  const [curencyCode, setCurencyCode] = useState('')

  const [form] = Form.useForm()
  const [showLoader, setShowLoader] = useState(false)
  const [createUserError, setCreateUserError] = useState('')

  const [profileImageName, setProfileImageName] = useState(false)
  const [deleteProfileImage, setDeleteProfileImage] = useState(false)

  const [previews, setPreviews] = useState([])
  const [wallpaper, setWallpaper] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [resImageError, setResImageError] = useState('')
  const [filteredState, setFilteredState] = useState([])
  const [filterdCurrency, setFilterdCurrency] = useState('')
  const [guestSetting, updateGuestSetting] = useState({
    hotelLogoOrName: guestLogoOrNameConfig.name,
    hotelLogoOrNameAlignment: [guestLogoOrNameAlignmentConfig.left],
  })
  const { hotelLogoOrName, hotelLogoOrNameAlignment } = guestSetting

  function setGuestSetting(data) {
    updateGuestSetting(oldStat => ({ ...oldStat, ...data }))
  }

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('2'))
  }, [dispatch])

  const gethotelInfo = (key, defaultValue) => {
    return hotelInfo && key in hotelInfo ? hotelInfo[key] : defaultValue
  }

  const enableGuestAppLogoSetting = gethotelInfo(
    'enableGuestAppLogoSetting',
    false
  )
  const gethotel = (hotel, key, defaultValue) => {
    return hotel?.[key] ? hotel[key] : defaultValue
  }

  useEffect(() => {
    if (countryName) {
      let filterState = [...stateList]
      filterState = filterState.filter(user =>
        user.country?.includes(countryName)
      )
      if (filterState[0]) {
        setFilteredState(filterState[0].states)
      } else {
        setFilteredState([])
      }

      const selectedCountry = CountryList.find(c => c.name === countryName)
      if (selectedCountry) {
        setFilterdCurrency(selectedCountry.currency)
        if (hotelInfo.countryName !== countryName) {
          form.setFieldsValue({ stateName: null })
          setStateName(null)
        }

        setCountryCode(selectedCountry.code)
      } else {
        setStateName(gethotelInfo('stateName', null))
        form.setFieldsValue({
          stateName: gethotelInfo('stateName', null),
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryName, hotelInfo])

  const handleContactChange = e => {
    let contactNumberValue = SanitizeNumber(e.target.value)
    setContactNumber(contactNumberValue)
    form.setFieldsValue({
      contactNumber: contactNumberValue,
    })
  }
  const clearResImage = (e, file1) => {
    const ref = `${file1}`
    e.preventDefault()
    let previewsList = previews.filter(preview => preview !== ref)
    setPreviews(previewsList)
  }
  const clearWallpaper = (e, file1) => {
    const ref = `${file1}`
    e.preventDefault()
    let wallpaperList = wallpaper.filter(img => img !== ref)
    setWallpaper(wallpaperList)
  }

  const clearProfileImage = () => {
    setHotelLogo(null)
    setHotelLogoUrl(null)
  }
  const onFinishEdit = async () => {
    try {
      if (loadingData) return
      setShowLoader(true)
      setCreateUserError('')
      setHotelId(gethotelInfo('hotelId', null))
      const newHotel = {
        hotelName,
        website,
        city,
        countryName,
        className,
        roomCount,
        emailId,
        contactNumber,
        countryCode,
        locationUrl,
        coordinates,
        description,
        previews,
        wallpaper,
        hotelSubName,
        stateName,
        currency,
        curencyCode,

        hotelLogoOrName,
        hotelLogoOrNameAlignment: hotelLogoOrNameAlignment?.length
          ? hotelLogoOrNameAlignment[0]
          : guestLogoOrNameAlignmentConfig.left,
      }

      const { success: editSuccess, message: editErrorMessage } =
        await EditHotelProfile(
          hotelLogo,
          newHotel,
          hotelLogoUrl,
          profileImageName,
          deleteProfileImage,
          hotelId
        )
      if (!editSuccess) {
        setCreateUserError(editErrorMessage)
        return
      }

      setIsModalVisible(false)
      setShowSuccessModal(true)
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
    } finally {
      setShowLoader(false)
    }
  }

  const LoadModalData = () => {
    clearProfileImage()
    form.resetFields()

    setPreviews([])
    setWallpaper([])

    setIsModalVisible(true)

    setHotelName(hotelInfo.hotelName)
    setContactNumber(hotelInfo.contactNumber)
    setWebsite(hotelInfo.website)
    setHotelLogoUrl(hotelInfo.hotelLogo)
    setHotelId(hotelInfo.hotelId)
    setCity(hotelInfo.city)
    setHotelEmail(gethotel(hotelInfo, 'emailId', ''))
    setLocation(gethotel(hotelInfo, 'locationUrl', ''))
    setCoordinates(geoPointToString(gethotel(hotelInfo, 'coordinates', '')))
    setCountry(hotelInfo.countryName)
    setCountryCode(hotelInfo.countryCode)
    setClass(hotelInfo.className)
    setRoomCount(hotelInfo.roomCount)
    setHotelSubName(gethotel(hotelInfo, 'hotelSubName', ''))
    setDescription(gethotel(hotelInfo, 'description', ''))
    setPreviews(gethotel(hotelInfo, 'previews', []))
    setWallpaper(gethotel(hotelInfo, 'wallpaper', []))
    setCurrency(gethotel(hotelInfo, 'currency', ''))
    setGuestSetting({
      hotelLogoOrName: hotelInfo?.hotelLogoOrName || guestLogoOrNameConfig.name,
      hotelLogoOrNameAlignment: [
        hotelInfo?.hotelLogoOrNameAlignment ||
          guestLogoOrNameAlignmentConfig.left,
      ],
    })

    setHotelLogo(null)
    setProfileImageName(hotelInfo.hotelLogoImageName)
    setDeleteProfileImage(false)
    setIsModalVisible(true)

    form.setFieldsValue({
      hotelName: hotelInfo.hotelName,
      contactNumber: hotelInfo.contactNumber,
      website: hotelInfo.website,
      city: hotelInfo.city,
      emailId: hotelInfo.emailId,
      countryName: hotelInfo.countryName,
      countryCode: hotelInfo.countryCode,
      className: hotelInfo.className,
      roomCount: hotelInfo.roomCount,
      description: hotelInfo.description,
      locationUrl: hotelInfo.locationUrl,
      coordinates: geoPointToString(hotelInfo.coordinates),
      previews: hotelInfo.previews,
      wallpaper: hotelInfo.wallpaper,
      hotelSubName: hotelInfo.hotelSubName,
      stateName: hotelInfo.stateName,
      currency: hotelInfo.currency,
    })
    setStateName(hotelInfo.stateName)
  }

  useEffect(() => {
    if (isModalVisible) {
      LoadModalData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelInfo])

  const editHotelProfile = () => {
    LoadModalData()
  }

  useEffect(() => {
    if (createUserError) setTimeout(() => setCreateUserError(''), 3000)
    if (hotelLogoError) setTimeout(() => setHotelLogoError(''), 3000)
  }, [createUserError, hotelLogoError])

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const prefixSelector = (
    <Form.Item name='prefix' noStyle>
      {countryCode}
    </Form.Item>
  )

  function onGuestSettingOptionChange(e) {
    let selectedOption = e.target.value
    const guestConfig = { hotelLogoOrName: selectedOption }
    if (selectedOption === guestLogoOrNameConfig.both) {
      guestConfig.hotelLogoOrNameAlignment = [
        guestLogoOrNameAlignmentConfig.left,
      ]
    }
    setGuestSetting(guestConfig)
  }

  function onGuestSettingAlignmentChange(selectedOptions) {
    let selectedGuestAlignment = selectedOptions.filter(
      v => !hotelLogoOrNameAlignment.includes(v)
    )
    selectedGuestAlignment = selectedGuestAlignment.length
      ? selectedGuestAlignment
      : [guestLogoOrNameAlignmentConfig.left]
    setGuestSetting({ hotelLogoOrNameAlignment: selectedGuestAlignment })
  }

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent hotelInfo-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title={gethotelInfo('hotelName', '')}
                breadcrumb={[
                  'Hotel Admin',
                  { hotelName: `${gethotelInfo('hotelName', '')}` },
                ]}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row justify-content-end'>
                  <div className='col-auto'>
                    <Button onClick={editHotelProfile} className='cmnBtn'>
                      {translateTextI18N('Edit Details')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <HotelInfoContent hotelInfo={hotelInfo} />
        </div>
      </section>

      <Modal
        title={translateTextI18N('Edit Hotel Details')}
        visible={isModalVisible}
        onOk={onFinishEdit}
        onCancel={handleCancel}
        className='addHotelmodal cmnModal'
        footer={null}
      >
        <AddHotelLogo
          hotelLogoError={hotelLogoError}
          setHotelLogoError={setHotelLogoError}
          setHotelLogo={setHotelLogo}
          setHotelLogoUrl={setHotelLogoUrl}
          hotelLogoUrl={hotelLogoUrl}
          clearProfileImage={clearProfileImage}
          enableGuestAppLogoSetting={enableGuestAppLogoSetting}
          hotelLogoOrName={hotelLogoOrName}
          hotelLogoOrNameAlignment={hotelLogoOrNameAlignment}
          onGuestSettingOptionChange={onGuestSettingOptionChange}
          onGuestSettingAlignmentChange={onGuestSettingAlignmentChange}
        />
        <Form
          layout='vertical'
          initialValues={{
            prefix: countryCode,
          }}
          onFinish={onFinishEdit}
          form={form}
          validateTrigger
        >
          <div className='row'>
            <div className='col-12 col-sm-6 col-md-4'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Hotel Name')}
                  name='hotelName'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter the hotel name'),
                    },
                  ]}
                >
                  <Input
                    maxLength={50}
                    value={hotelName}
                    disabled
                    onChange={e => setHotelName(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-md-4'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Hotel Brand')}
                  name='hotelSubName'
                >
                  <Input
                    maxLength={50}
                    value={hotelSubName}
                    onChange={e => setHotelSubName(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-md-4'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Hotel Email ID')}
                  name='emailId'
                  rules={[
                    {
                      type: 'email',
                      message: translateTextI18N(emailErrorMessge),
                    },
                  ]}
                >
                  <Input
                    value={emailId}
                    placeholder='name@domain.com'
                    onChange={e => setHotelEmail(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-md-4'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Hotel Website')}
                  name='website'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N(
                        'Please enter the hotel website'
                      ),
                    },
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve()

                        if (isValidUrl(value)) {
                          return Promise.resolve()
                        }
                        return Promise.reject(
                          new Error(`Please enter valid hotel website url`)
                        )
                      },
                    }),
                  ]}
                >
                  <Input
                    placeholder='www.domain.com'
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-md-2'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Country')}
                  name='countryName'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select the country'),
                    },
                  ]}
                >
                  <Select
                    showSearch={true}
                    value={translateTextI18N(countryName)}
                    onChange={selectedCountryName =>
                      setCountry(selectedCountryName)
                    }
                    disabled
                    getPopupContainer={triggerNode => {
                      return triggerNode.parentNode
                    }}
                  >
                    {CountryList.map(country => (
                      <Option value={country.name} key={country.name}>
                        {translateTextI18N(country.name)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-sm-6 col-md-2'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('State')}
                  name='stateName'
                  value={translateTextI18N(stateName)}
                >
                  <Select
                    disabled
                    showSearch={true}
                    value={stateName}
                    onChange={selectedStateName => {
                      setStateName(selectedStateName)
                    }}
                    getPopupContainer={triggerNode => {
                      return triggerNode.parentNode
                    }}
                  >
                    {filteredState.map(objState => (
                      <Option value={objState} key={objState}>
                        {translateTextI18N(objState)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-sm-6 col-md-2'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('City')}
                  name='city'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter the city name'),
                    },
                  ]}
                >
                  <Input value={city} onChange={e => setCity(e.target.value)} />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-md-2'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Coordinates')}
                  name='coordinates'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N(
                        'Please enter the hotel coordinates'
                      ),
                    },
                    {
                      pattern: /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/,
                      message: translateTextI18N(
                        'Please enter a valid coordinates'
                      ),
                    },
                  ]}
                >
                  <Input
                    value={coordinates}
                    placeholder='19.9924028,36.2881812'
                    onChange={e => setCoordinates(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-sm-6 col-md-4'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Hotel Description')}
                  name='description'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N(
                        'Please enter the hotel description'
                      ),
                    },
                  ]}
                >
                  <Input
                    value={description}
                    maxLength={100}
                    placeholder={translateTextI18N(
                      'Enter hotel information here..'
                    )}
                    onChange={e => setDescription(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-md-2'>
              <div className='form-group contact-input'>
                <Form.Item
                  label={translateTextI18N('Contact Number')}
                  name='contactNumber'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N(
                        'Please enter the contact number'
                      ),
                    },
                  ]}
                >
                  <Input
                    maxLength={10}
                    addonBefore={prefixSelector}
                    value={contactNumber}
                    onChange={handleContactChange}
                  />
                </Form.Item>
              </div>
            </div>
            <HotelInfoCurrency
              hotelInfo={hotelInfo}
              currency={currency}
              filterdCurrency={filterdCurrency}
              setCurrency={setCurrency}
              setCurencyCode={setCurencyCode}
              form={form}
              countryName={countryName}
            />

            <div className='col-12 col-sm-6 col-md-2'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Class')}
                  name='className'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select the class'),
                    },
                  ]}
                >
                  <Select
                    value={className}
                    onChange={selectedClassname => setClass(selectedClassname)}
                    getPopupContainer={triggerNode => {
                      return triggerNode.parentNode
                    }}
                  >
                    {ClassList.map(classValue => (
                      <Option value={classValue.id} key={classValue.id}>
                        {classValue.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-md-2'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Rooms')}
                  name='roomCount'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter the room count'),
                    },
                    {
                      pattern: '[0-9.]+',
                      message: translateTextI18N(
                        'Please enter a numeric value'
                      ),
                    },
                  ]}
                >
                  <Input
                    value={roomCount}
                    onChange={e => setRoomCount(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            {Ternary(
              loadingData,
              <div style={{ width: '100%', textAlign: 'center' }}>
                <Spin />
              </div>,
              null
            )}
            <AddHotelImage
              title={translateTextI18N('Add Images')}
              previews={previews}
              loaded={loaded}
              setLoaded={() => setLoaded(true)}
              clearResImage={clearResImage}
              count={2}
              UplaodFileCommon={UplaodFileCommon}
              setResImageError={setResImageError}
              setLoadingData={setLoadingData}
              setPreviews={setPreviews}
            />
            <AddHotelImage
              previews={wallpaper}
              loaded={loaded}
              setLoaded={() => setLoaded(true)}
              clearResImage={clearWallpaper}
              count={0}
              UplaodFileCommon={UplaodFileCommon}
              setResImageError={setResImageError}
              setLoadingData={setLoadingData}
              setPreviews={setWallpaper}
              title={translateTextI18N('Set Wallpaper')}
            />
          </div>
          <br />
          <Space size='4'>
            {Ternary(
              resImageError,
              <Alert
                message={resImageError}
                type='error'
                showIcon
                id='hotelInfo-alert1'
              />,
              null
            )}
            {Ternary(
              createUserError,
              <Alert
                message={createUserError}
                type='error'
                showIcon
                id='hotelInfo-alert2'
              />,
              null
            )}
          </Space>
          <div className='modalFooter'>
            <Button className='grayBtn' key='back' onClick={handleCancel}>
              {translateTextI18N('Cancel')}
            </Button>

            <Button
              className='blueBtn ml-3 ml-lg-4'
              key='submit'
              htmlType='submit'
              loading={showLoader}
            >
              {translateTextI18N('Submit')}
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        visible={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        className='successModal'
        footer={null}
        centered
      >
        <SuccessModal title='Hotel details edited successfully'></SuccessModal>
      </Modal>
    </>
  )
}

export default HotelInfo
