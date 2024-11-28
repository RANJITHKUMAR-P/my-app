import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { Modal, Select, Form, Alert, Input } from 'antd'
import { Option } from '../../../config/constants'
import CancelModal from './CancelModal'
import DescriptionModal from './DescriptionModal'

const CuisineModal = ({
  editingCuisine = false,
  isModalVisible,
  onFinishAdd,
  handleCancel,
  setCuisineName,
  setDescription,
  CuisineTypes = [],
  cuisineName = '',
  description = '',
  createUserError = false,
  showLoader,
  form,
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <>
      <Modal
        title={translateTextI18N(`${editingCuisine ? 'Edit' : 'Add'} Cuisine`)}
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
                  label={translateTextI18N('Cuisine')}
                  name='cuisineName'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please select cuisine type'),
                    },
                  ]}
                >
                  {editingCuisine ? (
                    <Input value={translateTextI18N(cuisineName)} disabled />
                  ) : (
                    <Select
                      value={translateTextI18N(cuisineName)}
                      showSearch={true}
                      onChange={e => setCuisineName(e)}
                    >
                      {CuisineTypes.map(cuisineType => (
                        <Option value={cuisineType.id} key={cuisineType.id}>
                          {translateTextI18N(cuisineType.name)}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </div>
            </div>

            <DescriptionModal
              setDescription={setDescription}
              description={description}
              placeholder='Enter cuisine description here..'
            />
          </div>
          {createUserError && <Alert message={createUserError} type='error' showIcon />}
          <CancelModal handleCancel={handleCancel} showLoader={showLoader} />
        </Form>
      </Modal>
    </>
  )
}

export default CuisineModal
