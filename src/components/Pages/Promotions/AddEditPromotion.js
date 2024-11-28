import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Input, Modal, Select, Button, Form, DatePicker, Checkbox } from 'antd'
import moment from 'moment'

import {
  ImageUploadHint,
  Option,
  secondsToShowAlert,
  TextArea,
} from '../../../config/constants'
import {
  AddPromotionMenuItem,
  EditPromoMenuItem,
} from '../../../services/promotion'
import { getImage, validateProfileImage } from '../../../config/utils'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import ClearImage from '../../Common/ClearImage/ClearImage'
import { GetMomentDaysDiff } from '../../../services/common'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { PromotionsRequest } from '../../../services/notification'
import { GetCurrentUser } from '../../../services/user'

const GetModalTitle = editingPromoMenu =>
  `${editingPromoMenu ? 'Edit' : 'Add'} Promotion`
const GetPromotionSavedMessage = editingPromoMenu => {
  return editingPromoMenu
    ? 'Promotion updated successfully'
    : 'Promotion added successfully'
}

const AllowedImageSizeMb = 3

const GetDate = date => (date ? date.toDate() : null)
const GetMomentDate = date => (date ? moment(date.toDate()) : null)
const GetStartDate = date => (date ? date.startOf('day').toDate() : null)

const GetConditionalDate = (editingPromoMenu, date, dateFormat) => {
  return editingPromoMenu && date ? moment(date).format(dateFormat) : null
}

const CheckDeletePromoImage = (
  editingPromoMenu,
  promoImageName,
  setDeletePromoImage
) => {
  if (editingPromoMenu && promoImageName !== '') {
    setDeletePromoImage(true)
  }
}

const disabledDate = current =>
  current && current.endOf('day') < moment().endOf('day')

const GetServiceOptions = (objServices, translateTextI18N) => {
  if (!Array.isArray(objServices)) return []

  return objServices.map(s => {
    return (
      <Option value={s.id} key={s.name}>
        {translateTextI18N(s.name)}
      </Option>
    )
  })
}

const GetValidDate = date => {
  if (!date) return moment()
  return moment(date)
}

const IsModifiedData = (promotionMenuItem, promotionToEdit) => {
  if (!promotionToEdit.id) return true

  if (promotionMenuItem.department !== promotionToEdit.department) return true
  if (promotionMenuItem.service !== promotionToEdit.service) return true
  if (promotionMenuItem.promotionName !== promotionToEdit.promotionName)
    return true
  if (promotionMenuItem.promotionCaption !== promotionToEdit.promotionCaption)
    return true
  if (promotionMenuItem.description !== promotionToEdit.description) return true
  if (promotionMenuItem.status !== promotionToEdit.status) return true
  if (promotionMenuItem.promoImageUrl !== promotionToEdit.imageUrl) return true

  const ModifiedStartDate = GetValidDate(promotionMenuItem.startDate)
  const startDate = GetValidDate(promotionToEdit.startDate?.toDate())
  if (!ModifiedStartDate.isSame(startDate)) return true

  const ModifiedEndDateDate = GetValidDate(promotionMenuItem.endDate)
  const endDate = GetValidDate(promotionToEdit.endDate?.toDate())
  return !ModifiedEndDateDate.isSame(endDate) ? true : false
}

const AddEditPromotion = ({
  isModalVisible,
  promotionToEdit,
  setPromotionToEdit,
  hotelId,
  departments,
  showLoader,
  setShowLoader,
  setIsModalVisible,
  setSuccessMessage,
  DateFormat,
  GetDepartmentOptions,
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [editingPromoMenu, setEditingPromoMenu] = useState(false)
  const [services, setServices] = useState([])
  const [createUserError, setCreateUserError] = useState('')
  const [publish, setPublish] = useState(false)
  const [profileImageError, setProfileImageError] = useState('')
  const [promotionName, setPromotionName] = useState('')
  const [promotionCaption, setPromotionCaption] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [promoImage, setPromoImage] = useState()
  const [promoImageUrl, setPromoImageUrl] = useState()
  const [promoImageName, setPromoImageName] = useState('')
  const [deletePromoImage, setDeletePromoImage] = useState(false)
  const [department, setDepartment] = useState('')
  const [service, setService] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const [isDataModified, setIsDataModified] = useState(false)

  const cancleBtnEl = useRef(null)
  const [form] = Form.useForm()

  const clearPromoImage = useCallback(() => {
    setPromoImage(null)
    setPromoImageUrl(null)
    CheckDeletePromoImage(editingPromoMenu, promoImageName, setDeletePromoImage)
  }, [editingPromoMenu, promoImageName])

  const clearModalData = useCallback(() => {
    clearPromoImage()
    form.resetFields()

    setDepartment('')
    setService('')
    setStartDate(null)
    setEndDate(null)
    setPromotionName('')
    setDescription('')
    setPublish(false)
    setPromoImageName('')
    setPromotionCaption('')
    setDeletePromoImage(false)
  }, [clearPromoImage, form])

  useEffect(() => {
    clearModalData()
    if (promotionToEdit.id) {
      setDepartment(promotionToEdit.department)
      setService(promotionToEdit.service)
      setStartDate(GetDate(promotionToEdit.startDate))
      setEndDate(GetDate(promotionToEdit.endDate))
      setPromotionName(promotionToEdit.promotionName)
      setPromotionCaption(promotionToEdit?.promotionCaption ?? '')
      setDescription(promotionToEdit.description)
      setPromoImageUrl(promotionToEdit.imageUrl)
      setPublish(promotionToEdit.status)
      setPromoImage(null)
      setPromoImageName(promotionToEdit.imageName)

      setDeletePromoImage(false)
      form.setFieldsValue({
        department: promotionToEdit.department,
        service: promotionToEdit.service,
        StartDate: GetMomentDate(promotionToEdit.startDate),
        EndDate: GetMomentDate(promotionToEdit.endDate),
        promotionName: promotionToEdit.promotionName,
        promotionCaption: promotionToEdit?.promotionCaption ?? '',
        description: promotionToEdit.description,
        publish: promotionToEdit.status,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible])

  useEffect(() => {
    const departmentData = departments.find(d => d.id === department)
    setDepartmentName(departmentData?.name)
    setServices(departmentData?.services)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department])

  useEffect(() => {
    setEditingPromoMenu(!!promotionToEdit.id)
  }, [promotionToEdit])

  const updateProfileImageError = errorText => {
    setProfileImageError(errorText)
    setTimeout(() => setProfileImageError(''), secondsToShowAlert)
  }

  const handleOk = useCallback(() => {
    clearModalData()

    setIsModalVisible(false)
    setPromotionToEdit({})
  }, [clearModalData, setIsModalVisible, setPromotionToEdit])

  const savePromotionMenu = useCallback(async () => {
    try {
      if (!isDataModified) {
        cancleBtnEl.current.focus()
        return
      }

      if (showLoader) return

      setShowLoader(true)
      setCreateUserError('')
      const promotionMenuItem = {
        department,
        service,
        startDate,
        endDate,
        promotionName,
        promotionCaption,
        description,
        status: publish,
      }

      let successfullySaved = false
      let errorMessage = ''
      if (editingPromoMenu) {
        const { success: editSuccess, message: editErrorMessage } =
          await EditPromoMenuItem({
            promoImage,
            promotionMenuItem,
            promoImageUrl,
            promoImageName,
            deletePromoImage,
            promoMenuId: promotionToEdit.id,
            hotelId,
          })
        if (editSuccess && publish) {
          const sender_id = GetCurrentUser().uid
          let template_variables = {
            '%department%': departmentName,
          }
          PromotionsRequest(
            'PROMOTIONS_REQUEST',
            template_variables,
            sender_id,
            hotelId
          )
        }
        successfullySaved = editSuccess
        errorMessage = editErrorMessage
      } else {
        const { success, message: addPromoMessage } =
          await AddPromotionMenuItem(
            promoImage,
            promotionMenuItem,
            hotelId,
            promotionName,
            promotionCaption,
            publish
          )
        if (success && publish) {
          const sender_id = GetCurrentUser().uid
          let template_variables = {
            '%department%': departmentName,
          }
          PromotionsRequest(
            'PROMOTIONS_REQUEST',
            template_variables,
            sender_id,
            hotelId
          )
        }
        successfullySaved = success
        setCreateUserError(addPromoMessage)
      }

      if (!successfullySaved) {
        setCreateUserError(errorMessage)
        return
      }

      setIsModalVisible(false)
      setShowLoader(false)
      setSuccessMessage(GetPromotionSavedMessage(editingPromoMenu))
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
    } finally {
      setShowLoader(false)
    }
    clearModalData()
    setIsModalVisible(false)
    setPromotionToEdit({})
  }, [
    clearModalData,
    deletePromoImage,
    department,
    departmentName,
    description,
    editingPromoMenu,
    endDate,
    hotelId,
    isDataModified,
    promoImage,
    promoImageName,
    promoImageUrl,
    promotionCaption,
    promotionName,
    promotionToEdit.id,
    publish,
    service,
    setIsModalVisible,
    setPromotionToEdit,
    setShowLoader,
    setSuccessMessage,
    showLoader,
    startDate,
  ])

  useEffect(() => {
    const dataModified = IsModifiedData(
      {
        department,
        service,
        startDate,
        endDate,
        promotionName,
        promotionCaption,
        description,
        status: publish,
        promoImageUrl,
      },
      promotionToEdit
    )
    setIsDataModified(dataModified)
  }, [
    department,
    service,
    startDate,
    endDate,
    promotionName,
    promotionCaption,
    description,
    publish,
    promoImageUrl,
    promotionToEdit,
  ])

  const onStartDateChange = useCallback(selectedDate => {
    setStartDate(GetStartDate(selectedDate))
  }, [])

  const onEnDateChange = useCallback(
    selectedDate => setEndDate(GetStartDate(selectedDate)),
    []
  )

  const onPromotionCaptionChange = useCallback(
    e => setPromotionCaption(e.target.value),
    []
  )

  const onDescriptionChange = useCallback(
    e => setDescription(e.target.value),
    []
  )

  const onProfileImage = useCallback(e => {
    validateProfileImage(
      e.target.files[0],
      updateProfileImageError,
      setPromoImage,
      setPromoImageUrl,
      AllowedImageSizeMb
    )
    e.target.value = null
  }, [])

  const onPublishChange = useCallback(e => setPublish(e.target.checked), [])

  return (
    <Modal
      title={translateTextI18N(GetModalTitle(editingPromoMenu))}
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleOk}
      className='addrestaurantModal cmnModal'
      footer={null}
      centered
    >
      <Form
        layout='vertical'
        onFinish={savePromotionMenu}
        form={form}
        validateTrigger
      >
        <div className='row'>
          <div className='col-12 col-md-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Promotion Name')}
                name='promotionName'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please enter Promotion Name'),
                  },
                ]}
              >
                <Input
                  placeholder={translateTextI18N('Promotion Name')}
                  value={promotionName}
                  onChange={e => setPromotionName(e.target.value)}
                />
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-md-6'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Department')}
                name='department'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please select Department'),
                  },
                ]}
              >
                <Select
                  placeholder={translateTextI18N('Department')}
                  value={department}
                  loading={showLoader}
                  onChange={deptId => setDepartment(deptId)}
                  getPopupContainer={triggerNode => {
                    return triggerNode.parentNode
                  }}
                >
                  {GetDepartmentOptions(departments)}
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-md-6'>
            <div className='form-group cmn-input'>
              <Form.Item label={translateTextI18N('Service')} name='service'>
                <Select
                  placeholder={translateTextI18N('Service')}
                  value={service}
                  loading={showLoader}
                  disabled={department === '0'}
                  onChange={s => setService(s)}
                  getPopupContainer={triggerNode => {
                    return triggerNode.parentNode
                  }}
                >
                  {GetServiceOptions(services, translateTextI18N)}
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-md-6'>
            <div className='form-row'>
              <div className='col-12 col-md-6'>
                <div className='orm-group cmn-input'>
                  <Form.Item
                    label={translateTextI18N('Start Date')}
                    name='StartDate'
                    rules={[
                      {
                        required: true,
                        message: translateTextI18N('Please select Start Date'),
                      },
                    ]}
                  >
                    <DatePicker
                      disabledDate={disabledDate}
                      placeholder={translateTextI18N('Start Date')}
                      format={DateFormat}
                      value={GetConditionalDate(
                        editingPromoMenu,
                        startDate,
                        DateFormat
                      )}
                      onChange={onStartDateChange}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className='col-12 col-md-6'>
                <div className='orm-group cmn-input'>
                  <Form.Item
                    label={translateTextI18N('End Date')}
                    name='EndDate'
                    rules={[
                      () => ({
                        validator() {
                          if (GetMomentDaysDiff(startDate, endDate) < 0)
                            return Promise.reject(
                              new Error(
                                translateTextI18N(
                                  'End date cannot be earlier than Start date'
                                )
                              )
                            )
                          return Promise.resolve()
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      placeholder={translateTextI18N('End Date')}
                      format={DateFormat}
                      value={GetConditionalDate(
                        editingPromoMenu,
                        endDate,
                        DateFormat
                      )}
                      onChange={onEnDateChange}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>
          <div className='col-12 col-md-6'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Promotion Caption')}
                name='promotionCaption'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N(
                      'Please enter Promotion Caption'
                    ),
                  },
                ]}
              >
                <Input
                  maxLength={35}
                  placeholder={translateTextI18N('Promotion Caption')}
                  value={promotionCaption}
                  onChange={onPromotionCaptionChange}
                />
              </Form.Item>
            </div>
          </div>
          <div className='col-12'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Description')}
                name='description'
                rules={[
                  { message: translateTextI18N('Please select Description') },
                ]}
              >
                <TextArea rows={4} onChange={onDescriptionChange} />
              </Form.Item>
            </div>
          </div>
          <div className='col-12 arabicstyle'>
            <label>{translateTextI18N('Banner/ Image')}</label>
            <div className='imageUpload-wrp'>
              <div className='form-row'>
                <div className='col-3 col-sm-auto'>
                  <div className='singleuploadimage mt-2'>
                    <ClearImage
                      onClick={clearPromoImage}
                      visible={promoImageUrl}
                    />
                    <div className='singleuploadfigin'>
                      <img
                        className='img-fluid'
                        width='130'
                        height='130'
                        alt=''
                        src={
                          promoImageUrl
                            ? promoImageUrl
                            : getImage('images/uploadfig.svg')
                        }
                        style={{ height: '100%', width: '100%' }}
                      ></img>
                    </div>
                    <input
                      type='file'
                      name='myfile'
                      accept='.png, .jpeg, .jpg'
                      onChange={onProfileImage}
                    />
                  </div>
                  <CustomAlert
                    visible={profileImageError}
                    message={profileImageError}
                    type='error'
                    showIcon={true}
                  />
                  <p className='mt-1 upload-image-hint'>
                    {translateTextI18N(`${ImageUploadHint}`)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-12 arabicstyle'>
          <Form.Item name='publish'>
            <Checkbox
              name='publish'
              checked={publish}
              onChange={onPublishChange}
            >
              {translateTextI18N('Publish Now')}
            </Checkbox>
          </Form.Item>
        </div>
        <CustomAlert
          visible={createUserError}
          message={createUserError}
          type='error'
          showIcon={true}
        />
        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={handleOk}
            ref={cancleBtnEl}
          >
            {translateTextI18N('Cancel')}
          </Button>
          <Button
            className={`${isDataModified ? 'blueBtn' : 'grayBtn'} ml-3 ml-lg-4`}
            key='submit'
            htmlType='submit'
            loading={showLoader}
          >
            {translateTextI18N('Submit')}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default AddEditPromotion
