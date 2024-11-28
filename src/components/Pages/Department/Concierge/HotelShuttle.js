/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useContext, useEffect, useState } from 'react'
import { Table, Button, Form, message, Modal } from 'antd'

import Header from '../../../Common/Header/Header'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'

import {
  PaginationOptions,
  secondsToShowAlert,
} from '../../../../config/constants'
import { editHotelShuttle, getImage } from '../../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import {
  GetHotelShuttle,
  EditHotelShuttle,
  CreateNewHotelShuttle,
  DeleteHotelShuttle,
} from '../../../../services/hotelShuttle'
import PageNamecard from '../../../Common/PageNameCard/PageNameCard'
import ReadMore from '../../../Common/ReadMore/ReadMore'
import SuccessModal from '../../../Common/Modals/SuccessModal'
import { AuthContext } from '../../../../Router/AuthRouteProvider'
import HotelShuttleModal from './HotelShuttleModal'
import DeleteCuisineModal from '../../../Common/Modals/DeleteCuisineModal'

const onFinishFunctionAdd = async data => {
  const {
    hotelId,
    showLoader,
    setShowLoader,
    setCreateUserError,
    destination,
    description,
    setIsModalVisible,
    getHotelShuttleFunc,
    editingHotelShuttle,
    hotelShuttleId,
    setShowSuccessModal,
  } = data
  try {
    if (showLoader) return

    setShowLoader(true)
    setCreateUserError('')

    const hotelShuttle = {
      destination,
      description,
      hotelId: hotelId,
    }
    if (editingHotelShuttle) {
      const { success: editSuccess, message: editErrorMessage } =
        await EditHotelShuttle({
          hotelShuttle,
          hotelShuttleId,
        })
      if (!editSuccess) {
        setCreateUserError(editErrorMessage)
        return
      } else {
        setIsModalVisible(false)
        setShowSuccessModal(true)
      }
    } else {
      const { success, message: createUserMessage } =
        await CreateNewHotelShuttle(hotelShuttle)
      if (!success) {
        setCreateUserError(createUserMessage)
        return
      } else {
        setShowSuccessModal(true)
      }
    }
    setIsModalVisible(false)
    getHotelShuttleFunc()
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
  } finally {
    setShowLoader(false)
  }
}

function handleErrorMessage(data) {
  const { createUserError, setCreateUserError } = data
  if (createUserError)
    setTimeout(() => setCreateUserError(''), secondsToShowAlert)
}

const HotelShuttle = () => {
  const { hotelId } = useContext(AuthContext)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [destination, setDestination] = useState('')
  const [loadingData, setLoadingData] = useState(false)
  const [description, setDescription] = useState('')
  const [form] = Form.useForm()
  const [showLoader, setShowLoader] = useState(false)
  const [hotelShuttle, setHotelShuttle] = useState([])
  const [hotelShuttleId, setHotelShuttleId] = useState('')
  const [selectedRow, setSelectedRow] = useState({})

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingHotelShuttle, setEditingHotelShuttle] = useState(false)
  const [userAction, setUserAction] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [hotelShuttleToDelete, setHotelShuttleToDelete] = useState()
  const [createUserError, setCreateUserError] = useState('')

  const getHotelShuttleFunc = async () => {
    try {
      if (!hotelId) return
      setLoadingData(true)
      const data = await GetHotelShuttle(hotelId)
      setHotelShuttle(data)
    } catch (error) {
      console.log({ error })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    getHotelShuttleFunc()
  }, [hotelId])

  const deleteHotelShuttle = async () => {
    try {
      setShowDeleteConfirmation(false)
      setLoadingData(true)
      const { success, message: deleteUserProfileMessage } =
        await DeleteHotelShuttle(hotelShuttleToDelete)
      setLoadingData(false)
      if (success) {
        setShowSuccessModal(true)
        setSuccessMessage('Destination deleted successfully')
        setTimeout(() => {
          setShowSuccessModal(false)
        }, secondsToShowAlert)
        setSelectedRow({})
        getHotelShuttleFunc()
      } else {
        message.error(deleteUserProfileMessage)
      }
    } catch (error) {
      console.log(error)
      message.error('Something went wrong! Please try again!')
    }
  }

  useEffect(() => {
    if (successMessage)
      setTimeout(() => setSuccessMessage(''), secondsToShowAlert)
  }, [successMessage])

  useEffect(() => {
    handleErrorMessage({
      createUserError,
      setCreateUserError,
    })
  }, [createUserError])

  useEffect(() => {
    setUserAction(editingHotelShuttle)
    if (!isModalVisible) setEditingHotelShuttle(false)
  }, [isModalVisible])

  const showModal = () => {
    form.resetFields()
    setDestination('')
    setDescription('')
    setIsModalVisible(true)
  }
  const hideDeleteConfirmation = () => {
    setShowDeleteConfirmation(false)
    setSelectedRow({})
  }
  const onFinishAdd = async () => {
    onFinishFunctionAdd({
      hotelId,
      showLoader,
      setShowLoader,
      setCreateUserError,
      setSuccessMessage,
      destination,
      description,
      userAction,
      setIsModalVisible,
      getHotelShuttleFunc,
      editingHotelShuttle,
      hotelShuttleId,
      setShowSuccessModal,
      hotelShuttle,
    })
  }

  const handleCancel = () => {
    if (showLoader) return
    setIsModalVisible(false)
    setSelectedRow({})
  }

  const HotelShuttleColumns = [
    {
      title: translateTextI18N('Destination Name'),
      dataIndex: 'destination',
      width: 120,
    },
    {
      title: translateTextI18N('Description'),
      dataIndex: 'Description',
      width: 400,
      render: (_, row) => <ReadMore text={row.description} />,
    },

    {
      title: translateTextI18N('Action'),
      dataIndex: 'Action',
      width: 80,
      render: (id, row) => (
        <div id={id} className='tableactionbtn-grp'>
          <button
            onClick={e => {
              e.preventDefault()
              editHotelShuttle({
                row,
                setLoadingData,
                setDestination,
                setDescription,
                setHotelShuttleId,
                setEditingHotelShuttle,
                form,
                setIsModalVisible,
                setSelectedRow,
              })
            }}
          >
            <img src={getImage('images/tedit.svg')}></img>
          </button>
          <button
            onClick={() => {
              setShowDeleteConfirmation(true)
              setHotelShuttleToDelete(row)
            }}
          >
            <img src={getImage('images/tdelete.svg')}></img>
          </button>
        </div>
      ),
    },
  ]
  const getSuccessModalText = () => {
    if (successMessage) return successMessage
    return `Destination ${userAction ? 'edited' : 'added'} successfully`
  }

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='Concierge'
                breadcrumb={['Department Admin', 'Concierge', 'Hotel Shuttle']}
              />
            </div>

            <div className='col-12 col-md-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-4 col-md-auto ml-auto'>
                    <Button
                      className='cmnBtn'
                      onClick={() => {
                        setSelectedRow({})
                        showModal()
                      }}
                    >
                      {translateTextI18N('Add Destination')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className='table-wrp'>
                <Table
                  columns={HotelShuttleColumns}
                  dataSource={hotelShuttle}
                  pagination={PaginationOptions}
                  scroll={{ y: 382 }}
                  loading={loadingData}
                  rowKey='id'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <HotelShuttleModal
        editingHotelShuttle={editingHotelShuttle}
        isModalVisible={isModalVisible}
        onFinishAdd={onFinishAdd}
        handleCancel={handleCancel}
        setDestination={setDestination}
        setDescription={setDescription}
        destination={destination}
        description={description}
        createUserError={createUserError}
        showLoader={showLoader}
        form={form}
        HotelShuttle={hotelShuttle}
        selectedRow={selectedRow}
      />
      <Modal
        visible={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        className='successModal'
        footer={null}
        centered
      >
        <SuccessModal
          title={translateTextI18N(getSuccessModalText())}
        ></SuccessModal>
      </Modal>

      {/* Delete Modal */}

      <Modal
        onOk={deleteHotelShuttle}
        onCancel={hideDeleteConfirmation}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={showDeleteConfirmation}
      >
        <DeleteCuisineModal
          title='Confirm Delete'
          message='Do you wish to continue?'
          extraInfo=''
        />

        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={hideDeleteConfirmation}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={deleteHotelShuttle}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
    </>
  )
}

export default HotelShuttle
