import { Modal, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { fetchHotelData } from '../../../services/user'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

function HotelAssociation({ selectStaff, visible, onCancel }) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const [loading, setLoading] = useState(false)
  const [hotelList, setHotelList] = useState([])

  async function fetData() {
    setLoading(true)
    const data = await fetchHotelData(selectStaff)
    setHotelList(data)
    setLoading(false)
  }

  useEffect(() => {
    if (visible) fetData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  return (
    <Modal
      title={translateTextI18N('Hotel Association')}
      visible={visible}
      onCancel={onCancel}
      className='addUsermodal cmnModal'
      footer={null}
    >
      {loading ? (
        <Skeleton />
      ) : (
        <ul>
          {hotelList.map(hotelName => {
            return (
              <li key={hotelName}>
                <span>{hotelName}</span>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}

export default HotelAssociation
