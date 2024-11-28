/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Input, Upload, Select, Modal, Button, Form, Alert } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import ImgCrop from 'antd-img-crop'

import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'

import { actions } from '../../../Store'
import PlaceHolder from '../../../assets/backgroundimages/Placeholder.svg'
import CountryList from '../../../config/CountryList'
import {
  beforeCrop,
  countryCodeList,
  GetContactNubmerPrefixOptions,
  getImage,
  SanitizeNumber,
  SetAutoClearProp,
  Ternary,
  validateProfileImage,
} from '../../../config/utils'
import { EditUserProfile } from '../../../services/user'
import SuccessModal from '../../Common/Modals/SuccessModal'
import {
  ContactNumberValidation,
  Option,
  secondsToShowAlert,
  validateAlphaNumeric,
} from '../../../config/constants'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const MyProfile = () => {
  const userInfo = useSelector(state => state.userInfo)
  const hotelInfo = useSelector(state => state.hotelInfo)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // for edit profile form
  const [showLoader, setShowLoader] = useState(false)
  const [fullName, setFullName] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [contactNumberPrefix, setContactNumberPrefix] = useState('')
  const [title, setTitle] = useState([])
  const [countryName, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [profileImage, setProfileImage] = useState()
  const [profileImageUrl, setProfileImageUrl] = useState()
  const [profileImageError, setProfileImageError] = useState('')
  const [profileImageName, setProfileImageName] = useState(false)
  const [deleteProfileImage, setDeleteProfileImage] = useState(false)
  const [createUserError, setCreateUserError] = useState('')
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey(''))
  }, [])

  useEffect(() => {
    if (profileImageError)
      setTimeout(() => setProfileImageError(''), secondsToShowAlert)
    if (showSuccessModal)
      setTimeout(() => setShowSuccessModal(false), secondsToShowAlert)
  }, [profileImageError, showSuccessModal])

  useEffect(() => {
    if (countryName) {
      const selectedCountry = CountryList.find(c => c.name === countryName)
      if (selectedCountry) setContactNumberPrefix(selectedCountry.code)
    }
  }, [countryName])

  const handleOk = () => setIsModalVisible(false)
  const handleCancel = () => {
    if (showLoader) return
    setIsModalVisible(false)
  }

  const clearProfileImage = () => {
    setProfileImage(null)
    setProfileImageUrl(null)
    if (profileImageName !== '') setDeleteProfileImage(true)
  }

  const showModal = () => {
    clearProfileImage()
    form.resetFields()
    setIsModalVisible(true)
  }

  const dispatch = useDispatch()

  const prefixSelector = (
    <Form.Item name='prefix' noStyle>
      <Select
        value={contactNumberPrefix}
        onChange={e => setContactNumberPrefix(e)}
      >
        {GetContactNubmerPrefixOptions()}
      </Select>
    </Form.Item>
  )

  const handleContactChange = e => {
    let contactNumberValue = SanitizeNumber(e.target.value)
    setContactNumber(contactNumberValue)
    form.setFieldsValue({
      contactNumber: contactNumberValue,
    })
  }

  const editProfile = () => {
    showModal()

    const currFullName = userInfo?.name
    const currHotelName = hotelInfo?.hotelName
    const currContactNumber = userInfo?.contactNumber
    const currContactNumberPrefix = userInfo?.contactNumberPrefix
    const currTitle = userInfo?.title || 'Admin'
    const currCountry = userInfo?.countryName
    const currCity = userInfo?.city
    const currProfileImageUrl = userInfo?.profileImage
    const currProfileImageName = userInfo?.profileImageName

    setFullName(currFullName)
    setHotelName(currHotelName)
    setContactNumber(currContactNumber)
    setContactNumberPrefix(currContactNumberPrefix)
    setTitle(currTitle)
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
      title: currTitle,
      country: currCountry,
      city: currCity,
      contactNumber: currContactNumber,
    })
  }

  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const saveProfileData = async () => {
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
        contactNumberPrefix: Ternary(contactNumber, contactNumberPrefix, ''),
      }

      const userProfileData = {
        profileImage,
        user,
        profileImageUrl,
        profileImageName,
        deleteProfileImage,
        userId: userInfo.id,
        hotelName,
        hotelId: hotelInfo.hotelId,
        roles: userInfo.roles,
        email: userInfo?.email,
      }
      const { success: editSuccess, message: editErrorMessage } =
        await EditUserProfile(userProfileData)
      if (!editSuccess) {
        SetAutoClearProp(setCreateUserError, editErrorMessage)
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

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent profile-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='My Profile'
                breadcrumb={['Hotel Admin', 'My Profile']}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row justify-content-end'>
                  <div className='col-auto'>
                    <Button onClick={editProfile} className='cmnBtn'>
                      {translateTextI18N('Edit Profile')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='profileCard'>
            <div className='row'>
              <div className='col-12 col-lg-auto'>
                <div className='profileMainDetails'>
                  <div>
                    <figure>
                      <img
                        className='img-fluid'
                        src={Ternary(
                          userInfo?.profileImage,
                          userInfo.profileImage,
                          PlaceHolder
                        )}
                        alt=''
                      ></img>
                    </figure>
                    <h4>{userInfo?.name}</h4>
                    <h5>{userInfo?.email}</h5>
                  </div>
                  <p>{Ternary(userInfo?.bio, userInfo?.bio, '')}</p>
                </div>
              </div>
              <div className='col-12 col-lg'>
                <div className='profileSubDetails'>
                  <ul className='list-unstyled'>
                    <li>
                      <h6>
                        {translateTextI18N('Email')} &nbsp;
                        {translateTextI18N('ID')}
                      </h6>
                      <span>{userInfo?.email}</span>
                    </li>
                    <li>
                      <h6>
                        {translateTextI18N('Hotel')} &nbsp;
                        {translateTextI18N('Name')}
                      </h6>
                      <span>{hotelInfo?.hotelName}</span>
                    </li>
                    <li>
                      <h6>{translateTextI18N('Title')}</h6>
                      <span>
                        {Ternary(userInfo?.title, userInfo.title, 'Admin')}
                      </span>
                    </li>
                    <li>
                      <h6>
                        {translateTextI18N('Phone')} &nbsp;
                        {translateTextI18N('Number')}
                      </h6>
                      <span>
                        {Ternary(
                          userInfo?.contactNumber,
                          `${userInfo.contactNumberPrefix} - ${userInfo.contactNumber}`,
                          ''
                        )}
                      </span>
                    </li>
                    <li>
                      <h6>{translateTextI18N('Country')}</h6>
                      <span>{userInfo?.countryName}</span>
                    </li>
                    <li>
                      <h6>{translateTextI18N('City')}</h6>
                      <span>{userInfo?.city}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        title={translateTextI18N('Edit Profile')}
        visible={isModalVisible}
        centered
        onOk={handleOk}
        onCancel={handleCancel}
        className='addUsermodal cmnModal'
        footer={null}
      >
        <div className='imageUpload-wrp'>
          <figure>
            <div className='upload-figin'>
              <img
                src={Ternary(profileImageUrl, profileImageUrl, PlaceHolder)}
                height='155'
                width='155'
              ></img>
            </div>
            {Ternary(
              profileImageUrl,
              <button className='removebtn' onClick={clearProfileImage}>
                <img src={getImage('images/close.svg')}></img>
              </button>,
              null
            )}
          </figure>
          <div className='uploadbtn-wrp'>
            <ImgCrop
              beforeCrop={file => beforeCrop(file, setProfileImageError)}
              rotate
            >
              <Upload
                accept='.png, .jpeg, .jpg'
                beforeUpload={file =>
                  validateProfileImage(
                    file,
                    setProfileImageError,
                    setProfileImage,
                    setProfileImageUrl
                  )
                }
                showUploadList={false}
                id='myprofile-upload-btn'
              >
                <button>{translateTextI18N('Upload Photo')}</button>
              </Upload>
            </ImgCrop>
            {Ternary(
              profileImageError,
              <Alert message={profileImageError} type='error' showIcon />,
              null
            )}
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
            prefix: Ternary(
              contactNumberPrefix,
              contactNumberPrefix,
              Ternary(countryCodeList.length, countryCodeList[0], '')
            ),
          }}
          onFinish={() => saveProfileData()}
          footer={null}
          form={form}
          validateTrigger
        >
          <div className='row' id='myprofile-form'>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
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
                  value={fullName}
                  id='name'
                >
                  <Input
                    maxLength={50}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item label={translateTextI18N('Email')} name='email'>
                  <Input disabled />
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Hotel Name')}
                  name='hotelName'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter hotel name'),
                    },
                  ]}
                  value={hotelName}
                >
                  <Input
                    value={hotelName}
                    onChange={e => setHotelName(e.target.value)}
                    disabled
                  />
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Title')}
                  name='title'
                  value={title}
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter title'),
                    },
                  ]}
                >
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>

            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Country')}
                  name='country'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select country'),
                    },
                  ]}
                  id='country'
                >
                  <Select
                    showSearch={true}
                    value={translateTextI18N(countryName)}
                    onChange={selectedCountryName =>
                      setCountry(selectedCountryName)
                    }
                    id='countryName'
                    disabled
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

            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('City')}
                  name='city'
                  value={city}
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter city'),
                    },
                  ]}
                >
                  <Input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    disabled
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-group contact-input'>
                <Form.Item
                  name='contactNumber'
                  label={translateTextI18N('Contact Number')}
                  rules={ContactNumberValidation(translateTextI18N)}
                >
                  <Input
                    addonBefore={prefixSelector}
                    maxLength={10}
                    value={contactNumber}
                    onChange={handleContactChange}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
          {Ternary(
            createUserError,
            <Alert message={createUserError} type='error' showIcon />,
            null
          )}
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
        <SuccessModal title='Profile changes saved successfully'></SuccessModal>
      </Modal>
    </>
  )
}

export default MyProfile
