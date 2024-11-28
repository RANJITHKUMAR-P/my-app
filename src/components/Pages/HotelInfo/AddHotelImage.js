/* eslint-disable jsx-a11y/alt-text */
import React from 'react'

import { ImageUploadHint } from '../../../config/constants'
import { getImage } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const AddHotelImage = ({
  previews = [],
  loaded = false,
  setLoaded,
  clearResImage,
  UplaodFileCommon,
  setResImageError,
  setLoadingData,
  setPreviews,
  count = 0,
  title = '',
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <>
      <div className='col-12 col-sm-6 col-md-4' id='hotelInfo-image'>
        <p>{title}</p>
        <div className='restaurantupload-wrp' id='restaurantupload-id'>
          <div className='form-row'>
            {previews &&
              previews.map(file => (
                <div className='col-3 col-sm-auto'>
                  <figure>
                    <div className='rest-upload-fig'>
                      <img
                        style={
                          loaded
                            ? { height: '70px', width: '70px' }
                            : { display: 'none' }
                        }
                        className='img-fluid'
                        accept='image/png,image/jpeg,image/jpg'
                        src={file}
                        height='155'
                        width='155'
                        onLoad={setLoaded}
                      ></img>
                    </div>
                    <button
                      className='restaurantRemovebtn'
                      onClick={e => clearResImage(e, file)}
                    >
                      <img
                        className='img-fluid'
                        src={getImage('images/close.svg')}
                      ></img>
                    </button>
                  </figure>
                </div>
              ))}

            {previews.length <= count && (
              <div className='col-3 col-sm-auto' id='hotelInfo-previews'>
                <div className='uploadimgtype' id='uploadimgtype1'>
                  <button className='btn'>
                    <img className='img-fluid' src={getImage('images/uploadfig.svg')}></img>
                  </button>
                  <input
                    type='file'
                    name='myfile'
                    id='files'
                    accept='image/png,image/jpeg,image/jpg'
                    multiple='true'
                    onChange={e => {
                      UplaodFileCommon(
                        e,
                        setResImageError,
                        setLoadingData,
                        setPreviews,
                        previews
                      )
                      e.target.value = null
                    }}
                  />
                </div>
              </div>
            )}
            <p className='mt-3 upload-image-hint'>
              {translateTextI18N(ImageUploadHint)}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddHotelImage
