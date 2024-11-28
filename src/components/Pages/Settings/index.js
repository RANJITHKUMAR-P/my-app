import React from 'react'
import { SettingsStateProvider } from './model'
import SettingsLayout from './SettingsLayout'

const Settings = () => {
  return (
    <SettingsStateProvider>
      <SettingsLayout />
    </SettingsStateProvider>
  )
}

export default Settings
