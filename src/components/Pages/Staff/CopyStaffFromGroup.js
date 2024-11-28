import { Button, Form, Input, Modal, Select } from 'antd'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Option } from '../../../config/constants'
import { CopyStaff, GroupStaffListener } from '../../../services/user'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import StaffDeptRoleManagerSelection from './StaffDeptRoleManagerSelection'

function CopyStaffFromGroup({
  commonProps,
  contactNumber,
  copyUserId,
  createUserError,
  email,
  form,
  getServiceKeys,
  handleCancel,
  isModalVisible,
  prefixSelector,
  setContactNumber,
  setContactNumberPrefix,
  setCopyUserId,
  setCreateUserError,
  setEmail,
  setIsModalVisible,
  setShowLoader,
  setShowSuccessModal,
  showLoader,
  setResStatus,
}) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const {
    departmentAndServiceIdToInfo,
    hotelInfo,
    groupStaffLoading,
    groupStaffList,
    titleAndPermission,
  } = useSelector(state => state)
  const dispatch = useDispatch()

  const {
    hotelId,
    hotelName,
    hotelLogo,
    status: hotelStatus,
    groupId,
  } = hotelInfo
  const { department, role, managers, setManagers } = commonProps

  function resetForm() {
    form.resetFields()
    setCopyUserId('')
    setEmail('')
    setContactNumber('')
    setContactNumberPrefix('')
    setManagers({})
    GroupStaffListener(hotelId, groupId, dispatch)
  }

  useEffect(() => {
    if (isModalVisible) {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible])

  useEffect(() => {
    if (copyUserId) {
      const copyUserInfo = groupStaffList.find(i => i.id === copyUserId)
      if (copyUserInfo) {
        setEmail(copyUserInfo.email)
        setContactNumber(copyUserInfo.contactNumber)
        setContactNumberPrefix(copyUserInfo.contactNumberPrefix)

        form.setFieldsValue({
          contactNumber: copyUserInfo.contactNumber,
          contactNumberPrefix: copyUserInfo.contactNumberPrefix,
          email: copyUserInfo.email,
        })
      }
    }
  }, [
    copyUserId,
    form,
    groupStaffList,
    hotelInfo?.countryCode,
    setContactNumber,
    setContactNumberPrefix,
    setEmail,
  ])

  async function onFinish() {
    try {
      if (showLoader) return
      setShowLoader(true)
      setCreateUserError('')

      let isDepartmentAdmin = false
      let level = 0
      const titleInfo = titleAndPermission.find(t => t.id === role)
      if (titleInfo) {
        isDepartmentAdmin = titleInfo.isAdmin
        level = titleInfo.level
      }

      const { success, message: copyStaffMessage } = await CopyStaff({
        uid: copyUserId,
        department: departmentAndServiceIdToInfo[department]?.name,
        departmentId: department,
        hotelId,
        hotelLogo,
        hotelName,
        hotelStatus,
        isDepartmentAdmin,
        level,
        managers,
        roles: role,
        serviceKeys: getServiceKeys(role),
        title: titleInfo.title,
      })
      setResStatus(success)
      if (!success) {
        setCreateUserError(copyStaffMessage)
        return
      }

      resetForm()
      setIsModalVisible(false)
      setShowSuccessModal(true)
    } catch (error) {
      console.log('❌', error)
    } finally {
      setShowLoader(false)
    }
  }

  return (
    <Modal
      title={translateTextI18N('Add Existing Staff')}
      visible={isModalVisible}
      onCancel={handleCancel}
      className='addUsermodal cmnModal'
      footer={null}
      maskClosable={false}
    >
      <Form layout='vertical' onFinish={onFinish} form={form} validateTrigger>
        <div className='row'>
          <div className='col-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Select Staff')}
                name='copyUserId'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please select staff'),
                  },
                ]}
              >
                <Select
                  value={copyUserId}
                  onChange={selectedCopyUserId => {
                    setCopyUserId(selectedCopyUserId)
                  }}
                  placeholder={groupStaffLoading ? 'Loading Staff...' : ''}
                >
                  {groupStaffList.map((c, idx) => (
                    <Option value={c.id} key={c.id} id={idx}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-6'>
            <div className='form-group cmn-input'>
              <Form.Item label={translateTextI18N('Email ID')} name='email'>
                <Input disabled={true} placeholder='' value={email} />
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-sm-6 col-md-6'>
            <div className='form-group cmn-input contact-number'>
              <Form.Item
                name='contactNumber'
                label={translateTextI18N('Contact Number')}
                rules={[
                  {
                    min: 6,
                    message: translateTextI18N(
                      'Contact number should be minimum of 6 Characters long'
                    ),
                  },
                ]}
              >
                <Input
                  disabled={true}
                  addonBefore={prefixSelector}
                  maxLength={10}
                  value={contactNumber}
                />
              </Form.Item>
            </div>
          </div>
          <StaffDeptRoleManagerSelection {...commonProps} form={form} />
        </div>
        <CustomAlert
          visible={createUserError}
          message={createUserError}
          type='error'
          showIcon={true}
        />
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

export default CopyStaffFromGroup
