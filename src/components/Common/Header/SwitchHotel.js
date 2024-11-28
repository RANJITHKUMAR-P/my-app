import React, { useState, useCallback } from 'react'
import { Modal, Form, Button } from 'antd'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { useDispatch, useSelector } from 'react-redux'
import { GetHotelDataByHotelId } from '../../../services/hotels'
import { getImage } from '../../../config/utils'
import { actions } from '../../../Store'
import { unsubscribeFirebaseListeners } from './../../../config/constants'

function SwitchHotel(props) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [loading, setLoading] = useState(false)
  const { isModalVisible, closeModal } = props
  const { hotelsByGroupId } = useSelector(state => state)

  const [selectHotel, setSelectHotel] = useState('')

  const handleOk = useCallback(() => {
    closeModal()
  }, [closeModal])

  const handleSetHotel = useCallback(e => {
    setSelectHotel(e.target.id)
  }, [])

  const handleCancel = useCallback(() => {
    setSelectHotel('')
    closeModal()
  }, [closeModal])

  const dispatch = useDispatch()

  const handleSwitchHotel = useCallback(async () => {
    if (!selectHotel) return
    setLoading(true)

    dispatch(actions.reset())
    unsubscribeFirebaseListeners()
    window.switchHotel = true

    let promise = []
    promise.push(GetHotelDataByHotelId(selectHotel, dispatch))
    await Promise.all(promise)

    setTimeout(() => {
      window.location.replace('/')
      setLoading(false)
    }, 3000)
  }, [dispatch, selectHotel])

  return (
    <>
      <Modal
        title={translateTextI18N('Switch Hotel')}
        visible={isModalVisible}
        centered
        onOk={handleOk}
        onCancel={handleCancel}
        className='cmnModal swicthModal'
        footer={null}
        maskClosable={false}
        wrapClassName={'change-password-dailogue'}
      >
        <Form layout='vertical'>
          <div className='row'>
            <div className='col-12 '>
              <ul className='list-unstyled'>
                {hotelsByGroupId?.map(
                  hotel =>
                    hotel?.hotelStatus === 'active' &&
                    hotel?.status === 'active' && (
                      <li key={hotel?.hotelId} className='switchUseHotel'>
                        <input
                          type='checkbox'
                          id={hotel?.hotelId}
                          checked={selectHotel === hotel?.hotelId}
                          onChange={handleSetHotel}
                        />
                        <label for={hotel?.hotelId}></label>
                        <div className='userHotelName'>
                          <figure>
                            <img
                              className='userImage'
                              src={
                                hotel?.hotelLogo ||
                                getImage('images/default-hotel.svg')
                              }
                              height={30}
                              width={30}
                              alt=''
                            ></img>
                          </figure>
                          <span>{hotel.hotelName}</span>
                        </div>
                      </li>
                    )
                )}
              </ul>
            </div>
          </div>
        </Form>
        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={handleCancel}
            disabled={loading}
          >
            {translateTextI18N('Cancel')}
          </Button>
          <Button
            className='blueBtn ml-3'
            key='submit'
            onClick={handleSwitchHotel}
            disabled={loading || !selectHotel}
            loading={loading}
          >
            {translateTextI18N('Switch')}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default SwitchHotel
