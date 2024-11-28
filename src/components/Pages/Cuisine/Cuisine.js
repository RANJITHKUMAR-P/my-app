/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useContext, useEffect, useState } from 'react'
import { Table, Button, Form, message, Modal } from 'antd'

import { useDispatch } from 'react-redux'

import { actions } from '../../../Store'

import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'

import {
  PaginationOptions,
  secondsToShowAlert,
} from '../../../config/constants'
import { editCuisineProfile, getImage, Sort } from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import {
  GetCuisineMenu,
  EditCuisine,
  CreateNewCuisine,
  GetCuisineType,
  DeleteCuisineProfile,
} from '../../../services/cuisineMenu'
import PageNamecard from '../../Common/PageNameCard/PageNameCard'
import ReadMore from '../../Common/ReadMore/ReadMore'
import CuisineModal from './CuisineModal'
import SuccessModal from '../../Common/Modals/SuccessModal'
import DeleteCusineModal from '../../Common/Modals/DeleteCuisineModal'
import { AuthContext } from '../../../Router/AuthRouteProvider'

const onFinishFunction = async data => {
  const {
    hotelId,
    showLoader,
    setShowLoader,
    setCreateUserError,
    cuisineName,
    description,
    setIsModalVisible,
    getCuisineFunc,
    editingCuisine,
    cuisineId,
    setShowSuccessModal,
  } = data
  try {
    if (showLoader) return

    setShowLoader(true)
    setCreateUserError('')

    const cuisine = {
      cuisineName,
      description,
      hotelId: hotelId,
    }
    if (editingCuisine) {
      const { success: editSuccess, message: editErrorMessage } =
        await EditCuisine({
          cuisine,
          cuisineId,
        })
      if (!editSuccess) {
        setCreateUserError(editErrorMessage)
        return
      } else {
        setIsModalVisible(false)
        setShowSuccessModal(true)
      }
    } else {
      const { success, message: createUserMessage } = await CreateNewCuisine(
        cuisine
      )
      if (!success) {
        setCreateUserError(createUserMessage)
        return
      } else {
        setShowSuccessModal(true)
      }
    }
    setIsModalVisible(false)
    getCuisineFunc()
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

const Cuisine = () => {
  const { hotelId } = useContext(AuthContext)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [cuisine, setCuisine] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [cuisineName, setCuisineName] = useState('')
  const [description, setDescription] = useState('')
  const [cuisineId, setCuisineId] = useState('')
  const [form] = Form.useForm()
  const [showLoader, setShowLoader] = useState(false)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingCuisine, setEditingCuisine] = useState(false)
  const [userAction, setUserAction] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [cuisineToDelete, setCuisineToDelete] = useState()
  const [createUserError, setCreateUserError] = useState('')
  const [type, setType] = useState([])

  const dispatch = useDispatch()

  const getCuisineFunc = async () => {
    try {
      if (!hotelId) return
      setLoadingData(true)
      let cuisineList = await GetCuisineMenu(hotelId)
      setCuisine(cuisineList)
    } catch (error) {
      console.log({ error })
    } finally {
      setLoadingData(false)
    }
  }
  const getCuisineType = async () => {
    setLoadingData(true)
    try {
      if (!hotelId) return
      let cuisineType = await GetCuisineType(hotelId)
      setType(Sort(cuisineType, 'name'))
    } catch (error) {
      console.log({ error })
    } finally {
      setLoadingData(false)
    }
  }
  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey(['sub1', '10']))
  }, [])

  useEffect(() => {
    getCuisineFunc()
  }, [hotelId])

  useEffect(async () => {
    getCuisineType()
  }, [cuisine, isModalVisible, successMessage])

  const deleteCuisine = async () => {
    try {
      setShowDeleteConfirmation(false)
      setLoadingData(true)
      const { success, message: deleteUserProfileMessage } =
        await DeleteCuisineProfile(cuisineToDelete)
      setLoadingData(false)
      if (success) {
        setShowSuccessModal(true)
        setSuccessMessage('Cuisine deleted successfully')
        setTimeout(() => {
          setShowSuccessModal(false)
        }, secondsToShowAlert)
        getCuisineFunc()
        getCuisineType()
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
    setUserAction(editingCuisine)
    if (!isModalVisible) setEditingCuisine(false)
  }, [isModalVisible])

  const showModal = () => {
    form.resetFields()
    setDescription('')
    setIsModalVisible(true)
  }

  const onFinishAdd = async () => {
    onFinishFunction({
      hotelId,
      showLoader,
      setShowLoader,
      setCreateUserError,
      setSuccessMessage,
      cuisineName,
      description,
      userAction,
      setIsModalVisible,
      getCuisineFunc,
      editingCuisine,
      cuisineId,
      setShowSuccessModal,
    })
  }

  const handleCancel = () => {
    if (showLoader) return
    setIsModalVisible(false)
  }

  const cuisineColumns = [
    {
      title: translateTextI18N('Cuisine Name'),
      dataIndex: 'cuisineName',
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
      render: (_, row) => (
        <div className='tableactionbtn-grp'>
          <button
            onClick={e => {
              e.preventDefault()
              editCuisineProfile({
                row,
                setLoadingData,
                setCuisineName,
                setDescription,
                setCuisineId,
                setEditingCuisine,
                form,
                setIsModalVisible,
              })
            }}
          >
            <img src={getImage('images/tedit.svg')}></img>
          </button>
          <button
            onClick={() => {
              setShowDeleteConfirmation(true)
              setCuisineToDelete(row)
            }}
          >
            <img src={getImage('images/tdelete.svg')}></img>
          </button>
        </div>
      ),
    },
  ]
  const hideDeleteConfirmation = () => setShowDeleteConfirmation(false)
  const getSuccessModalMessage = () => {
    if (successMessage) return successMessage
    return `Cuisine ${userAction ? 'edited' : 'added'} successfully`
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
                title='Cuisine'
                breadcrumb={['Hotel Admin', 'Dining', 'Cuisine']}
              />
            </div>

            <div className='col-12 col-md-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-4 col-md-auto ml-auto'>
                    <Button className='cmnBtn' onClick={showModal}>
                      {translateTextI18N('Add Cuisine')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className='table-wrp'>
                <Table
                  columns={cuisineColumns}
                  dataSource={cuisine}
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

      <CuisineModal
        editingCuisine={editingCuisine}
        isModalVisible={isModalVisible}
        onFinishAdd={onFinishAdd}
        handleCancel={handleCancel}
        setCuisineName={setCuisineName}
        setDescription={setDescription}
        CuisineTypes={type}
        cuisineName={cuisineName}
        description={description}
        createUserError={createUserError}
        showLoader={showLoader}
        form={form}
      />
      <Modal
        visible={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        className='successModal'
        footer={null}
        centered
      >
        <SuccessModal title={getSuccessModalMessage()}></SuccessModal>
      </Modal>

      {/* Delete Modal */}

      <Modal
        onOk={deleteCuisine}
        onCancel={hideDeleteConfirmation}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={showDeleteConfirmation}
      >
        <DeleteCusineModal
          title='Confirm Delete'
          message='There are restaurants associated with this cuisine.'
          extraInfo='Do you wish to continue?'
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
            onClick={deleteCuisine}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
    </>
  )
}

export default Cuisine
