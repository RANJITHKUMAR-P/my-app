import { Button } from 'antd'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { defaultResActionData, loadProgress, MODAL_TYPES } from '../../../../config/constants'
import { SetAutoClearProp } from '../../../../config/utils'
import { deleteHotelGuideLineFile } from '../../../../services/hotels'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import DeleteModal from '../../../Common/Modals/DeleteModal'

function ConfirmDelete(props) {
  const [actionRes, setActionRes] = useState(defaultResActionData)
  const { loading, setLoading } = props
  const { hotelGuideLines, hotelInfo } = useSelector(state => state)
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const footerBtn = useMemo(() => {
    async function handleDelete(e) {
      e.preventDefault()
      setLoading(loadProgress.LOADING)

      const { success, message, type } = await deleteHotelGuideLineFile(
        hotelGuideLines.data,
        props?.file,
        hotelInfo?.hotelId
      )

      if (!success) {
        SetAutoClearProp(
          setActionRes,
          {
            message,
            status: true,
            type,
          },
          defaultResActionData
        )
      }

      if (success) {
        props.setModalData({
          status: true,
          data: {
            message: 'File deleted successfully',
          },
          modalType: MODAL_TYPES.SUCCESS,
        })
      }

      setLoading(loadProgress.LOADED)
    }
    return (
      <>
        <Button
          className='grayBtn'
          key='back'
          onClick={e => {
            e.preventDefault()
            props.handleCancel?.()
          }}
          disabled={loading === loadProgress.LOADING}
        >
          {translateTextI18N('Cancel')}
        </Button>
        <Button
          className='blueBtn ml-3 ml-lg-4'
          key='submit'
          onClick={handleDelete}
          loading={loading === loadProgress.LOADING}
          disabled={loading === loadProgress.LOADING}
        >
          {translateTextI18N('Delete')}
        </Button>
      </>
    )
  }, [hotelGuideLines.data, hotelInfo?.hotelId, loading, props, setLoading, translateTextI18N])

  return (
    <>
      <DeleteModal title='Confirm Delete' message='Do you want to delete ?' />
      <div className='modalFooter'>
        {footerBtn}
        {actionRes.status && (
          <CustomAlert
            visible={actionRes.status}
            message={actionRes.message}
            type={actionRes.type}
            showIcon={true}
            classNames='ml-3 mr-3 mb-3'
          />
        )}
      </div>
    </>
  )
}

export default ConfirmDelete
