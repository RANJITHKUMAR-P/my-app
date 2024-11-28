/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react'
import { Button, Table } from 'antd'
import { useDispatch, useSelector } from 'react-redux'

import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'

import { actions } from '../../../Store'
import {
  commonModalType,
  defaultModalData,
  PaginationOptions,
} from '../../../config/constants'
import PageNameCard from '../../Common/PageNameCard/PageNameCard'
import AddLocationModal from './AddLocationModal'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import AddLocationTypeModal from './AddLocationTypeModal'
import ConfirmationDialog from '../../Common/ConfirmationDialog/ConfirmationDialog'
import {
  deleteLocation,
  deleteLocationType,
  fetchHotelLocations,
} from '../../../services/location'
import { viewResponseModal } from '../../../services/requests'
import { getImage, Sort } from '../../../config/utils'

const Locations = () => {
  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const { hotelInfo, locationIdToInfo } = useSelector(state => state)
  const [locationModal, setLocationModal] = useState(defaultModalData)
  const [locationTypeModal, setLocationTypeModal] = useState(defaultModalData)

  const hotelId = hotelInfo.hotelId

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('1001'))
  }, [])

  const locationOperation = useCallback(({ modalType = null, data = null }) => {
    setLocationModal({
      ...locationModal,
      isOpen: true,
      isEdit: modalType === commonModalType.EditLocation,
      data,
      modalType,
    })
  }, [])

  const locationTypeOperation = useCallback(
    ({ modalType = null, data = null }) => {
      setLocationTypeModal({
        ...locationTypeModal,
        isOpen: true,
        isEdit: modalType === commonModalType.EditLocationType,
        data,
        modalType,
      })
    },
    []
  )

  const onLocationModalClose = useCallback(() => {
    setLocationModal(defaultModalData)
  }, [])

  const onLocationTypeModalClose = useCallback(() => {
    setLocationTypeModal(defaultModalData)
  }, [])

  const onDeleteLocationType = useCallback(async () => {
    setLocationTypeModal({ ...locationTypeModal, isLoading: true })
    const { success, message } = await deleteLocationType(
      locationTypeModal.data
    )

    setTimeout(() => {
      viewResponseModal({
        dispatch,
        data: { status: success, message },
      })
    }, 100)

    if (success) {
      onLocationTypeModalClose()
    }
  }, [locationTypeModal])

  const onDeleteLocation = useCallback(async () => {
    setLocationModal({ ...locationModal, isLoading: true }) // Corrected from setLocationTypeModal
    const { success, message } = await deleteLocation(locationModal.data)

    setTimeout(() => {
      viewResponseModal({
        dispatch,
        data: { status: success, message },
      })
    }, 100)

    if (success) {
      onLocationModalClose()
    }
  }, [locationModal])

  useEffect(() => {
    fetchHotelLocations({ dispatch, hotelId })
  }, [dispatch, hotelId])

  const locationColumns = [
    {
      title: '#',
      width: 30,
      render: (...args) => ++args[2],
    },
    {
      title: 'Location Name',
      dataIndex: 'locationName',
      width: 160,
      render: val => val,
    },
    {
      title: 'Location Type',
      dataIndex: 'locationTypeName',
      width: 160,
      render: val => val,
    },
    {
      title: '',
      dataIndex: '',
      width: 160,
      render: (_val, rowData) => (
        <div className='tableactionbtn-grp'>
          <button
            onClick={() =>
              locationOperation({
                modalType: commonModalType.EditLocation,
                data: rowData,
              })
            }
            className={'resend'}
          >
            <img src={getImage('images/tedit.svg')}></img>
          </button>
          <button
            onClick={() => {
              if (rowData?.isLocationUsed) return
              locationOperation({
                modalType: commonModalType.DeleteLocation,
                data: rowData,
              })
            }}
            className={'resend'}
            disabled={rowData?.isLocationUsed || false}
          >
            <img src={getImage('images/tdelete.svg')}></img>
          </button>
        </div>
      ),
    },
  ]

  const onAddLocationClick = useCallback(e => {
    e.preventDefault()
    locationOperation({
      modalType: commonModalType.AddLocation,
    })
  }, [])

  return (
    <>
      <Header></Header>
      <SideMenu></SideMenu>
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNameCard
                title='Locations'
                breadcrumb={['Hotel Admin', 'Locations']}
              />
            </div>
            <div className='col-12 col-xl-12'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-4 col-md-auto ml-auto'>
                    <Button onClick={onAddLocationClick} className='cmnBtn'>
                      {translateTextI18N('Add New Location')}
                    </Button>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-12 col-xl-12'>
                  <div className='table-wrp'>
                    <Table
                      columns={locationColumns}
                      dataSource={Sort(
                        Object.values(locationIdToInfo),
                        'locationName'
                      )}
                      pagination={PaginationOptions}
                      scroll={{ y: 382 }}
                      rowKey='id'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {[commonModalType.AddLocation, commonModalType.EditLocation].includes(
        locationModal.modalType
      ) && (
        <AddLocationModal
          {...{
            onLocationModalClose,
            locationModal,
            locationTypeOperation,
            setLocationTypeModal,
          }}
        />
      )}
      {[
        commonModalType.AddLocationType,
        commonModalType.EditLocationType,
      ].includes(locationTypeModal.modalType) && (
        <AddLocationTypeModal
          {...{
            locationTypeModal,
            setLocationTypeModal,
            onLocationTypeModalClose,
          }}
        />
      )}

      {commonModalType.DeleteLocationType === locationTypeModal.modalType && (
        <ConfirmationDialog
          visible={locationTypeModal.isOpen}
          onCancelClick={onLocationTypeModalClose}
          onOkClick={onDeleteLocationType}
          title={'Confirm Delete'}
          message={`Do you really want to delete this location type ?`}
          okButtonText='Confirm'
          options={{ name: locationTypeModal?.data?.name }}
          isDisable={locationTypeModal?.isLoading}
        />
      )}

      {commonModalType.DeleteLocation === locationModal.modalType && (
        <ConfirmationDialog
          visible={locationModal.isOpen}
          onCancelClick={onLocationModalClose}
          onOkClick={onDeleteLocation}
          title={'Confirm Delete'}
          message={`Do you really want to delete this location?`}
          okButtonText='Confirm'
          options={{ name: locationTypeModal?.data?.name }}
          isDisable={locationTypeModal?.isLoading}
        />
      )}
    </>
  )
}

export default Locations
