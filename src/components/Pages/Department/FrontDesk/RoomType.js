import React, { useEffect, useState } from 'react'
import { Table, Button } from 'antd'

import Header from '../../../Common/Header/Header'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'
import PageNamecard from '../../../Common/PageNameCard/PageNameCard'
import RoomTypeModal from './RoomTypeModal'
import { useDispatch, useSelector } from 'react-redux'
import {
  DeleteRoomType,
  AddRoomTypeListener,
} from '../../../../services/roomType'
import {
  PaginationOptions,
  secondsToShowAlert,
} from '../../../../config/constants'
import CustomAlert from '../../../Common/CustomAlert/CustomAlert'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import ReadMore from '../../../Common/ReadMore/ReadMore'
import { actions } from '../../../../Store'
import { getImage } from '../../../../config/utils'

const RoomType = () => {
  const { hotelId } = useSelector(state => state)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [roomTypeToEdit, setRoomTypeToEdit] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  const dispatch = useDispatch()
  const { roomTypeListenerAdded, roomTypes } = useSelector(state => state)

  const showModal = () => setIsModalVisible(true)

  const columns = [
    {
      title: translateTextI18N('Sl.No'),
      dataIndex: 'srNo',
      width: 80,
    },
    {
      title: translateTextI18N('Room Type'),
      dataIndex: 'roomName',
      width: 100,
    },
    {
      title: translateTextI18N('Description'),
      dataIndex: 'description',
      width: 505,
      render: (_, row) => <ReadMore text={row.description} />,
    },
    {
      title: translateTextI18N('Action'),
      dataIndex: 'Action',
      width: 80,
      render: (_, _roomType) => (
        <div className='tableactionbtn-grp'>
          <button
            onClick={() => {
              setRoomTypeToEdit(_roomType)
              setIsModalVisible(true)
            }}
          >
            <img alt='' src={getImage('images/tedit.svg')}></img>
          </button>
          <button onClick={() => deleteRoomType(_roomType.id)}>
            <img alt='' src={getImage('images/tdelete.svg')}></img>
          </button>
        </div>
      ),
    },
  ]

  useEffect(() => {
    AddRoomTypeListener(hotelId, roomTypeListenerAdded, dispatch)
  }, [hotelId, roomTypeListenerAdded, dispatch])

  const deleteRoomType = async roomTypeId => {
    try {
      if (showLoader) return
      setShowLoader(true)

      const deleteSuccess = await DeleteRoomType(roomTypeId)
      if (!deleteSuccess) {
        setErrorMessage(
          translateTextI18N('Something went wrong while deleting room type')
        )
        setTimeout(() => setErrorMessage(''), secondsToShowAlert)
      } else {
        setSuccessMessage(translateTextI18N('Room type deleted successfully'))
        setTimeout(() => setSuccessMessage(''), secondsToShowAlert)
      }
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
    } finally {
      setShowLoader(false)
    }
  }

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('4'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='Front Desk'
                breadcrumb={['Department Admin', 'Front Desk', 'Room Type']}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-8 col-md-auto'>
                    <CustomAlert
                      visible={successMessage}
                      message={successMessage}
                      type='success'
                      showIcon={true}
                    />
                    <CustomAlert
                      visible={errorMessage}
                      message={errorMessage}
                      type='error'
                      showIcon={true}
                    />
                  </div>
                  <div className='col-4 col-md-auto ml-auto'>
                    <Button className='cmnBtn' onClick={showModal}>
                      {translateTextI18N('Add Room Types')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className='col-12 col-xl-12'>
              <div className='row'>
                <div className='col-12 col-xl-12'>
                  <div className='table-wrp'>
                    <Table
                      columns={columns}
                      dataSource={roomTypes}
                      pagination={PaginationOptions}
                      scroll={{ y: 580 }}
                      loading={showLoader}
                      rowKey='id'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RoomTypeModal
        roomTypes={roomTypes}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        showLoader={showLoader}
        setShowLoader={setShowLoader}
        hotelId={hotelId}
        roomTypeToEdit={roomTypeToEdit}
        setSuccessMessage={setSuccessMessage}
        setRoomTypeToEdit={setRoomTypeToEdit}
      />
    </>
  )
}

export default RoomType
