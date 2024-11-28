/* eslint-disable jsx-a11y/alt-text */
import { Button, Checkbox, Form, Input, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  ImageUploadHint,
  RoomServiceRegEx,
  secondsToShowAlert,
  translationDataKey,
} from '../../../config/constants'
import {
  formatPrice,
  getImage,
  GetTranlationStyle,
  GetTranslatedName,
  GetTranslationImage,
  SetAutoClearProp,
  Ternary,
} from '../../../config/utils'
import { AddFoodMenuItem, EditFoodMenuItem } from '../../../services/foodMenu'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import ConfirmationDialog from '../../Common/ConfirmationDialog/ConfirmationDialog'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import TranslateModal from '../../Common/TranslateModal/TranslateModal'

const { TextArea } = Input

const validateImageFunc = data => {
  const { file, setProfileImageError, setFoodImage, setFoodImageUrl } = data
  if (!file) return

  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const lessThan3Mb = file.size / 1024 <= 1024

  if (!isJpgOrPng) {
    setProfileImageError('Invalid format, please upload JPEG or PNG')
  } else if (!lessThan3Mb) {
    setProfileImageError('Maximum upload size is 1mb')
  } else {
    setProfileImageError('')
  }

  if (isJpgOrPng && lessThan3Mb) {
    setFoodImage(file)

    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      setFoodImageUrl(fileReader.result)
    })
    fileReader.readAsDataURL(file)
  }
}

const CheckIfDuplicate = (
  selectedCuisines,
  dish,
  foodMenus,
  foodMenuId,
  cuisines
) => {
  const cuisineToFoodMenus = foodMenus.reduce((acc, curr) => {
    if (curr.id === foodMenuId) return acc
    curr.cuisines.forEach(cuisine => {
      if (!acc[cuisine]) acc[cuisine] = []
      acc[cuisine].push(curr.dish.toLowerCase())
    })
    return acc
  }, {})

  const alreadyExistsInCuisines = selectedCuisines.reduce(
    (acc, currentCuisine) => {
      if (cuisineToFoodMenus[currentCuisine]?.includes(dish.toLowerCase()))
        acc.push(currentCuisine)
      return acc
    },
    []
  )

  let errorMessage = ''
  if (alreadyExistsInCuisines.length) {
    errorMessage = cuisines
      .filter(c => alreadyExistsInCuisines.includes(c.id))
      .map(c => c.name)
      .join(', ')
    const lastIndexOfComma = errorMessage.lastIndexOf(',')
    if (lastIndexOfComma > 0) {
      errorMessage = [...errorMessage]
      errorMessage[lastIndexOfComma] = ' &'
      errorMessage = errorMessage.join('')
    }
    errorMessage = `Dish already exists in ${errorMessage}`
  }

  return errorMessage
}

const saveFoodMenuFunc = async data => {
  const {
    showLoader,
    setShowLoader,
    setSaveFoodMenuError,
    selectedCuisines,
    dish,
    description,
    price,
    editingFoodMenu,
    foodImage,
    foodImageUrl,
    foodImageName,
    deleteFoodImage,
    foodMenuId,
    hotelId,
    setIsModalVisible,
    setFoodMenuSuccessAlert,
    foodMenus,
    cuisines,
    dishTranslationData,
    setDishTranslationData,
    checkPendingTranlation,
    setShowMenuConfirmation,
  } = data
  try {
    if (showLoader) return
    setShowLoader(true)
    setSaveFoodMenuError('')

    const duplicateError = CheckIfDuplicate(
      selectedCuisines,
      dish,
      foodMenus,
      foodMenuId,
      cuisines
    )
    if (duplicateError) {
      SetAutoClearProp(setSaveFoodMenuError, duplicateError)
      return
    }

    if (checkPendingTranlation) {
      if (
        Object.values(dishTranslationData).filter(v => v).length === 0 ||
        dishTranslationData['en'] !== dish
      ) {
        setShowMenuConfirmation(true)
        return
      }
    }

    const foodMenuItem = {
      cuisines: selectedCuisines,
      dish,
      description,
      price,
      [translationDataKey]: dishTranslationData,
    }

    if (editingFoodMenu) {
      const { success: editSuccess, message: editErrorMessage } =
        await EditFoodMenuItem({
          foodImage,
          foodMenuItem,
          foodImageUrl,
          foodImageName,
          deleteFoodImage,
          foodMenuId,
          hotelId,
        })
      if (!editSuccess) {
        setSaveFoodMenuError(editErrorMessage)
        return
      }
    } else {
      const { success, message: addMenuMessage } = await AddFoodMenuItem(
        foodImage,
        foodMenuItem,
        hotelId
      )
      if (!success) {
        setSaveFoodMenuError(addMenuMessage)
        return
      }
    }

    setIsModalVisible(false)
    setDishTranslationData({})
    setFoodMenuSuccessAlert(
      editingFoodMenu ? 'Changes saved successfully' : 'Menu added successfully'
    )
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
  } finally {
    setShowLoader(false)
  }
}

const GetOldMenuTranslationData = ({ foodMenuToEdit, dishTranslationData }) => {
  let tranlationData
  if (foodMenuToEdit.id) tranlationData = foodMenuToEdit[translationDataKey]
  else tranlationData = dishTranslationData
  return tranlationData || {}
}

function AddMenu({
  curencyCode,
  editingFoodMenu,
  foodMenuId,
  foodMenuToEdit,
  handleCancel,
  isModalVisible,
  selectedCuisines,
  setFoodMenuId,
  setFoodMenuSuccessAlert,
  setFoodMenuToEdit,
  setIsModalVisible,
  setSelectedCuisines,
  setShowLoader,
  showLoader,
  translationConfirmationMessage,
  translationConfirmationTitle,
}) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const { hotelId, cuisines, foodMenus, currentLanguage } = useSelector(
    state => state
  )

  const [form] = Form.useForm()
  const [dish, setDish] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [showMenuTranlateModal, setShowMenuTranlateModal] = useState(false)
  const [showMenuConfirmation, setShowMenuConfirmation] = useState(false)
  const [saveFoodMenuError, setSaveFoodMenuError] = useState('')
  const [dishTranslationData, setDishTranslationData] = useState({})
  const [foodImage, setFoodImage] = useState()
  const [foodImageUrl, setFoodImageUrl] = useState()
  const [foodImageName, setFoodImageName] = useState(false)
  const [deleteFoodImage, setDeleteFoodImage] = useState(false)
  const [profileImageError, setProfileImageError] = useState('')

  useEffect(() => {
    if (profileImageError)
      setTimeout(() => setProfileImageError(''), secondsToShowAlert)
  }, [profileImageError])

  useEffect(() => {
    if (isModalVisible) {
      setDishTranslationData({})
      setDish('')
      setFoodImage()
      setFoodImageUrl()
      setProfileImageError()
      form.resetFields()
      form.setFieldsValue({
        cuisines: selectedCuisines,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible])

  useEffect(() => {
    if (editingFoodMenu) {
      setDish(foodMenuToEdit.dish)
      setDescription(foodMenuToEdit.description || '')
      setPrice(foodMenuToEdit.price)
      setFoodImageUrl(foodMenuToEdit.imageUrl)
      setFoodMenuId(foodMenuToEdit.id)
      setDishTranslationData(foodMenuToEdit[translationDataKey] || {})

      setFoodImage(null)
      setFoodImageName(foodMenuToEdit.imageName)
      setDeleteFoodImage(false)

      form.setFieldsValue({
        cuisines: foodMenuToEdit.cuisines,
        dish: foodMenuToEdit.dish,
        description: foodMenuToEdit.description || '',
        price: foodMenuToEdit.price,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingFoodMenu])

  const prefixSelector = (
    <Form.Item name='prefix' noStyle>
      {curencyCode}
    </Form.Item>
  )

  const handleDishChagne = (e, isOnBlur) => {
    let newDishName = e.target.value.replace(RoomServiceRegEx, '')
    if (isOnBlur) {
      newDishName = newDishName.trim()
    }
    setDish(newDishName)
    form.setFieldsValue({ dish: newDishName })
  }

  const handlePriceChange = (e, isBlur = false) => {
    const updatePrice = updatedPrice => {
      setPrice(updatedPrice)
      form.setFieldsValue({
        price: updatedPrice,
      })
    }

    let inputText = e.target.value

    if (inputText.length === 1 && inputText === '.') {
      inputText = '0.'
    }

    if (isNaN(+inputText)) {
      updatePrice(price)
      return
    }

    const formattedPrice = formatPrice(inputText)
    let newPrice = isBlur ? formattedPrice : inputText
    updatePrice(newPrice)
  }

  const saveFoodMenu = async checkPendingTranlation => {
    setFoodMenuToEdit({})
    setDishTranslationData({})

    saveFoodMenuFunc({
      showLoader,
      setShowLoader,
      setSaveFoodMenuError,
      selectedCuisines,
      dish,
      description,
      price,
      editingFoodMenu,
      foodImage,
      foodImageUrl,
      foodImageName,
      deleteFoodImage,
      foodMenuId,
      hotelId,
      setIsModalVisible,
      setFoodMenuSuccessAlert,
      foodMenus,
      cuisines,
      dishTranslationData,
      setDishTranslationData,
      checkPendingTranlation,
      setShowMenuConfirmation,
    })
  }

  const validateImage = file => {
    validateImageFunc({
      file,
      setProfileImageError,
      setFoodImage,
      setFoodImageUrl,
    })
  }

  const clearFoodImage = () => {
    setFoodImage(null)
    setFoodImageUrl(null)
    if (editingFoodMenu && foodImageName !== '') setDeleteFoodImage(true)
  }

  const handleCuisineChange = value => {
    setSelectedCuisines([...value])
  }

  return (
    <>
      <Modal
        title={translateTextI18N(
          `${Ternary(editingFoodMenu, 'Edit', 'Add')} Menu`
        )}
        visible={true}
        onCancel={handleCancel}
        className='addCuisineModal cmnModal'
        footer={null}
        centered
      >
        <Form
          layout='vertical'
          onFinish={() => saveFoodMenu(true)}
          initialValues={{
            prefix: curencyCode,
          }}
          form={form}
          validateTrigger
        >
          <div className='row'>
            <div className='col-12'>
              <div className='buttonCheckGrp'>
                <Form.Item
                  label={translateTextI18N('Meals of the day')}
                  name='cuisines'
                  required
                  rules={[
                    () => ({
                      validator() {
                        if (selectedCuisines.length) return Promise.resolve()
                        return Promise.reject(
                          new Error(
                            translateTextI18N('Please select at least one meal')
                          )
                        )
                      },
                    }),
                  ]}
                >
                  <Checkbox.Group
                    options={cuisines.map(c => ({
                      label: GetTranslatedName(c, currentLanguage, 'name'),
                      value: c.id,
                    }))}
                    onChange={handleCuisineChange}
                    value={selectedCuisines}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-md-6'>
              <div className='form-row'>
                <div className='col'>
                  <div className='form-group cmn-input'>
                    <Form.Item
                      label={translateTextI18N('Dish')}
                      name='dish'
                      rules={[
                        {
                          required: true,
                          message: translateTextI18N('Enter the dish'),
                        },
                      ]}
                    >
                      <Input
                        maxLength={50}
                        value={dish}
                        onChange={e => handleDishChagne(e)}
                        onBlur={e => handleDishChagne(e, true)}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className='col-auto'>
                  <Button
                    className='cmnBtn dlticonBtn'
                    style={{
                      marginTop: '25px',
                      ...GetTranlationStyle(dishTranslationData, dish),
                    }}
                    onClick={() => setShowMenuTranlateModal(true)}
                  >
                    <img
                      src={GetTranslationImage(dishTranslationData, dish)}
                    ></img>
                  </Button>
                </div>
              </div>
            </div>

            <div className='col-12 col-md-6'>
              <div className='form-group contact-input'>
                <Form.Item
                  label={translateTextI18N('Price')}
                  name='price'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Enter Price'),
                    },
                    () => ({
                      validator() {
                        if (price && !curencyCode)
                          return Promise.reject(
                            new Error(
                              translateTextI18N(
                                'Please add currency in hotel info page'
                              )
                            )
                          )
                        return Promise.resolve()
                      },
                    }),
                  ]}
                  value={price}
                >
                  <Input
                    value={price}
                    addonBefore={prefixSelector}
                    onChange={handlePriceChange}
                    onBlur={e => handlePriceChange(e, true)}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-12 col-md-12'>
              <div className='form-row'>
                <div className='col'>
                  <div className='form-group cmn-input'>
                    <Form.Item
                      label={translateTextI18N('Description')}
                      name='description'
                    >
                      <TextArea
                        maxLength={500}
                        rows={5}
                        value={description}
                        onBlur={e => {
                          setDescription(e.target.value)
                          form.setFieldsValue({ description: e.target.value })
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='col-12 arabicstyle'>
            <label>{translateTextI18N('Dish Photo')}</label>
            <div className='imageUpload-wrp'>
              <div className='form-row'>
                <div className='col-3 col-sm-auto'>
                  <CustomAlert
                    visible={profileImageError}
                    message={profileImageError}
                    type='error'
                    showIcon={true}
                  />

                  <div className='singleuploadimage mt-2'>
                    {Ternary(
                      foodImage || foodImageUrl,
                      <span className='removebtn' onClick={clearFoodImage}>
                        <img
                          className='img-fluid fit-image'
                          src={getImage('images/close.svg')}
                          alt=''
                        ></img>
                      </span>,
                      null
                    )}
                    <div className='singleuploadfigin'>
                      <img
                        className='img-fluid'
                        src={Ternary(
                          foodImageUrl,
                          foodImageUrl,
                          getImage('images/uploadfig.svg')
                        )}
                        style={{ height: '100%', width: '100%' }}
                        width='130'
                        height='130'
                        alt=''
                      ></img>
                    </div>
                    <input
                      type='file'
                      name='myfile'
                      onChange={e => {
                        validateImage(e.target.files[0])
                        e.target.value = null
                      }}
                      accept='.png, .jpeg, .jpg'
                    />
                  </div>
                  <p className='mt-1 upload-image-hint'>
                    {translateTextI18N(ImageUploadHint)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-12 col-md-auto'>
              <CustomAlert
                visible={saveFoodMenuError}
                message={saveFoodMenuError}
                type='error'
                showIcon={true}
                classNames='mb-3'
              />
            </div>
          </div>
          <div className='modalFooter mt-1'>
            <Button className='grayBtn' key='back' onClick={handleCancel}>
              {translateTextI18N('Cancel')}
            </Button>
            <Button
              className='blueBtn ml-3 ml-lg-4'
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
            setDishTranslationData(data)
          }}
          oldTranslatedData={GetOldMenuTranslationData({
            foodMenuToEdit,
            dishTranslationData,
          })}
          text={dish}
        />

        <ConfirmationDialog
          visible={showMenuConfirmation}
          onCancelClick={() => setShowMenuConfirmation(false)}
          onOkClick={() => {
            setShowMenuConfirmation(false)
            saveFoodMenu(false)
          }}
          title={translateTextI18N(translationConfirmationTitle)}
          message={translateTextI18N(translationConfirmationMessage)}
          okButtonText='Confirm'
        />
      </Modal>
    </>
  )
}

export default AddMenu
