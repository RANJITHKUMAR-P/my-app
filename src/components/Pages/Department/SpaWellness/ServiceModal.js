import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import { Modal, Form, Alert, Input, TimePicker } from 'antd'

import CancelModal from '../../Cuisine/CancelModal'
import DescriptionModal from '../../Cuisine/DescriptionModal'
import { getImage, Ternary, validateLogoFunc } from '../../../../config/utils'

import moment from 'moment'
import Checkbox from 'antd/lib/checkbox/Checkbox'

const ServiceModal = ({
  isModalVisible,
  onFinishAdd,
  handleCancel,
  setName,
  name = '',
  setDescription,
  description = '',
  createUserError = false,
  showLoader,
  form,
  profileImageError,
  image,
  imageUrl,
  clearImage,
  setProfileImageError,
  setImage,
  setImageUrl,
  serviceId,
  serviceName,
  closingTime,
  openingTime,
  closingTimeFunction,
  openingTimeFunction,
  closed,
  setClosed,
}) => {
  const GetMoment = time => {
    if (!time) return moment()

    const [hours, minutes] = time.split(':').map(v => +v)
    return moment().set('hours', hours).set('minutes', minutes)
  }
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const timeFormatvalue = 'HH:mm'
  const validateLogo = file => {
    validateLogoFunc({ file, setProfileImageError, setImage, setImageUrl })
  }

  let title = translateTextI18N(`${Ternary(serviceId, 'Edit', 'Add')} Details`)
  let servicename = translateTextI18N(serviceName)

  return (
    <>
      <Modal
        title={`${title} ${servicename}`}
        visible={isModalVisible}
        onOk={onFinishAdd}
        onCancel={handleCancel}
        className='addrestaurantModal cmnModal'
        footer={null}
        centered
      >
        <Form
          layout='vertical'
          onFinish={onFinishAdd}
          form={form}
          validateTrigger
        >
          <div className='row'>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Brand Name')}
                  name='name'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter name '),
                    },
                  ]}
                >
                  <Input
                    maxLength={30}
                    value={translateTextI18N(name)}
                    onChange={e => setName(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>

            <DescriptionModal
              setDescription={setDescription}
              description={description}
              placeholder={translateTextI18N('Enter  description here..')}
              required={true}
            />
            <div className='col-12 col-md-6'>
              <div className='form-row'>
                <div className='col-12 col-md-6'>
                  <div className='form-group cmn-input'>
                    <Form.Item
                      label={translateTextI18N('Opening Time')}
                      name='openingTime'
                      id='openingTime'
                      rules={[
                        {
                          required: !closed,
                          message: translateTextI18N(
                            'Please enter opening time'
                          ),
                        },
                      ]}
                    >
                      <TimePicker
                        value={openingTime}
                        disabled={closed}
                        format={timeFormatvalue}
                        onChange={openingTimeFunction}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className='col-12 col-md-6'>
                  <div className='form-group cmn-input'>
                    <Form.Item
                      label={translateTextI18N('Closing Time')}
                      name='closingTime'
                      id='closingTime'
                      rules={[
                        () => ({
                          validator() {
                            if (
                              openingTime &&
                              closingTime &&
                              GetMoment(closingTime).isSameOrBefore(
                                GetMoment(openingTime)
                              )
                            ) {
                              return Promise.reject(
                                new Error(
                                  translateTextI18N(
                                    'Closing time should be after opening time.'
                                  )
                                )
                              )
                            }
                            return Promise.resolve()
                          },
                        }),
                      ]}
                    >
                      <TimePicker
                        value={closingTime}
                        disabledHours={() => [0]}
                        format={timeFormatvalue}
                        hideDisabledOptions
                        onChange={closingTimeFunction}
                        disabled={closed}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
            {serviceName === 'Saloon' && (
              <div className='col-12 arabicstyle'>
                <Form.Item name='publish'>
                  <Checkbox
                    name='publish'
                    checked={closed}
                    onChange={e => setClosed(e.target.checked)}
                  >
                    {translateTextI18N('Close Now')}
                  </Checkbox>
                </Form.Item>
              </div>
            )}
            <div className='col-12 arabicstyle'>
              <label>{translateTextI18N('Upload Logo')}</label>
              <div className='imageUpload-wrp'>
                <div className='form-row'>
                  <div className='col-3 col-sm-auto'>
                    <div className='singleuploadimage mt-2'>
                      {Ternary(
                        image || imageUrl,
                        <span className='removebtn' onClick={clearImage}>
                          <img
                            className='img-fluid fit-image'
                            src={getImage('images/close.svg')}
                            alt=''
                          ></img>
                        </span>,
                        null
                      )}
                      <div className='singleuploadfigin'>
                        <img
                          className='img-fluid'
                          src={Ternary(
                            imageUrl,
                            imageUrl,
                            getImage('images/uploadfig.svg')
                          )}
                          style={{ height: '100%', width: '100%' }}
                          width='130'
                          height='130'
                          alt=''
                        ></img>
                      </div>
                      <input
                        type='file'
                        name='myfile'
                        onChange={e => {
                          validateLogo(e.target.files[0])
                          e.target.value = null
                        }}
                        accept='.png, .jpeg, .jpg'
                      />
                    </div>
                    {profileImageError && (
                      <Alert
                        message={profileImageError}
                        type='error'
                        showIcon
                      />
                    )}
                    <p className='mt-1'>
                      {translateTextI18N('Maximum upload size 1mb')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {createUserError && (
            <Alert message={createUserError} type='error' showIcon />
          )}
          <CancelModal handleCancel={handleCancel} showLoader={showLoader} />
        </Form>
      </Modal>
    </>
  )
}

export default ServiceModal
