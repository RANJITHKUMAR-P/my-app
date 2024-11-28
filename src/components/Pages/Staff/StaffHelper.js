import { GetDepartments } from '../../../services/department'
import { StaffListener } from '../../../services/user'
import { actions } from '../../../Store'
import PlaceHolder from '../../../assets/backgroundimages/Placeholder.svg'
import Node from './Node'
import { auth } from '../../../config/firebase'
import { isFilterValueSelected } from '../../../config/utils'
import { TitleAndPermissonListener } from '../../../services/titleAndPermissions'

export default class StaffHelper {
  static getDepartments = async hotelId => {
    let departmentsList = []
    if (auth?.currentUser) {
      departmentsList = await GetDepartments(hotelId)
      if (!departmentsList?.length) departmentsList = []
      departmentsList?.unshift({ id: '0', name: 'All' })
    }
    return departmentsList
  }

  static filterUsers = (
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
  ) => {
    if (!titleAndPermission.length) return
    let activeUsers = [...sortedUsers].map(u => {
      const titleId = u.roles[0]
      const title = titleAndPermission.find(obj => obj.id === titleId)?.title
      return {
        ...u,
        title: translateTextI18N(title),
        department: translateTextI18N(u.department),
      }
    })
    let currentfilteredUser = [...activeUsers]

    if (filteredName && filteredName !== '')
      currentfilteredUser = currentfilteredUser.filter(user =>
        user.name.toLowerCase().includes(filteredName.toLowerCase())
      )
    if (isFilterValueSelected(filteredDept, departmentFilterLabel))
      currentfilteredUser = currentfilteredUser.filter(
        user => user.departmentId === filteredDept
      )
    if (isFilterValueSelected(filteredStatus, statusFilterLabel))
      currentfilteredUser = currentfilteredUser.filter(
        user => user.status === filteredStatus
      )

    if (isFilterValueSelected(filteredManager, managerFilterLabel))
      currentfilteredUser = currentfilteredUser.filter(
        user =>
          user?.managers &&
          Object.values(user.managers)
            .map(i => i.name.toLowerCase())
            .includes(filteredManager.toLowerCase())
      )
    const activeUserList = activeUsers.filter(user => user.status === 'active')
    return {
      activeUser: activeUsers.length,
      activeUserList,
      currentfilteredUser,
    }
  }

  static onChangeHotelId = (
    hotelId,
    dispatch,
    titleAndPermissionListenerAdded,
    isStaffListenerAdded
  ) => {
    if (hotelId) {
      StaffListener(hotelId, isStaffListenerAdded, dispatch)
      if (!titleAndPermissionListenerAdded) {
        dispatch(actions.setTitleAndPermissionListenerAdded())
        TitleAndPermissonListener(hotelId, dispatch)
      }
    }
  }

  static validatePhoneOrEmail = (
    email,
    contactNumber,
    setCreateUserError,
    translateTextI18N
  ) => {
    let flag = !email && !contactNumber
    if (flag) {
      setCreateUserError(translateTextI18N('Email Id/Contact Number required'))
    }
    return !flag
  }
  static getRole = user => {
    return user.roles && Array.isArray(user.roles) && user.roles.length
      ? user.roles[0]
      : ''
  }
  static setEmailOrPhone(user) {
    return !user.email && !user.contactNumber
  }
  static getSuccessModalMessage = (successMessage, userAction) => {
    if (successMessage) return successMessage
    return userAction
      ? 'Staff details updated sucessfully'
      : 'Staff added successfully'
  }
  static errorChange = (
    { profileImageError, setProfileImageError },
    { statusChangeError, setStatusChangeError },
    { deleteUserError, setDeleteUserError },
    secondsToShowAlert
  ) => {
    if (profileImageError)
      setTimeout(() => setProfileImageError(''), secondsToShowAlert)
    if (statusChangeError)
      setTimeout(() => setStatusChangeError(''), secondsToShowAlert)
    if (deleteUserError) {
      setTimeout(() => setDeleteUserError(''), secondsToShowAlert)
    }
  }
  static redirectToOrganizationchart = history => {
    history.push('/Organizationchart')
  }
  static setContactNumberPrefix = (hotelInfo, setContactNumberPrefix) => {
    hotelInfo && setContactNumberPrefix(hotelInfo.countryCode)
  }

  static profileImage = row => {
    return row.profileImage ? row.profileImage : PlaceHolder
  }
  static contactNumberSpan = row => {
    if (!row.contactNumber) return <span></span>

    const prefix = (row.contactNumberPrefix || '').length
      ? `${row.contactNumberPrefix}-`
      : ''
    return <span>{`${prefix}${row.contactNumber}`}</span>
  }
  static resendBtnDisabled = (user, activeInactiveStatusList) => {
    return user.emailVerified || activeInactiveStatusList[2].id === user.status
  }

  static bindHierarchy({ userIdToInfo, managerToStaffList, staff }) {
    let hierarchyData = {}
    let rootNode = staff ?? {}

    if (!staff) {
      rootNode = Object.values(userIdToInfo).find(user => !user['managers'])
    }

    let children = StaffHelper.childNode(managerToStaffList, rootNode.id) || []

    hierarchyData = {
      id: rootNode.id,
      label: <Node userdata={rootNode} />,
      children,
    }
    return hierarchyData
  }

  static childNode(managerToStaffList, managerId) {
    if (!managerToStaffList?.[managerId]) return []

    let arrChildNode = []

    let arrNode = managerToStaffList?.[managerId]

    if (!arrNode?.length) return []

    arrNode?.forEach(item => {
      let children = StaffHelper.childNode(managerToStaffList, item.id)
      return arrChildNode.push({
        id: item.id,
        label: <Node userdata={item} />,
        children,
      })
    })

    return arrChildNode
  }
}
