import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Modal } from 'antd'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import DeleteModal from '../../Common/Modals/DeleteModal'

function StaffConfirmDelete({
  deleteUserError,
  deleteUserProfile,
  setShowDeleteConfirmation,
  showDeleteConfirmation,
  userToDelete,
}) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [deleteFromAllHotel, setDeleteFromAllHotel] = useState(false)

  useEffect(() => {
    if (showDeleteConfirmation) {
      setDeleteFromAllHotel(false)
    }
  }, [showDeleteConfirmation])

  function hideDeleteConfirmation() {
    setShowDeleteConfirmation(false)
    setDeleteFromAllHotel(false)
  }

  function submitClick() {
    deleteUserProfile({ hotelId: userToDelete.hotelId, deleteFromAllHotel })
  }

  return (
    <Modal
      onOk={submitClick}
      onCancel={hideDeleteConfirmation}
      className='deleteModal cmnModal'
      footer={null}
      centered
      visible={showDeleteConfirmation}
    >
      <DeleteModal
        title='Confirm Delete'
        message='Do you really want to delete ?'
      />

      {+userToDelete?.hotelAssociationCount > 1 && (
        <div className='form-group cmn-input alignedCheckbox'>
          <Checkbox
            checked={deleteFromAllHotel}
            onChange={e => setDeleteFromAllHotel(e.target.checked)}
            className='alignedCheckboxBL'
          >
            {translateTextI18N('Delete staff from all the hotel')}
          </Checkbox>
        </div>
      )}

      <CustomAlert
        visible={deleteUserError}
        message={deleteUserError}
        type='error'
        showIcon={true}
      />

      <div className='modalFooter'>
        <Button className='grayBtn' key='back' onClick={hideDeleteConfirmation}>
          {translateTextI18N('Cancel')}
        </Button>

        <Button
          className='blueBtn ml-3 ml-lg-4'
          key='submit'
          onClick={submitClick}
        >
          {translateTextI18N('Delete')}
        </Button>
      </div>
    </Modal>
  )
}

export default StaffConfirmDelete
