/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import {
  Input,
  Table,
  Select,
  Modal,
  Button,
  Upload,
  Form,
  message,
  Popover,
  Checkbox,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import ImgCrop from 'antd-img-crop'

import Header from '../../Common/Header/Header'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import PageNamecard from '../../Common/PageNameCard/PageNameCard'

import CountBrownCard from '../../Common/CountCard/CountBrownCard/CountBrownCard'
import CountGreenCard from '../../Common/CountCard/CountGreenCard/CountGreenCard'

import ActivityCard from '../../Common/ActivityCard/ActivityCard'
import {
  CreateNewUser,
  DeleteUserProfile,
  EditUserProfile,
  UpdateUser,
  ForcePasswordUpdateDb,
  changeManager,
  activateManager,
} from '../../../services/user'
import PlaceHolder from '../../../assets/backgroundimages/Placeholder.svg'
import {
  beforeCrop,
  getActiveManagers,
  GetContactNubmerPrefixOptions,
  getImage,
  SanitizeNumber,
  Sort,
  Ternary,
  validateProfileImage,
} from '../../../config/utils'
import {
  activeInactiveStatusList,
  commonModalType,
  emailErrorMessge,
  ManagementDeptObject,
  ManagerType,
  Option,
  PaginationOptions,
  Search,
  secondsToShowAlert,
  statusFilterLabel,
  validateAlphaNumeric,
} from '../../../config/constants'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import StaffHelper from './StaffHelper'
import SelectManager from './SelectManager'
import DepartmentOrServiceName from '../../Common/DepartmentOrServiceName/DepartmentOrServiceName'
import OrganizationChart from './OrganizationChart'
import useHotelAdminDashboardStat from '../../../hooks/useHotelAdminDashboardStat'
import ConfirmResend from './ConfirmResend'
import StaffSuccessModal from './StaffSuccessModal'
import StaffConfirmDelete from './StaffConfirmDelete'
import ForcePasswordUpdate from './ForcePasswordUpdate'
import { copyUser } from '../../../config/images'
import StaffDeptRoleManagerSelection from './StaffDeptRoleManagerSelection'
import CopyStaffFromGroup from './CopyStaffFromGroup'
import HotelAssociation from './HotelAssociation'
import { actions } from '../../../Store'
import ErrorSVG from './../../../assets/svg/error_svg'

const departmentFilterLabel = 'Department'
const managerFilterLabel = 'Manager'

const FormTypes = {
  ADD_STAFF: 'ADD_STAFF',
  COPY_STAFF: 'COPY_STAFF',
}

const contactInfoWarning =
  'Please use either an email address or a phone number for contact information. You cannot use both. Please choose the most convenient method of contact for the staff member.'

function getDepartmentName(departmentAndServiceIdToInfo, department) {
  let deptName = departmentAndServiceIdToInfo[department]?.name || ''
  if (department === ManagementDeptObject.id) {
    deptName = ManagementDeptObject.name
  }
  return deptName
}

const Staff = () => {
  const [loadingData, setLoadingData] = useState(false)
  const [users, setUsers] = useState([])
  const [userId, setUserId] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [contactNumberPrefix, setContactNumberPrefix] = useState('')
  const [status, setStatus] = useState('')

  const [profileImage, setProfileImage] = useState()
  const [profileImageUrl, setProfileImageUrl] = useState()
  const [profileImageError, setProfileImageError] = useState('')

  const [form] = Form.useForm()
  const [replacementForm] = Form.useForm()
  const [showLoader, setShowLoader] = useState(false)
  const [createUserError, setCreateUserError] = useState('')
  const [deleteUserError, setDeleteUserError] = useState('')
  const [statusChangeError, setStatusChangeError] = useState('')

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [formType, setFormType] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [resStatus, setResStatus] = useState(true)

  const [filteredName, setFilteredName] = useState('')
  const [filteredDept, setFilteredDept] = useState('')
  const [filteredDeptName, setFilteredDeptName] = useState(
    departmentFilterLabel
  )
  const [filteredManager, setFilteredManager] = useState(managerFilterLabel)
  const [filteredStatus, setFilteredStatus] = useState(statusFilterLabel)
  const [filteredUser, setFilteredUser] = useState([])

  const [editingUserProfile, setEditingUserProfile] = useState(false)
  const [profileImageName, setProfileImageName] = useState(false)
  const [deleteProfileImage, setDeleteProfileImage] = useState(false)

  const [userAction, setUserAction] = useState('')
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [userToDelete, setUserToDelete] = useState()
  const [titles, setTitles] = useState([])

  const [resendModalVisible, setResendModalVisible] = useState(false)
  const [isForcePasswordModalVisible, setForcePasswordModalVisible] =
    useState(false)

  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [emailOrPhone, setEmailOrPhone] = useState(true)

  const [staff, setStaff] = useState([])
  const [isHierarchyModal, setIsHierarchyModal] = useState(false)
  const [isReplacementModalVisible, setIsReplacementModalVisible] =
    useState(false)
  const [replacementManagerId, setReplacementManagerId] = useState('')
  const [replacementManagerName, setReplacementManagerName] = useState('')
  const [replacementAndDelete, setReplacementAndDelete] = useState(false)
  const [isUserVerified, setIsUserVerified] = useState(false)
  const [selectedManagerType, setSelectedManagerType] = useState(
    ManagerType.NewManager
  )

  const [formCopyStaff] = Form.useForm()
  const [copyUserId, setCopyUserId] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [managers, setManagers] = useState({})
  const {
    titleAndPermission,
    staffList,
    staffLoading,
    managerList,
    departmentsNew: departments,
    departmentAndServiceIdToInfo,
    managerToStaffList,
    hotelInfo,
    hotelId,
    userInfo,
    userIdToInfo,
    grandParentToGrandChild,
    staffHierarchyErrorLogs,
  } = useSelector(state => state)

  const {
    staffActiveCount,
    staffInactiveCount,
    totalDepartments,
    hotelsInGroup,
  } = useHotelAdminDashboardStat()
  const [selectTitleAndPermissionData, setSelectedTitleAndPermissionData] =
    useState({})
  const [titleIdToInfo, setTitleIdToInfo] = useState({})
  const dispatch = useDispatch()

  useEffect(() => {
    const _titleIdToInfo = {}
    for (const titleInfo of titleAndPermission) {
      const { id, title } = titleInfo
      _titleIdToInfo[id] = title
    }
    setTitleIdToInfo(_titleIdToInfo)
  }, [titleAndPermission])

  useEffect(() => {
    setUsers(staffList)
    filterUsers(staffList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffList])

  useEffect(() => {
    StaffHelper.setContactNumberPrefix(hotelInfo, setContactNumberPrefix)
  }, [hotelInfo])

  useEffect(() => {
    StaffHelper.errorChange(
      { profileImageError, setProfileImageError },
      { statusChangeError, setStatusChangeError },
      { deleteUserError, setDeleteUserError },
      secondsToShowAlert
    )
  }, [createUserError, profileImageError, statusChangeError, deleteUserError])

  const filterUsers = sortedUsers => {
    const data = StaffHelper.filterUsers(
      titleAndPermission,
      sortedUsers,
      {
        filteredName,
        filteredDept,
        departmentFilterLabel,
        filteredStatus,
        statusFilterLabel,
        filteredManager,
        managerFilterLabel,
      },
      translateTextI18N
    )
    if (data) {
      setFilteredUser(data.currentfilteredUser)
    }
  }

  useEffect(() => {
    dispatch(actions.setSideMenuSelectedKey('13'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    filterUsers(users)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    users,
    filteredName,
    filteredDept,
    filteredStatus,
    filteredManager,
    titleAndPermission,
  ])

  useEffect(() => {
    setUserAction(editingUserProfile)
    if (!isModalVisible) setEditingUserProfile(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible])

  useEffect(() => {
    setTitles(titleAndPermission.filter(d => d.departmentId === department))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department])

  useEffect(() => {
    let deptId = ''
    let uid = ''
    if (replacementAndDelete) {
      // replace & delete manager
      deptId = userToDelete?.departmentId
      uid = userToDelete?.id
    } else {
      // add/edit staff OR chagne status & replace manager
      deptId = department
      const addingNewStaff = isModalVisible && !editingUserProfile
      if (!addingNewStaff) {
        // edit staff OR chagne status & replace manager
        uid = userId
      }
    }

    const managerDeptIds = [deptId, ManagementDeptObject.id]
    let staffData = staffList
      .filter(
        s =>
          managerDeptIds.includes(s.departmentId) &&
          s.id !== uid &&
          s.status === 'active'
      )
      .map(staff => ({ ...staff, title: titleIdToInfo[staff.role] || '' }))
      .sort((s1, s2) =>
        s1.name.toLowerCase() < s2.name.toLowerCase() ? -1 : 1
      )

    setStaff(staffData)
  }, [
    department,
    editingUserProfile,
    isModalVisible,
    replacementAndDelete,
    staffList,
    userId,
    userToDelete?.departmentId,
    userToDelete?.id,
    titleIdToInfo,
  ])

  const showModal = ({ _form, _formType }) => {
    clearProfileImage()
    _form.resetFields()

    setEmail('')
    setContactNumber('')
    setDepartment()
    setFullName('')
    setEmailOrPhone(true)
    setContactNumberPrefix(hotelInfo?.countryCode)
    setManagers({})

    setEditUser(null)
    setIsUserVerified(false)
    _form.setFieldsValue({
      contactNumberPrefix: hotelInfo?.countryCode,
    })
    setFormType(_formType)

    setIsModalVisible(true)
  }

  const validatePhoneOrEmail = () => {
    return StaffHelper.validatePhoneOrEmail(
      email,
      contactNumber,
      setCreateUserError,
      translateTextI18N
    )
  }

  useEffect(() => {
    form.validateFields(['email'])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailOrPhone])

  function getServiceKeys(titleId) {
    return titleAndPermission?.find(t => t.id === titleId)?.serviceKeys || []
  }

  function resetStaff() {
    setIsModalVisible(false)
    setShowSuccessModal(true)
  }

  const onFinish = async () => {
    try {
      if (showLoader) return
      if (!validatePhoneOrEmail()) return
      setShowLoader(true)
      setCreateUserError('')

      const { groupId, groupName } = hotelInfo
      const groupInfoObj = { groupId, groupName }

      const user = {
        name: fullName,
        email,
        hotelId,
        contactNumber,
        contactNumberPrefix: Ternary(contactNumber, contactNumberPrefix, ''),
        ...groupInfoObj,
      }

      let { managerIds, managerNames } = getActiveManagers(managers)

      const userHotel = {
        ...editUser,
        ...user,
        status: Ternary(userAction, status, 'active'),
        roles: [role],
        departmentId: department,
        department: getDepartmentName(departmentAndServiceIdToInfo, department),
        level: selectTitleAndPermissionData.level,
        serviceKeys: getServiceKeys(role),
        managers,
        managerIds,
        hotelName: hotelInfo.hotelName,
        hotelLogo: hotelInfo.hotelLogo,
        isUserVerified,
        title: titleIdToInfo[role],
        managerNames,
      }

      if (editingUserProfile) {
        const { success: editSuccess, message: editErrorMessage } =
          await EditUserProfile({
            profileImage,
            user: userHotel,
            profileImageUrl,
            profileImageName,
            deleteProfileImage,
            userId,
            hotelName: userHotel.hotelName,
            hotelId: userHotel.hotelId,
            roles: userHotel.roles,
            email,
          })
        setResStatus(editSuccess)
        if (!editSuccess) {
          setCreateUserError(editErrorMessage)
          return
        }
        resetStaff()
        return
      }

      const { success, message: createUserMessage } = await CreateNewUser(
        email,
        profileImage,
        user,
        userHotel
      )
      setResStatus(success)
      if (!success) {
        setCreateUserError(createUserMessage)
        return
      }

      resetStaff()
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
    } finally {
      setShowLoader(false)
    }
  }

  const GetStaffListOptions = () => {
    let managerList = [...staff]
    if (selectTitleAndPermissionData?.level) {
      managerList = managerList.filter(
        s => s.level <= selectTitleAndPermissionData.level
      )
    }

    if (editUser) {
      managerList = managerList.filter(
        mList => !grandParentToGrandChild?.[editUser?.id]?.includes(mList.id)
      )
    }

    return managerList.map((c, idx) => (
      <Option value={c.id} key={c.id} id={idx}>
        {`${c.name} (${c.title})`}
      </Option>
    ))
  }

  const handleCancel = () => {
    if (showLoader) return
    setCreateUserError('')
    setIsModalVisible(false)
    setIsHierarchyModal(false)
    setIsReplacementModalVisible(false)
    setForcePasswordModalVisible(false)
    replacementForm.resetFields()
  }

  const clearProfileImage = () => {
    setProfileImage(null)
    setProfileImageUrl(null)
    if (editingUserProfile && profileImageName !== '')
      setDeleteProfileImage(true)
  }

  const resetFilter = () => {
    setFilteredName('')
    setFilteredDeptName(departmentFilterLabel)
    setFilteredDept(departmentFilterLabel)
    setFilteredStatus(statusFilterLabel)
    setFilteredManager(managerFilterLabel)
  }

  function isManager(userId) {
    return staffList.some(user => user.managers?.[userId]?.active)
  }

  function isStaffRoleManager(row) {
    setUserId(row.userId)
    setDepartment(row.departmentId)
    setReplacementManagerId('')
    setReplacementManagerName('')
    form.setFieldsValue({ Manager: null })

    return isManager(row.id)
  }

  useEffect(() => {
    if (!isReplacementModalVisible) {
      setReplacementAndDelete(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReplacementModalVisible])

  useEffect(() => {
    let errMsg = ''
    if (isModalVisible) {
      if (department && !titles.length) {
        errMsg = 'Please add title for selected department'
      } else if (
        titles.length &&
        department !== ManagementDeptObject.id &&
        !staff.length
      ) {
        errMsg = 'Please add staff for management department'
      }
    }
    setCreateUserError(errMsg)
    // staffData,
  }, [isModalVisible, role, titles, department, staff.length])

  const checkManagerList = (selectedStatus, row) => {
    if (selectedStatus === 'active') return activateStatus(selectedStatus, row)

    if (isStaffRoleManager(row)) {
      setUserAction(true)
      setSelectedTitleAndPermissionData(
        titleAndPermission?.find(d => d.id === row.roles[0]) || {}
      )
      setIsReplacementModalVisible(true)
    } else {
      handleStatusChange(selectedStatus, row.id)
    }
  }

  const replaceManagerAndDeleteStaff = row => {
    setUserToDelete(row)
    if (managerToStaffList[row?.id]) {
      replacementForm.setFieldsValue({ Manager: null })
      setReplacementAndDelete(true)
      setIsReplacementModalVisible(true)
    } else {
      setShowDeleteConfirmation(true)
    }
  }

  const forcePasswordUpdate = async row => {
    setUserToDelete(row)
    setForcePasswordModalVisible(true)
  }

  const activateStatus = async (selectedStatus, row) => {
    if (row.departmentId !== ManagementDeptObject.id) {
      const managersAreInactive =
        getActiveManagers(row.managers).managerIds.length === 0
      if (managersAreInactive) {
        setStatusChangeError(
          'Manager for this staff is inactive, Please activate or change the manager first then change the status.'
        )
        return
      }
    }

    await activateManager(staffList, row)

    handleStatusChange(selectedStatus, row.id)
  }

  const handleStatusChange = async (selectedStatus, id) => {
    setLoadingData(true)
    const { success } = await UpdateUser(id, {
      status: selectedStatus,
      hotelId: userInfo.hotelId,
    })

    setLoadingData(false)

    if (!success) {
      message.error(`Problem updating user's status`)
      return
    }

    setResStatus(success)
    setStatus(selectedStatus)
    setLoadingData(false)
  }

  const editUserProfile = user => {
    const currRole = StaffHelper.getRole(user)
    setFullName(user.name)
    setEmail(user.email)
    setDepartment(user.departmentId)
    setRole(currRole)
    setContactNumber(user.contactNumber)
    setContactNumberPrefix(user.contactNumberPrefix)
    setProfileImageUrl(user.profileImage)
    setUserId(user.userId)
    setStatus(user.status)
    setManagers(user?.managers || {})
    setIsUserVerified(user?.emailVerified || false)
    setProfileImage(null)
    setProfileImageName(user.profileImageName)
    setEditingUserProfile(true)
    setDeleteProfileImage(false)
    setEmailOrPhone(StaffHelper.setEmailOrPhone(user))
    setEditUser(user)
    setSelectedTitleAndPermissionData(
      titleAndPermission?.find(d => d.id === user.role) || {}
    )
    setFormType(FormTypes.ADD_STAFF)
    setIsModalVisible(true)

    form.setFieldsValue({
      fullName: user.name,
      email: user.email,
      Department: user.departmentId,
      Role: currRole,
      contactNumber: user.contactNumber,
      status: user.status,
      contactNumberPrefix: user.contactNumberPrefix,
      Manager: getActiveManagers(user?.managers).managerIds,
      isUserVerified: user?.emailVerified || false,
    })
  }

  const forcePasswordUpdateDb = async ({
    user,
    type,
    setLoader = () => {},
  }) => {
    const { success, message } = await ForcePasswordUpdateDb(user)
    setForcePasswordModalVisible(false)

    if (type === 'revoke') return

    const successMessage =
      'Reset enabled, please login to the staff to reset the password'
    setForcePasswordModalVisible(false)
    setSuccessMessage(success ? successMessage : message)
    setResStatus(success)
    setShowSuccessModal(true)
    setLoader?.(false)
  }

  const deleteUserProfile = async deletedUserData => {
    try {
      const deletingUserId = userToDelete.id
      if (isManager(deletingUserId))
        return setDeleteUserError(
          'User cannot be deleted due to multiple staff reporting to this user'
        )

      setShowDeleteConfirmation(false)
      setLoadingData(true)
      const tempUserInfo = { ...userIdToInfo[deletingUserId] }
      const tempStaffUnderUser = []
      for (const staff of staffList) {
        if (staff?.managers?.[deletingUserId]) {
          tempStaffUnderUser.push({ ...staff })
        }
      }
      const { success, message: deleteUserProfileMessage } =
        await DeleteUserProfile({ userId: deletingUserId, ...deletedUserData })
      if (success) {
        await changeManager(
          '',
          '',
          tempUserInfo,
          tempStaffUnderUser,
          ManagerType.DeleteInActiveManager
        )
      } else {
        message.error(deleteUserProfileMessage)
        return
      }
      setResStatus(success)
      setSuccessMessage('Deleted successfully')
      setShowSuccessModal(true)
      setUserToDelete()
    } catch (error) {
      console.log(error)
      message.error('Something went wrong! Please try again!')
    } finally {
      setTimeout(() => {
        setShowSuccessModal(false)
        setSuccessMessage('')
      }, secondsToShowAlert)
      setLoadingData(false)
    }
  }

  const resendConfirm = user => {
    setResendModalVisible(true)
    setUserToDelete(user)
  }
  const [selectStaff, setSelectStaff] = useState(null)
  const [isHotelAssociationModalVisible, setIsHotelAssociationModalVisible] =
    useState(false)

  const showHierarchy = async user => {
    setSelectStaff(user)
    setIsHierarchyModal(true)
  }

  function showHotelAssociation(user) {
    setSelectStaff(user)
    setIsHotelAssociationModalVisible(true)
  }

  const staffColumns = [
    {
      title: translateTextI18N('Name'),
      dataIndex: 'name',
      width: 160,
      render: (name, row) => (
        <div className='tableuser'>
          <figure>
            <img
              className='userImage'
              src={StaffHelper.profileImage(row)}
              height={25}
              width={25}
              alt=''
            ></img>
          </figure>
          <span>{name}</span>
        </div>
      ),
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
      render: (_, row) => (
        <DepartmentOrServiceName
          data={departmentAndServiceIdToInfo[row.departmentId]}
        />
      ),
    },
    {
      title: translateTextI18N('Manager'),
      dataIndex: '',
      width: 100,
      render: datum => {
        const bindManager =
          datum?.managers &&
          Sort(Object.values(datum?.managers), 'name').map(i => {
            return (
              i && <li className={i?.active ? '' : 'text-muted'}>{i?.name}</li>
            )
          })

        return <ul>{bindManager}</ul>
      },
    },
    {
      title: translateTextI18N('Email'),
      dataIndex: 'email',
      width: 180,
      render: text => <a href={`mailto: ${text}`}>{text}</a>,
    },
    {
      title: translateTextI18N('Contact No'),
      dataIndex: 'contactNumber',
      width: 110,
      render: (_, row) => {
        return StaffHelper.contactNumberSpan(row)
      },
    },
    {
      title: translateTextI18N('Status'),
      dataIndex: 'status',
      width: 100,
      render: (st, row) => {
        return (
          <>
            <Select
              value={translateTextI18N(st)}
              bordered={false}
              onChange={selectedStatus => checkManagerList(selectedStatus, row)}
              className={`${st}Status`}
            >
              <Option value={activeInactiveStatusList[1].id}>
                {translateTextI18N(activeInactiveStatusList[1].name)}
              </Option>
              <Option value={activeInactiveStatusList[2].id}>
                {translateTextI18N(activeInactiveStatusList[2].name)}
              </Option>
            </Select>
          </>
        )
      },
    },
    {
      title: translateTextI18N('Action'),
      dataIndex: 'Action',
      width: 110,
      render: (_id, user) => {
        return (
          <div className='tableactionbtn-grp'>
            <button
              className='resend'
              disabled={StaffHelper.resendBtnDisabled(
                user,
                activeInactiveStatusList
              )}
              onClick={() => resendConfirm(user)}
            >
              <img src={getImage('images/checkedin.svg')}></img>
            </button>
            <Popover
              content={() => dropdowncontent(user)}
              trigger='click'
              placement='bottomRight'
              overlayClassName={'moreDropdown'}
            >
              <button className='moreicon'>
                <MoreOutlined />
              </button>
            </Popover>
          </div>
        )
      },
    },
  ]

  const dropdowncontent = user => {
    const isDisable = staffHierarchyErrorLogs?.errorUID
      ?.flatMap(i => i)
      .includes(user.userId)

    return (
      <>
        <ul
          key={user.id}
          className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'
        >
          <li className='ant-dropdown-menu-item'>
            <div className='tableactionbtn-grp'>
              <button
                className=''
                title={translateTextI18N('Edit Staff')}
                onClick={() => editUserProfile(user)}
              >
                {translateTextI18N('Edit Staff')}
              </button>
            </div>
          </li>
          <li className='ant-dropdown-menu-item'>
            <div className='tableactionbtn-grp'>
              <button
                className=''
                title={translateTextI18N('Delete Staff')}
                onClick={e => {
                  e.preventDefault()
                  setUserId(user.userId)
                  setSelectedTitleAndPermissionData(
                    titleAndPermission?.find(d => d.id === user.roles[0]) || {}
                  )
                  replaceManagerAndDeleteStaff(user)
                }}
              >
                {translateTextI18N('Delete Staff')}
              </button>
            </div>
          </li>
          <li className='ant-dropdown-menu-item'>
            <div className='tableactionbtn-grp'>
              <button
                className='resend'
                title={translateTextI18N('View Hierarchy')}
                onClick={() => {
                  if (isDisable) {
                    dispatch(
                      actions.setCommonModalData({
                        status: true,
                        data: staffHierarchyErrorLogs?.errorLog,
                        type: commonModalType.ViewStaffHierarchy,
                      })
                    )
                    return
                  }
                  showHierarchy(user)
                }}
              >
                <span>
                  {translateTextI18N('View Hierarchy')}

                  {isDisable && <ErrorSVG />}
                </span>
              </button>
            </div>
          </li>
          <li className='ant-dropdown-menu-item'>
            <div className='tableactionbtn-grp'>
              <button
                className='resend'
                title={translateTextI18N('Reset Password')}
                onClick={() => forcePasswordUpdate(user)}
                disabled={
                  !StaffHelper.resendBtnDisabled(user, activeInactiveStatusList)
                }
              >
                {translateTextI18N('Reset Password')}
              </button>
            </div>
          </li>
          {window.location.hostname === 'localhost' &&
            user.isForceChangePassword && (
              <li className='ant-dropdown-menu-item'>
                <div className='tableactionbtn-grp'>
                  <button
                    className='resend'
                    title={translateTextI18N('Revoke Reset Password')}
                    onClick={async e => {
                      e.preventDefault()
                      const userData = {
                        hotelId: user.hotelId,
                        id: user.userId,
                        isForceChangePassword: false,
                        resetPasswordByHotelId: '',
                        resetPasswordMode: '',
                        userId: user.userId,
                      }
                      await forcePasswordUpdateDb({
                        user: userData,
                        type: 'revoke',
                      })
                    }}
                    disabled={
                      !StaffHelper.resendBtnDisabled(
                        user,
                        activeInactiveStatusList
                      )
                    }
                  >
                    {translateTextI18N('Revoke Reset Password')}
                  </button>
                </div>
              </li>
            )}
          {+user?.hotelAssociationCount > 1 ? (
            <li className='ant-dropdown-menu-item'>
              <div className='tableactionbtn-grp'>
                <button
                  className=''
                  title={translateTextI18N('Hotel Association')}
                  onClick={() => showHotelAssociation(user)}
                >
                  {translateTextI18N('Hotel Association')}
                </button>
              </div>
            </li>
          ) : null}
        </ul>
      </>
    )
  }

  const handleContactChange = e => {
    let contactNumberValue = SanitizeNumber(e.target.value)
    setContactNumber(contactNumberValue)
    setEmail('')
    form.setFieldsValue({
      contactNumber: contactNumberValue,
      email: '',
    })
  }

  const prefixSelector = (
    <Form.Item name='contactNumberPrefix' noStyle>
      <Select
        value={contactNumberPrefix}
        onChange={e => setContactNumberPrefix(e)}
        disabled={formType === FormTypes.COPY_STAFF}
      >
        {GetContactNubmerPrefixOptions()}
      </Select>
    </Form.Item>
  )

  const getSuccessModalMessage = () => {
    return StaffHelper.getSuccessModalMessage(successMessage, userAction)
  }

  const getSortedDepartments = () => {
    const sortedDept = Sort([ManagementDeptObject, ...departments], 'name')
    sortedDept.unshift({ id: 'all', name: 'All' })
    return sortedDept
  }

  const commonProps = {
    department,
    departments,
    editingUserProfile,
    editUser,
    GetStaffListOptions,
    isManager,
    role,
    setRole,
    setCreateUserError,
    setDepartment,
    managers,
    setManagers,
    setSelectedTitleAndPermissionData,
    titles,
    userId,
  }

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard
                title='Staffs'
                breadcrumb={['Hotel Admin', 'Staffs']}
              />
            </div>

            <div className='col-12 col-md-12 col-lg-9'>
              <div className='tablefilter-wrp'>
                <div className='form-row'>
                  <div className='col-4 col-md-4'>
                    <div className='searchbox'>
                      <Search
                        placeholder={translateTextI18N('Search by Staff')}
                        value={filteredName}
                        onChange={e => setFilteredName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form' id='drpDept'>
                      <Select
                        value={translateTextI18N(filteredDeptName)}
                        onChange={(e, ...args) => {
                          setFilteredDeptName(args[0]?.value || '')
                          setFilteredDept(e)
                        }}
                      >
                        {getSortedDepartments().map(dept => (
                          <Option value={dept.id} key={dept.id} id={dept.id}>
                            <DepartmentOrServiceName data={dept} />
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form' id='manager'>
                      <Select
                        value={translateTextI18N(filteredManager)}
                        onChange={e => setFilteredManager(e)}
                      >
                        {[{ id: 'all', name: 'All' }, ...managerList].map(
                          manager =>
                            manager && (
                              <Option
                                value={manager.name}
                                key={manager.id}
                                id={manager.id}
                              >
                                {manager.name}
                              </Option>
                            )
                        )}
                      </Select>
                    </div>
                  </div>
                  <div className='col-4 col-md'>
                    <div className='cmnSelect-form' id='drpStatus'>
                      <Select
                        value={translateTextI18N(filteredStatus)}
                        onChange={e => setFilteredStatus(e)}
                      >
                        {activeInactiveStatusList.map(st => (
                          <Option value={st.id} key={st.id}>
                            {translateTextI18N(st.name)}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className='col-4 col-md-auto'>
                    <Button
                      type='primary'
                      title='Reset Filter'
                      className='adduserbtn'
                      onClick={resetFilter}
                    >
                      <img src={getImage('images/clearicon.svg')}></img>
                    </Button>
                  </div>
                  <div className='col-4 col-md-auto'>
                    <Button
                      type='primary'
                      onClick={() =>
                        showModal({
                          _form: form,
                          _formType: FormTypes.ADD_STAFF,
                        })
                      }
                      className='adduserbtn'
                      title='Add Staff'
                    >
                      <img src={getImage('images/add-user.svg')} alt=''></img>
                    </Button>
                  </div>
                  {hotelsInGroup > 1 ? (
                    <div className='col-4 col-md-auto'>
                      <Button
                        type='primary'
                        onClick={() =>
                          showModal({
                            _form: formCopyStaff,
                            _formType: FormTypes.COPY_STAFF,
                          })
                        }
                        className='adduserbtn'
                        title='Add Existing Staff'
                      >
                        <img src={copyUser} alt=''></img>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
              <CustomAlert
                visible={statusChangeError}
                message={statusChangeError}
                type='error'
                showIcon={true}
                classNames='mb-30 '
              />
              <div className='table-wrp'>
                <Table
                  columns={staffColumns}
                  dataSource={filteredUser}
                  pagination={PaginationOptions}
                  scroll={{ y: 512 }}
                  loading={loadingData || staffLoading}
                  rowKey='id'
                />
              </div>
            </div>
            <div className='col-12 col-md-12 col-lg-3'>
              <CountGreenCard
                no={totalDepartments}
                text='Total Departments'
              ></CountGreenCard>
              <CountBrownCard
                no={staffActiveCount + staffInactiveCount}
                text='Total Staff'
              ></CountBrownCard>
              <ActivityCard
                total={staffActiveCount + staffInactiveCount}
                active={staffActiveCount}
              ></ActivityCard>
            </div>
          </div>
        </div>
      </section>
      {isHierarchyModal && selectStaff && (
        <OrganizationChart
          staff={selectStaff}
          isHierarchyModal={isHierarchyModal}
          handleCancel={handleCancel}
        />
      )}
      <Modal
        title={translateTextI18N(
          `${Ternary(editingUserProfile, 'Edit', 'Add')} Staff`
        )}
        visible={isModalVisible && formType === FormTypes.ADD_STAFF}
        onCancel={handleCancel}
        className='addUsermodal cmnModal'
        footer={null}
        maskClosable={false}
      >
        <div className='imageUpload-wrp'>
          <figure>
            <div className='upload-figin'>
              <img
                src={Ternary(profileImageUrl, profileImageUrl, PlaceHolder)}
                height='155'
                width='155'
              ></img>
            </div>
            {Ternary(
              profileImageUrl,
              <button
                className='removebtn'
                onClick={clearProfileImage}
                id='btn-remove'
              >
                <img src={getImage('images/close.svg')}></img>
              </button>,
              ''
            )}
          </figure>
          <div className='uploadbtn-wrp'>
            <ImgCrop
              beforeCrop={file => beforeCrop(file, setProfileImageError)}
              rotate
            >
              <Upload
                id='btnUpload'
                accept='.png, .jpeg, .jpg'
                beforeUpload={file =>
                  validateProfileImage(
                    file,
                    setProfileImageError,
                    setProfileImage,
                    setProfileImageUrl
                  )
                }
                showUploadList={false}
              >
                <button>{translateTextI18N('Upload Photo')}</button>
              </Upload>
            </ImgCrop>
            <CustomAlert
              visible={profileImageError}
              message={profileImageError}
              type='error'
              showIcon={true}
            />
            <p>
              {translateTextI18N(
                'Image should be in PNG or JPEG file with maximum of size 1mb'
              )}
            </p>
          </div>
        </div>

        <Form layout='vertical' onFinish={onFinish} form={form} validateTrigger>
          <div className='row'>
            <div className='col-12'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Staff Name')}
                  name='fullName'
                  rules={[
                    {
                      required: true,
                      message: translateTextI18N('Please enter staff name'),
                    },
                    fieldProps =>
                      validateAlphaNumeric(
                        fieldProps,
                        'Please enter valid staff name'
                      ),
                  ]}
                  value={fullName}
                >
                  <Input
                    maxLength={50}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-md-6'>
              <div className='form-group cmn-input'>
                <Form.Item
                  label={translateTextI18N('Email ID')}
                  name='email'
                  rules={[
                    {
                      type: 'email',
                      message: translateTextI18N(emailErrorMessge),
                    },
                  ]}
                >
                  <Input
                    disabled={editingUserProfile || contactNumber !== ''}
                    placeholder='name@domain.com'
                    value={email}
                    onChange={e => {
                      const lowerEmail = e.target.value.toLowerCase().trim()
                      setEmail(lowerEmail)
                      setContactNumber('')
                      form.setFieldsValue({
                        email: lowerEmail,
                        contactNumber: '',
                      })
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-md-6'>
              <div className='form-group cmn-input contact-number'>
                <Form.Item
                  name='contactNumber'
                  label={translateTextI18N('Contact Number')}
                  rules={[
                    {
                      min: 6,
                      message: translateTextI18N(
                        'Contact number should be minimum of 6 Characters long'
                      ),
                    },
                  ]}
                >
                  <Input
                    disabled={editingUserProfile || email !== ''}
                    addonBefore={prefixSelector}
                    maxLength={10}
                    value={contactNumber}
                    onChange={handleContactChange}
                  />
                </Form.Item>
              </div>
            </div>
            <StaffDeptRoleManagerSelection {...commonProps} form={form} />
            <div className='col-12 col-sm-6 col-md-6'>
              <div
                className='form-group cmn-input customCheckbox checkbox-margin'
                style={{ marginTop: '30px', alignItems: 'center' }}
              >
                <Form.Item name='isUserVerified'>
                  <Checkbox
                    className='resend'
                    checked={isUserVerified}
                    onChange={e => setIsUserVerified(e.target.checked)}
                    disabled={editUser?.emailVerified || false}
                    style={{ alignItems: 'center' }}
                  >
                    {translateTextI18N('Verified')}
                  </Checkbox>
                </Form.Item>
              </div>
            </div>
          </div>
          <CustomAlert
            visible={true}
            message={contactInfoWarning}
            type='info'
            showIcon={true}
          />
          <CustomAlert
            visible={createUserError}
            message={createUserError}
            type='error'
            showIcon={true}
          />
          <div className='modalFooter'>
            <Button
              id='btnGray'
              className='grayBtn'
              key='back'
              onClick={handleCancel}
            >
              {translateTextI18N('Cancel')}
            </Button>

            <Button
              className='blueBtn ml-3 ml-lg-4'
              key='submit'
              htmlType='submit'
              loading={showLoader}
              id='btnSubmit'
            >
              {translateTextI18N('Submit')}
            </Button>
          </div>
        </Form>
      </Modal>

      {isModalVisible && formType === FormTypes.COPY_STAFF ? (
        <CopyStaffFromGroup
          commonProps={commonProps}
          contactNumber={contactNumber}
          copyUserId={copyUserId}
          createUserError={createUserError}
          email={email}
          form={formCopyStaff}
          getServiceKeys={getServiceKeys}
          handleCancel={handleCancel}
          isModalVisible={isModalVisible && formType === FormTypes.COPY_STAFF}
          prefixSelector={prefixSelector}
          setContactNumber={setContactNumber}
          setContactNumberPrefix={setContactNumberPrefix}
          setCopyUserId={setCopyUserId}
          setCreateUserError={setCreateUserError}
          setEmail={setEmail}
          setIsModalVisible={setIsModalVisible}
          setShowLoader={setShowLoader}
          setShowSuccessModal={setShowSuccessModal}
          showLoader={showLoader}
          setResStatus={setResStatus}
        />
      ) : null}

      {resStatus && typeof resStatus === 'boolean' && (
        <StaffSuccessModal
          getSuccessModalMessage={getSuccessModalMessage}
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={() => {
            setShowSuccessModal(false)
            setResStatus(null)
            setSuccessMessage('')
          }}
          resStatus={resStatus}
        />
      )}

      {showDeleteConfirmation ? (
        <StaffConfirmDelete
          deleteUserError={deleteUserError}
          deleteUserProfile={deleteUserProfile}
          setShowDeleteConfirmation={setShowDeleteConfirmation}
          showDeleteConfirmation={showDeleteConfirmation}
          userToDelete={userToDelete}
        />
      ) : null}

      <ConfirmResend
        resendModalVisible={resendModalVisible}
        setResendModalVisible={setResendModalVisible}
        setShowSuccessModal={setShowSuccessModal}
        setSuccessMessage={setSuccessMessage}
        userToDelete={userToDelete}
      />

      {isReplacementModalVisible ? (
        <SelectManager
          form={replacementForm}
          GetStaffListOptions={GetStaffListOptions}
          handleCancel={handleCancel}
          handleStatusChange={handleStatusChange}
          isReplacementModalVisible={isReplacementModalVisible}
          replacementAndDelete={replacementAndDelete}
          replacementManagerId={replacementManagerId}
          replacementManagerName={replacementManagerName}
          selectedManagerType={selectedManagerType}
          setEditingUserProfile={setEditingUserProfile}
          setIsReplacementModalVisible={setIsReplacementModalVisible}
          setReplacementManagerId={setReplacementManagerId}
          setReplacementManagerName={setReplacementManagerName}
          setSelectedManagerType={setSelectedManagerType}
          setShowLoader={setShowLoader}
          setShowSuccessModal={setShowSuccessModal}
          setSuccessMessage={setSuccessMessage}
          showLoader={showLoader}
          userId={userId}
          userToDelete={userToDelete}
          setResStatus={setResStatus}
        />
      ) : null}

      <HotelAssociation
        selectStaff={selectStaff}
        visible={isHotelAssociationModalVisible}
        onCancel={() => setIsHotelAssociationModalVisible(false)}
      />
      <ForcePasswordUpdate
        userToDelete={userToDelete}
        visible={isForcePasswordModalVisible}
        onCancel={() => setForcePasswordModalVisible(false)}
        forcePasswordUpdateDb={forcePasswordUpdateDb}
      />
    </>
  )
}

export default Staff
