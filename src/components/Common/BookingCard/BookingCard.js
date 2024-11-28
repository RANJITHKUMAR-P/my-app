import React from 'react'
import { useSelector } from 'react-redux'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const BookingCard = () => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const { checkInCount, checkOutCount } = useSelector(state => state)

  return (
    <>
      <div className='bookingCard-wrp cmnCard-wrp'>
        <div className='cardHead'>
          <h3>{translateTextI18N('Check In & Check Out')}</h3>
        </div>

        <div className='cardBody'>
          <div className='row'>
            <div className='col-6'>
              <div className='bookingStatus'>
                <span style={{ color: '#0BAE36' }}>{checkInCount}</span>
                <p>{translateTextI18N('Check In')}</p>
              </div>
            </div>
            <div className='col-6'>
              <div className='bookingStatus'>
                <span style={{ color: '#FF1616' }}>{checkOutCount}</span>
                <p>{translateTextI18N('Check Out')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BookingCard
