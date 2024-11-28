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

import { storageRef, db } from '../../../config/firebase'
import DragableUploadListItem from '../../Pages/Restaurant/DragableUploadListItem'
import { Collections } from '../../../config/constants'

const MAX_FILE_COUNT = 5

const RequestImageUpload = ({
  row,
  visibleImageUpload,
  setVisibleImageUpload,
  imageUploadType,
  FetchData,
}) => {
  const title =
    imageUploadType === 'before' ? 'Image Before Job' : 'Image After Job'
  const {
    hotelId,
    isHotelAdmin,
    userInfo: { name, userId },
  } = useSelector(state => state)
  const messagesEndRef = useRef(null)
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [fileListNew, setFileListNew] = useState([])
  const [imageLoading, setImageLoading] = useState(false)
  const [disableFooter, setDisableFooter] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [displayingMessageNew, setDisplayingMessageNew] = useState(false)
  const [fileErrorMessags, setFileErrorMessags] = useState([])

  useEffect(() => {
    if (fileErrorMessags.length) {
      message.error(translateTextI18N(fileErrorMessags[0]))
      setFileErrorMessags([])
    }
  }, [fileErrorMessags])

  function getExtension(ext) {
    switch (ext) {
      case ext.includes('png'):
        return 'png'
      case ext.includes('jpeg'):
        return 'jpeg'
      case ext.includes('jpg'):
        return 'jpg'
      default:
        return ''
    }
  }

  useEffect(() => {
    let list = []
    function modifyElement(el, row) {
      const valType = typeof el
      if (valType === 'string') {
        let fileExt = el.split('.').pop()
        fileExt = getExtension(fileExt)
        const uniqueName = unique()
        list.push({
          uid: uniqueName,
          name: `${uniqueName}.${fileExt}`,
          status: 'done',
          url: el,
          createdBy: row.createdBy,
          createdAt: row.createdAt,
          createdByName: row.createdByName,
          isDelete: false,
          updatedAt: row.updatedAt,
          updatedBy: row.updatedBy,
          updatedByName: row.createdByName,
        })
      } else {
        list.push({
          uid: el.page,
          name: el.name,
          status: 'done',
          url: el.url,
          createdBy: el.createdBy,
          createdAt: el.createdAt,
          createdByName: el.createdByName,
          isDelete: false,
          updatedAt: el.updatedAt,
          updatedBy: el.updatedBy,
          updatedByName: el.updatedByName,
        })
      }
    }
    if (imageUploadType === 'before') {
      if (
        row?.beforeStartUploadImages &&
        row?.beforeStartUploadImages.length > 0
      ) {
        setIsEdit(row?.beforeStartUploadImages)
        row?.beforeStartUploadImages?.forEach(el => {
          modifyElement(el, row)
        })
      }
    } else {
      if (
        row?.afterCompleteUploadImages &&
        row?.afterCompleteUploadImages.length > 0
      ) {
        setIsEdit(row?.afterCompleteUploadImages)
        row?.afterCompleteUploadImages?.forEach(el => {
          modifyElement(el, row)
        })
      }
    }
    setFileListNew(list)
  }, [row])

  const handleCancel = () => {
    resetModal()
    setVisibleImageUpload(false)
  }

  const resetModal = () => {
    setDisableFooter(false)
    setFileListNew([])
    setImageLoading(false)
  }

  useEffect(() => {
    let flag = fileListNew.find(i => i.status === 'uploading')
    let isDisable = isEdit ? false : fileListNew.length < 1
    setDisableFooter(!!flag ? true : isDisable)
  }, [fileListNew])

  useEffect(() => {
    if (displayingMessageNew) {
      message.error(
        translateTextI18N(
          `You can only upload maximum of ${MAX_FILE_COUNT} files`
        )
      )
      setDisplayingMessageNew(false)
    }
  }, [displayingMessageNew])

  const moveRow = useCallback(
    (dragIndexNew, hoverIndexNew) => {
      const dragRowNew = fileListNew[dragIndexNew]
      setFileListNew(
        update(fileListNew, {
          $splice: [
            [dragIndexNew, 1],
            [hoverIndexNew, 0, dragRowNew],
          ],
        })
      )
    },
    [fileListNew]
  )

  const onChange = ({ fileList: newFileList }) => {
    setFileListNew(newFileList.filter(i => i.status))
  }

  const validateFile = async file => {
    if (fileListNew.length >= MAX_FILE_COUNT) {
      setDisplayingMessageNew(true)
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
    setImageLoading(true)
    const images = []
    let i = 0
    for (let file of fileListNew) {
      i++
      images.push({
        isDelete: false,
        createdBy: file.createdBy ?? userId,
        createdAt: file.createdAt ?? new Date(),
        updatedBy: file.updatedBy ?? userId,
        updatedAt: file.updatedAt ?? new Date(),
        createdByName: file.createdByName ?? name,
        updatedByName: file.updatedByName ?? name,
        name: file.name,
        page: i,
        url: file?.xhr?.ref ? await file?.xhr?.ref.getDownloadURL() : file.url,
      })
    }
    const imageCol =
      imageUploadType === 'before'
        ? 'beforeStartUploadImages'
        : 'afterCompleteUploadImages'
    let { success, message: msg } = await UploadRequestImages(
      row,
      images,
      imageCol
    )
    success ? message.success(msg) : message.error(msg)
    setImageLoading(false)
    handleCancel()
    if (FetchData) {
      FetchData()
    }
  }

  const customUpload = async ({ onError, onSuccess, file }) => {
    try {
      setDisableFooter(true)
      const uniqueName = unique()
      const fileExtension = file.name.split('.').pop()
      const imageName = `${uniqueName}.${fileExtension}`

      const fileRef = storageRef.child(
        `${hotelId}/departmentRequestImages/${imageName}`
      )
      const uploadTaskSnapshot = await fileRef.put(file)
      onSuccess(null, uploadTaskSnapshot)
    } catch (e) {
      onError(e)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  const UploadRequestImages = async (row, images, imageCol) => {
    try {
      await db
        .collection(Collections.REQUEST_INFO)
        .doc(row.hotelId)
        .collection(Collections.REQUEST_INFO_DEPARTMENT)
        .doc(row.departmentId)
        .collection(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
        .doc(row.requestId)
        .update({ [imageCol]: images })
      return {
        success: true,
        message:
          images.length > 0
            ? 'Images Uploaded Successfully'
            : 'Images Deleted Successfully',
      }
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
      return { success: false, message: error?.message }
    }
  }

  const onRemove = file => {
    const isCurrentUser = isCurrentUserFile(file)
    if (!isCurrentUser) {
      message.error('Only Admin/Author Can Delete Image')
      return false
    }
  }

  const isCurrentUserFile = file => {
    let currentUser = false
    if (isHotelAdmin || file?.lastModified) {
      //Admin and Author has the delete permission or its a newly created file of current user
      currentUser = true
    } else {
      /// Check  the file ownership
      currentUser = file?.createdBy === userId
    }
    return currentUser
  }

  return (
    <>
      <Modal
        visible={visibleImageUpload}
        onOk={handleOk}
        onCancel={handleCancel}
        title={translateTextI18N(title)}
        className='menuuploadModal cmnModal'
        footer={null}
        centered
        maskClosable={false}
        destroyOnClose={true}
      >
        <DndProvider backend={HTML5Backend}>
          <Upload
            listType='picture'
            fileList={fileListNew}
            className='upload-list-inline'
            onChange={onChange}
            onRemove={onRemove}
            beforeUpload={validateFile}
            customRequest={customUpload}
            maxCount={MAX_FILE_COUNT}
            multiple={false}
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
              <br></br>
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
            loading={imageLoading}
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

export default RequestImageUpload
