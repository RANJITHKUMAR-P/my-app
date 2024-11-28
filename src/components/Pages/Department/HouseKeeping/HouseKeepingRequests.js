/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/alt-text */
import { Tabs } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { archivedData, realTimeData } from '../../../../config/constants'
import { defaultSelectedTab } from '../../../../config/utils'
import { actions } from '../../../../Store'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import Header from '../../../Common/Header/Header'
import PageNameCard from '../../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'
import ArchivedHouseKeepingRequests from './ArchivedHouseKeepingRequests'
import RealTimeHouseKeepingRequests from './RealTimeHouseKeepingRequests'

const { TabPane } = Tabs

const HouseKeepingRequests = () => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [resetArchive, setResetArchive] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('101'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='House Keeping'
                breadcrumb={['Department Admin', 'House Keeping']}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row'>
                <Tabs
                  defaultActiveKey={defaultSelectedTab}
                  onChange={e => {
                    if (e === '2') {
                      setResetArchive(true)
                    }
                  }}
                  className='col-12 col-12'
                >
                  <TabPane tab={translateTextI18N(realTimeData)} key='1'>
                    <RealTimeHouseKeepingRequests />
                  </TabPane>
                  <TabPane tab={translateTextI18N(archivedData)} key='2'>
                    <ArchivedHouseKeepingRequests
                      resetArchive={resetArchive}
                      setResetArchive={setResetArchive}
                    />
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HouseKeepingRequests
