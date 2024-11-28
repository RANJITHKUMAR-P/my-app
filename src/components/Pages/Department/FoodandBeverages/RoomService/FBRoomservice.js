/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Tabs } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AdminActionKey,
  archivedData,
  confirmLabel,
  FandBServiceStatus,
  HotelAdminRole,
  inProgressLabel,
  realTimeData,
  rejectedLable,
  rejectLabel,
  unAssignTaskErrorMsg,
} from '../../../../../config/constants'
import { auth } from '../../../../../config/firebase'
import {
  ActionAdminCancel,
  FormatTimestamp,
  GetAddViewCommentColumn,
  getCommonColumns,
  getJobStartEndImageAndName,
  GetStatusColumn,
  GetTranlatedOrderType,
  GetTranslatedName,
  isAssigned,
  Ternary,
  toTitleCase,
} from '../../../../../config/utils'
import { actions } from '../../../../../Store'
import { useCustomI18NTranslatorHook } from '../../../../../utility/globalization'
import { Amount } from '../../../../Common/Amount/Amount'
import Header from '../../../../Common/Header/Header'
import PageNamecard from '../../../../Common/PageNameCard/PageNameCard'
import ReadMore from '../../../../Common/ReadMore/ReadMore'
import SideMenu from '../../../../Common/Sidemenu/Sidemenu'
import {
  FAndBTabChange,
  handleConfimOrRejectButton,
  handleStatusChange,
  hideModal,
  showModal,
} from '../FoodAndBeveragesUtils'
import ArchiveRoomService from './ArchiveRoomService'
import RealtimeRoomService from './RealtimeRoomService'
import RequestImageUpload from '../../../../Common/RequestImageUpload'

const { TabPane } = Tabs

const GetSuccessMessage = status =>
  status === inProgressLabel ? 'Order confirmed successfully' : 'Order rejected'

const FBRoomservice = () => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [order, setOrder] = useState({})
  const {
    cuisines,
    currentLanguage,
    hotelInfo,
    isHotelAdmin,
    isManagementStaff,
    sideMenuOpenKeys,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const hotelId = hotelInfo?.hotelId

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalClickedButton, setModalClickedButton] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [savingOrderStatus, setSavingOrderStatus] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [successMessageType, setSuccessMessageType] = useState('')
  const [resetArchive, setResetArchive] = useState(false)
  const [blockStatusChange, setBlockStatusChange] = useState(false)
  const [tabIndex, setTabIndex] = useState('1')
  const dispatch = useDispatch()
  const [requestRowInfo, setRequestRowInfo] = useState(null)
  const [visibleImageUpload, setVisibleImageUpload] = useState(false)
  const [imageUploadType, setImageUploadType] = useState(null)

  useEffect(() => {
    if (!sideMenuOpenKeys?.includes('1')) {
      dispatch(actions.setSideMenuOpenKeys('1'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showImageUploadPopup = (row, type) => {
    setRequestRowInfo(row)
    setVisibleImageUpload(true)
    setImageUploadType(type)
  }

  const {
    assignStaffCol,
    billAmountCol,
    detailCol,
    guestCol,
    orderedTimeCol,
    orderTypeCol,
    requestTypeCol,
    roomNumberCol,
    requestFromCol,
    getRatinAndFeedbackCol,
    guestComment,
  } = getCommonColumns({
    translateTextI18N,
    dispatch,
    handleStatusChange,
    hideAssignButton: tabIndex === '2',
    userInfo,
  })

  const acceptRejectOptions = {
    setSavingOrderStatus,
    setSuccessMessage,
    GetSuccessMessage,
    setErrorMessage,
    setIsModalVisible,
  }

  guestCol.width = 150

  orderTypeCol.render = mealOfTheDay =>
    GetTranlatedOrderType(mealOfTheDay, cuisines, currentLanguage)

  detailCol.width = 90
  detailCol.render = (_, row) => {
    return (
      <asetIsModalVisible
        className='viewlink'
        onClick={() => {
          showModal(row, setIsModalVisible, setOrder)

          if (!row.assignedToId && userInfo.roles.includes(HotelAdminRole)) {
            setBlockStatusChange(true)
            return
          }

          setBlockStatusChange(
            isAssigned(row.assignedToId) &&
              !childIdToParentIds?.[row.assignedToId]?.includes(
                auth.currentUser.uid
              )
          )
        }}
      >
        {translateTextI18N('View')}
      </asetIsModalVisible>
    )
  }

  const fbcolumns = ({ setShowLoader }) => [
    guestCol,
    roomNumberCol,
    orderTypeCol,
    requestFromCol,
    billAmountCol,
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
    orderedTimeCol,
    ...getRatinAndFeedbackCol(),
  ]

  let props = {
    order,
    setOrder,
    fbcolumns,
    isModalVisible,
    setIsModalVisible,
    errorMessage,
    setErrorMessage,
    savingOrderStatus,
    setSavingOrderStatus,
    successMessage,
    setSuccessMessage,
    translateTextI18N,
    acceptRejectOptions,
    successMessageType,
    setSuccessMessageType,
  }

  const validatedRequestActionMessage = useMemo(() => {
    if (!blockStatusChange) return null

    if ((isHotelAdmin || isManagementStaff) && !order.assignedToId)
      return unAssignTaskErrorMsg

    if (!(isHotelAdmin || isManagementStaff) && order.assignedToId)
      return `You cannot accept/reject order as assigned to ${order.assignedToName}`
  }, [
    blockStatusChange,
    isHotelAdmin,
    isManagementStaff,
    order.assignedToId,
    order.assignedToName,
  ])

  return (
    <>
      <Header />
      <SideMenu />
      <section id='rsmsec' className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                id='rsmsepgnc'
                title='Food & Beverages'
                breadcrumb={
                  isHotelAdmin
                    ? ['Hotel Admin', 'Dining', 'Room Service']
                    : [
                        'Department Admin',
                        'Food & Beverages',
                        'Requests',
                        'Room Service',
                      ]
                }
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row'>
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
                    <RealtimeRoomService {...props} />
                  </TabPane>
                  <TabPane tab={translateTextI18N(archivedData)} key='2'>
                    <ArchiveRoomService
                      {...props}
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

      <Modal
        title={translateTextI18N('Order Details')}
        visible={isModalVisible}
        onOk={() => hideModal(setIsModalVisible)}
        onCancel={() => hideModal(setIsModalVisible)}
        className='orderdetailsModal room-service-modal cmnModal'
        footer={null}
        centered
      >
        <div className='orderdetails-wrp'>
          <div className='ordertypeDetails'>
            <h3>
              {translateTextI18N('Order Type')} -{' '}
              {GetTranlatedOrderType(
                order?.orderType,
                cuisines,
                currentLanguage
              )}
            </h3>
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

          <div className='invoicebillTable'>
            <table>
              <tr>
                <th>{translateTextI18N('Dish')} </th>
                <th width='300'> {translateTextI18N('Description')} </th>
                <th width='100'>{translateTextI18N('Rate')}</th>
                <th width='50'>{translateTextI18N('Qty')}</th>
                <th width='100' className='text-right'>
                  {translateTextI18N('Amount')}
                </th>
              </tr>
              {order?.menuDetail
                ? order?.menuDetail.map(item => (
                    <tr>
                      <td>
                        {GetTranslatedName(item, currentLanguage, 'name')}
                      </td>
                      <td>
                        <ReadMore
                          text={item?.description || ''}
                          charLength={75}
                        />
                      </td>
                      <td>
                        <Amount value={item.price} />
                      </td>
                      <td>{item.qty}</td>
                      <td className='text-right'>
                        <Amount value={item.amount} />
                      </td>
                    </tr>
                  ))
                : null}
            </table>
          </div>
          <div className='invoicetotalTable'>
            <table>
              <tr>
                <th>
                  <strong>{translateTextI18N('Total')}</strong>
                </th>
                <td className='text-right'>
                  <Amount value={order?.billAmount} />
                </td>
              </tr>
            </table>
          </div>
          <div className='orderpersonDetails taxes'>
            <h6>
              <i>
                {translateTextI18N('Disclaimer **** Extra charges may apply')}
              </i>
            </h6>
          </div>
          {Ternary(
            validatedRequestActionMessage,
            <div className='block-accept-reject-order'>
              {validatedRequestActionMessage}
            </div>,
            null
          )}
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
                disabled={savingOrderStatus || validatedRequestActionMessage}
              >
                {translateTextI18N(rejectLabel)}
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
                disabled={savingOrderStatus || validatedRequestActionMessage}
              >
                {translateTextI18N(confirmLabel)}
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

export default FBRoomservice
