/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { LightgalleryProvider } from 'react-lightgallery'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { MODAL_TYPES } from '../../../../config/constants'
import HotelGuideLineImage from './HotelGuideLineImage'
import HotelGuideLinePDF from './HotelGuideLinePDF'

export default function HotelGuideLinesList(props) {
  const { hotelGuideLines } = useSelector(state => state)

  const handleClickPDF = (e, item, idx) => {
    e.preventDefault()
    props.setModalData({
      status: true,
      data: { ...item, idx },
      modalType: MODAL_TYPES.PDFVIEWER,
    })
  }
  return (
    <div className='guidelinesList-wrp'>
      <LightgalleryProvider galleryClassName='imgGallery'>
        {hotelGuideLines?.data?.map((item, idx) => {
          let data = {
            idx,
            ...item,
            ...props,
            name: `${item?.name}.${item?.type}`,
            createdAt: moment(item?.createdAt?.toDate()).format('DD-MM-YYYY HH:mm'),
            handleClickPDF,
          }
          return item.type === 'pdf' ? (
            <HotelGuideLinePDF key={item.idx} {...data} />
          ) : (
            <HotelGuideLineImage key={item.idx} {...data} />
          )
        })}
      </LightgalleryProvider>
    </div>
  )
}
