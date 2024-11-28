import { Button, Form, Input, Modal } from 'antd'
import { Ternary } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { useDispatch, useSelector } from 'react-redux'

import React, { useEffect, useState, useCallback } from 'react'
import { saveLocationType } from '../../../services/location'
import { viewResponseModal } from '../../../services/requests'

function AddLocationTypeModal({ locationTypeModal, onLocationTypeModalClose }) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const { hotelInfo, locationTypeIdToInfo } = useSelector(state => state)
  const hotelId = hotelInfo.hotelId

  const [isLoading, setIsLoading] = useState(false)
  const [locationTypeName, setLocationTypeName] = useState('')

  const { isOpen, isEdit, data } = locationTypeModal

  useEffect(() => {
    if (isEdit && data) {
      form.setFieldsValue({
        locationTypeName: locationTypeIdToInfo[data.id].name,
      })
      setLocationTypeName(locationTypeIdToInfo[data.id].name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isEdit, locationTypeIdToInfo])

  function isDuplicateName(value) {
    return Object.values(locationTypeIdToInfo || {}).findIndex(
      i => i.name.toLocaleLowerCase() === value.toLocaleLowerCase()
    )
  }

  const closeModal = useCallback(() => {
    setIsLoading(false)
    setLocationTypeName('')
    form.resetFields([])
    form.setFieldsValue({ locationTypeName: '' })
    onLocationTypeModalClose()
  }, [form, onLocationTypeModalClose])

  const onFinish = useCallback(async () => {
    setIsLoading(true)

    let saveData = { hotelId, name: locationTypeName }

    if (isEdit) {
      saveData['id'] = data?.id
    }

    const { success, message } = await saveLocationType(saveData, isEdit)

    setTimeout(() => {
      viewResponseModal({
        dispatch,
        data: { status: success, message },
      })
      setIsLoading(false)
    }, 100)

    if (success) {
      closeModal()
    }
  }, [closeModal, data?.id, dispatch, hotelId, isEdit, locationTypeName])

  const onLocationTypeChange = useCallback(e => {
    setLocationTypeName(e.target.value)
  }, [])

  return (
    <Modal
      title={translateTextI18N(
        `${Ternary(isEdit, 'Edit', 'Add')} Location Type`
      )}
      visible={isOpen}
      centered
      onOk={onLocationTypeModalClose}
      onCancel={closeModal}
      className='addLocationmodal cmnModal'
      footer={null}
      maskClosable={false}
    >
      <Form
        layout='vertical'
        initialValues={{ locationTypeName }}
        onFinish={onFinish}
        footer={null}
        form={form}
      >
        <div className='row' id='myprofile-form'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Location Type Name')}
                name='locationTypeName'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please enter location type'),
                  },
                  () => ({
                    validator(_, value) {
                      if (isDuplicateName(value) > -1) {
                        return Promise.reject('Location Type already exist')
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
                value={locationTypeName}
                id='locationTypeName'
              >
                <Input
                  id='locationTypeName'
                  maxLength={50}
                  value={locationTypeName}
                  onChange={onLocationTypeChange}
                />
              </Form.Item>
            </div>
          </div>
        </div>
        <div className='modalFooter'>
          <Button className='grayBtn' onClick={closeModal} disabled={isLoading}>
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            htmlType='submit'
            disabled={
              (isEdit &&
                data?.name?.toLocaleLowerCase() ===
                  locationTypeName.toLocaleLowerCase()) ||
              isDuplicateName(locationTypeName) > -1 ||
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

export default AddLocationTypeModal
