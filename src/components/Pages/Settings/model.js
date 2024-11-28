import React, { useState, createContext, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Collections } from '../../../config/constants'
import { db } from '../../../config/firebase'
import { DefaultGuestSettingsListener } from '../../../services/guest'

export const SettingsState = createContext()

export const SettingsStateProvider = props => {
  const {
    guestSettingsList,
    hotelId,
    guestSettingsLoading,
    existingLevelsAllocatedFeedbackSettingsLoading,
    existingLevelsAllocatedFeedbackSettings,
  } = useSelector(state => state)
  const dispatch = useDispatch()
  const location = useLocation()
  const { levels } = existingLevelsAllocatedFeedbackSettings
  const urlParams = new URLSearchParams(location.search)
  const selectedTab = urlParams.get('tab') || '1'
  const [tabKey, setTabKey] = useState(selectedTab)
  const [successMessage, setSuccessMessage] = useState('')
  const [guestSettingsSaving, setGuestSettingsSaving] = useState(false)
  const [editingGuestSettings, setEditingGuestSettings] = useState(false)
  const [feedbackAllocatedLevels, setFeedbackAllocatedLevels] = useState([])
  const editMode = useMemo(
    () => guestSettingsList?.length > 0,
    [guestSettingsList]
  )

  useEffect(() => {
    if (levels) {
      setFeedbackAllocatedLevels(levels.split(','))
    }
    // eslint-disable-next-line
  }, [levels])

  useEffect(() => {
    DefaultGuestSettingsListener(hotelId, dispatch)
    setEditingGuestSettings(editMode)
    // eslint-disable-next-line
  }, [dispatch, editMode, hotelId])

  const handleTabChange = key => {
    setTabKey(key)
    const newUrlParams = new URLSearchParams(location.search)
    newUrlParams.set('tab', key)
    const newUrl = `${location.pathname}?${newUrlParams.toString()}`
    window.history.pushState({ path: newUrl }, '', newUrl)
  }

  useEffect(() => {
    setTabKey(selectedTab)
    // eslint-disable-next-line
  }, [location])

  const manageGuestOnboardingSettings = async values => {
    setGuestSettingsSaving(true)

    if (guestSettingsList?.length > 0) {
      const settingsRef = db
        .collection(Collections.ADMINSETTINGS)
        .doc(hotelId)
        .collection(Collections.ADMIN_GUESTSETTINGS)

      try {
        const querySnapshot = await settingsRef.get()
        querySnapshot.forEach(async doc => {
          await doc.ref.delete()
        })
      } catch (error) {
        console.log(error?.message)
      }
    }
    const promises = []
    const newsettingsRef = db
      .collection(Collections.ADMINSETTINGS)
      .doc(hotelId)
      .collection(Collections.ADMIN_GUESTSETTINGS)
    values.forEach(element => {
      promises.push(
        newsettingsRef
          .add(element)
          .then(docRef => {
            console.log('Document written with ID: ', docRef.id)
          })
          .catch(error => {
            console.error('Error adding document: ', error)
          })
      )
    })
    await Promise.all(promises)
    setSuccessMessage('Guest Settings Saved Successfully')
    setGuestSettingsSaving(false)
  }

  const getSuccessModalMessage = () => {
    if (successMessage) return successMessage
    return 'Changes saved sucessfully'
  }

  function onChangeFeedbackNotificationSelection(e, val) {
    let prev = [...new Set(feedbackAllocatedLevels)]
    if (e.target.checked) {
      prev.push(val)
    }
    const formatted = prev.map(e => {
      return Number(e)
    })
    setFeedbackAllocatedLevels(formatted)
  }

  async function saveFeedbackNotificationSettings() {
    const levelsval = [...new Set(feedbackAllocatedLevels)].toString()
    const obj = {
      hotelId,
      levels: levelsval,
    }
    const newsettingsRef = await db
      .collectionGroup(Collections.ADMIN_FEEDBACK_NOTIFICATION_SETTINGS)
      .where('hotelId', '==', hotelId)
      .get()

    newsettingsRef.forEach(doc => {
      doc.ref.delete()
    })
    console.log(obj)
    await db
      .collection(Collections.ADMINSETTINGS)
      .doc()
      .collection(Collections.ADMIN_FEEDBACK_NOTIFICATION_SETTINGS)
      .add(obj)
      .then(docRef => {
        console.log('Document written with ID: ', docRef.id)
      })
      .catch(error => {
        console.error('Error adding document: ', error)
      })

    setSuccessMessage(
      'Guest Feedback  Notification Settings Saved Successfully'
    )
  }

  return (
    <SettingsState.Provider
      value={{
        ...{
          tabKey,
          setTabKey,
          handleTabChange,
          manageGuestOnboardingSettings,
          successMessage,
          setSuccessMessage,
          getSuccessModalMessage,
          guestSettingsSaving,
          setGuestSettingsSaving,
          editingGuestSettings,
          setEditingGuestSettings,
          guestSettingsList,
          guestSettingsLoading,
          saveFeedbackNotificationSettings,
          onChangeFeedbackNotificationSelection,
          existingLevelsAllocatedFeedbackSettingsLoading,
          existingLevelsAllocatedFeedbackSettings,
          setFeedbackAllocatedLevels,
          feedbackAllocatedLevels,
        },
      }}
    >
      {props.children}
    </SettingsState.Provider>
  )
}
