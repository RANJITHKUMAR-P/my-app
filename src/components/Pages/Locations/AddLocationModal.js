import { Button, Form, Input, Modal, Select } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { commonModalType, Option } from '../../../config/constants'
import { Ternary } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { useDispatch, useSelector } from 'react-redux'

import React, { useState, useMemo, useEffect, useCallback } from 'react'

import {
  fetchHotelLocationTypes,
  saveLocation,
} from '../../../services/location'
import { viewResponseModal } from '../../../services/requests'

function AddLocationModal({
  onLocationModalClose,
  locationModal,
  locationTypeOperation,
}) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const { hotelInfo, locationTypeIdToInfo, locationIdToInfo } = useSelector(
    state => state
  )
  const hotelId = hotelInfo.hotelId

  const [locationName, setLocationName] = useState('')
  const [locationType, setLocationType] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { isOpen, isEdit, data } = locationModal

  useEffect(() => {
    if (isEdit && data) {
      form.setFieldsValue({
        locationType: locationIdToInfo[data.id].locationTypeId,
        locationName: locationIdToInfo[data.id].locationName,
      })
      setLocationType(locationIdToInfo[data.id].locationTypeId)
      setLocationName(locationIdToInfo[data.id].locationName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isEdit, locationIdToInfo])

  useEffect(() => {
    fetchHotelLocationTypes({ dispatch, hotelId })
  }, [dispatch, hotelId])

  const closeModal = useCallback(() => {
    setIsLoading(false)
    setLocationName('')
    setLocationType('')
    form.resetFields([])
    form.setFieldsValue({
      locationName: '',
      locationType: '',
    })
    onLocationModalClose()
  }, [form, onLocationModalClose])

  const LocationTypes = useMemo(() => {
    return Object.values(locationTypeIdToInfo || {})
      .sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1
        return 1
      })
      .map(lt => {
        return (
          <Option value={lt.id} key={lt.id}>
            <em>{lt.name}</em>
            {!lt.isDefault && (
              <div className='option-actionsBtn'>
                <button
                  className={'resend'}
                  onClick={e => {
                    e.preventDefault()
                    locationTypeOperation({
                      modalType: commonModalType.EditLocationType,
                      data: lt,
                    })
                  }}
                  disabled={lt.isDefault}
                >
                  <EditOutlined />
                </button>
                <button
                  className={'resend'}
                  onClick={e => {
                    e.preventDefault()
                    if (lt.isDefault || lt?.isLocationTypeUsed) return
                    locationTypeOperation({
                      modalType: commonModalType.DeleteLocationType,
                      data: lt,
                    })
                  }}
                  disabled={lt.isDefault || lt.isLocationTypeUsed}
                >
                  <DeleteOutlined />
                </button>
              </div>
            )}
          </Option>
        )
      })
  }, [locationTypeIdToInfo, locationTypeOperation])

  const onFinish = useCallback(async () => {
    setIsLoading(true)

    const {
      name: locationTypeName,
      isDefault: locationTypeIsDefault,
      isLocationTypeUsed,
    } = locationTypeIdToInfo[locationType]

    let saveLocationData = {
      hotelId,
      locationName,
      locationTypeId: locationType,
      locationTypeName,
      locationTypeIsDefault,
    }

    if (isEdit) {
      saveLocationData['id'] = data.id
    }

    const { success, message } = await saveLocation(
      saveLocationData,
      isEdit,
      isLocationTypeUsed
    )

    setTimeout(() => {
      viewResponseModal({
        dispatch,
        data: { status: success, message },
      })
      setIsLoading(false)
    }, 10)

    if (success) {
      closeModal()
    }
  }, [
    closeModal,
    data,
    dispatch,
    hotelId,
    isEdit,
    locationName,
    locationType,
    locationTypeIdToInfo,
  ])

  function validateFields(sLocationName, sLocationTypeId) {
    let errors = []
    errors.push({
      name: 'locationName',
      errors: [],
    })

    // Check if locationType is selected
    if (!sLocationTypeId) {
      return { message: '', status: true, errors: [] }
    }

    // Proceed with the validation if locationType is selected
    if (!locationTypeIdToInfo[sLocationTypeId]) {
      errors[0].errors = ['Selected location type is invalid']
      form.setFields(errors)
      return {
        message: 'Selected location type is invalid',
        error: true,
        errors,
      }
    }

    if (isLoading) return { message: '', status: true, errors: [] }

    if (isEdit) {
      if (
        data.locationName.toLocaleLowerCase() ===
          sLocationName.toLocaleLowerCase() &&
        data.locationTypeId.toLocaleLowerCase() ===
          sLocationTypeId.toLocaleLowerCase()
      ) {
        form.setFields(errors)
        return { message: '', error: false, errors: [] }
      }
    }

    let locationTypeIsExist = `${sLocationName} with ${locationTypeIdToInfo?.[sLocationTypeId]?.name} already exist`
    let isLocationTypeExist = Object.values(locationIdToInfo).findIndex(
      loc =>
        loc.locationName.toLocaleLowerCase() ===
          sLocationName.toLocaleLowerCase() &&
        loc.locationTypeId.toLocaleLowerCase() ===
          sLocationTypeId.toLocaleLowerCase()
    )

    locationTypeIsExist = isLocationTypeExist > -1 ? locationTypeIsExist : ''

    errors[0].errors = locationTypeIsExist ? [locationTypeIsExist] : []

    form.setFields(errors)

    return {
      message: locationTypeIsExist,
      error: errors[0].errors.length > 0,
      errors,
    }
  }

  const onLocationNameChange = useCallback(
    e => setLocationName(e.target.value),
    []
  )

  const onLocationTypeChange = useCallback(e => setLocationType(e), [])

  const onEditLocationType = useCallback(e => {
    e.preventDefault()
    locationTypeOperation({
      modalType: commonModalType.AddLocationType,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Modal
      title={translateTextI18N(`${Ternary(isEdit, 'Edit', 'Add')} Location`)}
      visible={isOpen}
      centered
      onOk={closeModal}
      onCancel={closeModal}
      className='addLocationmodal cmnModal'
      footer={null}
      maskClosable={false}
    >
      <Form
        layout='vertical'
        initialValues={{
          locationName,
          locationType,
        }}
        onFinish={onFinish}
        footer={null}
        form={form}
      >
        <div className='row' id='myprofile-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Location Name')}
                name='locationName'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please enter location name'),
                  },
                  () => ({
                    validator(_, value) {
                      const { error, message } = validateFields(
                        value,
                        locationType
                      )

                      if (error) {
                        return Promise.reject(message)
                      }

                      return Promise.resolve()
                    },
                  }),
                ]}
                value={locationName}
                id='locationName'
              >
                <Input
                  id='locationName'
                  maxLength={50}
                  value={locationName}
                  onChange={onLocationNameChange}
                />
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input group-input'>
              <Form.Item
                label='Location Type'
                name='locationType'
                rules={[
                  {
                    required: true,
                    message: 'Please select the location type',
                  },
                  () => ({
                    validator(_, value) {
                      validateFields(locationName, value)
                      return Promise.resolve()
                    },
                  }),
                ]}
              >
                <Select
                  id='locationType'
                  value={locationType}
                  onChange={onLocationTypeChange}
                  className='editButonnSelect'
                  dropdownClassName='editButonn-dropdown'
                >
                  {LocationTypes}
                </Select>
              </Form.Item>
              <Button className='plusBtn-II' onClick={onEditLocationType}>
                <PlusOutlined />
              </Button>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={closeModal}
            disabled={isLoading}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            htmlType='submit'
            disabled={
              validateFields(locationName, locationType).error ||
              (isEdit &&
                data?.locationName?.toLocaleLowerCase() ===
                  locationName.toLocaleLowerCase() &&
                data?.locationTypeId?.toLocaleLowerCase() ===
                  locationType.toLocaleLowerCase()) ||
              isLoading
            }
          >
            {translateTextI18N('Submit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddLocationModal
