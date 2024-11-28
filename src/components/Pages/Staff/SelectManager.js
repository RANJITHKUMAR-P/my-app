import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Form, message, Modal, Radio, Select } from 'antd'
import { useSelector } from 'react-redux'
import { ManagerType, secondsToShowAlert } from '../../../config/constants'
import { Ternary } from '../../../config/utils'
import { changeManager, DeleteUserProfile } from '../../../services/user'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

function SelectManager({
  form,
  GetStaffListOptions,
  handleCancel,
  handleStatusChange,
  isReplacementModalVisible,
  replacementAndDelete,
  replacementManagerId,
  replacementManagerName,
  selectedManagerType,
  setEditingUserProfile,
  setIsReplacementModalVisible,
  setReplacementManagerId,
  setReplacementManagerName,
  setSelectedManagerType,
  setShowLoader,
  setShowSuccessModal,
  setSuccessMessage,
  showLoader,
  userId,
  userToDelete,
  setResStatus,
}) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { managerToStaffList, userIdToInfo, titleAndPermission, userInfo } =
    useSelector(state => state)
  const [deleteFromAllHotel, setDeleteFromAllHotel] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (isReplacementModalVisible) {
      setSelectedManagerType(ManagerType.NewManager)
      setReplacementManagerName('')
      setReplacementManagerId('')
      form.setFieldsValue({ managerType: ManagerType.NewManager, Manager: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplacementModalVisible])

  useEffect(() => {
    const userDetails = userIdToInfo[userId]
    if (userDetails) {
      const { role, name, department = '' } = userDetails
      const titleName = titleAndPermission?.find(t => t.id === role)?.title
      let lbl = `${Ternary(
        selectedManagerType === ManagerType.NewManager,
        'New',
        'Substitute'
      )} Manager for ${name} (${department}/${titleName})`

      setLabel(lbl)
    }
  }, [selectedManagerType, titleAndPermission, userId, userIdToInfo])

  const handleReplaceAndDeleteManager = async () => {
    if (!userToDelete?.id) return
    try {
      setShowLoader(true)
      if (showLoader) return

      const { success, message: deleteUserProfileMessage } =
        await DeleteUserProfile({
          userId: userToDelete.id,
          hotelId: userInfo.hotelId,
          deleteFromAllHotel,
        })
      setShowLoader(false)
      if (!success) {
        message.error(deleteUserProfileMessage)
        return
      }

      const { success: objSucess, message: editErrorMessage } =
        await callChangeManager()
      if (!objSucess) {
        setEditingUserProfile(editErrorMessage)
        return
      }

      form.resetFields()
      setResStatus(objSucess)
      setSuccessMessage('Deleted successfully')
      setShowSuccessModal(true)
      setIsReplacementModalVisible(false)
      setTimeout(() => {
        setShowSuccessModal(false)
        setSuccessMessage('')
      }, secondsToShowAlert)
    } catch (error) {
      console.log(error)
      message.error('Something went wrong! Please try again!')
    }
  }

  function staffShouldNotEachOtherManager(replacementUsersManagerIds = []) {
    // Replacement user managers ids
    let filterUserData = {}

    for (const managerId of replacementUsersManagerIds) {
      //userId as oldManagerId
      if (userIdToInfo?.[managerId]?.managers?.[userId]) {
        filterUserData[managerId] = userIdToInfo[managerId]
      }
    }

    return filterUserData
  }

  const onManagerSelection = async () => {
    try {
      if (showLoader) return
      setShowLoader(true)

      const { success, message: editErrorMessage } = await callChangeManager()
      if (!success) {
        setEditingUserProfile(editErrorMessage)
        return
      }
      handleStatusChange('inactive', userId)
      setIsReplacementModalVisible(false)
      setShowSuccessModal(true)
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
    } finally {
      setShowLoader(false)
    }
  }

  async function callChangeManager() {
    const response = await changeManager(
      replacementManagerName,
      replacementManagerId,
      userIdToInfo[userId],
      managerToStaffList[userId],
      selectedManagerType
    )
    return response
  }

  return (
    <Modal
      title={translateTextI18N(
        replacementAndDelete
          ? 'Select Manager & Confirm Delete'
          : 'Select Manager'
      )}
      visible={isReplacementModalVisible}
      onCancel={() => {
        handleCancel()
        setDeleteFromAllHotel(false)
      }}
      className='addUsermodal cmnModal'
      footer={null}
    >
      <Form
        layout='vertical'
        onFinish={() => {
          if (replacementAndDelete) {
            handleReplaceAndDeleteManager()
            return
          }

          onManagerSelection()
        }}
        form={form}
        validateTrigger
      >
        {replacementAndDelete ? null : (
          <div className='row'>
            <div className='col-12'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Select Manager Type')}
                  name='managerType'
                  value={selectedManagerType}
                >
                  <Radio.Group
                    onChange={e => {
                      setSelectedManagerType(e.target.value)
                      form.setFieldsValue({ managerType: e.target.value })
                    }}
                    value={selectedManagerType}
                  >
                    <Radio value={ManagerType.NewManager}>New Manager</Radio>
                    <Radio value={ManagerType.SubstitureManager}>
                      Substitute Manager
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </div>
          </div>
        )}

        <div className='row'>
          <div className='col-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={label}
                name='Manager'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N(
                      `Please Select ${Ternary(
                        selectedManagerType === ManagerType.NewManager,
                        'New',
                        'Substitute'
                      )} Manager`
                    ),
                  },
                  () => ({
                    validator(_, selectedManager) {
                      const filterUserData = staffShouldNotEachOtherManager(
                        userIdToInfo[selectedManager]?.managerIds
                      )

                      if (Object.keys(filterUserData).length) {
                        const names = Object.values(filterUserData)
                          .map(i => i.name)
                          .join(', ')

                        const error = `Staff cannot be manager of manager. ${userIdToInfo[selectedManager].name} cannot be manager of ${names}`
                        return Promise.reject(error)
                      }
                      return Promise.resolve()
                    },
                  }),
                ]}
                validateTrigger={['onChange']}
              >
                <Select
                  name='Manager'
                  id='Manager'
                  value={translateTextI18N(replacementManagerName)}
                  onChange={mgr => {
                    setReplacementManagerName(userIdToInfo[mgr].name)
                    setReplacementManagerId(mgr)
                  }}
                >
                  {GetStaffListOptions()}
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>

        {replacementAndDelete && +userToDelete?.hotelAssociationCount > 1 ? (
          <div className='row'>
            <div className='col-12'>
              <Form.Item name='deleteFromAllHotel'>
                <div className='form-group cmn-input alignedCheckbox'>
                  <Checkbox
                    checked={deleteFromAllHotel}
                    onChange={e => {
                      setDeleteFromAllHotel(e.target.checked)
                      form.setFieldsValue({
                        deleteFromAllHotel: e.target.checked,
                      })
                    }}
                    className='alignedCheckboxBL'
                  >
                    {translateTextI18N('Delete staff from all the hotel')}
                  </Checkbox>
                </div>
              </Form.Item>
            </div>
          </div>
        ) : null}

        <div className='modalFooter'>
          <Button
            id='btnGray'
            className='grayBtn'
            key='back'
            onClick={handleCancel}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            htmlType='submit'
            loading={showLoader}
            id='btnSubmit'
          >
            {translateTextI18N('Submit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default SelectManager
