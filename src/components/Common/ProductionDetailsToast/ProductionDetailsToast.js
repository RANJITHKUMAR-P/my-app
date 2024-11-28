import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

import { actions } from '../../../Store'

function formatDateTime(dateTime) {
  return moment(dateTime).format('DD MMM YYYY hh:mm A')
}

const ProductionDetailsToast = () => {
  const { enableStickyBar, fromDate, toDate } = useSelector(
    state => state.production
  )
  const dispatch = useDispatch()

  if (!enableStickyBar) return null

  const hideStickyBar = () => {
    dispatch(actions.setProduction({ enableStickyBar: false }))
  }

  return (
    <>
      <div className='productionToast-msg'>
        Kindly note that there will be a scheduled downtime across the INPLASS
        Solutions platform from {formatDateTime(fromDate)} to{' '}
        {formatDateTime(toDate)} IST time
        <button type='button' class='ant-modal-close' onClick={hideStickyBar}>
          <span class='ant-modal-close-x'>
            <span
              role='img'
              aria-label='close'
              class='anticon anticon-close ant-modal-close-icon'
            >
              <svg
                viewBox='64 64 896 896'
                width='1em'
                height='1em'
                fill='#fff'
                aria-hidden='true'
              >
                <path d='M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z'></path>
              </svg>
            </span>
          </span>
        </button>
      </div>
    </>
  )
}

export default ProductionDetailsToast
