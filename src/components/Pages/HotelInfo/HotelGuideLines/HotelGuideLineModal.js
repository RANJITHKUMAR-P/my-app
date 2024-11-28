import React, { useEffect, useState } from 'react'
import { Modal } from 'antd'
import ConfirmDelete from './ConfirmDelete'
import PdfViewer from './PdfViewer'
import { MODAL_TYPES } from '../../../../config/constants'
import SuccessModal from '../../../Common/Modals/SuccessModal'
import ErrorModal from '../../../Common/Modals/ErrorModal'

function HotelGuideLineModal(props) {
  const { modalData, handleCancel, handleOk } = props
  const [modalConfig, setModalConfig] = useState({
    className: '',
    component: <></>,
  })

  useEffect(() => {
    let modalConfigData = null
    switch (modalData.modalType) {
      case MODAL_TYPES.DELETE:
        modalConfigData = {
          className: 'deleteModal cmnModal',
          component: <ConfirmDelete file={modalData?.data} {...props} />,
        }
        break
      case MODAL_TYPES.PDFVIEWER:
        modalConfigData = {
          className: 'pdfModal',
          component: modalData?.data?.url && (
            <PdfViewer fileURL={modalData?.data?.url} {...props} />
          ),
        }
        break

      case MODAL_TYPES.SUCCESS:
        modalConfigData = {
          className: 'successModal cmnModal',
          component: <SuccessModal title={modalData?.data?.message || 'Success'} {...props} />,
        }
        break

      case MODAL_TYPES.ERROR:
        modalConfigData = {
          className: 'successModal cmnModal',
          component: <ErrorModal title={modalData?.data?.message || 'Error'} {...props} />,
        }
        break
      default:
        break
    }
    setModalConfig(modalConfigData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalData, props.loading])

  return (
    <Modal
      title=''
      visible={modalData?.status}
      onOk={() => handleOk()}
      onCancel={() => handleCancel()}
      footer={null}
      className={modalConfig?.className}
    >
      {modalConfig?.component}
    </Modal>
  )
}

export default HotelGuideLineModal
