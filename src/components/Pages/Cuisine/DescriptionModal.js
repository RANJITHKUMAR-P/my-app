import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { Form } from 'antd'
import { TextArea } from '../../../config/constants'

const DescriptionModal = ({ setDescription, description = '', placeholder = '',required=false }) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <>
      <div className='col-12 col-md-6'>
        <div className='form-group cmn-input'>
          <Form.Item
            label={translateTextI18N('Description')}
            name='description'
            value={description}
            required={required}
            rules={[
              {
                required: required,
                message: translateTextI18N('Please enter description '),
              }]}
          >
            <TextArea
              rows={2}
              placeholder={translateTextI18N(placeholder)}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Form.Item>
        </div>
      </div>
    </>
  )
}

export default DescriptionModal
