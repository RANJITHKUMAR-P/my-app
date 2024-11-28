/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Tabs } from 'antd'
import Modal from 'antd/lib/modal/Modal'
import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AdminActionKey,
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
  handleConfimOrRejectButton,
  handleStatusChange,
  hideModal,
  showModal,
} from '../../FoodandBeverages/FoodAndBeveragesUtils'
import RealtimeRoomServiceTwo from './RealtimeRoomServiceTwo'
import RequestImageUpload from '../../../../Common/RequestImageUpload'

const { TabPane } = Tabs

const GetSuccessMessage = status =>
  status === inProgressLabel ? 'Order confirmed successfully' : 'Order rejected'

const FBRoomserviceTwo = () => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [order, setOrder] = useState({})
  const {
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
    requestTypeCol,
    roomNumberCol,
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
                title='Doctor on Call'
                breadcrumb={
                  isHotelAdmin
                    ? ['Doctor On Call', 'Medical Service']
                    : ['Department Admin', 'Requests', 'Medical Service']
                }
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='row'>
                <Tabs activeKey={tabIndex} className='col-12 col-12'>
                  <TabPane tab={translateTextI18N(realTimeData)} key='1'>
                    <RealtimeRoomServiceTwo {...props} />
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
                {/* <th>{translateTextI18N('Dish')} </th> */}
                <th width='300'>
                  {' '}
                  {translateTextI18N('Medical Service Name')}{' '}
                </th>
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
            <table></table>
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

export default FBRoomserviceTwo
