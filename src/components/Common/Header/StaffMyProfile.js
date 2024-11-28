/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react'
import { Input, Upload, Select, Modal, Button, Form, Alert } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import ImgCrop from 'antd-img-crop'

import PlaceHolder from '../../../assets/backgroundimages/Placeholder.svg'
import CountryList from '../../../config/CountryList'
import {
  beforeCrop,
  getImage,
  SanitizeNumber,
  validateProfileImage,
} from '../../../config/utils'
import { EditStaffProfile } from '../../../services/user'
import {
  commonModalType,
  ContactNumberValidation,
  emailErrorMessge,
  Option,
  secondsToShowAlert,
  validateAlphaNumeric,
} from '../../../config/constants'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { actions } from '../../../Store'

function setMessages(objData) {
  const {
    createUserError,
    setCreateUserError,
    profileImageError,
    setProfileImageError,
  } = objData
  if (createUserError)
    setTimeout(() => setCreateUserError(''), secondsToShowAlert)
  if (profileImageError)
    setTimeout(() => setProfileImageError(''), secondsToShowAlert)
}

const saveProfileDataFunc = async objData => {
  const {
    showLoader,
    setShowLoader,
    setCreateUserError,
    fullName,
    title,
    countryName,
    city,
    contactNumber,
    contactNumberPrefix,
    profileImage,
    profileImageUrl,
    profileImageName,
    deleteProfileImage,
    userInfo,
    hotelName,
    hotelInfo,
    closeModal,
    dispatch,
  } = objData
  try {
    if (showLoader) return

    setShowLoader(true)
    setCreateUserError('')

    const user = {
      name: fullName,
      title,
      countryName,
      city,
      contactNumber,
      contactNumberPrefix: contactNumber ? contactNumberPrefix : '',
    }

    const userProfileData = {
      user,
      profileImage,
      profileImageUrl,
      profileImageName,
      deleteProfileImage,
      userId: userInfo.id,
      hotelName,
      hotelId: hotelInfo.hotelId,
    }
    const { success: editSuccess, message: editErrorMessage } =
      await EditStaffProfile(userProfileData)
    if (!editSuccess) {
      setCreateUserError(editErrorMessage)
      return
    }

    dispatch(
      actions.setCommonModalData({
        status: true,
        data: {
          response: { status: editSuccess, message: editErrorMessage },
        },
        type: commonModalType.ResponseModal,
      })
    )

    closeModal?.()
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
  } finally {
    setShowLoader(false)
  }
}

function setUserData(userInfo, hotelInfo) {
  const currCountry = userInfo?.countryName ?? hotelInfo?.countryName ?? ''
  const currCity = userInfo?.city ?? hotelInfo?.city ?? ''
  const currContactNumberPrefix = userInfo?.contactNumberPrefix
  return { currCountry, currCity, currContactNumberPrefix }
}

function onLoadCountry(data) {
  const { countryName, setContactNumberPrefix } = data
  if (countryName) {
    const currSelectedCountry = CountryList.find(c => c.name === countryName)
    if (currSelectedCountry) setContactNumberPrefix(currSelectedCountry.code)
  }
}
const StaffMyProfile = props => {
  const { userInfo, hotelInfo } = useSelector(state => state)
  const { isModalVisible, closeModal } = props

  // for edit profile form
  const [form] = Form.useForm()
  const [fullName, setFullName] = useState('')
  const [showLoader, setShowLoader] = useState(false)
  const [title, setTitle] = useState([])
  const [contactNumber, setContactNumber] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [contactNumberPrefix, setContactNumberPrefix] = useState('')
  const [contactNumberPrefixList, setContactNumberPrefixList] = useState([])
  const [city, setCity] = useState('')
  const [profileImage, setProfileImage] = useState()
  const [countryName, setCountry] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState()
  const [profileImageName, setProfileImageName] = useState(false)
  const [profileImageError, setProfileImageError] = useState('')
  const [deleteProfileImage, setDeleteProfileImage] = useState(false)
  const [createUserError, setCreateUserError] = useState('')

  useEffect(() => {
    editProfile()
  }, [userInfo, hotelInfo])

  useEffect(() => {
    const newCountryCodeList = [
      ...new Set(CountryList.map(c => +c.code).sort((a, b) => a - b)),
    ].map(c => `+${c}`)
    setContactNumberPrefixList(newCountryCodeList)
  }, [])

  useEffect(() => {
    setMessages({
      createUserError,
      setCreateUserError,
      profileImageError,
      setProfileImageError,
    })
  }, [createUserError, profileImageError])

  useEffect(() => {
    onLoadCountry({ countryName, setContactNumberPrefix })
  }, [countryName])

  const handleCancel = useCallback(() => {
    if (showLoader) return
    closeModal()
  }, [])

  const clearProfileImage = useCallback(() => {
    setProfileImageUrl(null)
    setProfileImage(null)
    if (profileImageName !== '') setDeleteProfileImage(true)
  }, [])

  const prefixSelector = (
    <Form.Item name='prefix' noStyle>
      {CountryList?.find(c => c.name === countryName)?.code ?? ''}
    </Form.Item>
  )

  const handleContactChange = useCallback(e => {
    let contactNumberValue = SanitizeNumber(e.target.value)
    setContactNumber(contactNumberValue)
    form.setFieldsValue({
      contactNumber: contactNumberValue,
    })
  }, [])

  const editProfile = () => {
    clearProfileImage()
    form.resetFields()
    const currFullName = userInfo?.name
    const currHotelName = hotelInfo?.hotelName
    const currContactNumber = userInfo?.contactNumber

    const currProfileImageUrl = userInfo?.profileImage
    const currProfileImageName = userInfo?.profileImageName
    const { currCountry, currCity, currContactNumberPrefix } = setUserData(
      userInfo,
      hotelInfo
    )
    setFullName(currFullName)
    setHotelName(currHotelName)
    setContactNumber(currContactNumber)
    setContactNumberPrefix(currContactNumberPrefix)
    setTitle(userInfo?.currentUserTitle)
    setCountry(currCountry)
    setCity(currCity)
    setProfileImageUrl(currProfileImageUrl)
    setProfileImageName(currProfileImageName)
    setDeleteProfileImage(false)

    setProfileImage(null)

    form.setFieldsValue({
      fullName: currFullName,
      email: userInfo?.email,
      hotelName: currHotelName,
      title: userInfo.currentUserTitle,
      country: currCountry,
      city: currCity,
      contactNumber: currContactNumber,
    })
  }

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()

  const saveProfileData = async () => {
    await saveProfileDataFunc({
      showLoader,
      setShowLoader,
      setCreateUserError,
      fullName,
      title,
      countryName,
      city,
      contactNumber,
      contactNumberPrefix,
      profileImage,
      profileImageUrl,
      profileImageName,
      deleteProfileImage,
      userInfo,
      hotelName,
      hotelInfo,
      dispatch,
      closeModal,
    })
  }

  return (
    <>
      <Modal
        title={translateTextI18N('Edit Profile')}
        visible={isModalVisible}
        centered
        onCancel={handleCancel}
        className='addUsermodal cmnModal'
        footer={null}
        id='staff'
      >
        <div className='imageUpload-wrp'>
          <figure>
            <div className='upload-figin'>
              <img
                src={profileImageUrl ? profileImageUrl : PlaceHolder}
                height='155'
                width='155'
                alt='user'
              ></img>
            </div>
            {profileImageUrl && (
              <button className='removebtn' onClick={clearProfileImage}>
                <img src={getImage('images/close.svg')}></img>
              </button>
            )}
          </figure>
          <div className='uploadbtn-wrp'>
            <ImgCrop
              beforeCrop={file => beforeCrop(file, setProfileImageError)}
              rotate
            >
              <Upload
                beforeUpload={file =>
                  validateProfileImage(
                    file,
                    setProfileImageError,
                    setProfileImage,
                    setProfileImageUrl
                  )
                }
                accept='.png, .jpeg, .jpg'
                id='myprofile-upload-btn'
                showUploadList={false}
              >
                <button id='btnUpload'>
                  {translateTextI18N('Upload Photo')}
                </button>
              </Upload>
            </ImgCrop>
            {profileImageError ? (
              <Alert message={profileImageError} type='error' showIcon />
            ) : null}
            <p>
              {translateTextI18N(
                'Image should be in PNG or JPEG file with maximum of size 1mb'
              )}
            </p>
          </div>
        </div>

        <Form
          layout='vertical'
          initialValues={{
            prefix: contactNumberPrefixList.length
              ? contactNumberPrefixList[0]
              : '',
          }}
          onFinish={saveProfileData}
          footer={null}
          form={form}
          validateTrigger
          id='editProfile'
        >
          <div className='row' id='myprofile-form'>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input' id='divEditProfile'>
                <Form.Item
                  label={translateTextI18N('Full Name')}
                  name='fullName'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N(
                        'Please enter staff full name'
                      ),
                    },
                    fieldProps =>
                      validateAlphaNumeric(
                        fieldProps,
                        'Please enter valid staff full name'
                      ),
                  ]}
                  id='name'
                  value={fullName}
                >
                  <Input
                    value={fullName}
                    maxLength={50}
                    onChange={e => setFullName(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input' id='email'>
                <Form.Item
                  label={translateTextI18N('Email')}
                  name='email'
                  rules={[
                    {
                      required: true,
                      type: 'email',
                      message: translateTextI18N(emailErrorMessge),
                    },
                  ]}
                >
                  <Input disabled={userInfo?.isEmailUser} />
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  name='hotelName'
                  label={translateTextI18N('Hotel Name')}
                  value={hotelName}
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter hotel name'),
                    },
                  ]}
                >
                  <Input
                    onChange={e => setHotelName(e.target.value)}
                    value={hotelName}
                    disabled={true}
                  />
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  value={title}
                  label={translateTextI18N('Title')}
                  name='title'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter title'),
                    },
                  ]}
                >
                  <Input
                    onChange={e => setTitle(e.target.value)}
                    value={title}
                    disabled={true}
                  />
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  name='country'
                  label={translateTextI18N('Country')}
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select country'),
                    },
                  ]}
                  id='country'
                >
                  <Select
                    value={translateTextI18N(countryName)}
                    showSearch={true}
                    id='countryName'
                    onChange={selectedCountryName =>
                      setCountry(selectedCountryName)
                    }
                    disabled={true}
                  >
                    {CountryList.map((country, idx) => (
                      <Option value={country.name} key={idx}>
                        {translateTextI18N(country.name)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('City')}
                  value={city}
                  name='city'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter city'),
                    },
                  ]}
                >
                  <Input
                    onChange={e => setCity(e.target.value)}
                    value={city}
                    disabled={true}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-group contact-input'>
                <Form.Item
                  label={translateTextI18N('Contact Number')}
                  name='contactNumber'
                  disabled={!userInfo?.isEmailUser}
                  rules={ContactNumberValidation(translateTextI18N)}
                >
                  <Input
                    maxLength={10}
                    addonBefore={prefixSelector}
                    value={contactNumber}
                    onChange={handleContactChange}
                    disabled={!userInfo?.isEmailUser}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
          {createUserError && (
            <Alert type='error' message={createUserError} showIcon />
          )}
          <div className='modalFooter'>
            <Button className='grayBtn' key='back' onClick={handleCancel}>
              {translateTextI18N('Cancel')}
            </Button>

            <Button
              className='blueBtn ml-3 ml-lg-4'
              key='submit'
              htmlType='submit'
              id='submit'
              loading={showLoader}
            >
              {translateTextI18N('Submit')}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default StaffMyProfile
