/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Upload, Button, Modal, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import update from 'immutability-helper'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import unique from 'uniqid'

import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import DragableUploadListItem from './DragableUploadListItem'
import { storageRef } from '../../../config/firebase'
import { UploadMenuAdvanced } from '../../../services/restaurants'
import { UploadSpaMenuAdvanced, UploadGymMenuAdvanced, UploadSaloonMenuAdvanced } from '../../../services/spaWellness'

const MAX_FILE_COUNT = 20

const MenuUpload = ({ index, data, updateMenuData, setMenuUploadData }) => {
  const messagesEndRef = useRef(null)
  const { hotelId } = useSelector(state => state)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [isModalVisible, setIsModalVisible] = useState(true)
  const [fileList, setFileList] = useState([])
  const [menuSaveLoading, setMenuSaveLoading] = useState(false)
  const [disableFooter, setDisableFooter] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [displayingMessage, setDisplayingMessage] = useState(false)
  const [fileErrorMessags, setFileErrorMessags] = useState([])

  useEffect(() => {
    if (fileErrorMessags.length) {
      message.error(translateTextI18N(fileErrorMessags[0]))
      setFileErrorMessags([])
    }
  }, [fileErrorMessags])

  useEffect(() => {
    let list = []
    setIsEdit(data.menu && data.menu.length > 0)
    data.menu &&
      data.menu.forEach(el => {
        list.push({
          uid: el.page,
          name: el.name,
          status: 'done',
          url: el.url,
        })
      })
    setFileList(list)
  }, [data])

  const handleCancel = () => {
    resetModal()
    setIsModalVisible(false)
  }

  const resetModal = () => {
    setDisableFooter(false)
    setFileList([])
    setMenuSaveLoading(false)
    setMenuUploadData(null)
  }

  useEffect(() => {
    let flag = fileList.find(i => i.status === 'uploading')
    let isDisable = isEdit ? false : fileList.length < 1
    setDisableFooter(!!flag ? true : isDisable)
  }, [fileList])

  useEffect(() => {
    if (displayingMessage) {
      message.error(
        translateTextI18N('You can only upload maximum of 20 files')
      )
      setDisplayingMessage(false)
    }
  }, [displayingMessage])

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = fileList[dragIndex]
      setFileList(
        update(fileList, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        })
      )
    },
    [fileList]
  )

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.filter(i => i.status))
  }

  const validateFile = async file => {
    if (fileList.length >= MAX_FILE_COUNT) {
      setDisplayingMessage(true)
      return false
    }
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    const lessThanAllowedSize = file.size / 1024 <= 1024 * 1

    if (!isJpgOrPng) {
      setFileErrorMessags([
        ...fileErrorMessags,
        'Invalid format, please upload JPEG or PNG',
      ])
    } else if (!lessThanAllowedSize) {
      setFileErrorMessags([...fileErrorMessags, 'Maximum upload size is 1mb'])
    }

    if (isJpgOrPng && lessThanAllowedSize) scrollToBottom()
    return isJpgOrPng && lessThanAllowedSize
  }

  const handleOk = async () => {
    setMenuSaveLoading(true)
    const menu = []
    let i = 0
    for (let file of fileList) {
      i++
      menu.push({
        name: file.name,
        page: i,
        url: file.xhr ? await file.xhr.ref.getDownloadURL() : file.url,
      })
    }

    let success, msg;
    if (data.serviceName === 'Spa') {
      const result = await UploadSpaMenuAdvanced(data.id, menu)
      success = result.success
      msg = result.message
    } else if (data.serviceName === 'Gym') {
      const result = await UploadGymMenuAdvanced(data.id, menu)
      success = result.success
      msg = result.message
    } else if (data.serviceName === 'Saloon') {
      const result = await UploadSaloonMenuAdvanced(data.id, menu)
      success = result.success
      msg = result.message
    } else {
      const result = await UploadMenuAdvanced(data.id, menu);
      success = result.success;
      msg = result.message;
    }

    success ? message.success(msg) : message.error(msg)
    setMenuSaveLoading(false)
    handleCancel()
    updateMenuData(menu, index)
  }

  const customUpload = async ({ onError, onSuccess, file }) => {
    try {
      setDisableFooter(true)
      const uniqueName = unique()
      const fileExtension = file.name.split('.').pop()
      const imageName = `${uniqueName}.${fileExtension}`
      const fileRef = storageRef.child(`${hotelId}/Menu/${imageName}`)
      const uploadTaskSnapshot = await fileRef.put(file)
      onSuccess(null, uploadTaskSnapshot)
    } catch (e) {
      onError(e)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Modal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        title={translateTextI18N(`Menu Upload`)}
        className='menuuploadModal cmnModal'
        footer={null}
        centered
        maskClosable={false}
        destroyOnClose={true}
      >
        <DndProvider backend={HTML5Backend}>
          <Upload
            listType='picture'
            fileList={fileList}
            className='upload-list-inline'
            onChange={onChange}
            beforeUpload={validateFile}
            customRequest={customUpload}
            maxCount={MAX_FILE_COUNT}
            multiple={true}
            itemRender={(originNode, file, currFileList) => (
              <DragableUploadListItem
                originNode={originNode}
                file={file}
                fileList={currFileList}
                moveRow={moveRow}
              />
            )}
          >
            <Button className='black' icon={<UploadOutlined />}>
              {translateTextI18N('Upload')} <br></br>
              {translateTextI18N('Drag image here or select a file')}
            </Button>
            <p className='mb-3'>
              {translateTextI18N(
                'Image should be in PNG or JPEG file with maximum of size 1mb'
              )}
            </p>
          </Upload>
        </DndProvider>

        <div className='modalFooter'>
          <Button className='grayBtn' key='back' onClick={handleCancel}>
            {translateTextI18N('Cancel')}
          </Button>

          <Button
            className='blueBtn ml-3 ml-lg-4'
            disabled={disableFooter}
            loading={menuSaveLoading}
            key='submit'
            onClick={handleOk}
          >
            {translateTextI18N('Save')}
          </Button>
        </div>
        <div ref={messagesEndRef} />
      </Modal>
    </>
  )
}

export default MenuUpload
