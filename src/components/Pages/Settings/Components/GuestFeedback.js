import React, { useContext } from 'react'
import { Checkbox, Button } from 'antd'
import { SettingsState } from '../model'

const GuestFeedback = React.memo(() => {
  const {
    saveFeedbackNotificationSettings,
    onChangeFeedbackNotificationSelection,
    existingLevelsAllocatedFeedbackSettingsLoading,
    feedbackAllocatedLevels,
  } = useContext(SettingsState)

  return (
    <>
      <div className='col-12 col-xl-12'>
        <div className='row'>
          <div className='col-12 col-xl-12'>
            <div className='tablefilter-wrp'>
              <div className='form-row justify-content-end'>
                <div className='col-12'>
                  <h6>Guest Feedback Notification Settings</h6>
                </div>
              </div>
            </div>
            <div className='tablefilter-wrp'>
              <Checkbox disabled defaultChecked>
                Level 0: IT Admin
              </Checkbox>
              <Checkbox
                defaultChecked={feedbackAllocatedLevels?.includes('1')}
                onChange={e => {
                  onChangeFeedbackNotificationSelection(e, '1')
                }}
              >
                Level 1: Top Management
              </Checkbox>
              <Checkbox
                defaultChecked={feedbackAllocatedLevels?.includes('2')}
                onChange={e => {
                  onChangeFeedbackNotificationSelection(e, '2')
                }}
              >
                Level 2: Administrative Level
              </Checkbox>
            </div>
          </div>
        </div>
      </div>
      <div className='col-4 col-md-auto ml-auto'>
        <Button
          className='cmnBtn'
          onClick={saveFeedbackNotificationSettings}
          loading={existingLevelsAllocatedFeedbackSettingsLoading}
        >
          Save Notification Settings
        </Button>
      </div>
    </>
  )
})

export default GuestFeedback
