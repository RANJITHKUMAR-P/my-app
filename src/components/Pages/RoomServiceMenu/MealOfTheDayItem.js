/* eslint-disable jsx-a11y/alt-text */
import { Button, Form, Input, Spin } from 'antd'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { translationDataKey } from '../../../config/constants'
import {
  getImage,
  GetTranlationStyle,
  GetTranslationImage,
  UplaodFileCommon,
} from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'

function MealOfTheDayItem({
  data,
  handleChange,
  handleRemove,
  removeMealImage,
  handleTranslationClick,
  idx,
  setMealOfTheDayImage,
}) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { hotelInfo } = useSelector(state => state)
  const { hotelId } = hotelInfo
  const [imageError, setImageError] = useState('')
  const [loading, setLoading] = useState(false)
  const folderPath = `${hotelId}/MealOfTheDay`

  const { imageUrl, isDelete } = data

  function getImageUrl(url) {
    setMealOfTheDayImage(idx, url)
  }

  if (isDelete) {
    return (
      <div className='hidden' key={idx}>
        added to fix react key prop issue
      </div>
    )
  }

  return (
    <div key={idx}>
      <CustomAlert
        visible={imageError}
        message={imageError}
        type='error'
        showIcon={true}
      />
      <div className='form-row' key={data.id}>
        <div className='col-3 col-sm-auto' id='meal-of-the-day-image'>
          <div className='uploadimgtype' id='uploadimgtype1'>
            {loading ? (
              <Spin />
            ) : (
              <>
                {imageUrl ? (
                  <button
                    className='removebtn'
                    onClick={() => removeMealImage(idx)}
                    style={{ zIndex: 999 }}
                  >
                    <img src={getImage('images/close.svg')}></img>
                  </button>
                ) : null}

                <img
                  className='img-fluid'
                  src={imageUrl || getImage('images/uploadfig.svg')}
                ></img>

                <input
                  type='file'
                  name='myfile'
                  id='files'
                  accept='image/png,image/jpeg,image/jpg'
                  multiple={false}
                  title={imageUrl ? '' : 'Please select image'}
                  onChange={e => {
                    e.stopPropagation()
                    UplaodFileCommon(
                      e,
                      setImageError,
                      setLoading,
                      getImageUrl,
                      '',
                      folderPath
                    )
                    e.target.value = null
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div className='col'>
          <div className='form-group cmn-input'>
            <Form.Item>
              <Input
                placeholder={translateTextI18N('Meal name')}
                value={data.name}
                onChange={e => handleChange(idx, e.target.value)}
              />
            </Form.Item>
          </div>
        </div>
        {data.isDefault ? null : (
          <div className='col-auto'>
            <Button
              className='cmnBtn dlticonBtn'
              onClick={() => handleRemove(idx)}
            >
              <img src={getImage('images/deleteicon.svg')}></img>
            </Button>
          </div>
        )}
        <div className='col-auto'>
          <Button
            className='cmnBtn dlticonBtn'
            style={GetTranlationStyle(data[translationDataKey], data.name)}
            onClick={() => handleTranslationClick(idx)}
          >
            <img
              src={GetTranslationImage(
                data[translationDataKey],
                data.name,
                getImage('images/translate.svg'),
                getImage('images/PendingTranslation.svg')
              )}
            ></img>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MealOfTheDayItem
