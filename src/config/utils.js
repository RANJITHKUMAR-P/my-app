/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-useless-escape */
/* eslint-disable jsx-a11y/alt-text */
import { Button, Select, Upload, Tooltip, Modal } from 'antd'
import {
  CommentOutlined,
  SolutionOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import moment from 'moment'
import { useEffect, useRef } from 'react'
import * as EmailValidator from 'email-validator'
import { updatationData, UploadFile } from '../services/common'
import { DeleteCuisineProfile } from '../services/cuisineMenu'
import {
  GetCurrentUserToken,
  GetCurrentUser,
  getUserRef,
} from '../services/user'
import { useCustomI18NTranslatorHook } from '../utility/globalization'
import {
  AdminActionKey,
  ADMIN_REQUEST_CHANGE,
  Collections,
  commonModalType,
  CompletedLabel,
  checkoutLabel,
  DateTimeColumnWidth,
  defaultPageSize,
  DeferredLabel,
  DNDLabel,
  delayedLabel,
  FandBServiceStatus,
  guestRefusedLabel,
  HotelAdminRole,
  inProgressLabel,
  notificationTypes,
  Option,
  outOfServiceLabel,
  pendingLable,
  rejectedLable,
  RequestStatus,
  secondsToShowAlert,
  statusToIndex,
  translationDataKey,
  transliterateLanguageIds,
  StatusButton,
  ManagementDeptObject,
  unAssignTaskErrorMsg,
  CanceledLabel,
  APIs,
} from './constants'
import CountryList from './CountryList'
import DepartmentAndServiceKeys from './departmentAndServicekeys'
import { auth, db, timestamp } from './firebase'
import {
  updateCommonModal,
  viewAddCommenModal,
  viewAddRequestModal,
} from '../services/requests'
import _ from 'underscore'
import MenuGallery from '../components/Pages/Restaurant/MenuGallery'
import { AdminRequest, ManagerRequest } from '../services/notification'
import { Amount } from '../components/Common/Amount/Amount'
import { actions } from '../Store'
import RatingList from '../components/Common/Rating/RatingList'
import { groupBy, orderBy } from 'lodash'
import { onViewFeedbackClick } from '../services/guest'
import { getCurrentUserCancelRequestPermissions } from '../services/user'
import Axios from '../utility/axiosHelper'
import { v4 as uuidv4 } from 'uuid'
import firebase from 'firebase/app'
import 'firebase/firestore'
const MaskData = require('maskdata')

const timeFormat = 'HH:mm'
export const SanitizeNumber = number => {
  let returnValue = number
  if (!number) return returnValue
  returnValue = returnValue.replace(/\D/g, '')
  return returnValue
}

export const Sort = (array, key) => {
  const compare = (a, b) => {
    let comparison = 0
    let value1 = a[key]
    let value2 = b[key]
    if (typeof a[key] === 'string') {
      value1 = value1?.toUpperCase()
      value2 = value2?.toUpperCase()
    }
    if (value1 > value2) comparison = 1
    else if (value1 < value2) comparison = -1
    return comparison
  }

  return array?.sort(compare)
}

export const UpperCase = str => {
  return str?.toLowerCase()?.replace(/\b[a-z]/g, function (letter) {
    return letter?.toUpperCase() ?? ''
  })
}

export const UpperCaseWithSpace = str => {
  if (!str) return ''

  // If the string already contains spaces, just capitalize each word
  if (str.includes(' ')) {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Handle special cases like "5Star" or "fiveStar"
  const starMatch = str.match(/(\d+|[A-Za-z]+)Star$/)
  if (starMatch) {
    const prefix = starMatch[1]
    return isNaN(prefix)
      ? `${prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase()} Star`
      : `${prefix} Star`
  }

  // camelCase or PascalCase
  const words = str.split(/(?=[A-Z])/).map(word => word.toLowerCase())

  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const toDate = date => {
  return new Date(date.toDate())
}
export const toArray = ({ snapshot, idColumn, primaryKey = 'id' }) => {
  let arr = []

  if (snapshot) {
    if (snapshot.docs) {
      snapshot.forEach(ss => {
        const ssData = ss.data()
        arr.push({
          [primaryKey]: idColumn ? ssData[idColumn] : ss.id,
          ...ss.data(),
        })
      })
    } else if (snapshot.data()) {
      arr = [snapshot.data()]
    }
  }
  return arr
}

export const secret_key = process.env.REACT_APP_SECRET_KEY

export const Decrypt = encryptedValue => {
  if (encryptedValue) {
    const bytes = CryptoJS.AES.decrypt(`${encryptedValue}`, secret_key)
    return bytes?.toString(CryptoJS?.enc?.Utf8)
  }
}

export const Encrypt = text => {
  if (text) {
    return CryptoJS.AES.encrypt(text, secret_key).toString()
  }
}

export const beforeCrop = (file, setImageError) => {
  const allowedImageSizeMb = 1
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const lessThanAllowedSize = file.size / 1024 <= 1024 * allowedImageSizeMb

  let flag = true
  if (!isJpgOrPng) {
    setImageError('Invalid format, please upload JPEG or PNG')
    flag = false
  } else if (!lessThanAllowedSize) {
    setImageError(`Maximum upload size is ${allowedImageSizeMb}mb`)
    flag = false
  } else {
    setImageError('')
  }
  return flag
}

export const validateProfileImage = (
  file,
  setImageError,
  setImage,
  setImageUrl,
  allowedImageSizeMb = 1,
  allowedRatios = []
) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const lessThanAllowedSize = file.size / 1024 <= 1024 * allowedImageSizeMb

  if (!isJpgOrPng) {
    setImageError('Invalid format, please upload JPEG or PNG')
  } else if (!lessThanAllowedSize) {
    setImageError(`Maximum upload size is ${allowedImageSizeMb}mb`)
  } else {
    setImageError('')
  }

  if (isJpgOrPng && lessThanAllowedSize) {
    setImage(file)
    const fileReader = new FileReader()
    fileReader.addEventListener('load', e => {
      let image = new Image()
      image.src = e.target.result
      image.onload = function () {
        const imageRatio = `${this.width}x${this.height}`
        if (allowedRatios.length && !allowedRatios.includes(imageRatio)) {
          setImageError(`Image ratio should be ${allowedRatios.join(' or ')}`)
        } else {
          setImageUrl(fileReader.result)
        }
      }
    })
    fileReader.readAsDataURL(file)
  } else {
    setImage(null)
    setImageUrl(null)
  }

  return isJpgOrPng && lessThanAllowedSize ? true : Upload.LIST_IGNORE
}

export const validateLogoFunc = data => {
  const { file, setProfileImageError, setImage, setImageUrl } = data
  if (!file) return

  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const lessThan3Mb = file.size / 1024 <= 1024

  if (!isJpgOrPng) {
    setProfileImageError('Invalid format, please upload JPEG or PNG')
  } else if (!lessThan3Mb) {
    setProfileImageError('Maximum upload size is 1mb')
  } else {
    setProfileImageError('')
  }

  if (isJpgOrPng && lessThan3Mb) {
    setImage(file)

    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      setImageUrl(fileReader.result)
    })
    fileReader.readAsDataURL(file)
  }
}
export const GetOptions = ({
  list,
  addAll = false,
  shouldTranslate = true,
  nameKey = 'name',
  valueKey = 'value',
}) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  let newList = null

  if (!Array.isArray(list) || !list) return newList

  newList = list.map((option, idx) => (
    <Option value={option[valueKey]} key={idx}>
      {option.isEmoji
        ? String.fromCodePoint(option[nameKey])
        : Ternary(
            shouldTranslate,
            translateTextI18N(option[nameKey]),
            option[nameKey]
          )}
    </Option>
  ))

  if (addAll) {
    newList.unshift(
      <Option value='all' key='all'>
        {translateTextI18N('All')}
      </Option>
    )
  }

  return newList
}

export const defaultFilterOption = (input, option) => {
  if (typeof option.children !== 'string') return true
  return option.children.toLowerCase().includes(input.toLowerCase())
}

export const SelectDrops = props => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const {
    autoFocus = false,
    filterOption = defaultFilterOption,
    id = '',
    loading = false,
    onChange,
    optionFilterProp = 'children',
    placeholder = '',
    showSearch = false,
    value,
    ref = null,
    keepDropDownOpen = false,
  } = props

  const commonProps = {
    autoFocus,
    filterOption,
    loading,
    onChange: onChange,
    optionFilterProp,
    placeholder: translateTextI18N(placeholder),
    ref,
    showSearch,
    value: Array.isArray(value) ? value : translateTextI18N(value),
  }

  if ('mode' in props) {
    commonProps.mode = props.mode
  }

  if (keepDropDownOpen) {
    commonProps.getPopupContainer = trigger => trigger.parentElement
  }

  if (id) {
    commonProps['id'] = id
  }

  return (
    <div className='cmnSelect-form'>
      <Select
        {...commonProps}
        getPopupContainer={triggerNode => {
          return triggerNode.parentNode
        }}
      >
        {GetOptions(props)}
      </Select>
    </div>
  )
}

export const TableSearch = ({ requestType, serviceType, statusType }) => (
  <>
    <div className='Col-12 Col-xl-7'>
      <div className='tablefilter-wrp'>
        <div className='form-row'>
          <div className='Col-6 Col-md-4 Col-lg mb-1 m-lg-0'>
            <SelectDrops list={requestType} defaultV='Request Type' />
          </div>
          <div className='Col-6 Col-md-4 Col-lg'>
            <SelectDrops list={serviceType} defaultV='Services' />
          </div>

          <div className='Col-6 Col-md-4 Col-lg'>
            <SelectDrops list={statusType} defaultV='Status' />
          </div>

          <div className='Col-6 Col-md-auto '>
            <Button type='primary' className='adduserbtn'>
              <img src={getImage('images/clearicon.svg')}></img>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </>
)

export const CardContainer = ({ list }) => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  return (
    <>
      <div className='row'>
        {list.map(houseCard => (
          <div className='Col-12 Col-md-4'>
            <div className={`countcard-wrp ${houseCard.color}`}>
              <div>
                <h4>{translateTextI18N(houseCard.value)}</h4>
                <h6>{translateTextI18N(houseCard.text)}</h6>
              </div>
              <figure>
                <img src={houseCard.imgUrl}></img>
              </figure>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export const UplaodFileCommon = async (
  event,
  setResImageError,
  setLoadingData,
  setPreviews,
  previews = [],
  folderPath = '',
  maxImages = 4
) => {
  if (!folderPath) {
    folderPath = 'profileImages'
  }

  let imgFile = event.target.files[0]
  const isJpgOrPng =
    imgFile.type === 'image/jpeg' ||
    imgFile.type === 'image/png' ||
    imgFile.type === 'image/jpg'
  const lessThan3Mb = imgFile.size / 1024 <= 1024

  if (!isJpgOrPng) {
    setResImageError('Invalid format, please upload JPEG or PNG')
  } else if (!lessThan3Mb) {
    setResImageError('Maximum upload size is 1mb')
  } else {
    setResImageError('')
  }

  if (isJpgOrPng && lessThan3Mb) {
    let fileList = Array.from(event.target.files)

    setLoadingData(true)
    const { downloadUrl } = await UploadFile(...fileList, folderPath)
    if (Array.isArray(previews)) {
      let file = [...previews]
      if (!maxImages || file.length <= maxImages) {
        file.push(downloadUrl)
      }
      setPreviews(file)
    } else {
      setPreviews(downloadUrl)
    }
  }
  setTimeout(() => {
    setLoadingData(false)
    setResImageError('')
  }, secondsToShowAlert)
}

export const AddIndex = arr => {
  return (
    arr?.map((item, index) => ({
      ...item,
      srNo: index + 1,
    })) || []
  )
}

export const GetAxiosHeaders = async () => {
  const token = await GetCurrentUserToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export const FormatTimeago = timestamp => {
  if (!timestamp) return ''
  let timeAgo = moment(timestamp.toDate()).fromNow(true)

  return `${timeAgo} ago`
}

export const FormatTimestamp = (
  timestamp,
  onlyDate = false,
  defaultValue = ''
) => {
  try {
    if (!timestamp) return defaultValue
    const [, month, day, year, timePart] = String(timestamp.toDate()).split(' ')

    const date = `${day} ${month} ${year}`
    if (onlyDate) return date

    let [hour, minute] = timePart.split(':').map(v => +v)
    let amPm = hour >= 12 ? 'PM' : 'AM'

    if (hour > 12) hour -= 12
    if (hour < 10) hour = '0' + hour
    if (minute < 10) minute = '0' + minute

    return `${date} - ${hour}:${minute} ${amPm}`
  } catch (error) {
    return timestamp
  }
}

export const FormatDate = timestamp => {
  if (!timestamp) return ''

  const [, month, day, year] = String(timestamp.toDate()).split(' ')

  return `${day}-${month}-${year}`
}

export const isEmail = email => EmailValidator.validate(email)

export const maskPart = part => {
  const length = part.length
  if (length > 8) {
    return (
      part.substr(0, 2) +
      part.substr(2, length - 2).replace(/\w/g, '*') +
      part.substr(-2, 2)
    )
  }
  if (length > 4) {
    return (
      part.substr(0, 1) +
      part.substr(1, length - 1).replace(/\w/g, '*') +
      part.substr(-1, 1)
    )
  }
  return part.replace(/\w/g, '*')
}

export const maskEmail = email => {
  const emailMask2Options = {
    maskWith: '*',
    unmaskedStartCharactersBeforeAt: 3,
    unmaskedEndCharactersAfterAt: 2,
    maskAtTheRate: false,
  }

  return MaskData.maskEmail2(email, emailMask2Options)
}

export const maskUsername = item => {
  if (!item) return ''
  if (isEmail(item)) {
    return maskEmail(item)
  } else {
    return item[0] + item[1] + '*'.repeat(item.length - 4) + item.slice(-2)
  }
}

export const phoneWithPrefix = user => {
  if (!user) return ''
  return (
    (user.contactNumberPrefix ? user.contactNumberPrefix : '') +
    user.contactNumber
  )
}

export const axiosError = error => {
  let statusCode = 500
  let message = error.message
  if (error.response) {
    statusCode = error.response.status
    message = error.response.data?.message
  }
  return { statusCode, message }
}

export const SetAutoClearProp = (
  Func,
  value,
  clearValueData,
  clearAfterMilliSeconds = secondsToShowAlert
) => {
  Func(value)
  setTimeout(() => {
    Func(clearValueData ?? '')
  }, clearAfterMilliSeconds)
}

export const getEmailOrPhone = email => {
  let _email = isEmail(email) ? email.toLowerCase() : null
  let _phone = isEmail(email) ? null : email
  return { _email, _phone }
}

export const editCuisineProfile = async data => {
  const {
    row,
    setLoadingData,
    setCuisineName,
    setDescription,
    setCuisineId,
    setEditingCuisine,
    form,
    setIsModalVisible,
  } = data
  try {
    setLoadingData(true)
    setCuisineName(row.cuisineName)
    setDescription(row.description)
    setCuisineId(row.id)
    setEditingCuisine(true)
    setIsModalVisible(true)
    form.setFieldsValue({
      cuisineName: row.cuisineName,
      description: row.description,
    })
  } catch (error) {
    console.log(error)
  }
  setLoadingData(false)
}

export const editHotelShuttle = async data => {
  const {
    row,
    setLoadingData,
    setDestination,
    setDescription,
    setHotelShuttleId,
    setEditingHotelShuttle,
    form,
    setIsModalVisible,
    setSelectedRow,
  } = data
  try {
    setSelectedRow(row)
    setLoadingData(true)
    setDestination(row.destination)
    setDescription(row.description)
    setHotelShuttleId(row.id)
    setEditingHotelShuttle(true)
    setIsModalVisible(true)

    form.setFieldsValue({
      destination: row.destination,
      description: row.description,
    })
  } catch (error) {
    console.log(error)
  }
  setLoadingData(false)
}
export const editSpa = async data => {
  const {
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
  } = data
  try {
    setLoadingData(true)
    setName(row.name)
    setDescription(row.description)
    setServiceId(row.id)
    setIsModalVisible(true)
    setServiceName(row.serviceName)
    setImage(null)
    setImageUrl(row?.imageUrl || '')
    setImageName(row?.imageName || '')
    setOpeningTime(row.openingTime)
    setClosingTime(row.closingTime)
    setDeleteImage(false)
    setClosed(row.closed)
    const open = row.openingTime ? moment(row.openingTime, timeFormat) : null
    const close = row.closingTime ? moment(row.closingTime, timeFormat) : null
    form.setFieldsValue({
      name: row.name,
      description: row.description,
      openingTime: open,
      closingTime: close,
      closed: row.closed,
    })
  } catch (error) {
    console.log(error)
  }
  setLoadingData(false)
}

export const deleteCuisineProfile = async data => {
  const { e, row, setLoadingData, getCuisineFunc, setSuccessMessage } = data
  try {
    e.preventDefault()
    setLoadingData(true)
    const { success } = await DeleteCuisineProfile(row)
    setLoadingData(false)
    if (success) {
      setSuccessMessage('Deleted successfully')
      getCuisineFunc()
    }
  } catch (error) {
    console.log(error)
  }
}

export const GetFAndBStatusOptions = order => {
  if (!(AdminActionKey in order))
    return FandBServiceStatus.filter(s => s.value === pendingLable)

  if (order[AdminActionKey] === rejectedLable)
    return FandBServiceStatus.filter(s => s.value === rejectedLable)

  if (order[AdminActionKey] === inProgressLabel)
    return FandBServiceStatus.filter(s =>
      [inProgressLabel, CompletedLabel, DeferredLabel].includes(s.value)
    )
}

export function isStatusChangeBlocked({
  assignedToId,
  assignedToName,
  dispatch,
  isCurrentUserRoleIsManager,
}) {
  if (isAssigned(assignedToId) && !isCurrentUserRoleIsManager) {
    updateCommonModal(dispatch, {
      status: true,
      data: assignedToName,
      type: commonModalType.StatusChangeNotAllowed,
    })
    return true
  }
  return false
}

export function changeRequestStatus({
  childIdToParentIds,
  commonProps,
  dispatch,
  row,
  staffHierarchyErrorLogs,
  userInfo,
  updatedStatus,
  handleStatusChange,
}) {
  const loggedUserId = userInfo?.userId || userInfo?.id
  const loggedUserName = userInfo?.name
  const isHotelAdmin = userInfo?.roles?.includes(HotelAdminRole)
  const isManagementStaff = userInfo?.departmentId === ManagementDeptObject.id

  if ((isManagementStaff || isHotelAdmin) && updatedStatus !== CanceledLabel) {
    if (!row.assignedToId) {
      dispatch(
        actions.setCommonModalData({
          status: true,
          data: {
            heading: 'Assign Status',
            text: unAssignTaskErrorMsg,
          },
          type: commonModalType.ViewModal,
        })
      )
      return
    }
  }

  if (!isHotelAdmin && staffHierarchyErrorLogs?.errorLog?.length) {
    dispatch(
      actions.setCommonModalData({
        status: true,
        data: staffHierarchyErrorLogs.errorLog,
        type: commonModalType.ViewStaffHierarchy,
      })
    )
    return
  }

  let {
    assignedToId = '',
    assignedToName = '',
    assignedById = '',
    assignedByName = '',
    jobStartById,
    jobStartByName,
    jobEndById,
    jobEndByName,
  } = row

  let isCurrentUserRoleIsManager =
    childIdToParentIds?.[assignedToId]?.includes(loggedUserId)

  if (
    !isHotelAdmin &&
    isStatusChangeBlocked({
      assignedToId,
      assignedToName,
      dispatch,
      isCurrentUserRoleIsManager,
    })
  ) {
    return
  }

  if (
    (!assignedToId || !assignedToName) &&
    [CompletedLabel, inProgressLabel, DeferredLabel, CanceledLabel].includes(
      updatedStatus
    )
  ) {
    assignedToId = loggedUserId
    assignedToName = loggedUserName
    assignedById = assignedToId
    assignedByName = assignedToName
  }

  if ([CompletedLabel, DeferredLabel, CanceledLabel].includes(updatedStatus)) {
    if (!jobStartById || !jobStartByName) {
      jobStartById = loggedUserId
      jobStartByName = loggedUserName
    }

    jobEndById = loggedUserId
    jobEndByName = loggedUserName
  } else if (updatedStatus === inProgressLabel) {
    jobStartById = loggedUserId
    jobStartByName = loggedUserName
    jobEndById = ''
    jobEndByName = ''
  } else {
    jobStartById = ''
    jobStartByName = ''
    jobEndById = ''
    jobEndByName = ''
  }

  let data = {
    assignedById,
    assignedByName,
    assignedToId,
    assignedToName,
    status: updatedStatus,
    jobStartById,
    jobStartByName,
    jobEndById,
    jobEndByName,
    // startTime,
    //completedTime,
    ...updatationData(),
  }

  commonProps.userReqUpdateData = {
    ...commonProps.userReqUpdateData,
    ...data,
  }

  if (updatedStatus === DeferredLabel || updatedStatus === CanceledLabel) {
    viewAddCommenModal({
      dispatch,
      row: commonProps.userReqUpdateData,
      handleStatusChange: userReqUpdateData =>
        handleStatusChange({ ...commonProps, userReqUpdateData }),
    })

    return
  }

  handleStatusChange(commonProps)
}

//change status code here cancel the status
export const GetStatusColumn = ({
  translateTextI18N,
  handleStatusChange,
  statusOptions = RequestStatus,
  setShowLoader,
  setSuccessMessage,
  setErrorMessage,
  isFAndB = false,
  hotelId,
  dispatch,
  userInfo,
  childIdToParentIds,
  staffHierarchyErrorLogs = null,
}) => ({
  title: translateTextI18N('Status'),
  dataIndex: 'status',
  width: 130,
  render: (status, row, rowIndex) => {
    let options = statusOptions.filter(e => e.name !== CanceledLabel)

    const className = options.find(v => v.value === status)?.className
    if (
      isFAndB ||
      (row.departmentKey === DepartmentAndServiceKeys.foodAndBeverage.key &&
        !row.isMoreRequest)
    ) {
      options = GetFAndBStatusOptions(row)
    }

    const isCompleted = [CompletedLabel].includes(status)
    const isCancelled = [CanceledLabel].includes(status)

    if (isCompleted || isCancelled) {
      return StatusButton({ status, translateTextI18N })
    }

    return (
      <Select
        className={className}
        value={translateTextI18N(status)}
        bordered={false}
        onChange={updatedStatus => {
          let commonProps = {
            requestId: row.id,
            updatedStatus,
            serviceName: row.service,
            requestReferenceId: row.bookingReferance,
            guestId: row.guestId,
            requestType: row.requestType,
            setShowLoader,
            setSuccessMessage,
            setErrorMessage,
            hotelId,
            rowIndex,
            userReqUpdateData: row,
            userInfo,
          }

          changeRequestStatus({
            childIdToParentIds,
            commonProps,
            dispatch,
            row,
            staffHierarchyErrorLogs,
            userInfo,
            updatedStatus,
            handleStatusChange,
          })
        }}
      >
        {options?.map(option => (
          <Option value={option.value}>{translateTextI18N(option.name)}</Option>
        ))}
      </Select>
    )
  },
})

export function formatPrice(value) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
  const formattedValue = formatter
    .format(value)
    .replace(/,/gi, '')
    .replace('$', '')
  return isNaN(formattedValue) ? '0' : formattedValue
}

export const handleMyProfileOnClick = ({
  e,
  isHotelAdmin,
  history,
  setIsStaffModalVisible,
}) => {
  e.preventDefault()
  if (isHotelAdmin) {
    history.push('/MyProfile')
  } else {
    setIsStaffModalVisible(true)
  }
}

export const recursiveFlatten =
  (headProp, parentIdProp, parentRefProp, parent = null) =>
  tree =>
    tree.length === 0
      ? []
      : tree.flatMap(({ [headProp]: children = [], ...rest }) => [
          {
            ...rest,
            ...(parentIdProp && parentRefProp
              ? { [parentRefProp]: parent[parentIdProp] || null }
              : { parent }),
          },
          ...recursiveFlatten(
            headProp,
            parentIdProp,
            parentRefProp,
            rest
          )(children),
        ])

export const Ternary = (condition, trueValue, falseValue) =>
  condition ? trueValue : falseValue

export const SortByStatus = (a, b) =>
  statusToIndex[a.status] - statusToIndex[b.status]

export const sortByCreatedAt = (a, b) => {
  if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt
  return 0
}

export const getColor = status => {
  switch (status) {
    case 'DND':
      return '#20B2AA'
    case 'In Progress':
      return '#FF8000'
    case 'CheckOut':
      return '#A52A2A'
    case 'Completed':
      return '#059E4D'
    case 'Delayed':
      return '#8B4513'
    case 'Guest Refused':
      return '#8B4689'
    case 'Out Of Service':
      return '#708090'
    case 'Pending':
      return '#FF4500'
    default:
      return '#FF8000'
  }
}

export const getCardStyle = color => ({
  borderLeft: '2px solid ' + color,
  textAlign: 'center',
  transition: 'transform 0.3s',
  display: 'inline-block',
  borderRadius: '5px',
  minWidth: '50px',
})

export const SortByStatusAscAndCretedAtDesc = (a, b) => {
  if (a.status === b.status) {
    return b.createdAt - a.createdAt
  } else {
    return statusToIndex[a.status] - statusToIndex[b.status]
  }
}

export const TranslateColumnHeader = columns => {
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  return (
    columns?.map(c => ({
      ...c,
      title: translateTextI18N(c.title1 || c.title),
    })) || []
  )
}

const GetTransliterateUrl = (word, lang) =>
  `https://inputtools.google.com/request?text=${word.replace(
    '&',
    'and'
  )}&itc=${lang}-t-i0-und&num=13&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`

const commonCatch = err => err?.message || ''

const url = `https://translation.googleapis.com/language/translate/v2`
export const GetTranslationData = async (languageDictionary, text) => {
  try {
    const languagePromises = []

    const translateIds = languageDictionary
      .filter(l => !transliterateLanguageIds.includes(l.id) && l.id !== 'en')
      .map(l => l.id)

    const params = {
      source: 'en',
      key: process.env.REACT_APP_GOOGLE_TRANSLATOR_KEY,
      format: 'text',
      q: text,
    }

    translateIds.forEach(languageId => {
      const languagePromise = axios
        .post(url, null, { params: { ...params, target: languageId } })
        .catch(commonCatch)
      languagePromises.push(languagePromise)
    })

    let promiseResponse = await Promise.all(languagePromises)

    const response = { en: text }
    promiseResponse.forEach(async (d, index) => {
      const translatedText =
        d?.data?.data?.translations[0]?.translatedText || text
      response[translateIds[index]] = translatedText
    })

    return response
  } catch (error) {
    console.log(error)
    return {}
  }
}

export const GetTranslatiterationData = async text => {
  try {
    const languagePromises = []

    transliterateLanguageIds.forEach(async langId => {
      const tranliterateUrl = GetTransliterateUrl(text, langId)
      const languagePromise = fetch(tranliterateUrl).catch(commonCatch)
      languagePromises.push(languagePromise)
    })

    let promiseResponse = await Promise.all(languagePromises)
    promiseResponse = await Promise.all(promiseResponse.map(d => d.json()))
    const response = { en: text }

    promiseResponse.forEach(async (responseData, index) => {
      response[transliterateLanguageIds[index]] = responseData[1][0][1][0]
    })

    return response
  } catch (error) {
    console.log(error)
    return {}
  }
}

export const GetTranslatedName = (obj, currentLanguage, nameKey) =>
  obj[translationDataKey]?.[currentLanguage] || obj[nameKey]

export const toTitleCase = str => {
  if (!str) return ''
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

const GetNumber = v => {
  if (!v) return 0
  const tNumber = +v
  if (isNaN(tNumber)) return 0
  return tNumber
}

export const countryCodeList = [
  ...new Set(
    CountryList.map(c => GetNumber(c.code))
      .filter(v => v)
      .sort((a, b) => a - b)
  ),
].map(c => `+${c}`)

export const GetContactNubmerPrefixOptions = () =>
  countryCodeList.map(c => <Option value={c}>{c} </Option>)

export const geoPointToString = coordinates => {
  return coordinates?.latitude && coordinates?.longitude
    ? `${coordinates.latitude},${coordinates.longitude}`
    : ''
}

export const removeAllSpaces = str => {
  return str ? str.replace(/ /g, '') : ''
}

export const stringToGeoPoint = coordinates => {
  if (!coordinates) return null
  let split = coordinates.split(',')
  return split[0] && split[1]
    ? {
        latitude: removeAllSpaces(split[0]),
        longitude: removeAllSpaces(split[1]),
      }
    : null
}

export const GetDepartmentIdsToExcludeFromServiceRequest =
  departmentAndServiceKeyToId => {
    const promotionKey = DepartmentAndServiceKeys.promotions.key
    const promotionId = departmentAndServiceKeyToId[promotionKey] || ''
    return [promotionId].filter(v => v)
  }

export const ChangeTheme = ({ themecolor, themefontColor }) => {
  const root = document.documentElement
  root?.style.setProperty('--themecolor', themecolor)
  root?.style.setProperty('--themefontColor', themefontColor)
}

export function callback() {
  // intentionaly left blank
}

export const defaultSelectedTab = '1'

export const GetDataFromSnapshot = snapshot => {
  const data = []
  for (const doc of snapshot.docs) {
    data.push({ id: doc.id, ...doc.data() })
  }
  return data
}

export const paginateQueryWithOrderBy = ({ query, page, startAfter }) => {
  query = query.orderBy('createdAt', 'desc')

  if (page !== 1) query = query.startAfter(startAfter)

  // fetch first two pages if page is 1 so that it will be easy to disable next button
  query = query.limit(defaultPageSize * (page === 1 ? 2 : 1))

  return query
}

export const paginateQuery = ({ query, page, startAfter }) => {
  if (page !== 1) query = query.startAfter(startAfter)

  // fetch first two pages if page is 1 so that it will be easy to disable next button
  query = query.limit(defaultPageSize * (page === 1 ? 2 : 1))

  return query
}

export const GetTranlationStyle = (translationData, text) => {
  const translations = translationData || {}
  let textToTranslate = (text || '').trim().toLowerCase()
  let englishTranslation = (translations['en'] || '').trim().toLowerCase()

  return Object.values(translationData || {}).filter(v => v).length &&
    textToTranslate === englishTranslation
    ? {}
    : { backgroundColor: 'white' }
}

export const GetTranslationImage = (translationData, text) => {
  const translations = translationData || {}
  let textToTranslate = (text || '').trim().toLowerCase()
  let englishTranslation = (translations['en'] || '').trim().toLowerCase()

  return getImage(
    Object.values(translations).filter(v => v).length &&
      textToTranslate === englishTranslation
      ? 'images/translate.svg'
      : 'images/PendingTranslation.svg'
  )
}

export function getCollectionKey({
  funcName,
  hotelId,
  departmentId,
  frontDeskServiceType,
}) {
  return `${funcName}${frontDeskServiceType}${Collections.REQUEST_INFO}-${hotelId}-${Collections.REQUEST_INFO_DEPARTMENT}-${departmentId}-${Collections.REQUEST_INFO_DEPARTMENT_REQUEST}`
}

export function getRequestCollection(hotelId, departmentIds) {
  const baseCollection = db
    .collection(Collections.REQUEST_INFO)
    .doc(hotelId)
    .collection(Collections.REQUEST_INFO_DEPARTMENT)

  if (Array.isArray(departmentIds)) {
    const requestCollections = departmentIds.map(departmentId =>
      baseCollection
        .doc(departmentId)
        .collection(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
    )
    return requestCollections
  } else {
    return baseCollection
      .doc(departmentIds)
      .collection(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
  }
}

export const validateEmail = (_fieldProps, showPrefixDropdown) => ({
  validator(_, value) {
    if (!value)
      return Promise.reject(
        new Error('Please enter your Email ID or Phone Number ')
      )
    if (!isEmail(value) && !showPrefixDropdown)
      return Promise.reject(new Error('Please provide a valid Email Address '))
    return Promise.resolve()
  },
})

export function weekOfMonth(input = moment()) {
  const firstDayOfMonth = input.clone().startOf('month')
  const firstDayOfWeek = firstDayOfMonth.clone().startOf('week')

  const offset = firstDayOfMonth.diff(firstDayOfWeek, 'days')

  return Math.ceil((input.date() + offset) / 7)
}

export function GetCommentColumn({
  dispatch,
  translateTextI18N,
  isGuestRequest = true,
}) {
  return {
    title: translateTextI18N(
      isGuestRequest ? 'Comments' : 'Comments / Location'
    ),
    dataIndex: '',
    width: DateTimeColumnWidth,
    render: (_, row) => {
      return row?.writeRequest || row?.locationId || row?.comments?.length ? (
        <a
          className='viewlink'
          onClick={e => {
            e.preventDefault()
            updateCommonModal(dispatch, {
              status: true,
              data: row,
              type: commonModalType.ViewComment,
            })
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              updateCommonModal(dispatch, {
                status: true,
                data: row,
                type: commonModalType.ViewComment,
              })
            }
          }}
          role='button'
          tabIndex='0'
        >
          {translateTextI18N('View')}
        </a>
      ) : (
        ''
      )
    },
  }
}
//comment
export function GetAddViewCommentColumn({
  dispatch,
  translateTextI18N,
  isGuestRequest = true,
  userInfo,
}) {
  return {
    title: translateTextI18N(
      isGuestRequest ? 'Comments' : 'Comments / Location'
    ),
    dataIndex: '',
    width: DateTimeColumnWidth,
    render: (_, row, i) => {
      return (
        <CommentOutlined
          className='viewlink'
          style={{ fontSize: 20 }}
          onClick={e => {
            e.preventDefault()
            updateCommonModal(dispatch, {
              status: true,
              data: { row },
              type: commonModalType.ViewAddComment,
              userInfo: userInfo,
            })
          }}
        />
      )
    },
  }
}
export function GetFeedBackCol({ translateTextI18N }) {
  return {
    title: translateTextI18N('Feedback'),
    dataIndex: 'feedbackData',
    width: 200,
    render: (_, row) => {
      return translateTextI18N(row.feedback)
    },
  }
}

export function GetFeedBackTimeCol({ translateTextI18N }) {
  return {
    title: translateTextI18N('FeedBack Time'),
    dataIndex: 'feedBackDateTimeData',
    width: DateTimeColumnWidth,
    render: (_, row) => {
      return formatDateAndTime(row.feedBackDateTime)
    },
  }
}

export function UpdatedPageData({
  data,
  page,
  rowIndex,
  userReqUpdateData,
  UpdateData,
}) {
  const dataCopy = { ...data }

  const pageData = _.clone(dataCopy[page])
  let dataRow = _.clone(dataCopy[page][rowIndex])
  dataRow = { ...dataRow, ...userReqUpdateData }

  pageData[rowIndex] = dataRow
  dataCopy[page] = pageData
  UpdateData(dataCopy)
}

export function showStickyBar() {
  document.body.classList.add('toastOpen')
}

export function hideStickyBar() {
  document.body.classList.remove('toastOpen')
}

export function isValidUrl(str) {
  if (!str.toLowerCase().startsWith('http')) {
    str = 'http://' + str
  }

  if (str.indexOf('.') === -1) return false

  try {
    new URL(str)
  } catch {
    return false
  }

  return true
}

export function isAssigned(assignedToId) {
  return Boolean(assignedToId && GetCurrentUser().uid !== assignedToId)
}
//regex added for password validation
export const patterns = {
  password: {
    regex: /^(?=.*[0-9])(?=.*[!?!=#*$@+-.])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    message:
      'Password must contain a minimum of 8 characters including number, symbol(!?=#*$@+-.), upper and lower case character',
  },
}

export const getHotelDeptServiceNames = ({
  service,
  setServiceList,
  isAllLableExist = false,
}) => {
  let servicesList = [],
    currServiceNames = []

  if (service.length > 0) {
    for (const request of service) {
      const name = request.service
      if (currServiceNames.includes(name)) continue

      currServiceNames.push(name)
      servicesList.push({ id: name, name, value: name })
    }
    servicesList = Sort(servicesList, 'name')

    if (!isAllLableExist) {
      servicesList.unshift({ id: 'all', name: 'All', value: 'All' })
    }
  }

  setServiceList(servicesList)
  return { currServiceNames, servicesList }
}

export function setDeptService({
  currService,
  filteredDept,
  setLocalDepartments,
  departmentFilterLabel,
  setFilteredDept,
  setServiceList,
}) {
  if (!currService) return
  const prevFilteredDept = filteredDept

  const uniqueDepartments = [...new Set(currService?.map(s => s.department))]
    .filter(v => v)
    .sort()
  let departmentsList = uniqueDepartments.map(d => ({ id: d, name: d }))
  departmentsList.unshift({ id: '0', name: 'All' })
  setLocalDepartments(departmentsList)

  if (
    isFilterValueSelected(prevFilteredDept, departmentFilterLabel) &&
    departmentsList.includes(prevFilteredDept)
  ) {
    setFilteredDept(prevFilteredDept)
  }

  if (isFilterValueSelected(filteredDept, departmentFilterLabel)) {
    currService = currService.filter(i => i.department === filteredDept)
  }

  getHotelDeptServiceNames({ service: currService, setServiceList })
}

export const removeGuestRequestColumns = c =>
  ![
    'roomNumber',
    'rating',
    'feedback',
    'feedBackDateTime',
    'feedbackData',
    'feedBackDateTimeData',
  ].includes(c.dataIndex)

export const removeDepartmentRequestColumns = c =>
  !['fromDepartmentName', 'images', 'feedback', 'feedBackDateTime'].includes(
    c.dataIndex
  )

export const removeAllRequestColumns = () => true

export function formatDateAndTime(dateTime) {
  if (!dateTime) return '---'

  if (typeof dateTime === 'string') return dateTime

  return FormatTimestamp(dateTime)
}

export const linkStyleConfig = {
  color: '#00000040 !important',
  cursor: 'not-allowed',
}

export const getFeedbackColumn = ({
  translateTextI18N,
  dispatch,
  hotelFeedbacks,
}) => {
  const feedbackCol = {
    width: 70,
    dataIndex: '',
    title: translateTextI18N('Feedback'),
    render: (_, row) => {
      return Ternary(
        hotelFeedbacks?.data?.[row?.id || row?.guestId],
        <SolutionOutlined
          className='viewlink'
          style={{ fontSize: 20 }}
          onClick={e => {
            e.preventDefault()
            onViewFeedbackClick(e, row, dispatch)
          }}
        />,
        null
      )
    },
  }
  return {
    feedbackCol,
  }
}

export function requestFromGenerator(row) {
  let title = ''
  const { isGuestRequest, fromDepartmentName } = row
  if (isGuestRequest) {
    if (fromDepartmentName) {
      title = fromDepartmentName
    } else {
      title = 'Guest'
    }
  } else {
    title = fromDepartmentName
  }
  return title
}

//getCommonColumns adds the tile in table
export const getCommonColumns = ({
  translateTextI18N,
  dispatch,
  handleStatusChange = () => {},
  hideAssignButton = false,
  userInfo,
  childIdToParentIds,
  staffHierarchyErrorLogs,
}) => {
  function onStatusChange({ row, updatedStatus, rowIndex }) {
    let commonProps = {
      requestId: row.id,
      updatedStatus: updatedStatus,
      serviceName: row.serviceType
        ? row.service + ' - ' + row.serviceType
        : row.service,
      requestReferenceId: row.bookingReferance,
      guestId: row.guestId,
      requestType: row.requestType,
      rowIndex,
      userReqUpdateData: row,
    }

    changeRequestStatus({
      commonProps,
      childIdToParentIds,
      staffHierarchyErrorLogs,
      dispatch,
      row,
      userInfo,
      updatedStatus,
      handleStatusChange,
    })
  }

  const statusCol = {
    title: translateTextI18N('Status'),
    dataIndex: 'status',
    width: 100,
    render: (status, row, rowIndex) => {
      const loggedUserId = userInfo?.userId || userInfo?.id
      const isManagementStaff =
        userInfo?.departmentId === ManagementDeptObject.id

      if (
        (isManagementStaff &&
          row.assignedToId &&
          !childIdToParentIds?.[row.assignedToId]?.includes(loggedUserId)) ||
        CompletedLabel === status
      ) {
        return StatusButton({ status, translateTextI18N })
      }
      if (
        (isManagementStaff &&
          row.assignedToId &&
          !childIdToParentIds?.[row.assignedToId]?.includes(loggedUserId)) ||
        CanceledLabel === status
      ) {
        return StatusButton({ status, translateTextI18N })
      }

      let options = RequestStatus.filter(e => e.name !== CanceledLabel)
      const className = options.find(v => v.value === status)?.className
      if (
        row.departmentKey === DepartmentAndServiceKeys.foodAndBeverage.key &&
        !row.isMoreRequest
      ) {
        options = GetFAndBStatusOptions(row)
      }

      return (
        <Select
          className={className}
          value={translateTextI18N(status)}
          bordered={false}
          onChange={updatedStatus => {
            onStatusChange({ row, updatedStatus, rowIndex })
          }}
        >
          {options.map(option => (
            <Option key={option.value} value={option.value}>
              {translateTextI18N(option.name)}
            </Option>
          ))}
        </Select>
      )
    },
  }

  const requestFromCol = {
    title: translateTextI18N('Request from'),
    dataIndex: 'roomNumber',
    width: 120,
    render: (_, roomNumber) => {
      const requestFrom = requestFromGenerator(roomNumber)
      return translateTextI18N(requestFrom)
    },
  }

  const createdByNameCol = {
    title: translateTextI18N('Created By'),
    dataIndex: 'createdByName',
    width: 100,
  }

  const responseTimeCol = {
    title: translateTextI18N('Response Time'),
    dataIndex: 'responseTime',
    width: 100,
  }

  const roomNumberCol = {
    title: translateTextI18N('Room No'),
    dataIndex: 'roomNumber',
    width: 100,
    render: (_, row) => {
      if (!isNaN(Number(row.roomNumber))) {
        return translateTextI18N(row.roomNumber)
      } else {
        return translateTextI18N(row.locationName)
      }
    },
  }

  const requestTypeCol = {
    title: translateTextI18N('Request Type'),
    dataIndex: 'requestType',
    width: 100,
    render: requestType => translateTextI18N(requestType),
  }

  const serviceCol = {
    title: translateTextI18N('Service'),
    dataIndex: 'service',
    width: 100,
    render: (_, row) => {
      return translateTextI18N(row.service)
    },
  }

  const ActionCancelCol = {
    title: translateTextI18N('Action'),
    className: 'text-center',
    dataIndex: 'Action',
    width: 100,
    render: (status, row, rowIndex) => {
      const loggedUserId = userInfo?.userId || userInfo?.id
      const isManagementStaff =
        userInfo?.departmentId === ManagementDeptObject.id

      if (
        (isManagementStaff &&
          row.assignedToId &&
          !childIdToParentIds?.[row.assignedToId]?.includes(loggedUserId)) ||
        CompletedLabel === status
      ) {
        return StatusButton({ status, translateTextI18N })
      }

      const onHandleClick = async () => {
        // Check if the user has permission to cancel the request
        const canCancel = await getCurrentUserCancelRequestPermissions({
          roles: userInfo?.roles,
        })

        if (loggedUserId === row.createdBy || isManagementStaff || canCancel) {
          const updatedStatus = 'Canceled'
          onStatusChange({ row, updatedStatus, rowIndex })
        } else {
          // If the user doesn't have permission to cancel, show a message
          updateCommonModal(dispatch, {
            status: true,
            data: row.createdByName,
            type: commonModalType.YouCannotCancel,
          })
        }
      }

      return (
        <Tooltip title='Cancel'>
          <CloseCircleOutlined
            className='viewlink'
            style={{ fontSize: 20 }}
            onClick={e => {
              e.preventDefault()
              onHandleClick()
            }}
          />
        </Tooltip>
      )
    },
  }
  const emptyCancelCol = {
    title: translateTextI18N('ActionCol'),
    dataIndex: 'emptyCancelCol',
    width: 100,
    render: _ => {
      return ''
    },
  }

  const serviceTypeCol = {
    title: translateTextI18N('Service Type'),
    dataIndex: 'serviceType',
    width: 100,
    render: (serviceType, row) => {
      return (
        <span
          style={{
            opacity: !serviceType && ' 0.3',
          }}
        >
          {translateTextI18N(
            Ternary(serviceType === row.service, '', serviceType)
          )}
        </span>
      )
    },
  }

  const submittedTimeCol = {
    title: translateTextI18N('Submitted Time'),
    dataIndex: 'createdAt',
    width: DateTimeColumnWidth,
    render: date => formatDateAndTime(date),
  }

  const orderedTimeCol = {
    title: translateTextI18N('Ordered Time'),
    ...submittedTimeCol,
  }

  const requestedTimeCol = {
    title: translateTextI18N('Requested Time'),
    dataIndex: 'requestedTime',
    width: DateTimeColumnWidth,
    render: requestedTime => formatDateAndTime(requestedTime),
  }

  const imageCol = {
    title: translateTextI18N('Images'),
    className: 'text-center',
    dataIndex: 'images',
    width: 70,
    render: (_, row) => {
      if (!row?.departmentRequestImages?.length) return null
      const images = row.departmentRequestImages.map(url => ({ url }))
      return <MenuGallery menu={images} />
    },
  }
  const locationCol = {
    title: translateTextI18N('Location'),
    className: 'text-center',
    dataIndex: 'location',
    width: 100,
    render: (_, row) => translateTextI18N(row?.locationName),
  }

  const roomNumLocCol = {
    title: translateTextI18N('Room No'),
    className: 'text-center',
    dataIndex: 'location',
    width: 100,
    render: (_, row) => {
      if (row?.isGuestRequest) {
        return translateTextI18N(row?.roomNumber)
      } else {
        return translateTextI18N(row?.locationName)
      }
    },
  }

  const guestComment = {
    title: translateTextI18N('Guest Comment'),
    dataIndex: 'guestcomment',
    width: 200,
    render: (_, row) => row?.guestComment,
  }
  const aiRequest = {
    title: translateTextI18N('Ai Request'),
    dataIndex: 'aiRequest',
    width: 200,
    render: (_, row) => row?.aiRequest,
  }

  const guestCol = {
    width: 150,
    dataIndex: 'guest',
    title: translateTextI18N('Guest'),
    render: guest => toTitleCase(guest),
  }

  const restaurantNameCol = {
    title: 'Restaurant',
    className: 'text-center',
    dataIndex: 'restaurantName',
    width: 150,
  }

  const noOfGuestCol = {
    title: 'No. Of Guest',
    dataIndex: 'noOfGuest',
    width: 70,
  }

  const detailCol = {
    title: 'Detail',
    dataIndex: 'Detail',
    width: 90,
    render: () => '',
  }

  const ticketNumberCol = {
    title: translateTextI18N('Ticket Number'),
    dataIndex: 'ticketNumber',
    width: 100,
  }

  const orderTypeCol = {
    title: translateTextI18N('Meals of the day'),
    dataIndex: 'orderType',
    width: 120,
  }
  const orderTypeColTwo = {
    title: translateTextI18N('Medical Service'),
    dataIndex: 'orderTypeTwo',
    width: 120,
  }

  const billAmountCol = {
    title: translateTextI18N('Total Bill'),
    dataIndex: 'billAmount',
    width: 90,
    render: (_, row) => {
      if (row.service === 'Complementary') {
        // If service is complementary, display 0 price
        return <Amount value={0} />
      } else {
        // Otherwise, display bill amount
        return <Amount value={row.billAmount} />
      }
    },
  }

  const billModal = {
    title: translateTextI18N('View Order'),
    dataIndex: 'billModal',
    width: 90,
    render: (_, row, i) => {
      if (!row.menuDetail || row.menuDetail.length === 0) {
        return null // or return a string value like 'No details available'
      }
      return (
        <asetIsModalVisible
          className='viewlink'
          style={{ fontSize: 12 }}
          onClick={e => {
            e.preventDefault()
            updateCommonModal(dispatch, {
              status: true,
              data: { row },
              type: commonModalType.ViewBill,
              userInfo: userInfo,
            })
          }}
        >
          {translateTextI18N('View')}
        </asetIsModalVisible>
      )
    },
  }

  const deptCol = {
    title: translateTextI18N('Department'),
    dataIndex: 'department',
    width: 100,
  }

  const fromDeptCol = {
    title: translateTextI18N('From Department'),
    dataIndex: 'fromDepartmentName',
    width: 100,
  }

  function assignRequest(e, row) {
    e.preventDefault()
    viewAddRequestModal({ dispatch, row })
  }

  const assignStaffCol = {
    title: translateTextI18N('Assign To'),
    dataIndex: 'assignedToName',
    width: 120,
    render: (assignedToName, row) => {
      const assingButtonComp = (
        <Button
          className='statusBtn completedBtn'
          onClick={e => assignRequest(e, row)}
        >
          {translateTextI18N('Assign')}
        </Button>
      )

      const assingButton = Ternary(hideAssignButton, '', assingButtonComp)

      return Ternary(assignedToName, toTitleCase(assignedToName), assingButton)
    },
  }

  const roomTypeName = {
    title: translateTextI18N('Room Type'),
    dataIndex: 'roomTypeName',
    width: 100,
  }

  const extraInfo = {
    title: translateTextI18N('Extra Info'),
    dataIndex: 'description',
    width: 100,
  }

  const bookingReferanceCol = {
    width: 100,
    dataIndex: 'bookingReferance',
    title: translateTextI18N('Booking Reference'),
  }

  const reservedTimeCol = {
    ...requestedTimeCol,
    title: translateTextI18N('Reserved Time'),
  }

  const serialNumberCol = {
    title: translateTextI18N('Sl.No'),
    dataIndex: 'srNo',
    width: 80,
  }

  const checkedInTimeCol = {
    title: translateTextI18N('Check In'),
    dataIndex: 'checkedInTime',
    width: 155,
    render: date => FormatTimestamp(date),
  }

  const checkedOutTimeCol = {
    title: translateTextI18N('Check Out'),
    dataIndex: 'checkedOutTime',
    width: 155,
    render: date => FormatTimestamp(date),
  }

  const guestFullName = {
    title: translateTextI18N('Guest'),
    dataIndex: '',
    width: 135,
    render: (_, row) => toTitleCase(`${row.name} ${row.surName}`),
  }

  const ratingCol = {
    title: translateTextI18N('Rating'),
    dataIndex: 'rating',
    width: 70,
    render: (rating, row) =>
      rating ? (
        <RatingList selecteRating={row.rating} onlySelectedRating={true} />
      ) : null,
  }

  const guestFeedbackCol = {
    title: translateTextI18N('Feedback'),
    dataIndex: 'feedback',
    width: 200,
    render: (_, row) => {
      return translateTextI18N(row.feedback)
    },
  }

  const guestFeedbackDateTimeCol = {
    title: translateTextI18N('FeedBack Time'),
    dataIndex: 'feedBackDateTime',
    width: DateTimeColumnWidth,
    render: feedBackDateTime => formatDateAndTime(feedBackDateTime),
  }

  function getRatinAndFeedbackCol() {
    return [ratingCol, guestFeedbackCol, guestFeedbackDateTimeCol]
  }

  //all colums return are here
  return {
    getRatinAndFeedbackCol,
    ...getRatinAndFeedbackCol(),
    ...getJobStartEndImageAndName({ translateTextI18N }),
    assignStaffCol,
    billAmountCol,
    billModal,
    bookingReferanceCol,
    checkedInTimeCol,
    checkedOutTimeCol,
    deptCol,
    detailCol,
    extraInfo,
    fromDeptCol,
    guestCol,
    guestFullName,
    imageCol,
    locationCol,
    roomNumLocCol,
    noOfGuestCol,
    orderedTimeCol,
    orderTypeCol,
    orderTypeColTwo,
    requestedTimeCol,
    requestTypeCol,
    reservedTimeCol,
    restaurantNameCol,
    requestFromCol,
    roomNumberCol,
    roomTypeName,
    serialNumberCol,
    serviceCol,
    guestComment,
    aiRequest,
    serviceTypeCol,
    statusCol,
    ActionCancelCol,
    emptyCancelCol,
    submittedTimeCol,
    ticketNumberCol,
    ratingCol,
    createdByNameCol,
    responseTimeCol,
  }
}

export const getStatusButtonStyle = status => {
  const baseStyle = {
    padding: '0 6px',
    fontSize: '10px',
    height: '22px',
    minWidth: '80px',
    color: 'white',
    lineHeight: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  }
  switch (status.toLowerCase()) {
    case 'in progress':
      return {
        ...baseStyle,
        backgroundColor: '#FF8000',
        borderColor: '#FF8000',
      }
    case 'completed':
      return {
        ...baseStyle,
        backgroundColor: '#059E4D',
        borderColor: '#059E4D',
      }
    case 'pending':
      return {
        ...baseStyle,
        backgroundColor: '#FF4500',
        borderColor: '#FF4500',
      }
    case 'delayed':
      return {
        ...baseStyle,
        backgroundColor: '#8B4513',
        borderColor: '#8B4513',
      }
    case 'guest refused':
      return {
        ...baseStyle,
        backgroundColor: '#8B4689',
        borderColor: '#8B4689',
      }
    case 'checkout':
      return {
        ...baseStyle,
        backgroundColor: '#A52A2A',
        borderColor: '#A52A2A',
      }
    case 'dnd':
      return {
        ...baseStyle,
        backgroundColor: '#20B2AA',
        borderColor: '#20B2AA',
      }
    case 'out of service':
      return {
        ...baseStyle,
        backgroundColor: '#708090',
        borderColor: '#708090',
      }

    default:
      return {
        ...baseStyle,
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
      }
  }
}

export const handleStatusChangeWithComment = async (
  taskId,
  newStatus,
  comment,
  currentUser,
  db,
  hotelId,
  currentStaffName
) => {
  try {
    if (!hotelId || !taskId) {
      console.error('Missing required fields:', { hotelId, taskId })
      throw new Error('Missing required fields for query')
    }

    let query = db
      .collectionGroup(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .where('hotelId', '==', hotelId)
      .where('requestId', '==', taskId)

    const querySnapshot = await query.get()


    if (!querySnapshot.empty) {
      const taskDoc = querySnapshot.docs[0]

      const newComment = {
        id: uuidv4(),
        staffId: currentUser?.uid || 'unknown',
        staffName: currentStaffName || '',
        date: firebase.firestore.Timestamp.now(),
        description: comment,
        type: `Status changed to ${newStatus}`,
      }

      const currentComments = taskDoc.data().comments || []
      const updatedComments = [...currentComments, newComment]

      await taskDoc.ref.update({
        status: newStatus,
        comments: updatedComments,
      })

      console.log('Document updated successfully')
      return newComment
    } else {
      console.error('No matching document found')
      throw new Error('No matching document found')
    }
  } catch (error) {
    console.error('Error updating status with comment:', error)
    throw error
  }
}

export const updateTasksState = (prevTasks, taskId, newStatus, newComment) => {
  return prevTasks.map(task =>
    task.id === taskId || task.key === taskId
      ? {
          ...task,
          status: newStatus,
          comments: [...(task.comments || []), newComment],
        }
      : task
  )
}

export const getCustomTitle = task => {
  let title = task?.service || 'Task'

  if (task?.roomno || task?.location) {
    title += ` -  Room/Location: ${task.roomno || task.location}`
  }

  if (task?.staff || task?.staffName) {
    title += ` - Reported By: ${task.staff || task.staffName}`
  }

  if (task?.department) {
    title += ` (${task.department})`
  }

  return title
}

export function ActionAdminCancel({
  dispatch,
  translateTextI18N,
  userInfo,
  childIdToParentIds,
  handleStatusChange = () => {},
  staffHierarchyErrorLogs,
}) {
  function onStatusChange({ row, updatedStatus, rowIndex }) {
    let commonProps = {
      requestId: row.id,
      updatedStatus: updatedStatus,
      serviceName: row.serviceType
        ? row.service + ' - ' + row.serviceType
        : row.service,
      requestReferenceId: row.bookingReferance,
      guestId: row.guestId,
      hotelId: row.hotelId,
      requestType: row.requestType,
      rowIndex,
      userInfo,
      userReqUpdateData: row,
    }

    changeRequestStatus({
      commonProps,
      childIdToParentIds,
      staffHierarchyErrorLogs,
      dispatch,
      row,
      userInfo,
      updatedStatus,
      handleStatusChange,
    })
  }
  return {
    title: translateTextI18N('Action'),
    className: 'text-center',
    dataIndex: 'Action',
    width: 100,
    render: (status, row, rowIndex) => {
      const isHotelAdmin = userInfo?.roles?.includes(HotelAdminRole)
      const loggedUserId = userInfo?.userId || userInfo?.id
      const isManagementStaff =
        userInfo?.departmentId === ManagementDeptObject.id
      const onHandleClick = async () => {
        const canCancel = await getCurrentUserCancelRequestPermissions({
          roles: userInfo?.roles,
        })

        if (
          isHotelAdmin ||
          loggedUserId === row.createdBy ||
          isManagementStaff ||
          canCancel
        ) {
          // If admin authorized
          const updatedStatus = 'Canceled'
          onStatusChange({ row, updatedStatus, rowIndex })
        } else {
          //add you dont have permission to cancel this request
          updateCommonModal(dispatch, {
            status: true,
            data: row.createdByName,
            type: commonModalType.YouCannotCancel,
          })
          return true
        }
      }

      return (
        <Tooltip title='Cancel'>
          <CloseCircleOutlined
            className='viewlink'
            style={{ fontSize: 20 }}
            onClick={e => {
              e.preventDefault()
              onHandleClick()
            }}
          />
        </Tooltip>
      )
    },
  }
}

function sanitiseImages(imageArr) {
  const formattedArr = []
  imageArr.forEach(elem => {
    formattedArr.push({ url: typeof elem === 'string' ? elem : elem.url })
  })
  return formattedArr
}

function onKeyDown(e, row, type, showImageUploadPopup) {
  if (e.key === 'Enter') {
    e.preventDefault()
    showImageUploadPopup(row, type)
    return true
  }
  return false
}

export function getJobStartEndImageAndName({
  translateTextI18N,
  showImageUploadPopup,
}) {
  const beforeStartUpload = {
    title: translateTextI18N('Image Before Job'),
    dataIndex: 'beforeStartUploadImages',
    width: 140,
    render: (_, row) => {
      const beforeStartAvailable =
        row?.beforeStartUploadImages && row.beforeStartUploadImages?.length > 0
      const linkStyle = Ternary(!beforeStartAvailable, linkStyleConfig, {})

      return (
        <>
          <a
            onClick={() => showImageUploadPopup(row, 'before')}
            className='viewlink'
            rel='noopener noreferrer'
            onKeyDown={e => onKeyDown(e, row, 'before', showImageUploadPopup)}
            role='button'
            tabIndex='0'
          >
            {translateTextI18N('Upload')}
          </a>
          {beforeStartAvailable && (
            <MenuGallery
              menu={sanitiseImages(row.beforeStartUploadImages)}
              style={linkStyle}
            />
          )}
          {!beforeStartAvailable && (
            <a
              className='viewlink'
              rel='noopener noreferrer'
              disabled={true}
              style={linkStyle}
            >
              {translateTextI18N('View')}
            </a>
          )}
        </>
      )
    },
  }

  const afterCompleteUpload = {
    title: translateTextI18N('Image After Job'),
    dataIndex: 'afterCompleteUploadImages',
    width: 140,
    render: (_, row) => {
      const afterCompletedAvailable =
        row?.afterCompleteUploadImages &&
        row?.afterCompleteUploadImages?.length > 0
      const linkStyle = Ternary(!afterCompletedAvailable, linkStyleConfig, {})
      return (
        <>
          <a
            onClick={() => showImageUploadPopup(row, 'after')}
            className='viewlink'
            rel='noopener noreferrer'
            onKeyDown={e => onKeyDown(e, row, 'after', showImageUploadPopup)}
            role='button'
            tabIndex='0'
          >
            {translateTextI18N('Upload')}
          </a>
          {afterCompletedAvailable && (
            <MenuGallery
              menu={sanitiseImages(row.afterCompleteUploadImages)}
              style={linkStyle}
            />
          )}
          {!afterCompletedAvailable && (
            <a
              className='viewlink'
              rel='noopener noreferrer'
              disabled={true}
              style={linkStyle}
            >
              {translateTextI18N('View')}
            </a>
          )}
        </>
      )
    },
  }

  const jobStartByName = {
    title: translateTextI18N('Start By'),
    dataIndex: 'jobStartByName',
    width: 135,
  }

  const jobStartDateTime = {
    title: translateTextI18N('Start Time'),
    dataIndex: 'startTime',
    width: 135,
    render: startDateTime => formatDateAndTime(startDateTime),
  }

  const jobEndByName = {
    title: translateTextI18N('Completed By'),
    dataIndex: 'jobEndByName',
    width: 135,
  }

  const completedTimeCol = {
    title: translateTextI18N('Completed Time'),
    dataIndex: 'completedTime',
    width: DateTimeColumnWidth,
    render: completedTime => formatDateAndTime(completedTime),
  }

  return [
    beforeStartUpload,
    afterCompleteUpload,
    jobStartByName,
    jobStartDateTime,
    jobEndByName,
    completedTimeCol,
  ]
}

export function timeTakenCalculation(row) {
  let result = 0 + ' Hours ' + 0 + ' Minutes'

  const { startTime, completedTime } = row
  if (startTime && completedTime) {
    const { seconds: start } = startTime
    const { seconds: completed } = completedTime

    const startTimeStamp = start * 1000
    const completedTimeStamp = completed * 1000
    let diffTimeStamp = completedTimeStamp - startTimeStamp

    if (diffTimeStamp > 0) {
      let hoursDifference = Math.floor(diffTimeStamp / 1000 / 60 / 60)

      diffTimeStamp -= hoursDifference * 1000 * 60 * 60
      let minutesDifference = Math.floor(diffTimeStamp / 1000 / 60)
      result = hoursDifference + ' Hours ' + minutesDifference + ' Minutes'
    }

    return result
  } else {
    result = ''
  }

  return result
}

export function getStatiticsColumns({ translateTextI18N }) {
  const allocatedTimeCol = {
    title: translateTextI18N('Allocated Time'),
    dataIndex: 'requiredTime',
    width: 100,
  }

  const timeTakenCol = {
    title: translateTextI18N('Time Taken'),
    dataIndex: 'timeTaken',
    width: 100,
    render: (_, row) => timeTakenCalculation(row),
  }

  const varianceCol = {
    title: translateTextI18N('Variance'),
    dataIndex: 'variance',
    width: 70,
    render: (_, row) => `${row?.statistics?.newVarianceStr ?? '--'}`,
  }

  return [allocatedTimeCol, timeTakenCol, varianceCol]
}

export function getStaffcolumns({ translateTextI18N }) {
  const staffColumns = [
    {
      title: translateTextI18N('Name'),
      dataIndex: 'name',
      width: 160,
    },
    {
      title: translateTextI18N('Title'),
      dataIndex: 'title',
      width: 100,
    },
    {
      title: translateTextI18N('Department'),
      dataIndex: 'department',
      width: 100,
    },
    {
      title: translateTextI18N('Manager'),
      dataIndex: '',
      width: 100,
      render: datum => {
        const bindManager =
          datum?.managerNames && datum?.managerNames?.length > 0
            ? datum?.managerNames.join(', ')
            : null
        return bindManager
      },
    },
    {
      title: translateTextI18N('Email'),
      dataIndex: 'email',
      width: 180,
    },
    {
      title: translateTextI18N('Contact No'),
      dataIndex: 'contactNumber',
      width: 110,
    },
  ]
  return staffColumns
}

export const GetDateTimeString = date => {
  const options = {
    hour12: true,
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }

  if (date) return new Date(date).toLocaleString('en-IN', options)

  return new Date().toLocaleString('en-IN', options)
}

export const GetEscalationTime = (date, time) => {
  if (time.length < 5) return date
  const [hour, minute] = time.split(':').map(v => +v)
  let requestedTime = new Date(date)
  requestedTime.setHours(requestedTime.getHours() + hour)
  requestedTime.setMinutes(requestedTime.getMinutes() + minute)
  return requestedTime
}

export function GetPostfix(value, postFix) {
  if (+value > 1) {
    return postFix + 's'
  }
  return postFix
}

export function MapToIdName(arr) {
  return arr.map(s => ({ id: s.name, name: s.name }))
}

export function isFilterValueSelected(selectedValue, lable = '') {
  return (
    selectedValue &&
    selectedValue !== lable &&
    selectedValue?.toLowerCase() !== 'all' &&
    selectedValue?.toLowerCase() !== '0'
  )
}

export async function getServerDate() {
  try {
    if (!auth.currentUser) return
    const docRef = db
      .collection(Collections.CONFIG)
      .doc('hotel-admin-configuration')
    await docRef.set({ now: timestamp() }, { merge: true })

    const doc = await docRef.get()
    const utcDate = doc?.data()?.now?.toDate()
    return utcDate ? new Date(utcDate.toString()) : new Date()
  } catch (error) {
    console.log('🚀 ', error?.message)
  }
  return new Date()
}

export function getActiveManagers(managers = {}) {
  let managerIds = [],
    managerNames = [],
    activeManagers = []

  if (managers) {
    activeManagers = Object.values(managers).filter(m => m?.active)
    managerIds = activeManagers?.map(m => m?.id) || []
    managerNames = activeManagers?.map(i => i?.name).sort() || []
  }

  return { managerIds, managerNames, activeManagers }
}

export function deepCloneObject(obj) {
  if (!obj) return []
  return JSON.parse(JSON.stringify(obj))
}

export function isObjectSame(obj1, obj2) {
  if (!obj1 || !obj2) return false

  return JSON.stringify(obj1) !== JSON.stringify(obj2)
}

export function getUniqueValuesArray(idsArray) {
  return [...new Set(idsArray)]
}

async function AdminNotification({
  serviceName,
  updatedStatus,
  guestId,
  hotelId,
  requestReferenceId,
  requestType,
  departmentId,
  requestId = '',
  comment,
}) {
  const template_variables = {
    '%request%': serviceName,
    '%status%': updatedStatus,
  }

  const userid = GetCurrentUser().uid

  await AdminRequest(
    ADMIN_REQUEST_CHANGE,
    template_variables,
    userid,
    guestId,
    hotelId,
    requestReferenceId,
    requestType,
    departmentId,
    requestId,
    comment
  )
}

export async function sendNotification(data) {
  try {
    const { requestReferenceId, updatedStatus, userReqUpdateData, userInfo, newComment } =
      data

    let {
      assignedToId: staffId,
      departmentId,
      departmentKey,
      guestId,
      hotelId,
      loggedUserName: userName,
      reasonForReturn,
      requestType,
      service: serviceName,
      serviceType,
      isGuestRequest = '',
      id,
      locationName,
      assignedToStaffId,
    } = userReqUpdateData

    const statusToNotificationConfig = {
      [DeferredLabel]: {
        notificationType: notificationTypes.DEFERRED.toUpperCase(),
        requestType: notificationTypes.DEFERRED,
      },
      [CanceledLabel]: {
        notificationType: notificationTypes.CANCELED.toUpperCase(),
        requestType: notificationTypes.CANCELED,
      },
      [DNDLabel]: {
        notificationType: 'STATUS_UPDATE_RECURRING_REQUEST',
        requestType: notificationTypes.DND,
      },
      [checkoutLabel]: {
        notificationType: 'STATUS_UPDATE_RECURRING_REQUEST',
        requestType: notificationTypes.CHECKOUT,
      },
      [outOfServiceLabel]: {
        notificationType: 'STATUS_UPDATE_RECURRING_REQUEST',
        requestType: notificationTypes.OUT_OF_SERVICE,
      },
      [guestRefusedLabel]: {
        notificationType: 'STATUS_UPDATE_RECURRING_REQUEST',
        requestType: notificationTypes.GUEST_REFUSED,
      },
      [delayedLabel]: {
        notificationType: 'STATUS_UPDATE_RECURRING_REQUEST',
        requestType: notificationTypes.DELAYED,
      },
    }

    const notificationConfig = statusToNotificationConfig[updatedStatus]
    if (notificationConfig) {
      if (!staffId) staffId = userInfo?.id || userInfo?.userId

      let requestPath =
        getRequestCollection(hotelId, departmentId)?.path + `/${id}`
      const staffDoc = await getUserRef({ userId: staffId, hotelId }).get()
      const { managerIds, roles } = staffDoc.data()

      const requestData = {
        departmentKey,
        hotelId,
        managerIds,
        notificationType: notificationConfig.notificationType,
        reasonForReturn,
        requestPath,
        requestType: notificationConfig.requestType,
        serviceName,
        serviceType: serviceType || serviceName,
        staffId,
        userName,
        departmentId,
        newComment,
        locationName,
        updatedStatus,
        assignedToStaffId,
        isGuestRequest,
      }

      if(notificationConfig?.notificationType === 'STATUS_UPDATE_RECURRING_REQUEST'){
        requestData['isDepartmentType'] = true
        ManagerRequest(requestData)
      }else{
        if (managerIds?.length) {
          ManagerRequest(requestData)
        }
        requestData['isDepartmentType'] = true
        ManagerRequest(requestData) // For sending Cancel and deffered change notification to department
      }
      
    }

    // This runs regardless of the updatedStatus match
    await AdminNotification({
      serviceName,
      updatedStatus,
      guestId,
      hotelId,
      requestReferenceId,
      requestType,
      departmentId,
      requestId: id,
      comment: reasonForReturn ? reasonForReturn : '',
    })
  } catch (error) {
    console.log(error)
  }
}


export function getManagerHierarchy({ managerId, newManagersToStaff }) {
  let staff = newManagersToStaff[managerId] || []
  for (const objStaffId of staff) {
    staff = staff.concat(
      getManagerHierarchy({ managerId: objStaffId, newManagersToStaff })
    )
    staff = [...new Set(staff)]
  }
  return staff
}

export function getManagerHierarchyList(newManagersToStaff) {
  let managerHierarchy = {}
  for (let managerId in newManagersToStaff) {
    managerHierarchy[managerId] = getManagerHierarchy({
      managerId,
      newManagersToStaff,
    })
  }
  return managerHierarchy
}

export function updateManagerToStaffListData(graph) {
  let visited = {}
  let result = []
  let errorPath = []

  function dfs(graph, node, visited, result) {
    if (visited[node]) return
    visited[node] = true
    result.push(node)

    for (let i = 0; i < graph[node]?.length; i++) {
      dfs(graph, graph[node][i], visited, result)
    }
  }

  for (let node in graph) {
    dfs(graph, node, visited, result)
  }

  let newGraph = {}
  for (let i = 0; i < result.length; i++) {
    let node = result[i]
    let staff = []
    for (let j = i + 1; j < result.length; j++) {
      if (graph[node]?.includes(result[j])) {
        staff.push(result[j])
      }
    }
    newGraph[node] = staff
  }

  return { newManagersToStaff: newGraph, errorPath }
}

export function getImage(iconSrc) {
  return `${window.location.origin}/${iconSrc}`
}

export function getChildIdToParentIds(data) {
  const allParentOfChild = {}

  // recursive helper function
  function getParentIds(userId) {
    let parentIds = []
    const user = data.find(u => u.userId === userId)

    if (!user) {
      allParentOfChild[userId] = parentIds
      return parentIds
    }

    for (const managerId of user?.managerIds || []) {
      parentIds.push(managerId)
      parentIds = [...new Set([...parentIds, ...getParentIds(managerId)])]
    }

    return parentIds
  }

  // loop through each user and get all parent ids recursively
  for (const user of data) {
    allParentOfChild[user.userId] = getParentIds(user.userId)
  }

  return allParentOfChild
}

export function checkCyclicRecursion({ managerIdToStaffIds, userIdToInfo }) {
  const visited = new Set()
  const stack = new Set()
  let errorLog = []
  const errorUID = []

  function dfs(userIdToManagerIds, userId) {
    visited.add(userId)
    stack.add(userId)

    for (let managerId of userIdToManagerIds?.[userId] || []) {
      if (!visited.has(managerId)) {
        dfs(userIdToManagerIds, managerId)
      } else if (stack.has(managerId)) {
        const cycle = [...stack, managerId]
        errorUID.push(cycle)

        errorLog.push(
          `Cyclic recursion detected: ${cycle
            .map(uId => userIdToInfo?.[uId]?.name || '')
            .join(' -> ')}`
        )

        errorLog = [...new Set(errorLog)]
      }
    }

    stack.delete(userId)
  }

  for (let [userId] of Object.entries(managerIdToStaffIds)) {
    if (!visited.has(userId)) {
      dfs(managerIdToStaffIds, userId)
    }
  }

  return { errorLog, errorUID }
}

export function getIdToInfo(userList, state) {
  let managerToStaffList = {}
  let managerIdToStaffIds = {}
  let userIdToInfo = {}

  let staffList = [...userList]
  if (state?.userInfo) {
    staffList = [...staffList, state?.userInfo]
  }
  for (const staff of staffList) {
    let { managers, id } = staff
    userIdToInfo[id] = staff

    if (!managers) continue

    for (const [managerId] of Object.entries(managers || {})) {
      if (!managers?.[managerId]?.active) continue

      if (!managerToStaffList[managerId]) managerToStaffList[managerId] = []
      if (!managerIdToStaffIds[managerId]) managerIdToStaffIds[managerId] = []

      managerToStaffList[managerId].push(staff)
      managerIdToStaffIds[managerId].push(staff?.id || staff?.userId)
    }
  }

  return {
    managerToStaffList,
    userIdToInfo,
    managerIdToStaffIds,
  }
}

export function getManagerList(userList, userIdToInfo) {
  const managerList = {}
  for (const user of userList) {
    const { managers } = user
    if (!managers) continue

    for (const [managerId] of Object.entries(managers || {})) {
      if (!managers?.[managerId]?.active) continue
      managerList[managerId] = userIdToInfo[managerId]
    }
  }

  return Sort(Object.values(managerList), 'name')
}

export function getRatingOptions(ratingConfig) {
  let ratingOptions = [{ id: 'all', name: 'All' }]
  Object.entries(ratingConfig)?.forEach(([rate, emoji]) =>
    ratingOptions.push({ id: rate, name: emoji, isEmoji: true })
  )
  return ratingOptions
}

export const GetSuccessMessage = status =>
  Ternary(
    status === inProgressLabel,
    'Reservation confirmed successfully',
    'Reservation rejected'
  )

export function getViewOrderDetail({
  dispatch,
  isArchived = false,
  row,
  rowIndex,
  translateTextI18N,
  archivedHelperFunc = () => {},
  setErrorMessage = () => {},
  setSuccessMessage = () => {},
  setSuccessMessageType = () => {},
}) {
  return Ternary(
    row.departmentKey === DepartmentAndServiceKeys.foodAndBeverage.key &&
      !row.isMoreRequest &&
      row.serviceKey,
    <a
      className='viewlink'
      onClick={() => {
        dispatch(
          actions.setViewOrderModal({
            isModalVisible: true,
            requestData: row,
            props: {
              isArchived,
              rowIndex,
              archivedHelperFunc,
              setErrorMessage,
              setSuccessMessage,
              setSuccessMessageType,
            },
          })
        )
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault()
          dispatch(
            actions.setViewOrderModal({
              isModalVisible: true,
              requestData: row,
              props: {
                isArchived,
                rowIndex,
                archivedHelperFunc,
                setErrorMessage,
                setSuccessMessage,
                setSuccessMessageType,
              },
            })
          )
        }
      }}
      role='button'
      tabIndex='0'
    >
      {translateTextI18N('View')}
    </a>,
    null
  )
}

export const GetTranlatedOrderType = (orderType, cuisines, currentLanguage) => {
  if (orderType) {
    let orderTypes = orderType.split(', ')
    orderTypes = orderTypes
      .map(cuisineName => {
        const cuisine = cuisines.find(c => c.name === cuisineName)
        if (cuisine) {
          return GetTranslatedName(cuisine, currentLanguage, 'name')
        }
        return ''
      })
      .join(', ')
    return orderTypes
  }
  return ''
}

export function arrangeAssignToAndStatusCol(
  columns,
  {
    dispatch,
    handleStatusChange,
    hotelId,
    setErrorMessage,
    setShowLoader,
    setSuccessMessage,
    translateTextI18N,
    userInfo,
    staffListForLoggedManager,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  }
) {
  let tmpColumns = [
    ...columns,
    GetStatusColumn({
      dispatch,
      handleStatusChange,
      hotelId,
      setErrorMessage,
      setShowLoader,
      setSuccessMessage,
      statusOptions: RequestStatus,
      translateTextI18N,
      userInfo,
      staffListForLoggedManager,
      childIdToParentIds,
      staffHierarchyErrorLogs,
    }),
  ]

  return setColumnOrder(tmpColumns, 'assignedToName', 'status')
}
export function findColIndex(arr, colName) {
  return arr.findIndex(item => item.dataIndex === colName)
}

export function setColumnOrder(tmpColumns, firstCol, secondCol) {
  const indexFirstCol = findColIndex(tmpColumns, firstCol)
  const indexSecondCol = findColIndex(tmpColumns, secondCol)

  tmpColumns.splice(
    indexFirstCol + 1,
    0,
    ...tmpColumns.splice(indexSecondCol, 1)
  )

  return tmpColumns
}

export function swapColumns(arr, col1, col2) {
  const index1 = findColIndex(arr, col1)
  const index2 = findColIndex(arr, col2)

  if (index1 !== -1 && index2 !== -1) {
    ;[arr[index1], arr[index2]] = [arr[index2], arr[index1]]
  }
  return arr
}

export function calculateResponseTime(arr) {
  let newArr = []
  if (arr.length > 0) {
    arr.forEach(item => {
      let tempResponseDateString = ''
      let tempResponseTimeStamp = ''
      let responseInMinutes = ''
      const { requestedTime, startTime } = item //change it to startTime
      if (startTime && requestedTime) {
        const completedTimeFormatted = String(startTime.toDate())
        const tsCompleted = moment(completedTimeFormatted).unix()

        const requestedTimeFormatted = String(requestedTime.toDate())
        const tsRequested = moment(requestedTimeFormatted).unix()

        const res = tsCompleted - tsRequested
        const { responseDateString, responseTimeStamp } = secondsToHHMMSS(res)
        tempResponseDateString = responseDateString
        tempResponseTimeStamp = responseTimeStamp
        responseInMinutes = Math.floor(responseTimeStamp / 60)
      }
      newArr.push({
        ...item,
        responseTime: tempResponseDateString,
        responseTimeStamp: tempResponseTimeStamp,
        responseInMinutes: responseInMinutes,
      })
    })
    return newArr
  }
}

function secondsToHHMMSS(sec) {
  let totalSeconds = sec
  let hours = Math.floor(totalSeconds / 3600)
  totalSeconds %= 3600
  let minutes = Math.floor(totalSeconds / 60)
  let seconds = totalSeconds % 60
  let formattedTime = hours + ':' + minutes + ':' + seconds
  return { responseDateString: formattedTime, responseTimeStamp: sec }
}

export function groupArrayByType(groupByVal, data) {
  let newArr = []
  let result = data.map(a => a.department)
  result = [...new Set(result)]
  let result1 = data.map(a => a.fromDepartmentName)
  result1 = [...new Set(result1)]
  result1 = result1.concat(result)
  let uniqueDept = [...new Set(result1)]
  uniqueDept = uniqueDept.filter(function (element) {
    return element !== undefined
  })

  uniqueDept.forEach(item => {
    let filterByDept = data.filter(
      e => e.department === item || e.fromDepartmentName === item
    )
    if (filterByDept.length > 0) {
      if (groupByVal === 'date_range') {
        filterByDept.forEach(function (e) {
          e['dateShort'] = moment(String(e.requestedDate.toDate())).format(
            'MMMM Do YYYY'
          )
          e['dateLong'] = moment(String(e.requestedDate.toDate()))
        })
      } else if (groupByVal === 'week_range') {
        filterByDept.forEach(function (e) {
          e['dateShort'] = `${moment(String(e.requestedDate.toDate())).format(
            'YYYY'
          )}   ${moment(String(e.requestedDate.toDate())).week()}th Week`
          e['dateLong'] = moment(String(e.requestedDate.toDate()))
        })
      } else {
        filterByDept.forEach(function (e) {
          e['dateShort'] = moment(String(e.requestedDate.toDate())).format(
            'MMM YYYY'
          )
          e['dateLong'] = moment(String(e.requestedDate.toDate()))
        })
      }
    }
    filterByDept = orderBy(filterByDept, 'dateShort', 'desc')
    let dateGrouped = groupBy(filterByDept, function (a) {
      return a.dateShort
    })

    Object.keys(dateGrouped).forEach(dateVal => {
      let itemSelector = dateGrouped[dateVal]

      //Completed Count
      const totalCompletedCount = itemSelector.filter(
        p => p.department === item && p.status === 'Completed'
      ).length

      // Received count
      const totalRequestCountFilter = itemSelector.filter(
        p => p.department === item
      )
      const totalRequestCount = totalRequestCountFilter.length

      // Raised count
      const totalRaisedCountFilter = itemSelector.filter(
        p => p.fromDepartmentName === item
      )

      const totalRaisedCount = totalRaisedCountFilter.length

      newArr.push({
        department: item,
        dateShort: dateVal,
        dateLong: new Date(itemSelector[0].dateLong).getTime(),
        totalRequestCount: totalRequestCount,
        totalCompletedCount: totalCompletedCount,
        totalRaisedCount: totalRaisedCount,
      })
    })
  })
  const formattedRes = groupBy(newArr, function (a) {
    return a.department
  })
  return formattedRes
}

export function getHotelOverallFeedbackQuestions(
  hotelId = '',
  questionId = ''
) {
  let dbQuery = db
    .collection(Collections.OVERALLFEEDBACKQUESTIONS)
    .doc(hotelId)
    .collection(Collections.HOTELOVERALLFEEDBACKQUESTIONS)

  if (questionId) {
    dbQuery = dbQuery.doc(questionId)
  }
  return dbQuery
}

export function useIsMountedRef() {
  const isMountedRef = useRef(null)
  useEffect(() => {
    isMountedRef.current = true
    return () => (isMountedRef.current = false)
  })
  return isMountedRef
}

export function advancedSorting(data) {
  let newarr = []
  let newData = data
  newData = Sort(newData, 'department')
  newData.forEach((item, i) => {
    const { department } = item
    const findItemExist = newarr.find(s => s.department === department)
    if (!findItemExist) {
      let filterItem = newData.filter(el => el.department === department)
      filterItem = Sort(filterItem, 'dateLong')
      newarr.push(...filterItem)
    }
  })
  return newarr
}

export const getRequestRowData = async (hotelId, departmentId, rowId) => {
  const rowSnapshot = await db
    .collection(Collections.REQUEST_INFO)
    .doc(hotelId)
    .collection(Collections.REQUEST_INFO_DEPARTMENT)
    .doc(departmentId)
    .collection(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
    .doc(rowId)
    .get()

  return {
    ...rowSnapshot.data(),
  }
}

export const sortByCustomField = (field, sortOrder) => {
  if (field === 'department') {
    return function (a, b) {
      if (a.department && b.department) {
        if (sortOrder === 'desc') {
          return b.department.localeCompare(a.department)
        } else {
          return a.department.localeCompare(b.department)
        }
      }
    }
  } else if (field === 'requestedTime') {
    return function (a, b) {
      if (a.requestedTime && b.requestedTime) {
        if (sortOrder === 'desc') {
          return b.requestedTime - a.requestedTime
        } else {
          return a.requestedTime - b.requestedTime
        }
      }
    }
  }
}

export const paginateQueryWithCustomOrder = ({
  query,
  page,
  startAfter,
  orderBy,
}) => {
  query = query.orderBy(orderBy, 'desc')
  if (page !== 1) query = query.startAfter(startAfter)
  query = query.limit(defaultPageSize * (page === 1 ? 2 : 1))

  return query
}

export const updateUserRequestCountByRequestAssignment = async (
  requestData,
  updatedRequestData
) => {
  try {
    // Extract values from requestData
    const {
      serviceId = '',
      service = '',
      serviceKey = '',
      hotelId = '',
      assignedToId: requestAssignedToId = '',
      assignedById: requestAssignedById = '',
    } = requestData || {}

    // Use values from updatedRequestData if they are empty in requestData
    const assignedToId =
      requestAssignedToId || updatedRequestData.assignedToId || ''
    const assignedById =
      requestAssignedById || updatedRequestData.assignedById || ''

    // Ensure required values are present
    if (!hotelId || !assignedToId || !assignedById) {
      throw new Error('Missing required data')
    }

    // Prepare the data to send
    const data = {
      serviceId,
      service,
      serviceKey,
      hotelId,
      assignedToId,
      assignedById,
    }

    // Make the API request
    await Axios.post(APIs.UPDATE_DASHBOARD_COUNT_REQUEST_ASSIGNMNET, data)

    console.log('Request count updated successfully')
  } catch (error) {
    console.error('Error updating user request counts:', error.message)
    throw error
  }
}

export const updateRequestStatusCount = async requestData => {
  try {
    await Axios.post(APIs.UPDATE_DASHBOARD_COUNT, {
      requestData,
    })
  } catch (error) {
    console.error(
      'Error updating dashboard:',
      error.response ? error.response.data : error.message
    )
    throw error
  }
}
