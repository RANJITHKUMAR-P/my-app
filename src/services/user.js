import axios from 'axios'
import { DeleteFile, UploadFile, updatationData } from './common'
import { getDepartmentById, GetDepartments } from './department'
import { auth, db, firebase } from '../config/firebase'
import {
  deepCloneObject,
  Encrypt,
  getActiveManagers,
  GetAxiosHeaders,
  getRequestCollection,
  getUniqueValuesArray,
  isObjectSame,
  Ternary,
  toArray,
  toDate,
} from '../config/utils'
import {
  APIs,
  Collections,
  unsubscribeList,
  unsubscribeFirebaseListeners,
  ManagementDeptObject,
  ManagerType,
  PAGELOADER,
  HotelAdminRole,
  SuperAdminRole,
  LoginStatus,
  messages,
  defaultManagerProps,
} from '../config/constants'
import { actions } from '../Store'
import { GetCurrentUserTitleAndPermissions } from './titleAndPermissions'
import { CurrentHotelListener } from './hotels'
import { getParameterByName } from '../components/Common/Functions/reusable'
import { AssignTaskNotificaion, markNotificaitonAsRead } from './notification'

export const Logout = async ({
  success,
  error = null,
  dispatch,
  setLoader = true,
}) => {
  if (setLoader) {
    dispatch(actions.setIsLoggedIn(LoginStatus.WAITING))
  }

  await auth
    .signOut()
    .then(() => {
      success?.()
      unsubscribeFirebaseListeners()
      if (setLoader) {
        document.title = 'Hotel Admin'
        dispatch(actions.setIsLoggedIn(LoginStatus.LOGGED_OUT))
      }
    })
    .catch(err => {
      if (error) error?.(err)
    })
}

export const GetCurrentUser = () => auth?.currentUser

export const GetCurrentUserToken = () =>
  Promise.resolve(auth?.currentUser?.getIdToken())

export const Login = async ({
  rememberMe,
  email,
  password,
  success,
  error,
  validateUser,
  hotelId,
}) => {
  const persistenceType = rememberMe
    ? firebase.auth.Auth.Persistence.LOCAL
    : firebase.auth.Auth.Persistence.SESSION
  auth
    .setPersistence(persistenceType)
    .then(() => {
      auth
        .signInWithEmailAndPassword(email, password)
        .then(async res => {
          const validUser = await validateUser()
          if (!validUser) {
            return
          }

          await UpdateUser(res.user.uid, {
            hotelId,
            isLoggedIn: LoginStatus.LOGGED_IN,
          })

          setTimeout(() => success(res), 10000)

          const OneSignal = window.OneSignal
          const headers = await GetAxiosHeaders()
          OneSignal.push(function () {
            OneSignal.getUserId().then(function (playerId) {
              if (playerId != null) {
                const userid = GetCurrentUser().uid
                axios
                  .post(
                    APIs.ADD_PLAYER_ID,
                    {
                      userType: 'user',
                      deviceType: 'web',
                      userid: userid,
                      playerid: playerId,
                    },
                    { headers }
                  )
                  .then(response => {
                    console.log(response)
                  })
                  .catch(err => {
                    throw err
                  })
              }
            })
          })
        })
        .catch(err => {
          if (error) error(err)
        })
    })
    .catch(error)
}

export const resetUserPassword = async ({
  oobCode,
  password,
  success,
  error,
}) => {
  try {
    if (!oobCode || !password) return
    let res = await axios.post(APIs.CONFIRM_PASSWORD, {
      oobCode: Encrypt(oobCode),
      password: Encrypt(password),
      hotelId: getParameterByName('refId'),
    })
    console.log(res)
    //await setUserDataOfAllAssociatedHotels({ userInfo, hotelInfo })
    success?.()
  } catch (err) {
    if (error) {
      let errorMessage =
        err?.message ||
        'Something went wrong while updating new password! Please try again'
      if (errorMessage.indexOf('expired'))
        errorMessage = 'Link has been expired. Please resend email'
      error?.(errorMessage)
    }
  }
}

const getDeptms = async hotelId => {
  let departments = await GetDepartments(hotelId)
  departments = departments.reduce((acc, curr) => {
    const { id, name } = curr
    acc[id] = name
    return acc
  }, {})

  return departments
}

export const CreateNewUser = async (
  email,
  profileImage,
  newUser,
  userHotel
) => {
  try {
    // create new user in firebase auth
    const headers = await GetAxiosHeaders()
    // upload profile image
    let profileImageUrl = ''
    let profileImageName = ''
    if (profileImage) {
      const {
        success: uploadSuccess,
        downloadUrl,
        message: uploadMessage,
        profileImageName: imageName,
      } = await UploadFile(profileImage, 'profileImages')
      if (!uploadSuccess) return { success: false, message: uploadMessage }
      profileImageUrl = downloadUrl
      profileImageName = imageName
    }

    await axios.post(
      APIs.CREATEORUPDATE,
      {
        email,
        ...userHotel,
        profileImage: profileImageUrl,
        profileImageName,
        groupId: userHotel.groupId,
        hotelId: newUser.hotelId,
      },
      { headers }
    )

    return { success: true, message: 'User added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return {
      success: false,
      message: error?.response?.data?.message || error?.message,
    }
  }
}

export const CopyStaff = async userData => {
  try {
    // create new user in firebase auth
    const headers = await GetAxiosHeaders()
    await axios.post(APIs.COPY_USER, userData, { headers })

    return { success: true, message: 'User added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return {
      success: false,
      message: error?.response?.data?.message || error?.message,
    }
  }
}

const CheckIsHotelAdmin = roles =>
  !roles || (roles && Array.isArray(roles) && roles[0] === HotelAdminRole)

async function updateTokenExpiryDateTime({ email }) {
  let tokenSnap = await db
    .collection(Collections.TOKEN)
    .where('email', '==', email)
    .where('grantFor', '==', 'NEW_STAFF')
    .get()

  if (tokenSnap.docs.length === 0) return

  let promise = []
  for (let tokenDoc of tokenSnap.docs) {
    promise.push(tokenDoc.ref.delete())
  }

  await Promise.all(promise)
}

export const EditUserProfile = async ({
  profileImage,
  user,
  profileImageUrl,
  profileImageName,
  deleteProfileImageUser,
  userId,
  hotelId,
  roles,
  email,
  hotelName,
}) => {
  try {
    // delete old profile image
    let respUser
    let newUserImageUrl = profileImageUrl ? profileImageUrl : ''
    let newUserProfileImageName = profileImageName
    if (profileImageName && (deleteProfileImageUser || profileImage)) {
      newUserImageUrl = ''
      newUserProfileImageName = ''
      respUser = await DeleteFile(profileImageName)
      if (!respUser.success) {
        return { success: false, message: respUser.message }
      }
    }

    // update new profile Image
    if (profileImage) {
      const {
        success,
        downloadUrl,
        message,
        profileImageName: imageName,
      } = await UploadFile(profileImage, 'profileImages')
      if (!success) return { success: false, message }
      newUserImageUrl = downloadUrl
      newUserProfileImageName = imageName
    }

    // update profile data
    let nUserData = {
      ...user,
      hotelId,
      userId,
      profileImage: newUserImageUrl,
      profileImageName: newUserProfileImageName,
      ...updatationData(),
    }

    if (hotelName) {
      nUserData.hotelName = hotelName
    }

    const isHotelAdmin = CheckIsHotelAdmin(roles)
    if (!isHotelAdmin) {
      nUserData.isDepartmentAdmin = false
      const dept = await GetPermission(nUserData.roles)
      if (dept?.length) {
        nUserData.isDepartmentAdmin = dept[0].isAdmin
      }
      nUserData.emailVerified = user?.isUserVerified || false
    }

    await UpdateUser(nUserData.userId, nUserData)

    // Auto verify user
    if (!user.emailVerified && user.isUserVerified) {
      const headers = await GetAxiosHeaders()
      await axios.post(
        APIs.CREATEORUPDATE,
        { ...user, edit: true },
        { headers }
      )

      // Delete verification token grant for new staff
      await updateTokenExpiryDateTime({ email })
    }

    return { success: true, message: 'User added successfully' }
  } catch (error) {
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

const GetPermission = async roles => {
  try {
    let deptSnaps = await db
      .collection(Collections.TITLE_AND_PERMISSIONS)
      .doc(roles[0])
      .get()
    return toArray({ snapshot: deptSnaps })
  } catch (error) {
    console.error('error GetPermission', error)
  }
}

export const DeleteUserProfile = async ({
  userId,
  hotelId,
  deleteFromAllHotel,
}) => {
  try {
    const headers = await GetAxiosHeaders()
    const encryptedUserId = Encrypt(userId)
    const body = { userId: encryptedUserId, hotelId, deleteFromAllHotel }

    await axios.post(APIs.HARD_DELETE_USER, body, { headers })
    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    console.log(error.response)
    return {
      success: false,
      message: error?.response?.data?.message || error?.message,
    }
  }
}

export const SendResetPasswordEmail = async ({
  emailOrPhone,
  hotelId,
  groupId,
}) => {
  try {
    let res = await axios.post(APIs.SEND_RESET_PASSWORD, {
      email: emailOrPhone,
      hotelId,
      type: 'web',
      groupId,
    })
    const { statusCode, message } = res.data
    return { success: statusCode === 200, message }
  } catch (error) {
    console.log({ error })
    if (error.response?.data?.statusCode)
      return { success: false, message: error.response.data.message }
    return {
      success: false,
      message:
        'Please enter a valid Email ID/Phone Number to receive reset link',
    }
  }
}

export const CheckIfResetPasswordCodeIsNotExpired = async code => {
  try {
    const email = await auth.verifyPasswordResetCode(code)
    console.log(email)
    return { success: true, email, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, email: '', message: 'Link has been expired' }
  }
}

export const UpdateUser = async (id, user) => {
  let objError = { success: false, message: 'Problem updating user!' }
  try {
    if (!id || !user) return objError
    await getUserRef({ userId: id, hotelId: user.hotelId }).update({
      ...user,
      ...updatationData(user?.username || null),
    })
    return { success: true, message: '' }
  } catch (_error) {
    return objError
  }
}

export const getUserFromAllHotelByUID = async ({ userId }) => {
  let userHotelSnap = await db
    .collectionGroup(Collections.USERHOTELS)
    .where('userId', '==', userId)
    .get()

  return { userAllHotelLoginCount: userHotelSnap.docs.length, userHotelSnap }
}

export const setUserDataOfAllAssociatedHotels = async ({
  userInfo,
  hotelInfo,
}) => {
  const { LOGGED_IN, WAITING } = LoginStatus
  const { userId } = userInfo
  if (!userId) return
  try {
    let { userHotelSnap } = await getUserFromAllHotelByUID({ userId })
    const batch = await db.batch()

    let updateUserData = {
      isForceChangePassword: false,
      resetPasswordByHotelId: hotelInfo.hotelId,
      resetPasswordMode: 'changePassword',
    }

    for (let userHotelData of userHotelSnap.docs) {
      const { hotelId } = userHotelData.data()
      updateUserData['isLoggedIn'] =
        hotelId === userInfo.hotelId ? LOGGED_IN : WAITING
      batch.update(userHotelData.ref, updateUserData)
    }

    await batch.commit()
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: 'Problem updating user!' }
  }
}

export const IsSuperAdmin = async email => {
  if (email) {
    try {
      let res = await axios.post(APIs.VALIDATE_USER_IS_SUPERADMIN, {
        email,
      })
      if (res.data.statusCode === 200) {
        return res?.data?.data?.isSuperAdmin ?? false
      }
    } catch (error) {
      console.log({ error })
      console.log(error?.message)
    }
  }
  return false
}

const GetUserInfoFromDoc = doc => {
  const data = doc.data()
  return { id: data?.userId || data?.id, ...data }
}

export const CurrentUserListener = async ({ id, dispatch, hotelId }) => {
  try {
    let collectionKey = `CurrentUserListener_${Collections.USERS}_${hotelId}`
    if (!id || !hotelId || unsubscribeList[collectionKey])
      return console.error({ id, hotelId })

    let unSub = db
      .collection(Collections.USERS)
      .doc(id)
      .collection(Collections.USERHOTELS)
      .doc(hotelId)
      .onSnapshot(async doc => {
        const userInfo = GetUserInfoFromDoc(doc)
        const { departmentId } = userInfo
        let deptData = await getDepartmentById(departmentId)

        userInfo.customDepartmentStaff =
          !deptData?.default && userInfo.roles[0] !== HotelAdminRole
        userInfo.deptData = deptData

        dispatch(actions.setUserInfo(userInfo))
        // here logout
        if (userInfo?.roles) {
          CurrentHotelListener(userInfo?.hotelId, dispatch)
          if (userInfo.roles[0] === HotelAdminRole) {
            dispatch(actions.setGettingTitleAndPermission(false))
            dispatch(actions.setIsHotelAdmin(true))
          } else {
            if (!unsubscribeList[collectionKey]) {
              dispatch(actions.setGettingTitleAndPermission̥(true))
            }
            const missingPermission = await GetCurrentUserTitleAndPermissions(
              userInfo,
              dispatch
            )

            if (missingPermission) {
              dispatch(
                actions.setEnableGlobalConfig({
                  status: true,
                  msg: messages.MISSING_PERMISSONS,
                })
              )
              await Logout({ userInfo, dispatch })
            }
          }
        }
      })

    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.error('CurrentUserListener', error)
  }
}

export const GetToken = async (token, dispatch) => {
  let tokens = []
  try {
    const tokenSnap = await db
      .collection(Collections.TOKEN)
      .where('grantFor', '==', 'NEW_STAFF')
      .where('token', '==', token)
      .get()
    tokens = toArray({ snapshot: tokenSnap, primaryKey: 'tokenId' })
    tokens = tokens.length > 0 ? tokens[0] : null

    let isValidToken = !tokens || toDate(tokens.expiry) < new Date().getTime()
    dispatchFetchToken(
      dispatch,
      isValidToken ? null : tokens,
      PAGELOADER.LOADED
    )
  } catch (error) {
    console.log({ error })
    throw new Error(error)
  }
}

export const GetHotel = async hotelId => {
  let array = []
  try {
    const snap = await db.collection(Collections.HOTELS).doc(hotelId).get()
    array = toArray({ snapshot: snap })
    return array.length > 0 ? array[0] : null
  } catch (error) {
    console.log({ error })
  }
}

export const GetUserEmailOrPhone = async ({
  email,
  phone,
  prefix,
  hotelId,
  groupId,
  dispatch,
}) => {
  try {
    const username = phone ? `${prefix}${phone}@${groupId}.com` : email
    let qry = db
      .collectionGroup(Collections.USERHOTELS)
      .where('username', '==', username)
      .where('hotelId', '==', hotelId)
    const userSnapshot = await qry.where('isDelete', '==', false).limit(1).get()
    let userInfo = null
    userSnapshot.forEach(doc => {
      userInfo = GetUserInfoFromDoc(doc)
    })
    const { departmentId } = userInfo
    const deptData = await getDepartmentById(departmentId)
    userInfo.deptData = deptData

    userInfo.customDepartmentStaff =
      !deptData?.default && userInfo.roles[0] !== HotelAdminRole

    userInfo.missingPermission = false

    if (
      userInfo.roles[0] !== HotelAdminRole &&
      userInfo.departmentId !== ManagementDeptObject.id
    ) {
      userInfo.missingPermission = await GetCurrentUserTitleAndPermissions(
        userInfo,
        dispatch
      )
    }
    return userInfo
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
  }
}

export const EditStaffProfile = async ({
  profileImage,
  user,
  profileImageUrl,
  profileImageName,
  deleteProfileImageUser,
  userId,
  hotelId,
}) => {
  try {
    // delete old profile image
    let respUser
    let newObjUserImageUrl = profileImageUrl ? profileImageUrl : ''
    let newObjUserProfileImageName = profileImageName
    if (profileImageName && (deleteProfileImageUser || profileImage)) {
      newObjUserImageUrl = ''
      newObjUserProfileImageName = ''
      respUser = await DeleteFile(profileImageName)
      if (!respUser.success) {
        return { success: false, message: respUser.message }
      }
    }

    // update new profile Image
    if (profileImage) {
      const {
        success,
        downloadUrl,
        message,
        profileImageName: imageName,
      } = await UploadFile(profileImage, 'profileImages')
      if (!success) return { success: false, message }
      newObjUserImageUrl = downloadUrl
      newObjUserProfileImageName = imageName
    }

    // update profile data
    await UpdateUser(userId, {
      ...user,
      hotelId,
      userId,
      profileImage: newObjUserImageUrl,
      profileImageName: newObjUserProfileImageName,
      ...updatationData(),
    })
    // update hotel name if editing hotel admin profile

    return { success: true, message: 'Profile changes saved successfully' }
  } catch (error) {
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

function getStaffList({ staffRef, departments }) {
  let staffList = []
  for (const staff of staffRef.docs) {
    const userData = staff.data()
    if (
      !userData.roles.includes(SuperAdminRole) &&
      !userData.roles.includes(HotelAdminRole)
    ) {
      const department =
        userData.departmentId === ManagementDeptObject.id
          ? ManagementDeptObject.name
          : departments[userData.departmentId]
      staffList.push({
        id: userData.userId,
        ...userData,
        department,
        role: userData.roles.length ? userData.roles[0] : '',
      })
    }
  }
  return staffList
}

export const StaffListener = async (hotelId, listenerAdded, dispatch) => {
  try {
    let collectionKey = `StaffListener_${Collections.USERS}`
    if (hotelId && !listenerAdded && !unsubscribeList[collectionKey]) {
      let departments = await getDeptms(hotelId)
      dispatch(actions.setIsStaffListnerAdded(true))
      dispatch(actions.setLoadingStaff(true))

      let unSub = db
        .collectionGroup(Collections.USERHOTELS)
        .where('hotelId', '==', hotelId)
        .where('isDelete', '==', false)
        .onSnapshot(staffRef => {
          let staffList = getStaffList({ staffRef, departments })
          dispatch(actions.setStaffList(staffList))
          dispatch(actions.setLoadingStaff(false))
        })
      unsubscribeList[collectionKey] = unSub
    }
  } catch (error) {
    console.log({ error })
  }
}

export const getStaffs = async hotelId => {
  try {
    const departments = await getDeptms(hotelId)

    const staffSnapshot = await db
      .collectionGroup(Collections.USERHOTELS)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .get()

    const staffList = getStaffList({ staffRef: staffSnapshot, departments })

    return staffList
  } catch (error) {
    console.error('Error fetching staff list:', error)
    throw error
  }
}

export const GroupStaffListener = async (hotelId, groupId, dispatch) => {
  try {
    let collectionKey = `GroupStaffListener_${Collections.USERS}`
    if (groupId && !unsubscribeList[collectionKey]) {
      dispatch(actions.setGroupStaffLoading(true))

      let unSub = db
        .collectionGroup(Collections.USERHOTELS)
        .where('groupId', '==', groupId)
        .where('isDelete', '==', false)
        .onSnapshot(staffRef => {
          const userIdToInfo = {}
          for (const staff of staffRef.docs) {
            const userData = staff.data()
            const userId = userData.userId
            if (
              userData.userId === GetCurrentUser().uid ||
              userData.hotelId === hotelId
            ) {
              continue
            }
            userIdToInfo[userId] = {
              id: userId,
              ...userData,
            }
          }
          dispatch(actions.setGroupStaffList(Object.values(userIdToInfo)))
        })
      unsubscribeList[collectionKey] = unSub
    }
  } catch (error) {
    console.log({ error })
  }
}

export const GetDepartmentNameFromTitleId = async titleId => {
  const defaultValue = 'Department Admin'
  try {
    if (!titleId) return defaultValue
    const titleDataSnapshot = await db
      .collection(Collections.TITLE_AND_PERMISSIONS)
      .doc(titleId)
      .get()
    const departmentId = titleDataSnapshot.data().departmentId
    const departmentSnapshot = await db
      .collection(Collections.DEPARTMENTS)
      .doc(departmentId)
      .get()
    const role = departmentSnapshot.data().name
    console.log({ role })
    return role
  } catch (error) {
    console.log({ error })
    return defaultValue
  }
}

async function updateManagerInfo(managers, userId, hotelId, batch) {
  try {
    const { managerIds, managerNames } = getActiveManagers(managers)

    const userRef = getUserRef({ userId, hotelId })
    batch.update(userRef, {
      managers,
      managerIds,
      managerNames,
      ...updatationData(),
    })
  } catch (error) {
    console.log(error)
  }
}

export function deleteManager({
  oldManagerInfo,
  replacementManagerId,
  subordinatesManagers,
}) {
  const oldManagerId = oldManagerInfo?.userId

  const oldManagersSubOf = subordinatesManagers[oldManagerId]?.subOf ?? []

  // if deleted user is substitute of other manager then use replacement as substitute
  for (const mId of oldManagersSubOf) {
    subordinatesManagers[mId].subId = replacementManagerId
  }

  delete subordinatesManagers[oldManagerId]

  function deleteInactiveManager(managerData) {
    const { subOf } = managerData
    for (const mId of subOf) {
      deleteInactiveManager(subordinatesManagers[mId])
    }
    delete subordinatesManagers[managerData.id]
  }

  // delete substitute hierarchy - u1 -> u2 -> u3 and we are deleting u1
  for (let [mId, { active, sub, subId, subOf }] of Object.entries(
    subordinatesManagers
  )) {
    if (subordinatesManagers?.[mId]) {
      const subOf1 = subOf.filter(s => s !== oldManagerId)
      subordinatesManagers[mId].subOf = subOf1
      const condition1 = sub && !subOf1.length && mId !== replacementManagerId
      const condition2 = !active && !subId
      if (condition1 || condition2) {
        deleteInactiveManager(subordinatesManagers[mId])
      }
    }
  }

  return subordinatesManagers
}

function updateSubOf(
  managerType,
  replacementManagerAlreadyExists,
  oldManagerId,
  newReplacedManager
) {
  if (managerType === ManagerType.SubstitureManager) {
    if (replacementManagerAlreadyExists) {
      if (!newReplacedManager.subOf.includes(oldManagerId))
        newReplacedManager.subOf.push(oldManagerId)
    } else {
      newReplacedManager.subOf = [oldManagerId]
    }
  }
}

function assignReplacementsManager({
  oldManagerInfo,
  oldUsersManagers,
  sub,
  subordinatesManagers,
}) {
  /*
   * subordinate = replacement or suboridnate has no manager
   * then assign 1st manager from deleted user manager
   */
  const oldUsersManagersList = Object.entries(oldUsersManagers || {})
  for (const [id, data] of oldUsersManagersList) {
    if (data?.active) {
      // uupdate old manager
      if (subordinatesManagers?.[oldManagerInfo.id]) {
        subordinatesManagers[oldManagerInfo.id].subId = id
        subordinatesManagers[oldManagerInfo.id].active = false
      }

      const { name } = data
      if (subordinatesManagers[id]) {
        subordinatesManagers[id].active = true
        subordinatesManagers[id].subOf = Ternary(
          sub,
          getUniqueValuesArray([
            ...subordinatesManagers[id].subOf,
            oldManagerInfo.id,
          ]),
          []
        )
      } else {
        subordinatesManagers[id] = {
          active: true,
          id,
          name,
          ...defaultManagerProps,
          sub,
          subOf: Ternary(sub, [oldManagerInfo.id], []),
        }
      }

      break
    }
  }
  if (!oldUsersManagersList.length) {
    delete subordinatesManagers[oldManagerInfo.id]
  }
}

function setManager({
  subordinateUser,
  userInfo: oldManagerInfo,
  replacementManagerId,
  replacementManagerName,
  managerType,
}) {
  try {
    let subordinatesManagers = deepCloneObject(subordinateUser.managers)

    /*
     * check if replacement & staff are same
     */
    function isHavingSameManager() {
      // old is deleted or inactive manager
      let oldUsersManagers = oldManagerInfo?.managers
      const sub = managerType === ManagerType.SubstitureManager

      /*
       * if subordinateuser and replacementmanagerid are not same
       * then assign new substitutemanager
       */
      if (subordinateUser.id !== replacementManagerId) {
        const replacementManagerAlreadyExists =
          subordinatesManagers?.[replacementManagerId]
        const replacementManagerExistingData =
          replacementManagerAlreadyExists ?? {
            ...defaultManagerProps,
            sub,
          }

        let newReplacedManager = {
          active: true,
          id: replacementManagerId,
          name: replacementManagerName,
          ...replacementManagerExistingData,
        }

        const oldManagerId = oldManagerInfo.id
        updateSubOf(
          managerType,
          replacementManagerAlreadyExists,
          oldManagerId,
          newReplacedManager
        )

        subordinatesManagers[replacementManagerId] = newReplacedManager

        if (subordinatesManagers?.[oldManagerInfo?.id]) {
          const oldManager = subordinatesManagers[oldManagerId]
          oldManager.active = false
          oldManager.subId = replacementManagerId
        }
      } else {
        assignReplacementsManager({
          oldManagerInfo,
          oldUsersManagers,
          sub,
          subordinatesManagers,
        })
      }
    }

    /*
     * set new manager and delete old manager from suboridnate managers
     */
    function setNewManager() {
      deleteManager({
        oldManagerInfo,
        replacementManagerId,
        subordinatesManagers,
      })
      isHavingSameManager()
      return subordinatesManagers
    }

    /*
     * set substitute manager and disable replaced manager
     */
    function setSubstituteManager() {
      isHavingSameManager()
      return subordinatesManagers
    }

    return {
      [ManagerType.NewManager]: setNewManager,
      [ManagerType.SubstitureManager]: setSubstituteManager,
      [ManagerType.DeleteInActiveManager]: () =>
        deleteManager({
          oldManagerInfo,
          replacementManagerId,
          subordinatesManagers,
        }),
    }[managerType]()
  } catch (error) {
    console.log('❌ ', error?.message)
  }
}

export const changeManager = async (
  replacementManagerName,
  replacementManagerId,
  userInfo,
  staffUnderUser,
  managerType
) => {
  try {
    if (!staffUnderUser) return { success: true, message: '' }

    const batch = db.batch()
    for (const subordinateUser of staffUnderUser) {
      const managers = setManager({
        subordinateUser,
        userInfo,
        replacementManagerId,
        replacementManagerName,
        managerType,
      })

      updateManagerInfo(managers, subordinateUser.id, userInfo.hotelId, batch)
    }

    await batch.commit()

    return { success: true, message: '' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: 'Problem updating user!' }
  }
}

export function dispatchFetchToken(dispatch, data, loading) {
  dispatch(
    actions.setFetchToken({
      data: data || null,
      loading: loading || PAGELOADER.TOLOAD,
    })
  )
}

export async function fetchHotelData(user) {
  let hotelList = []
  try {
    const { userId } = user
    const userHotelsSnap = await getUserRef({ userId })
      .where('isDelete', '==', false)
      .get()
    for (const userHotel of userHotelsSnap.docs) {
      const { hotelName = '' } = userHotel.data()
      hotelList.push(hotelName)
    }
    hotelList.sort()
  } catch (error) {
    console.log('❌ ', error)
  }
  return hotelList
}

let response = {
  error: {
    success: false,
    msg: 'The old password you entered was incorrect. Please try again.',
  },
  success: {
    success: true,
    msg: 'Your Password has been changed successfully.',
  },
}

export const ChangeUserPassword = async ({ oldPassword, newPassword }) => {
  try {
    if (!oldPassword || !newPassword) return
    const headers = await GetAxiosHeaders()
    let res = await axios.post(
      APIs.CHANGE_PASSWORD,
      {
        oldPassword: Encrypt(oldPassword),
        newPassword: Encrypt(newPassword),
      },
      { headers }
    )

    if (res.status === 200) {
      return response.success
    }

    return response.error
  } catch (err) {
    return response.error
  }
}

export const reauthenticate = async currentPassword => {
  const userInfo = firebase.auth().currentUser
  const cred = firebase.auth.EmailAuthProvider.credential(
    userInfo.email,
    currentPassword
  )
  return userInfo.reauthenticateWithCredential(cred)
}

export const ForcePasswordUpdateDb = async user => {
  let objError = {
    success: false,
    message: 'Something went wrong! Please try again!',
  }

  try {
    const { success } = await UpdateUser(user.userId, user)
    if (!success) return objError
    return { success: true, message: 'Updated Successfully' }
  } catch (_error) {
    return objError
  }
}

export async function activateManager(staffList, row) {
  try {
    const batch = await db.batch()

    function removeSubstitute(staffId, newManagers) {
      newManagers[staffId].active = true

      const subId = newManagers[staffId].subId
      newManagers[staffId].subId = ''
      deleteSubstitute(subId, staffId)

      function deleteSubstitute(subId, staffId) {
        let subManager = newManagers[subId]
        subManager.subOf = subManager.subOf.filter(m => m !== staffId)

        let nextSubId
        if (subManager.sub && !subManager.subOf.length) {
          nextSubId = subManager.subId
          delete newManagers[subId]
        }
        if (nextSubId) {
          deleteSubstitute(nextSubId, subId)
        }
      }
    }

    const activeStaffId = row.id
    for (const staff of staffList) {
      if (staff.id === activeStaffId) continue

      if (staff?.managers?.[activeStaffId]) {
        let managers = deepCloneObject(staff.managers)
        removeSubstitute(activeStaffId, managers)

        if (isObjectSame(staff.managers, managers)) {
          updateManagerInfo(managers, staff.id, row.hotelId, batch)
        }
      }
    }
    await batch.commit()
  } catch (error) {
    console.log('❌ ', error?.message)
    console.log('❌ ', error)
  }
}

export function getUserRef({ userId = '', hotelId = '' }) {
  if (!userId) return

  let userRef = db
    .collection(Collections.USERS)
    .doc(userId)
    .collection(Collections.USERHOTELS)

  if (hotelId) userRef = userRef.doc(hotelId)

  return userRef
}

export async function getStaffListUnderLoggedInManager({
  hotelId,
  departmentId,
  dispatch,
}) {
  try {
    let collectionKey = `getStaffListUnderLoggedInManager_${Collections.USERHOTELS}_${hotelId}`
    if (!hotelId || unsubscribeList[collectionKey]) return

    const unSub = db
      .collectionGroup(Collections.USERHOTELS)
      .where('status', '==', 'active')
      .where('hotelId', '==', hotelId)
      .where('departmentId', '==', departmentId)
      .where('isDelete', '==', false)
      .onSnapshot(staffRef => {
        let staffList = []

        for (const staff of staffRef.docs) {
          staffList.push(staff.data())
        }

        dispatch(actions.setStaffListForLoggedManager(staffList))
      })

    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.log(error)
  }
}

export async function assignRequestToStaff(request, updatedReqData) {
  try {
    let {
      hotelId,
      departmentId,
      id,
      isGuestRequest,
      service,
      roomNumber,
      requestType,
      serviceType,
      fromDepartmentId,
    } = request

    const { assignedToId, assignedByName, assignedById } = updatedReqData

    let requestPath = getRequestPath({
      hotelId,
      isGuestRequest,
      departmentId,
      fromDepartmentId,
      requestId: id,
    })

    markNotificaitonAsRead({ ...request, ...updatedReqData, requestPath })

    await db
      .collection(Collections.REQUEST_INFO)
      .doc(hotelId)
      .collection(Collections.REQUEST_INFO_DEPARTMENT)
      .doc(departmentId)
      .collection(Collections.REQUEST_INFO_DEPARTMENT_REQUEST)
      .doc(id)
      .update(updatedReqData)

    if (assignedToId !== assignedById) {
      // In case of self assign no need to send notification
      AssignTaskNotificaion({
        manager_id: assignedById,
        staff_id: assignedToId,
        hotel_id: hotelId,
        request_type: requestType,
        service_type: serviceType || service,
        isGuest: isGuestRequest,
        assignerName: assignedByName,
        serviceName: service,
        roomNumber,
        requestPath,
      })
    }

    return { success: true, message: `Task Assign Successfully!` }
  } catch (error) {
    return { success: false, message: `Task Assign Failed!` }
  }
}

export function getRequestPath({ hotelId, departmentId, requestId }) {
  let requestPath = getRequestCollection(hotelId, departmentId)?.path
  requestPath += `/${requestId}`
  return requestPath
}

export const getCurrentUserCancelRequestPermissions = async ({ roles }) => {
  try {
    const permissions = await GetPermission(roles)
    const hasMenuCancelRequest = permissions.some(permission =>
      permission.menus.includes('101223')
    )

    return hasMenuCancelRequest
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return false
  }
}
export const recurringTaskSchedulerPermissions = async ({ roles }) => {
  try {
    const permissions = await GetPermission(roles)
    const hasMenuRecurringTask = permissions.some(permission =>
      permission.menus.includes('50')
    )

    return hasMenuRecurringTask
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return false
  }
}
export const getCurrentListViewPermissions = async ({ roles }) => {
  try {
    const permissions = await GetPermission(roles)
    const hasMenuListView = permissions.some(permission =>
      permission.menus.includes('51')
    )

    return hasMenuListView
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return false
  }
}
export const getCurrentTashsheetPermissions = async ({ roles }) => {
  try {
    const permissions = await GetPermission(roles)
    const hasMenuRoomView = permissions.some(permission =>
      permission.menus.includes('52')
    )

    return hasMenuRoomView
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return false
  }
}
