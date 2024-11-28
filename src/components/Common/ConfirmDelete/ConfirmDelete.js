import { Button, Modal } from 'antd'
import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  defaultCommonModalData,
  defaultResActionData,
  loadProgress,
  resActionType,
} from '../../../config/constants'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { SetAutoClearProp, Ternary } from '../../../config/utils'
import DeleteModal from '../Modals/DeleteModal'
import { actions } from '../../../Store'
import CustomAlert from '../CustomAlert/CustomAlert'
import { viewResponseModal } from '../../../services/requests'

function ConfirmDelete() {
  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const [loading, setLoading] = useState(loadProgress.TOLOAD)
  const [actionRes, setActionRes] = useState(defaultResActionData)

  const { commonModalData } = useSelector(state => state)

  const closeModal = useCallback(
    () => dispatch(actions.setCommonModalData(defaultCommonModalData)),
    [dispatch]
  )

  const footerBtn = useMemo(() => {
    async function handleDelete(e) {
      e.preventDefault()
      if (!commonModalData.data.props?.onDeleteAPI) return

      try {
        setLoading(loadProgress.LOADING)

        const { success, message, type } =
          await commonModalData.data.props.onDeleteAPI()

        if (!success) {
          SetAutoClearProp(
            setActionRes,
            { message, status: true, type },
            defaultResActionData
          )
        }
        if (success) {
          setTimeout(() => {
            viewResponseModal({
              dispatch,
              data: { status: success, message },
            })
          }, 10)
          closeModal()
        }
      } catch (error) {
        console.error(error)
        SetAutoClearProp(
          setActionRes,
          { message: error, status: true, type: resActionType.error },
          defaultResActionData
        )
      } finally {
        setLoading(loadProgress.LOADED)
      }
    }

    const isLoading = loading === loadProgress.LOADING

    return (
      <>
        <Button
          className='grayBtn'
          key='back'
          onClick={e => {
            e.preventDefault()
            closeModal()
          }}
          disabled={isLoading}
        >
          {translateTextI18N('Cancel')}
        </Button>
        <Button
          className='blueBtn ml-3 ml-lg-4'
          key='submit'
          onClick={handleDelete}
          loading={isLoading}
          disabled={isLoading}
        >
          {translateTextI18N('Delete')}
        </Button>
      </>
    )
  }, [
    closeModal,
    commonModalData.data.props,
    dispatch,
    loading,
    translateTextI18N,
  ])

  const title = useMemo(
    () =>
      Ternary(
        commonModalData.data.props?.title,
        commonModalData.data.props?.title,
        'Confirm Delete'
      ),
    [commonModalData.data.props?.title]
  )

  const message = useMemo(
    () =>
      Ternary(
        commonModalData.data.props?.description,
        commonModalData.data.props?.description,
        'Do you want to really want to delete ?'
      ),
    [commonModalData.data.props?.description]
  )

  return (
    <Modal
      onCancel={closeModal}
      className='deleteModal cmnModal'
      footer={null}
      centered
      visible={commonModalData?.status}
    >
      <DeleteModal title={title} message={message} />
      <div className='modalFooter'>{footerBtn}</div>
      {actionRes.status && (
        <CustomAlert
          visible={actionRes.status}
          message={actionRes.message}
          type={actionRes.type}
          showIcon={true}
          classNames='ml-3 mr-3 mb-3'
        />
      )}
    </Modal>
  )
}

export default ConfirmDelete
