import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, message, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  allowedMealsOfTheDay,
  RoomServiceRegEx,
  secondsToShowAlert,
  translationDataKey,
} from '../../../config/constants'
import { Ternary } from '../../../config/utils'
import { SaveCuisine } from '../../../services/cuisine'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import ConfirmationDialog from '../../Common/ConfirmationDialog/ConfirmationDialog'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import TranslateModal from '../../Common/TranslateModal/TranslateModal'
import MealOfTheDayItem from './MealOfTheDayItem'

function getCuisinesCopy(localCuisines, idx) {
  const copyLocalCuisines = [...localCuisines]
  const updatedCuisine = { ...copyLocalCuisines[idx] }
  return [copyLocalCuisines, updatedCuisine]
}

const saveCuisinesFunc = async ({
  localCuisines,
  setMealOfTheDayError,
  setShowCuisineLoader,
  hotelId,
  setShowMealOfTheDay,
  setMealOfTheDaySuccessMessage,
  checkPendingTranlation,
  setShowMealsOfTheDayConfirmation,
}) => {
  try {
    let filteredLocalCuisines = localCuisines.filter(
      c => !(!c.id && c.isDelete)
    )

    const allCuisineNames = filteredLocalCuisines
      .filter(c => !c.isDelete)
      .map(c => c.name.toLowerCase())
    const uniqueCuisineNames = [...new Set(allCuisineNames)]
    if (allCuisineNames.length !== uniqueCuisineNames.length) {
      setMealOfTheDayError('Please remove duplicate meals of the day')
      return
    }

    if (filteredLocalCuisines.some(c => c.name === '' && !c.isDelete)) {
      setMealOfTheDayError('Please enter name for all the meals')
      return
    }

    if (checkPendingTranlation) {
      const pendingTranlations = CalculatePendingTranslation(localCuisines)
      if (pendingTranlations) {
        setShowMealsOfTheDayConfirmation(true)
        return
      }
    }

    setShowCuisineLoader(true)
    if (filteredLocalCuisines.length) {
      const { success, message: saveCuisineMessage } = await SaveCuisine(
        hotelId,
        filteredLocalCuisines
      )
      if (!success) {
        message.error(saveCuisineMessage)
      } else {
        setShowMealOfTheDay(false)
        setMealOfTheDaySuccessMessage('Changes saved successfully')
      }
    }
  } catch (error) {
    message.error(error.message || 'Something went wrong! Please try again!')
  } finally {
    setShowCuisineLoader(false)
  }
}

const CalculatePendingTranslation = localCuisines => {
  let pendingTranlations = 0
  localCuisines.forEach(cuisine => {
    if (!cuisine.isDelete) {
      const translationData = cuisine[translationDataKey] || {}
      if (
        Object.values(translationData).filter(v => v).length === 0 ||
        translationData['en'] !== cuisine.name
      ) {
        pendingTranlations++
      }
    }
  })
  return pendingTranlations > 0
}

function AddMealOfTheDay({
  showMealOfTheDay,
  localCuisines,
  setLocalCuisines,
  handleCancel,
  setShowMealOfTheDay,
  setMealOfTheDaySuccessMessage,
  translationConfirmationTitle,
  translationConfirmationMessage,
}) {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const { hotelInfo, foodMenus } = useSelector(state => state)
  const { hotelId } = hotelInfo

  const [showCuisineLoader, setShowCuisineLoader] = useState(false)
  const [mealOfTheDayError, setMealOfTheDayError] = useState('')
  const [selectedCuisineIndex, setSelectedCuisineIndex] = useState(-1)
  const [showMealOfTheDayTranlateModal, setShowMealOfTheDayTranlateModal] =
    useState(false)
  const [showMealsOfTheDayConfirmation, setShowMealsOfTheDayConfirmation] =
    useState(false)
  const [preventAddingMoreMealsOfTheDay, setPreventAddingMoreMealsOfTheDay] =
    useState(false)

  useEffect(() => {
    setPreventAddingMoreMealsOfTheDay(
      localCuisines.filter(c => !c.isDelete).length >= allowedMealsOfTheDay
    )
  }, [localCuisines])

  useEffect(() => {
    if (mealOfTheDayError)
      setTimeout(() => setMealOfTheDayError(''), secondsToShowAlert)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealOfTheDayError])

  function handleChange(idx, value) {
    const [copyLocalCuisines, updatedCuisine] = getCuisinesCopy(
      localCuisines,
      idx
    )
    if (updatedCuisine) {
      updatedCuisine.name = value.replace(RoomServiceRegEx, '')
      updatedCuisine[translationDataKey] = {}
    }
    copyLocalCuisines[idx] = updatedCuisine
    setLocalCuisines(copyLocalCuisines)
  }

  function setMealOfTheDayImage(idx, url) {
    const [copyLocalCuisines, updatedCuisine] = getCuisinesCopy(
      localCuisines,
      idx
    )
    if (updatedCuisine) {
      updatedCuisine.imageUrl = url
    }
    copyLocalCuisines[idx] = updatedCuisine
    setLocalCuisines(copyLocalCuisines)
  }

  function handleAdd() {
    if (
      localCuisines.filter(c => !c.isDelete).length === allowedMealsOfTheDay
    ) {
      setMealOfTheDayError(
        `You cannot add more than ${allowedMealsOfTheDay} Meals of the day`
      )
      return
    }
    const copyLocalCuisines = [...localCuisines]
    const maxIndex = Math.max(...copyLocalCuisines.map(c => c.index))
    const newCuisine = { name: '', hotelId, index: maxIndex + 1 }
    copyLocalCuisines.push(newCuisine)
    setLocalCuisines(copyLocalCuisines)
  }

  function handleRemove(idx) {
    const copyLocalCuisines = [...localCuisines]
    const coisineToDelete = { ...copyLocalCuisines[idx], isDelete: true }
    if (coisineToDelete.id) {
      const foundDishesWithThisCuisine = foodMenus.filter(f =>
        f.cuisines.includes(coisineToDelete.id)
      )
      if (foundDishesWithThisCuisine.length > 0) {
        setMealOfTheDayError(
          `You cannot delete this meal of the day as it is used in some dishes`
        )
        return
      }
    }
    copyLocalCuisines[idx] = coisineToDelete
    setLocalCuisines(copyLocalCuisines)
  }

  function removeMealImage(idx) {
    const copyLocalCuisines = [...localCuisines]
    const coisineToDelete = { ...copyLocalCuisines[idx] }
    coisineToDelete.imageUrl = ''
    copyLocalCuisines[idx] = coisineToDelete
    setLocalCuisines(copyLocalCuisines)
  }

  const saveCuisines = async checkPendingTranlation => {
    saveCuisinesFunc({
      localCuisines,
      setMealOfTheDayError,
      setShowCuisineLoader,
      hotelId,
      setShowMealOfTheDay,
      setMealOfTheDaySuccessMessage,
      checkPendingTranlation,
      setShowMealsOfTheDayConfirmation,
    })
  }

  const handleTranslationClick = idx => {
    setSelectedCuisineIndex(idx)
    setShowMealOfTheDayTranlateModal(true)
  }

  function callHandleCancle() {
    if (!showCuisineLoader) {
      handleCancel()
    }
  }

  return (
    <Modal
      title={translateTextI18N('Add Meal of the Day')}
      visible={showMealOfTheDay}
      onCancel={callHandleCancle}
      className='editCategoriesModal cmnModal'
      footer={null}
      centered
      maskClosable={false}
    >
      <Form layout='vertical'>
        {localCuisines.map((localCuisine, idx) => (
          <MealOfTheDayItem
            data={localCuisine}
            handleChange={handleChange}
            handleRemove={handleRemove}
            removeMealImage={removeMealImage}
            handleTranslationClick={handleTranslationClick}
            idx={idx}
            setMealOfTheDayImage={setMealOfTheDayImage}
          />
        ))}
        <CustomAlert
          visible={mealOfTheDayError}
          message={mealOfTheDayError}
          type='error'
          showIcon={true}
          classNames='mb-2 '
        />
        {Ternary(
          preventAddingMoreMealsOfTheDay,
          null,
          <Button className='addnewLink' onClick={handleAdd}>
            <PlusOutlined /> {translateTextI18N('Add Meal of the Day')}
          </Button>
        )}
      </Form>
      <div className='modalFooter'>
        <Button className='grayBtn' key='back' onClick={callHandleCancle}>
          {translateTextI18N('Cancel')}
        </Button>
        <Button
          className='blueBtn ml-3 ml-lg-4'
          key='submit'
          loading={showCuisineLoader}
          onClick={() => saveCuisines(true)}
        >
          {translateTextI18N('Submit')}
        </Button>
      </div>

      <TranslateModal
        visible={showMealOfTheDayTranlateModal}
        onCancelClick={() => setShowMealOfTheDayTranlateModal(false)}
        onOkClick={translatedData => {
          const copiedCuisines = [...localCuisines]
          const cuisine = { ...copiedCuisines[selectedCuisineIndex] }
          cuisine[translationDataKey] = { ...translatedData }
          copiedCuisines[selectedCuisineIndex] = cuisine
          setLocalCuisines(copiedCuisines)

          setShowMealOfTheDayTranlateModal(false)
        }}
        oldTranslatedData={
          localCuisines[selectedCuisineIndex]?.[translationDataKey] || {}
        }
        text={localCuisines[selectedCuisineIndex]?.name}
      />

      <ConfirmationDialog
        visible={showMealsOfTheDayConfirmation}
        onCancelClick={() => setShowMealsOfTheDayConfirmation(false)}
        onOkClick={() => {
          setShowMealsOfTheDayConfirmation(false)
          saveCuisines(false)
        }}
        title={translateTextI18N(translationConfirmationTitle)}
        message={translateTextI18N(translationConfirmationMessage)}
        okButtonText='Confirm'
      />
    </Modal>
  )
}

export default AddMealOfTheDay
