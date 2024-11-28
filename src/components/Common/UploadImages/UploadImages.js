import React, { useState } from 'react'
import { ImageUploadHint, SpinLoading } from '../../../config/constants'
import { getImage, Ternary, UplaodFileCommon } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CustomAlert from '../CustomAlert/CustomAlert'

function UploadImages({
  folderPath,
  maxImages = 0,
  previews,
  setPreviews,
  loading,
  setLoading,
}) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [error, setError] = useState('')

  const clearResImage = (e, file1) => {
    const ref = `${file1}`
    e.preventDefault()
    let previewsList = previews.filter(preview => preview !== ref)
    setPreviews(previewsList)
  }

  function UploadIcon() {
    if (loading) return <SpinLoading />

    if (maxImages === 0 || previews.length <= maxImages) {
      return (
        <div className='col-3 col-sm-auto' id='update'>
          <div className='uploadimgtype'>
            <button className='btn'>
              <img
                className='img-fluid'
                src={getImage('images/uploadfig.svg')}
                alt=''
              ></img>
            </button>
            <input
              type='file'
              name='file'
              id='files'
              accept='image/png,image/jpeg,image/jpg'
              multiple='true'
              onChange={e => {
                UplaodFileCommon(
                  e,
                  setError,
                  setLoading,
                  setPreviews,
                  previews,
                  folderPath,
                  maxImages
                )
                e.target.value = null
              }}
            />
          </div>
        </div>
      )
    }

    return <></>
  }

  return (
    <div className='col-12 arabicstyle'>
      <p>{translateTextI18N('Add Images')}</p>
      <div className='restaurantupload-wrp'>
        <div className='form-row'>
          {Ternary(
            previews,
            previews?.map(file => (
              <div className='col-3 col-sm-auto' id='preview'>
                <figure>
                  <div className='rest-upload-fig' id='inside'>
                    <img
                      style={{ height: '70px', width: '70px' }}
                      className='img-fluid'
                      accept='image/png,image/jpeg,image/jpg'
                      src={file}
                      alt=''
                    ></img>
                  </div>
                  <button
                    className='restaurantRemovebtn'
                    onClick={e => clearResImage(e, file)}
                  >
                    <img
                      className='img-fluid'
                      src={getImage('images/close.svg')}
                      alt=''
                    ></img>
                  </button>
                </figure>
              </div>
            )),
            null
          )}
          <UploadIcon />
        </div>
      </div>

      <p className='mt-2 upload-image-hint'>
        {translateTextI18N(ImageUploadHint)}
      </p>
      <p>
        <CustomAlert
          visible={error}
          message={translateTextI18N(error)}
          type='error'
          showIcon={true}
        />
      </p>
    </div>
  )
}

export default UploadImages
