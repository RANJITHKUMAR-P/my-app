import React from 'react'
import { Modal } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { closeCommonModal } from '../../../services/requests'
import { FormatTimestamp, toTitleCase } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import _ from 'underscore'
import { Amount } from '../../Common/Amount/Amount'
function ViewBill() {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const dispatch = useDispatch()
  const { commonModalData } = useSelector(state => state)
  const row = commonModalData?.data?.row

  function renderMenuDetails(data) {
    let totalPrice = 0
    const details = Object.values(data).map((item, index) => {
      const itemTotal = item.price * item.qty
      totalPrice += itemTotal
      return (
        <tr key={index}>
          <td>{item.dish}</td>
          <td>{item.price}</td>
          <td>{item.qty}</td>
          <td className='text-right'>
            <Amount value={itemTotal} />
          </td>
        </tr>
      )
    })
    return { details, totalPrice }
  }

  const { details: menuDetail, totalPrice } = renderMenuDetails(
    row.menuDetail.pcrTest
  )

  return (
    <Modal
      className='cmnModal commentsModal commentsViewModal'
      title={translateTextI18N('View Bill')}
      footer={null}
      centered
      visible={commonModalData?.status}
      onOk={() => closeCommonModal(dispatch)}
      onCancel={() => closeCommonModal(dispatch)}
    >
      <div className='orderdetails-wrp'>
        <div className='ordertypeDetails'>
          <h3>
            {translateTextI18N('Order Type')} - {row?.service}
          </h3>
          <h3>{FormatTimestamp(row?.createdAt)}</h3>
        </div>
        <div className='orderpersonDetails'>
          <h4>
            {toTitleCase(row?.guest?.name)} {toTitleCase(row?.guest?.surName)}
          </h4>
          <h6>
            {translateTextI18N('Room No')} : {row?.roomNumber}
          </h6>
        </div>

        <div className='invoicebillTable'>
          <table>
            <thead>
              <tr>
                <th>{translateTextI18N('Product Name')}</th>
                <th width='100'>{translateTextI18N('Rate')}</th>
                <th width='50'>{translateTextI18N('Qty')}</th>
                <th width='100' className='text-right'>
                  {translateTextI18N('Amount')}
                </th>
              </tr>
            </thead>
            <tbody>{menuDetail}</tbody>
            <tfoot>
              <tr>
                <td colSpan='3' className='text-right'>
                  <strong>{translateTextI18N('Total')}</strong>
                </td>
                <td className='text-right'>
                  <strong>
                    <Amount value={totalPrice} />
                  </strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className='orderpersonDetails taxes'>
          <h6>
            <i>
              {translateTextI18N('Disclaimer **** Extra charges may apply')}
            </i>
          </h6>
        </div>
      </div>
    </Modal>
  )
}

export default ViewBill
