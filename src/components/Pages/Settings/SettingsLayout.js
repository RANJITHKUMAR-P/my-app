import React, { useContext } from 'react'
import { Modal, Tabs } from 'antd'
import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import PageNamecard from '../../Common/PageNameCard/PageNameCard'
import { SettingsState } from './model'
import GuestOnboarding from './Components/GuestOnboarding'
import GuestFeedback from './Components/GuestFeedback'
import SuccessModal from '../../Common/Modals/SuccessModal'

const { TabPane } = Tabs

export default function SettingsLayout() {
  const { tabKey, handleTabChange, successMessage, setSuccessMessage } =
    useContext(SettingsState)
  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent hotelmgmt-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='Settings'
                breadcrumb={['Hotel Admin', 'Settings']}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row'>
                <Tabs
                  activeKey={tabKey}
                  onChange={handleTabChange}
                  className='col-12 col-12'
                >
                  <TabPane tab='Guest' key='1'>
                    <GuestOnboarding />
                  </TabPane>
                  <TabPane tab='Feeback' key='2'>
                    <GuestFeedback />
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Modal
        visible={successMessage}
        className='successModal'
        footer={null}
        centered
        onCancel={() => setSuccessMessage('')}
      >
        <SuccessModal title={successMessage}></SuccessModal>
      </Modal>
    </>
  )
}
