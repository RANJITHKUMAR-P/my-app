/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useContext, useEffect, useState } from 'react'
import { Table, Form, Modal, Button, message} from 'antd'
import moment from 'moment'
import { useDispatch } from 'react-redux'

import Header from '../../../Common/Header/Header'
import SideMenu from '../../../Common/Sidemenu/Sidemenu'

import { secondsToShowAlert } from '../../../../config/constants'
import { editSpa, getImage } from '../../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../../utility/globalization'
import PageNamecard from '../../../Common/PageNameCard/PageNameCard'
import ReadMore from '../../../Common/ReadMore/ReadMore'
import SuccessModal from '../../../Common/Modals/SuccessModal'
import { AuthContext } from '../../../../Router/AuthRouteProvider'
import {
  CreateService,
  EditService,
  DeleteService,
  AddSpaListener,
  AddSaloonListener,
  AddGymListener,
} from '../../../../services/spaWellness'
import ServiceModal from './ServiceModal'
import DeleteModal from '../../../Common/Modals/DeleteModal'
import { actions } from '../../../../Store'
import MenuGallery from '../../../Pages/Restaurant/MenuGallery'
import MenuUpload from '../../../Pages/Restaurant/MenuUpload'
import { GetSpa, GetGym, GetSaloon, DeleteSpaMenu, DeleteGymMenu, DeleteSaloonMenu } from '../../../../services/spaWellness'



const onFinishServiceAdd = async data => {
  const {
    hotelId,
    showLoader,
    setShowLoader,
    setCreateUserError,
    description,
    setIsModalVisible,
    serviceId,
    setShowSuccessModal,
    serviceName,
    name,
    setSuccessMessage,
    image,
    deleteImage,
    imageUrl,
    imageName,
    openingTime,
    closingTime,
    closed,
  } = data
  try {
    if (showLoader) return

    setShowLoader(true)
    setCreateUserError('')
    const service = {
      serviceName,
      name,
      description,
      hotelId: hotelId,
      openingTime: openingTime ? openingTime : null,
      closingTime: closingTime ? closingTime : null,
      closed: closed ? closed : false,
    }
    if (serviceId) {
      const { success: editSuccess, message: editErrorMessage } =
        await EditService({
          service,
          serviceId,
          imageUrl,
          image,
          deleteImage,
          imageName,
        })
      if (!editSuccess) {
        setCreateUserError(editErrorMessage)
        return
      } else {
        setSuccessMessage(editErrorMessage)
        setIsModalVisible(false)
        setShowSuccessModal(true)
      }
    } else {
      const { success, message: createUserMessage } = await CreateService(
        service,
        image
      )
      if (!success) {
        setCreateUserError(createUserMessage)
        return
      } else {
        setSuccessMessage(createUserMessage)
        setShowSuccessModal(true)
      }
    }
    setIsModalVisible(false)
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

const SpaWellnessDetailsInfo = () => {
  const {
    hotelId,

    spa,
    spaListenerAdded,
    LoadingSpa,

    saloon,
    saloonListenerAdded,
    LoadingSaloon,

    gym,
    gymListenerAdded,
    LoadingGym,
  } = useContext(AuthContext)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [name, setName] = useState('')
  const [spas, setSpas] = useState([])
  const [filteredSpa, setFilteredSpa] = useState([])
  const [gyms, setGyms] = useState([])
  const [filteredGym, setFilteredGym] = useState([])
  const [saloons, setSaloons] = useState([])
  const [filteredSaloon, setFilteredSaloon] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [description, setDescription] = useState('')
  const [form] = Form.useForm()
  const [showLoader, setShowLoader] = useState(false)
  const [serviceId, setServiceId] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [requests, setRequests] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editing, setEditing] = useState(false)
  const [userAction, setUserAction] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createUserError, setCreateUserError] = useState('')
  const [profileImageError, setProfileImageError] = useState('')
  const [image, setImage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageName, setImageName] = useState('')
  const [deleteImage, setDeleteImage] = useState(false)
  const [showDeletConfirmation, setShowDeletConfirmation] = useState(false)
  const [openingTime, setOpeningTime] = useState(null)
  const [closingTime, setClosingTime] = useState(null)
  const [closed, setClosed] = useState(false)
  const [menuUploadData, setMenuUploadData] = useState(null)
  const [showDeleteMenuModal, setShowDeleteMenuModal] = useState(false)
  const [spaToDelete, setSpaToDelete] = useState()
  const [gymToDelete, setGymToDelete] = useState()
  const [saloonToDelete, setSaloonToDelete] = useState()
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)


  const dispatch = useDispatch()

  const timeFormat = 'HH:mm'

  const clearImage = _e => {
    setImage(null)
    setImageUrl(null)
  }

  const closingTimeFunction = e => {
    if (e) setClosingTime(moment(e).format(timeFormat))
    else setClosingTime(null)
  }

  const openingTimeFunction = e => {
    if (e) setOpeningTime(moment(e).format(timeFormat))
    else setOpeningTime(null)
  }

  useEffect(() => {
    AddSpaListener(hotelId, spaListenerAdded, dispatch)
  }, [dispatch, hotelId, spaListenerAdded])

  useEffect(() => {
    AddSaloonListener(hotelId, saloonListenerAdded, dispatch)
  }, [dispatch, hotelId, saloonListenerAdded])

  useEffect(() => {
    AddGymListener(hotelId, gymListenerAdded, dispatch)
  }, [dispatch, gymListenerAdded, hotelId])

  useEffect(() => {
    const filteredRequests = GetFilteredRequests()
    setRequests(filteredRequests)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gym, spa, saloon])

  const deleteFoodMenuItem = async () => {
    deleteFoodMenuItemFunc()
  }

  const deleteFoodMenuItemFunc = async () => {
    try {
      setShowDeletConfirmation(false)
      setShowLoader(true)
      const { success, message: deleteUserMessage } = await DeleteService(
        serviceId,
        serviceName
      )
      if (!success) {
        setCreateUserError(deleteUserMessage)
        return
      } else {
        setSuccessMessage(deleteUserMessage)
        setIsModalVisible(false)
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
    } finally {
      setShowLoader(false)
    }
  }

  const GetFilteredRequests = () => {
    if (!LoadingSpa && !LoadingSaloon && !LoadingGym) {
      if (spa.length === 0) {
        dispatch(
          actions.setSpa([
            ...spa,
            { name: '', description: '', id: '', serviceName: 'Spa' },
          ])
        )
      }
      if (saloon.length === 0) {
        dispatch(
          actions.setSaloon([
            ...saloon,
            { name: '', description: '', id: '', serviceName: 'Saloon' },
          ])
        )
      }
      if (gym.length === 0) {
        dispatch(
          actions.setGym([
            ...gym,
            { name: '', description: '', id: '', serviceName: 'Gym' },
          ])
        )
      }
    }

    return [...spa, ...saloon, ...gym]
  }

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('1'))
  }, [dispatch])

  useEffect(() => {
    if (profileImageError)
      setTimeout(() => setProfileImageError(''), secondsToShowAlert)
  }, [profileImageError])

  useEffect(() => {
    handleErrorMessage({
      createUserError,
      setCreateUserError,
    })
  }, [createUserError])

  useEffect(() => {
    setUserAction(editing)
    if (!isModalVisible) setEditing(false)
  }, [editing, isModalVisible])

  const onFinishAdd = async () => {
    onFinishServiceAdd({
      hotelId,
      showLoader,
      setShowLoader,
      setCreateUserError,
      setSuccessMessage,
      name,
      description,
      userAction,
      setIsModalVisible,
      editing,
      serviceId,
      setShowSuccessModal,
      serviceName,
      image,
      deleteImage,
      imageUrl,
      imageName,
      openingTime,
      closingTime,
      closed,
    })
  }

  const handleCancel = () => {
    if (showLoader) return
    setIsModalVisible(false)
    form.resetFields()
  }

  const showMenuUploadPopup = row => {

    setMenuUploadData(row)
  }

  const validateMenu = async () => {
    // validateMenuFunc({ file, row, setLoadingData, hotelId, getRestaurantsData })
  }

  const getData = async (getDataFunc, setFunc, setFilteredFunc) => {
    try {
      setLoadingData(true);
      const dataList = await getDataFunc(hotelId);
      setFunc(dataList);
      setFilteredFunc(dataList);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoadingData(false);
    }
  };
  
  const getSpaData = () => {
    getData(GetSpa, setSpas, setFilteredSpa);
  };
  
  const getGymData = () => {
    getData(GetGym, setGyms, setFilteredGym);
  };
  
  const getSaloonData = () => {
    getData(GetSaloon, setSaloons, setFilteredSaloon);
  };
  
  const updateMenuData = () => {
    getSpaData();
    getGymData();
    getSaloonData();
    setMenuUploadData(null);
  };
  

  const deleteMenu = async () => {
    try {
      setShowDeleteConfirmation(false);
      setLoadingData(true);
  
      const deleteOperation = async (deleteFn, deleteId, setDeleteFn, setShowDeleteModalFn) => {
        if (deleteId) {
          const result = await deleteFn(deleteId);
          const success = result?.success || false;
          const deleteUserProfileMessage = result?.message || '';
          setLoadingData(false);
          setDeleteFn(null);
          setShowDeleteModalFn(false);
  
          return { success, deleteUserProfileMessage };
        }
  
        return { success: false, deleteUserProfileMessage: '' };
      };
  
      const spaResult = await deleteOperation(DeleteSpaMenu, spaToDelete?.id, setSpaToDelete, setShowDeleteMenuModal);
      const gymResult = await deleteOperation(DeleteGymMenu, gymToDelete?.id, setGymToDelete, setShowDeleteMenuModal);
      const saloonResult = await deleteOperation(DeleteSaloonMenu, saloonToDelete?.id, setSaloonToDelete, setShowDeleteMenuModal);
  
      const success = spaResult.success || gymResult.success || saloonResult.success;
      const deleteUserProfileMessage = spaResult.userProfileMessage || gymResult.userProfileMessage || saloonResult.userProfileMessage;
  
      if (success) {
        setSuccessMessage('Deleted successfully');
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          setSuccessMessage('');
        }, secondsToShowAlert);
  
        getSpaData();
        getSaloonData();
        getGymData();
      } else {
        message.error(deleteUserProfileMessage);
      }
    } catch (error) {
      console.log(error);
      setSpaToDelete(null);
      setGymToDelete(null);
      setSaloonToDelete(null);
      message.error('Something went wrong! Please try again!');
    }
  };
  
  



  const HotelShuttleColumns = [
    {
      title: translateTextI18N('Service'),
      dataIndex: 'serviceName',
      width: 120,
      render: (_, row) => {
        return (
          <div className='tableuser'>
            <span>{translateTextI18N(row?.serviceName)}</span>
          </div>
        )
      },
    },
    {
      title: translateTextI18N('Brand Name'),
      dataIndex: 'name',
      width: 230,
      render: (_, row) => (
        <div className='tableuser'>
          {!row.name ? (
            <span>-</span>
          ) : (
            <figure>
              <img
                src={row?.imageUrl || getImage('images/cam.png')}
                alt='Logo'
                width='35'
                height='35'
                className='userImage'
              ></img>
            </figure>
          )}
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      title: translateTextI18N('Description'),
      dataIndex: 'description',
      width: 300,
      render: (_, row) => <ReadMore text={row?.description || '-'} />,
    },
    {
      title: translateTextI18N('Menu Upload'),
      dataIndex: 'menu',
      width: 300,
      render: (_, row) => {
        const menuAvailable = row.menu && row.menu.length > 0
        const linkStyle = !menuAvailable
          ? { color: '#00000040 !important', cursor: 'not-allowed' }
          : {}
        return (
          <>
            <a
              onClick={() => showMenuUploadPopup(row)}
              className='viewlink'
              rel='noopener noreferrer'
            >
              {translateTextI18N('Upload')}
            </a>
            {menuAvailable && <MenuGallery menu={row.menu} style={linkStyle} />}
            {!menuAvailable && (
              <a
                className='viewlink'
                rel='noopener noreferrer'
                disabled={true}
                style={linkStyle}
              >
                {translateTextI18N('View')}
              </a>
            )}
            <a
              onClick={() => {
                if (menuAvailable) {
                  setShowDeleteMenuModal(true)
                  if (row.serviceName === 'Gym') {
                    setGymToDelete(row)
                  } else if (row.serviceName === 'Spa') {
                    setSpaToDelete(row)
                  } else if (row.serviceName === 'Saloon') {
                    setSaloonToDelete(row)
                  }
                }
              }}
              style={linkStyle}
              className='viewlink'
              rel='noopener noreferrer'
              disabled={!row.menu || row.menu.length < 1}
            >
              {translateTextI18N('Delete')}
            </a>
          </>
        )
      },
    },

    {
      title: translateTextI18N('Action'),
      dataIndex: 'Action',
      width: 180,
      render: (id, row) => (
        <div id={id} className='tableactionbtn-grp'>
          <button
            onClick={e => {
              e.preventDefault()
              editSpa({
                row,
                setLoadingData,
                setName,
                setDescription,
                setServiceId,
                setServiceName,
                form,
                setIsModalVisible,
                setImage,
                setImageUrl,
                setDeleteImage,
                setImageName,
                setOpeningTime,
                setClosingTime,
                setClosed,
              })
            }}
          >
            {translateTextI18N(row.id !== '' ? 'Edit Info' : 'Add Info')}
          </button>
          {row.id !== '' && (
            <button
              onClick={() => {
                setServiceId(row.id)
                setServiceName(row.serviceName)
                setShowDeletConfirmation(true)
              }}
            >
              <img src={getImage('images/tdelete.svg')} alt=''></img>
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='Spa & Wellness'
                breadcrumb={[
                  'Department Admin',
                  'Spa & Wellness',
                  'Details Info',
                ]}
              />
            </div>

            <div className='col-12 col-md-12'>
              <div className='table-wrp'>
                <Table
                  columns={HotelShuttleColumns}
                  dataSource={requests}
                  pagination={false}
                  scroll={{ y: 382 }}
                  loading={loadingData}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceModal
        openingTime={openingTime}
        closingTime={closingTime}
        editing={editing}
        isModalVisible={isModalVisible}
        onFinishAdd={onFinishAdd}
        handleCancel={handleCancel}
        setName={setName}
        setDescription={setDescription}
        name={name}
        description={description}
        createUserError={createUserError}
        showLoader={showLoader}
        form={form}
        profileImageError={profileImageError}
        image={image}
        imageUrl={imageUrl}
        clearImage={clearImage}
        setProfileImageError={setProfileImageError}
        setImage={setImage}
        setImageUrl={setImageUrl}
        serviceId={serviceId}
        serviceName={serviceName}
        closingTimeFunction={closingTimeFunction}
        openingTimeFunction={openingTimeFunction}
        setClosed={setClosed}
        closed={closed}
      />
      <Modal
        visible={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        className='successModal'
        footer={null}
        centered
      >
        <SuccessModal title={translateTextI18N(successMessage)}></SuccessModal>
      </Modal>

      <Modal
        onCancel={() => setShowDeletConfirmation(false)}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={showDeletConfirmation}
        id='deleteModal'
      >
        <DeleteModal
          id='deleteModal'
          title='Confirm Delete'
          message='Do you want to delete ?'
        />

        <div className='modalFooter'>
          <Button
            key='back'
            className='grayBtn'
            onClick={() => setShowDeletConfirmation(false)}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            key='submit'
            className='blueBtn ml-3 ml-lg-4'
            onClick={deleteFoodMenuItem}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>
      <Modal
        onOk={deleteMenu}
        onCancel={() => {
          setShowDeleteMenuModal(false)
          setSpaToDelete(null)
          setGymToDelete(null)
          setSaloonToDelete(null)
        }}
        className='deleteModal cmnModal'
        footer={null}
        centered
        visible={showDeleteMenuModal}
      >
        <DeleteModal
          title='Confirm Delete'
          message='Do you wish to delete all the uploaded Menus ?'
        />

        <div className='modalFooter'>
          <Button
            className='grayBtn'
            key='back'
            onClick={() => setShowDeleteMenuModal(false)}
          >
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            key='submit'
            onClick={deleteMenu}
          >
            {translateTextI18N('Delete')}
          </Button>
        </div>
      </Modal>

      {menuUploadData && (
        <MenuUpload
          accept='.jpeg, .pdf,.jpg'
          beforeUpload={file => {
            validateMenu(file, {})
          }}
          showUploadList={false}
          data={menuUploadData}
          index={0}
          setMenuUploadData={setMenuUploadData}
          updateMenuData={updateMenuData}
        />
      )}
    </>
  )
}

export default SpaWellnessDetailsInfo
