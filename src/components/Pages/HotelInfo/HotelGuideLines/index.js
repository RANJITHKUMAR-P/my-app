/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Upload, Button, Spin } from 'antd'
import unique from 'uniqid'

import { Ternary } from '../../../../config/utils'
import HotelGuideLinesList from './HotelGuideLinesList'
import {
  loadProgress,
  MODAL_TYPES,
  resActionType,
} from '../../../../config/constants'
import {
  hotelGuideLinesListener,
  uploadHotelGuideLine,
} from '../../../../services/hotels'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'

const HotelGuideLines = props => {
  const { loading, setLoading } = props
  const { hotelInfo, hotelGuideLines } = useSelector(state => state)
  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  useEffect(() => {
    if (hotelInfo?.hotelId) {
      hotelGuideLinesListener(dispatch, hotelInfo?.hotelId)
    }
  }, [dispatch, hotelInfo.hotelId])

  const memoUploadButton = useMemo(() => {
    async function uploadFileEvent(file) {
      setLoading(loadProgress.LOADING)

      const errorMsg = translateTextI18N(
        'Allowed file types are PNG, JPEG and PDF with maximum of size 3mb'
      )

      const validExtension = ['jpg', 'png', 'jpeg', 'pdf'].includes(
        file.name.split('.').pop()
      )
      const lessThan3Mb = file.size / 1024 <= 1024 * 3

      let alertData = {}
      alertData['id'] = unique()
      alertData['status'] = true

      if (validExtension && lessThan3Mb) {
        const { message, type } = await uploadHotelGuideLine(
          hotelGuideLines?.data || [],
          [file],
          hotelInfo.hotelId
        )

        alertData = {
          ...alertData,
          message: translateTextI18N(message),
          type,
          modalType: MODAL_TYPES.SUCCESS,
        }
      } else {
        alertData = {
          ...alertData,
          message: errorMsg,
          type: resActionType.error,
          modalType: MODAL_TYPES.ERROR,
        }
      }

      if (alertData.status) {
        props?.setModalData({
          status: true,
          data: alertData,
          modalType: alertData.modalType,
        })
      }

      setTimeout(() => {
        setLoading(loadProgress.LOADED)
      }, 2000)
    }

    const uploadButton = (
      <Upload
        beforeUpload={options => {
          uploadFileEvent(options)
        }}
        disabled={loading === loadProgress.LOADING}
        showUploadList={false}
      >
        <Button className='cmnBtn' disabled={loading === loadProgress.LOADING}>
          {translateTextI18N('Upload')}
        </Button>
      </Upload>
    )
    return Ternary(
      hotelGuideLines.loadingStatus === loadProgress.LOADED,
      uploadButton,
      null
    )
  }, [
    hotelGuideLines?.data,
    hotelGuideLines.loadingStatus,
    hotelInfo.hotelId,
    loading,
    props,
    setLoading,
    translateTextI18N,
  ])

  function handleDelete(e, item, idx) {
    e.preventDefault()
    props.setModalData({
      status: true,
      data: { ...item, idx },
      modalType: MODAL_TYPES.DELETE,
    })
  }

  return (
    <>
      <div className='hotelGuidelines'>
        <div className='guidelinesHaed'>
          <h4>{translateTextI18N('Hotel Guidelines')}</h4>
          {memoUploadButton}
        </div>

        <div className='position-relative'>
          {(loading === loadProgress.LOADING ||
            hotelGuideLines.loadingStatus !== loadProgress.LOADED) && (
            <div className='spinnerLoader'>
              <Spin />
            </div>
          )}

          {hotelGuideLines.loadingStatus === loadProgress.LOADED && (
            <HotelGuideLinesList handleDelete={handleDelete} {...props} />
          )}
        </div>
      </div>
    </>
  )
}

export default HotelGuideLines
