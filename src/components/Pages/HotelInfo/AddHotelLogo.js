/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Checkbox, Upload, Alert, Radio } from 'antd'

import { getImage, validateProfileImage } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import {
  ImageUploadHint,
  guestLogoOrNameAlignmentConfig,
  guestLogoOrNameConfig,
} from '../../../config/constants'

const allowedRatios = ['512x512', '512x288']

const AddHotelLogo = ({
  hotelLogoError,
  setHotelLogoError,
  setHotelLogo,
  setHotelLogoUrl,
  clearProfileImage,
  hotelLogoUrl,

  enableGuestAppLogoSetting,
  hotelLogoOrName = guestLogoOrNameConfig.name,
  hotelLogoOrNameAlignment = [guestLogoOrNameAlignmentConfig.left],
  onGuestSettingOptionChange,
  onGuestSettingAlignmentChange,
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  let allowedImageSizeMb = 1

  const disableCentre = hotelLogoOrName === guestLogoOrNameConfig.both

  return (
    <>
      <div className='row mb-4'>
        <div className='col-12 col-lg-6'>
          <div className='imageUpload-wrp'>
            <figure>
              <div className='upload-figin'>
                <img
                  className='img-fluid'
                  src={hotelLogoUrl ? hotelLogoUrl : getImage('images/cam.png')}
                ></img>
              </div>
              {hotelLogoUrl && (
                <button className='removebtn' onClick={clearProfileImage}>
                  <img src={getImage('images/close.svg')}></img>
                </button>
              )}
            </figure>
            <div className='uploadbtn-wrp'>
              <Upload
                accept='.png, .jpeg, .jpg'
                beforeUpload={file =>
                  validateProfileImage(
                    file,
                    setHotelLogoError,
                    setHotelLogo,
                    setHotelLogoUrl,
                    allowedImageSizeMb,
                    allowedRatios
                  )
                }
                showUploadList={false}
              >
                <button>{translateTextI18N('Upload Photo')}</button>
              </Upload>

              {hotelLogoError ? (
                <Alert message={hotelLogoError} type='error' showIcon />
              ) : null}
              <p>{translateTextI18N(ImageUploadHint)}</p>
              <p>
                {translateTextI18N(
                  `It should be ${allowedRatios.join(' or ')}`
                )}
              </p>
            </div>
          </div>
        </div>

        <div className='col-12 col-lg-6'>
          <div className='guest-logo-setup'>
            <h5>GUEST by iNPLASS Settings</h5>
            <div className='row'>
              <div className='col-12 col-lg-6'>
                <div className='cmn-input'>
                  <Radio.Group
                    onChange={onGuestSettingOptionChange}
                    value={hotelLogoOrName}
                  >
                    <Radio
                      value={guestLogoOrNameConfig.logo}
                      disabled={!enableGuestAppLogoSetting}
                    >
                      Show Hotel Logo Only
                    </Radio>
                    <Radio value={guestLogoOrNameConfig.name}>
                      Show Hotel Name Only
                    </Radio>
                    <Radio
                      value={guestLogoOrNameConfig.both}
                      disabled={!enableGuestAppLogoSetting}
                    >
                      Show Logo & Name
                    </Radio>
                  </Radio.Group>
                </div>
              </div>
              <div className='col-12 col-lg-6 mt-3 mt-lg-0'>
                <h6>Logo/Name Alignment</h6>
                <div className='cmn-input'>
                  <Checkbox.Group
                    onChange={onGuestSettingAlignmentChange}
                    radioButton
                    value={hotelLogoOrNameAlignment}
                  >
                    <Checkbox value={guestLogoOrNameAlignmentConfig.left}>
                      Left
                    </Checkbox>
                    <Checkbox
                      value={guestLogoOrNameAlignmentConfig.centre}
                      disabled={disableCentre}
                    >
                      Centre
                    </Checkbox>
                  </Checkbox.Group>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddHotelLogo
