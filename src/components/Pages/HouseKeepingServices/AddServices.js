import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Input, Modal, Select, Button, Form } from 'antd'
import moment from 'moment'
import { RoomServiceRegEx, translationDataKey } from '../../../config/constants'
import { ImageUploadHint, secondsToShowAlert } from '../../../config/constants'
import {
  AddPromotionMenuItem,
  EditPromoMenuItem,
} from '../../../services/AddhouseKeepingService'
import {
  getImage,
  validateProfileImage,
  GetTranslationImage,
  GetTranlationStyle,
} from '../../../config/utils'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import ClearImage from '../../Common/ClearImage/ClearImage'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { PromotionsRequest } from '../../../services/notification'
import { GetCurrentUser } from '../../../services/user'

import TranslateModal from '../../Common/TranslateModal/TranslateModal'
import ConfirmationDialog from '../../Common/ConfirmationDialog/ConfirmationDialog'
import {
  formatPrice,
  GetTranslatedName,
  SetAutoClearProp,
  Ternary,
} from '../../../config/utils'

const GetPromotionSavedMessage = editingPromoMenu => {
  return editingPromoMenu
    ? 'Promotion updated successfully'
    : 'Product added successfully'
}

const AllowedImageSizeMb = 3

const GetDate = date => (date ? date.toDate() : null)
const GetMomentDate = date => (date ? moment(date.toDate()) : null)

const CheckDeletePromoImage = (
  editingPromoMenu,
  promoImageName,
  setDeletePromoImage
) => {
  if (editingPromoMenu && promoImageName !== '') {
    setDeletePromoImage(true)
  }
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
const translationConfirmationMessage = 'Are you sure you want to translate?'
const translationConfirmationTitle = 'Translation Confirmation'

const AddServices = ({
  isModalVisible,
  promotionToEdit,
  setPromotionToEdit,
  hotelId,
  departments,
  showLoader,
  setShowLoader,
  setIsModalVisible,
  setSuccessMessage,
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [editingPromoMenu, setEditingPromoMenu] = useState(false)
  const [services, setServices] = useState([])
  const [createUserError, setCreateUserError] = useState('')
  const [profileImageError, setProfileImageError] = useState('')
  const [promotionName, setPromotionName] = useState('')
  const [price, setPrice] = useState('')
  const [promotionCaption, setPromotionCaption] = useState('hello')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [promoImage, setPromoImage] = useState()
  const [promoImageUrl, setPromoImageUrl] = useState()
  const [promoImageName, setPromoImageName] = useState('')
  const [deletePromoImage, setDeletePromoImage] = useState(false)
  const [department, setDepartment] = useState('')
  const [service, setService] = useState('')
  const [isDataModified, setIsDataModified] = useState(false)
  const [productTranslationData, setProductTranslationData] = useState({})
  const [promotionType, setPromotionType] = useState('Complimentary') // New state variable for promotion type
  const publish = true
  const departmentName = 'House Keeping'
  const [showMenuTranlateModal, setShowMenuTranlateModal] = useState(false)
  const [showMenuConfirmation, setShowMenuConfirmation] = useState(false)

  const onPromotionTypeChange = value => {
    setPromotionType(value)
  }

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
    setPromoImageName('')
    setPrice('')
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
      setPrice(promotionToEdit.price)
      setPromoImage(null)
      setPromoImageName(promotionToEdit.imageName)
      setProductTranslationData(promotionToEdit[translationDataKey])

      setDeletePromoImage(false)
      form.setFieldsValue({
        department: promotionToEdit.department,
        service: promotionToEdit.service,
        StartDate: GetMomentDate(promotionToEdit.startDate),
        EndDate: GetMomentDate(promotionToEdit.endDate),
        promotionName: promotionToEdit.promotionName,
        price: promotionToEdit.price,
        promotionCaption: promotionToEdit?.promotionCaption ?? '',
        description: promotionToEdit.description,
        publish: promotionToEdit.status,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible])

  const GetOldMenuTranslationData = ({
    promotionToEdit,
    productTranslationData,
  }) => {
    let tranlationData
    if (promotionToEdit.id) tranlationData = promotionToEdit[translationDataKey]
    else tranlationData = productTranslationData
    return tranlationData || {}
  }

  useEffect(() => {
    const departmentData = departments.find(d => d.id === department)
    // setDepartmentName(departmentData?.name)
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
        price,
        promotionType,
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
          // const sender_id = GetCurrentUser().uid
          // let template_variables = {
          //   '%department%': 'House Keeping',
          // }
          // PromotionsRequest(
          //   'PROMOTIONS_REQUEST',
          //   template_variables,
          //   sender_id,
          //   hotelId
          // )
        }
        successfullySaved = editSuccess
        errorMessage = editErrorMessage
      } else {
        const { success, message: addPromoMessage } =
          await AddPromotionMenuItem(promoImage, promotionMenuItem, hotelId)
        if (success && publish) {
          // const sender_id = GetCurrentUser().uid
          // let template_variables = {
          //   '%department%': departmentName,
          // }
          // PromotionsRequest(
          //   'PROMOTIONS_REQUEST',
          //   template_variables,
          //   sender_id,
          //   hotelId
          // )
        }
        successfullySaved = success
        setCreateUserError(addPromoMessage)
      }

      if (!successfullySaved) {
        setCreateUserError(errorMessage)
        return
      }
      setProductTranslationData({})
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
    price,
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
        price,
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
    price,
    promotionName,
    promotionType,
    promotionCaption,
    description,
    publish,
    promoImageUrl,
    promotionToEdit,
  ])

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

  return (
    <Modal
      title={translateTextI18N('Add HouseKeeping Products')}
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
          <div className='col-12 arabicstyle'>
            <div className='form-group cmn-input'>
              <Form.Item
                label={translateTextI18N('Product Type')}
                name='promotionType'
              >
                <Select
                  placeholder={promotionType}
                  value={promotionType}
                  onChange={onPromotionTypeChange}
                >
                  <Select.Option value='Complimentary'>
                    {translateTextI18N('Complimentary')}
                  </Select.Option>
                  <Select.Option value='Chargeable'>
                    {translateTextI18N('Chargeable')}
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className='col-12 col-md-12'>
            <div
              className='form-group cmn-input'
              // style={{ width: 'calc(100% - 50px)' }}
            >
              <Form.Item
                label={translateTextI18N('Product Name')}
                name='Product Name'
                rules={[
                  {
                    required: true,
                    message: translateTextI18N('Please enter Product Name'),
                  },
                  {
                    max: 20,
                    message: translateTextI18N('Maximum 20 characters allowed'),
                  },
                ]}
              >
                {/* <Input compact> */}
                <Input
                  maxLength={20}
                  placeholder={translateTextI18N('Product Name')}
                  value={promotionName}
                  onChange={e => setPromotionName(e.target.value)}
                />
                {/* </Input> */}
              </Form.Item>
              {/* <Button
                className='cmnBtn dlticonBtn'
                style={{
                  marginLeft: '6px',
                  ...GetTranlationStyle(productTranslationData, promotionName),
                }}
                onClick={() => setShowMenuTranlateModal(true)}
              >
                <img
                  alt=''
                  src={GetTranslationImage(
                    productTranslationData,
                    promotionName
                  )}
                />
              </Button> */}
            </div>
          </div>

          {promotionType === 'Chargeable' && (
            <div className='col-12'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Price')}
                  name='price'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N(''),
                    },
                    {
                      validator: (rule, value, callback) => {
                        if (isNaN(value)) {
                          callback(
                            translateTextI18N('Please enter a valid number')
                          )
                        } else {
                          callback()
                        }
                      },
                    },
                  ]}
                  value={price}
                >
                  <Input
                    placeholder={translateTextI18N('Product Price')}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
          )}

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
      <TranslateModal
        visible={showMenuTranlateModal}
        onCancelClick={() => setShowMenuTranlateModal(false)}
        onOkClick={data => {
          setShowMenuTranlateModal(false)
          setProductTranslationData(data)
        }}
        oldTranslatedData={GetOldMenuTranslationData({
          promotionToEdit,
          productTranslationData,
        })}
        text={promotionName}
      />

      <ConfirmationDialog
        visible={showMenuConfirmation}
        onCancelClick={() => setShowMenuConfirmation(false)}
        onOkClick={() => {
          setShowMenuConfirmation(false)
          savePromotionMenu(false)
        }}
        title={translateTextI18N(translationConfirmationTitle)}
        message={translateTextI18N(translationConfirmationMessage)}
        okButtonText='Confirm'
      />
    </Modal>
  )
}

export default AddServices
