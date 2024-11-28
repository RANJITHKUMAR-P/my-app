import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import { Modal, Form, Alert, Input } from 'antd'

import CancelModal from '../../Cuisine/CancelModal'
import DescriptionModal from '../../Cuisine/DescriptionModal'

const HotelShuttleModal = ({
  editingHotelShuttle = false,
  isModalVisible,
  onFinishAdd,
  handleCancel,
  setDestination,
  destination = '',
  setDescription,
  description = '',
  createUserError = false,
  showLoader,
  form,
  HotelShuttle,
  selectedRow,
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const IsNotDuplicate = value => {
    if(!value) return true
    let names = HotelShuttle.map(l => l.destination.toLowerCase())
    if (selectedRow.id) {
      names = names.filter(n => n !== selectedRow.destination.toLowerCase())
    }
    return !names.includes( value.trim().toLowerCase())
  }

  return (
    <>
      <Modal
        title={translateTextI18N(`${editingHotelShuttle ? 'Edit' : 'Add'} Destination`)}
        visible={isModalVisible}
        onOk={onFinishAdd}
        onCancel={handleCancel}
        className='addrestaurantModal cmnModal'
        footer={null}
        centered
      >
        <Form layout='vertical' onFinish={onFinishAdd} form={form} validateTrigger>
          <div className='row'>
            <div className='col-12 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Destination Name')}
                  name='destination'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter destination '),
                    },
                    () => ({
                      validator(_, value) {
                        if (IsNotDuplicate(value)) {
                          return Promise.resolve()
                        }
                        return Promise.reject(
                          new Error(translateTextI18N(`Destination already exists`))
                        )
                      },
                    }),
                  ]}
                >
                  <Input
                    maxLength={30}
                    value={translateTextI18N(destination)}
                    onChange={e => setDestination(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>

            <DescriptionModal
              setDescription={setDescription}
              description={description}
              placeholder={translateTextI18N('Enter destination description here..')}
            />
          </div>
          {createUserError && <Alert message={createUserError} type='error' showIcon />}
          <CancelModal handleCancel={handleCancel} showLoader={showLoader} />
        </Form>
      </Modal>
    </>
  )
}

export default HotelShuttleModal
