/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Modal, Tabs } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AdminActionKey,
  archivedData,
  confirmLabel,
  FandBServiceStatus,
  inProgressLabel,
  realTimeData,
  rejectedLable,
  rejectLabel,
} from '../../../../../config/constants'
import { auth } from '../../../../../config/firebase'
import {
  ActionAdminCancel,
  FormatTimestamp,
  GetAddViewCommentColumn,
  getCommonColumns,
  getJobStartEndImageAndName,
  GetStatusColumn,
  isAssigned,
  toTitleCase,
} from '../../../../../config/utils'
import { AddRestaurantReservationListener } from '../../../../../services/foodAndBeverage'
import { AddRestaurantListener } from '../../../../../services/restaurants'
import { actions } from '../../../../../Store'
import { useCustomI18NTranslatorHook } from '../../../../../utility/globalization'
import Header from '../../../../Common/Header/Header'
import PageNamecard from '../../../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../../../Common/Sidemenu/Sidemenu'
import {
  FAndBTabChange,
  handleConfimOrRejectButton,
  handleStatusChange,
  hideModal,
  showModal,
} from '../FoodAndBeveragesUtils'
import ArchivedFBRestaurants from './ArchivedFBRestaurants'
import RealTimeFBRestaurants from './RealTimeFBRestaurants'
import RequestImageUpload from '../../../../Common/RequestImageUpload'

const { TabPane } = Tabs

const GetSuccessMessage = status =>
  status === inProgressLabel
    ? 'Reservation confirmed successfully'
    : 'Reservation rejected'

const FBRestaurants = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalClickedButton, setModalClickedButton] = useState('')
  const [order, setOrder] = useState({})

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showLoader, setShowLoader] = useState(false)
  const [successMessageType, setSuccessMessageType] = useState('')
  const [savingOrderStatus, setSavingOrderStatus] = useState(false)
  const [restaurantOptions, setRestaurantOptions] = useState([])
  const [resetArchive, setResetArchive] = useState(false)
  const [blockStatusChange, setBlockStatusChange] = useState(false)
  const [tabIndex, setTabIndex] = useState('1')
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const {
    hotelInfo,
    restaurantsListenerAdded,
    restaurants,
    sideMenuOpenKeys,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)
  const hotelId = hotelInfo?.hotelId

  useEffect(() => {
    AddRestaurantListener(hotelId, restaurantsListenerAdded, dispatch)
  }, [restaurantsListenerAdded, dispatch, hotelId])

  useEffect(() => {
    AddRestaurantReservationListener({ hotelId, dispatch })
  }, [hotelId, dispatch])

  useEffect(() => {
    setRestaurantOptions(
      restaurants.map(r => ({ value: r.name, name: r.name }))
    )
  }, [restaurants])

  const acceptRejectOptions = {
    setSavingOrderStatus,
    setSuccessMessage,
    GetSuccessMessage,
    setErrorMessage,
    setIsModalVisible,
  }

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  const {
    assignStaffCol,
    detailCol,
    guestCol,
    noOfGuestCol,
    requestedTimeCol,
    requestTypeCol,
    restaurantNameCol,
    roomNumberCol,
    requestFromCol,
    submittedTimeCol,
    getRatinAndFeedbackCol,
    guestComment,
  } = getCommonColumns({
    translateTextI18N,
    dispatch,
    handleStatusChange,
    userInfo,
    hideAssignButton: tabIndex === '2',
  })

  guestCol.width = 150
  roomNumberCol.width = 100
  restaurantNameCol.width = 150
  noOfGuestCol.width = 100
  detailCol.render = (_, row) => {
    return (
      <a
        className='viewlink'
        onClick={() => {
          showModal(row, setIsModalVisible, setOrder)
          setBlockStatusChange(
            isAssigned(row.assignedToId) &&
              !childIdToParentIds?.[row.assignedToId]?.includes(
                auth.currentUser.uid
              )
          )
        }}
      >
        {translateTextI18N('View')}
      </a>
    )
  }

  const fbrcolumns = [
    guestCol,
    roomNumberCol,
    restaurantNameCol,
    requestFromCol,
    noOfGuestCol,
    requestTypeCol,
    detailCol,
    assignStaffCol,
    guestComment,
    GetAddViewCommentColumn({
      dispatch,
      translateTextI18N,
      userInfo,
    }),
    ...getJobStartEndImageAndName({ translateTextI18N, showImageUploadPopup }),
    GetStatusColumn({
      dispatch,
      handleStatusChange,
      hotelId,
      isFAndB: true,
      setErrorMessage,
      setShowLoader,
      setSuccessMessage,
      statusOptions: FandBServiceStatus,
      translateTextI18N,
      userInfo,
      staffListForLoggedManager,
      childIdToParentIds,
      staffHierarchyErrorLogs,
    }),
    ActionAdminCancel({
      dispatch,
      translateTextI18N,
      userInfo,
      childIdToParentIds,
      staffHierarchyErrorLogs,
    }),
    submittedTimeCol,
    requestedTimeCol,
    requestedTimeCol,
    ...getRatinAndFeedbackCol(),
  ]

  useEffect(() => {
    if (!sideMenuOpenKeys?.includes('1')) {
      dispatch(actions.setSideMenuOpenKeys('1'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let props = {
    fbrcolumns,
    isModalVisible,
    setIsModalVisible,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    showLoader,
    setShowLoader,
    restaurantOptions,
    translateTextI18N,
    handleStatusChange,
    statusOptions: FandBServiceStatus,
    isFAndB: true,
    hotelId,
    successMessageType,
    setSuccessMessageType,
  }

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp' id='fbResSec'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12' id='fbResDiv'>
              <PageNamecard
                title='Food & Beverages'
                breadcrumb={[
                  'Department Admin',
                  'Food & Beverages',
                  'Reservation',
                ]}
              />
            </div>
          </div>

          <Tabs
            activeKey={tabIndex}
            className='col-12 col-12'
            onChange={e => {
              FAndBTabChange({ setSuccessMessage, setErrorMessage })
              if (e === '2') {
                setResetArchive(true)
              }
              setTabIndex(e)
            }}
          >
            <TabPane tab={translateTextI18N(realTimeData)} key='1'>
              <RealTimeFBRestaurants {...props} />
            </TabPane>
            <TabPane tab={translateTextI18N(archivedData)} key='2'>
              <ArchivedFBRestaurants
                {...props}
                resetArchive={resetArchive}
                setResetArchive={setResetArchive}
              />
            </TabPane>
          </Tabs>
        </div>
      </section>

      <Modal
        title={translateTextI18N('Order Details')}
        visible={isModalVisible}
        onOk={() => hideModal(setIsModalVisible)}
        onCancel={() => hideModal(setIsModalVisible)}
        className='orderdetailsModal cmnModal'
        footer={null}
        centered
      >
        <div className='orderdetails-wrp'>
          <div className='ordertypeDetails'>
            <p>{order?.restaurantDescription}</p>
            <h3>{FormatTimestamp(order?.createdAt)}</h3>
          </div>
          <div className='orderpersonDetails'>
            <h4>
              {toTitleCase(order?.guest?.name)}{' '}
              {toTitleCase(order?.guest?.surName)}
            </h4>
            <h6>
              {translateTextI18N('Room No')} : {order?.roomNumber}
            </h6>
          </div>

          <div className='restaurantorderdetails'>
            <table>
              <tr>
                <th>{translateTextI18N('No Of Seats Required')}</th>
                <td className='text-right'>{order?.noOfGuest}</td>
              </tr>
              <tr>
                <th>{translateTextI18N('Requested Time')}</th>
                <td className='text-right'>
                  {FormatTimestamp(order?.requestedTime)}
                </td>
              </tr>
            </table>
          </div>
          {blockStatusChange ? (
            <div
              className='block-accept-reject-order'
              style={{ paddingTop: '5px' }}
            >
              {`You can not accept/reject order as assigned to ${order.assignedToName}`}
            </div>
          ) : null}
        </div>

        <div className='modalFooter'>
          {AdminActionKey in order ? null : (
            <>
              <Button
                className='grayBtn'
                key='back'
                onClick={() =>
                  handleConfimOrRejectButton({
                    acceptRejectOptions,
                    buttonLable: rejectLabel,
                    order,
                    setModalClickedButton,
                    status: rejectedLable,
                    userInfo,
                  })
                }
                loading={
                  savingOrderStatus && modalClickedButton === rejectLabel
                }
                disabled={savingOrderStatus || blockStatusChange}
              >
                <th>{translateTextI18N(rejectLabel)}</th>
              </Button>
              <Button
                className='blueBtn ml-3 ml-lg-4'
                key='submit'
                onClick={() =>
                  handleConfimOrRejectButton({
                    acceptRejectOptions,
                    buttonLable: confirmLabel,
                    order,
                    setModalClickedButton,
                    status: inProgressLabel,
                    userInfo,
                  })
                }
                loading={
                  savingOrderStatus && modalClickedButton === confirmLabel
                }
                disabled={savingOrderStatus || blockStatusChange}
              >
                <th>{translateTextI18N(confirmLabel)}</th>
              </Button>
            </>
          )}
        </div>
      </Modal>
      {visibleImageUpload && (
        <RequestImageUpload
          visibleImageUpload={visibleImageUpload}
          row={requestRowInfo}
          setVisibleImageUpload={setVisibleImageUpload}
          imageUploadType={imageUploadType}
        />
      )}
    </>
  )
}

export default FBRestaurants
