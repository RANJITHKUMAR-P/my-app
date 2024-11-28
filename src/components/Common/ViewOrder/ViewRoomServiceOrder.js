import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import {
  FormatTimestamp,
  GetTranlatedOrderType,
  GetTranslatedName,
  toTitleCase,
} from '../../../config/utils'
import { useSelector } from 'react-redux'
import { Amount } from '../Amount/Amount'
import ReadMore from '../ReadMore/ReadMore'

function ViewRoomServiceOrder({ requestData, errorMsg }) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { currentLanguage, cuisines } = useSelector(state => state)

  return (
    <div className='orderdetails-wrp'>
      <div className='ordertypeDetails'>
        <h3>
          {translateTextI18N('Order Type')} -{' '}
          {GetTranlatedOrderType(
            requestData?.orderType,
            cuisines,
            currentLanguage
          )}
        </h3>
        <h3>{FormatTimestamp(requestData?.createdAt)}</h3>
      </div>
      <div className='orderpersonDetails'>
        <h4>
          {toTitleCase(requestData?.guest?.name)}{' '}
          {toTitleCase(requestData?.guest?.surName)}
        </h4>
        <h6>
          {translateTextI18N('Room No')} : {requestData?.roomNumber}
        </h6>
      </div>

      <div className='invoicebillTable' id='ViewRoomServiceOrder'>
        <table>
          <tr>
            <th>{translateTextI18N('Dish')} </th>
            <th width='300'> {translateTextI18N('Description')} </th>
            <th width='100'>{translateTextI18N('Rate')}</th>
            <th width='50'>{translateTextI18N('Qty')}</th>
            <th width='100' className='text-right'>
              {translateTextI18N('Amount')}
            </th>
          </tr>
          {requestData?.menuDetail
            ? requestData?.menuDetail.map(item => (
                <tr key={item.id}>
                  <td>
                    {GetTranslatedName(
                      item,
                      currentLanguage,
                      item.dish ? 'dish' : 'name'
                    ) ||
                      item.dish ||
                      item.name}
                  </td>{' '}
                  <td>
                    <ReadMore text={item?.description || ''} charLength={75} />
                  </td>
                  <td>
                    <Amount value={item.price} />
                  </td>
                  <td>{item.qty}</td>
                  <td className='text-right'>
                    <Amount value={item.amount} />
                  </td>
                </tr>
              ))
            : null}
        </table>
      </div>
      <div className='invoicetotalTable' id='ViewRoomServiceOrder'>
        <table>
          <tr>
            <th>
              <strong>{translateTextI18N('Total')}</strong>
            </th>
            <td className='text-right'>
              <Amount value={requestData?.billAmount} />
            </td>
          </tr>
        </table>
      </div>
      <div className='orderpersonDetails taxes'>
        <h6>
          <i>{translateTextI18N('Disclaimer **** Extra charges may apply')}</i>
        </h6>
      </div>
      {errorMsg && (
        <div
          className='block-accept-reject-order'
          style={{ paddingTop: '5px' }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  )
}

export default ViewRoomServiceOrder
