import React from 'react'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { FormatTimestamp, toTitleCase } from '../../../config/utils'

function ViewReservationeOrder({ requestData, errorMsg }) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    <div className='orderdetails-wrp'>
      <div className='ordertypeDetails'>
        <p>{requestData?.restaurantDescription}</p>
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

      <div className='restaurantorderdetails'>
        <table>
          <tr>
            <th>{translateTextI18N('No Of Seats Required')}</th>
            <td className='text-right'>{requestData?.noOfGuest}</td>
          </tr>
          <tr>
            <th>{translateTextI18N('Requested Time')}</th>
            <td className='text-right'>
              {FormatTimestamp(requestData?.requestedTime)}
            </td>
          </tr>
        </table>
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

export default ViewReservationeOrder
