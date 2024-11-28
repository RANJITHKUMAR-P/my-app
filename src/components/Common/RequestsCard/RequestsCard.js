/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import { Tabs } from 'antd'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import RequestStatusCard from '../RequestStatusCard/RequestStatusCard'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { AddDashboardServiceRequestListener } from '../../../services/requests'
import { callback, defaultSelectedTab } from '../../../config/utils'

const { TabPane } = Tabs

const RequestCardByFilter = ({ list, btnText, btnClassName, loading }) => {
  return list.map(({ id, guest, roomNumber, department, image }) => (
    <RequestStatusCard
      key={id}
      btnText={btnText}
      btnClassName={btnClassName}
      title={guest}
      desc={`Room No. ${roomNumber} ${department}`}
      image={image}
      loading={loading}
    />
  ))
}

const RequestsCard = () => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const {
    hotelId,
    departmentAndServiceKeyToId,
    loadingDashboardServiceRequest,
    dashboardServiceRequestPending,
    dashboardServiceRequestInprogress,
    dashboardServiceRequestCompleted,
  } = useSelector(state => state)

  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    setLoading(
      loadingDashboardServiceRequest ||
        Object.keys(departmentAndServiceKeyToId).length === 0
    )
  }, [loadingDashboardServiceRequest, departmentAndServiceKeyToId])

  useEffect(() => {
    AddDashboardServiceRequestListener(hotelId, dispatch)
  }, [dispatch, hotelId])

  return (
    <>
      <div className='requestsCard-wrp cmnCard-wrp'>
        <div className='cardHead'>
          <h3>{translateTextI18N('Service Requests')}</h3>
          <Link to='/ServiceRequests' className='viewall-link'>
            {translateTextI18N('VIEW ALL')}
          </Link>
        </div>

        <div className='cardBody'>
          <div className='cmnTab'>
            <Tabs defaultActiveKey={defaultSelectedTab} onChange={callback}>
              <TabPane tab={translateTextI18N('Completed')} key='1'>
                <div className='scroller-wrp'>
                  <RequestCardByFilter
                    btnText='Completed'
                    btnClassName='completedBtn'
                    list={dashboardServiceRequestCompleted}
                    loading={loading}
                  />
                </div>
              </TabPane>
              <TabPane tab={translateTextI18N('In Progress')} key='2'>
                <div className='scroller-wrp'>
                  <RequestCardByFilter
                    btnText='In Progress'
                    btnClassName='inprogressBtn'
                    list={dashboardServiceRequestInprogress}
                    loading={loading}
                  />
                </div>
              </TabPane>
              <TabPane tab={translateTextI18N('Pending')} key='3'>
                <div className='scroller-wrp'>
                  <RequestCardByFilter
                    btnText='Pending'
                    btnClassName='pendingBtn'
                    list={dashboardServiceRequestPending}
                    loading={loading}
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

export default RequestsCard
