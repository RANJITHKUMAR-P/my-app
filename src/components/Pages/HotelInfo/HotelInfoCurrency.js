/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect } from 'react'
import { Input, Select, Form } from 'antd'

import { Option } from '../../../config/constants'
import CountryList from '../../../config/CountryList'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const HotelInfoCurrency = ({
  hotelInfo,
  currency,
  filterdCurrency,
  setCurrency,
  setCurencyCode,
  form,
  countryName,
}) => {
  useEffect(() => {
    if (hotelInfo && !hotelInfo.currency) {
      form.setFieldsValue({ currency: null })
      setCurrency(null)
    } else {
      const selectedCountry = CountryList.find(c => c.name === countryName)
      setCurrency(selectedCountry.currency)
      setCurencyCode(selectedCountry.currencyCode)
      form.setFieldsValue({ currency: selectedCountry.currency })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryName])

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  return (
    <>
      <div className='col-12 col-sm-6 col-md-2'>
        <div className='form-group cmn-input'>
          {hotelInfo && hotelInfo.currency && (
            <Form.Item label={translateTextI18N('Currency')} name='currency'>
              <Input value={currency} disabled />
            </Form.Item>
          )}
          {hotelInfo && !hotelInfo.currency && (
            <Form.Item
              label={translateTextI18N('Currency')}
              name='currency'
              rules={[
                {
                  required: true,
                  message: translateTextI18N('Please select currency'),
                },
              ]}
            >
              <Select
                value={currency}
                onChange={selectedCurrency => {
                  setCurrency(selectedCurrency)
                  const selectedCurrencyCode = CountryList.find(
                    c => c.currency === selectedCurrency
                  ).currencyCode
                  setCurencyCode(selectedCurrencyCode)
                }}
              >
                <Option value={filterdCurrency}>{filterdCurrency}</Option>
              </Select>
            </Form.Item>
          )}
        </div>
      </div>
    </>
  )
}

export default HotelInfoCurrency
