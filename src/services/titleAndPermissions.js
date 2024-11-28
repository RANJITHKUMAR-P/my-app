import {
  Collections,
  unsubscribeList,
  menuToServices,
  CustomDepartmentSideMenu,
  ManagementDeptSideMenu,
  ReportSideMenu,
  FaqSideMenu,
} from '../config/constants'
import { auth, db } from '../config/firebase'
import { actions } from '../Store'
import { creationData, updatationData } from './common'
import { recursiveFlatten, Ternary } from '../config/utils'

export const GetDefaultMenusList = async () => {
  let data = []
  try {
    const snapshot = await db
      .collection(Collections.DEFAULT_DEPARTMENT_TO_MENUS)
      .orderBy('index')
      .get()
    if (snapshot) {
      for (const menu of snapshot.docs) {
        data.push({ id: menu.id, ...menu.data() })
      }
    }
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
  return data
}

export const SaveTitlePermission = async ({
  id,
  hotelId,
  departmentId,
  title,
  serviceId,
  menus,
  isAdmin,
  level,
  department,
}) => {
  try {
    let serviceKeys = []
    for (const menu of menus) {
      if (menuToServices[menu]) {
        serviceKeys.push(menuToServices[menu])
      }
    }
    serviceKeys = [...new Set(serviceKeys.flat())]

    let data = {
      title,
      hotelId,
      departmentId,
      isAdmin,
      serviceId,
      menus,
      department,
      level,
      serviceKeys,
    }
    const titleRef = db.collection(Collections.TITLE_AND_PERMISSIONS)

    if (id) {
      await titleRef.doc(id).update({ ...data, ...updatationData() })
    } else {
      await titleRef.doc().set({ ...data, active: true, ...creationData() })
    }

    return { success: true, message: 'Title saved successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const TitleAndPermissonListener = (hotelId, dispatch) => {
  try {
    let collectionKey = `TitleAndPermissonListener_${Collections.TITLE_AND_PERMISSIONS}`

    if (unsubscribeList[collectionKey]) return

    let unSub = db
      .collection(Collections.TITLE_AND_PERMISSIONS)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .orderBy('createdAt')
      .onSnapshot(snapshot => {
        const data = []
        for (const title of snapshot.docs) {
          data.push({ id: title.id, ...title.data() })
        }
        dispatch(actions.setTitleAndPermission(data))
      })

    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.log(error)
  }
}

export const UsersLinkedToTitle = async (titleId, staffList) => {
  try {
    if (staffList.length) {
      return staffList.filter(s => s.roles.includes(titleId)).length > 0
    }

    let data = await db
      .collectionGroup(Collections.USERHOTELS)
      .where('roles', 'array-contains', titleId)
      .where('isDelete', '==', false)
      .limit(1)
      .get()

    return data.size > 0
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

export const DeleteTitle = async titleId => {
  try {
    await db
      .collection(Collections.TITLE_AND_PERMISSIONS)
      .doc(titleId)
      .update({ isDelete: true, ...updatationData() })
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

function customDeptSideMenuConfig({ menuIds, sideMenus, departmentId }) {
  const sideMenuArray = Ternary(
    departmentId === 'management',
    ManagementDeptSideMenu,
    CustomDepartmentSideMenu
  )

  for (const menu of sideMenuArray) {
    const tempMenu = { ...menu }
    if (tempMenu.subMenu) {
      tempMenu.subMenu = tempMenu.subMenu.filter(s =>
        menuIds?.includes(String(s.index))
      )
    }
    if (menuIds?.includes(tempMenu.id)) sideMenus.push(tempMenu)
  }
  return sideMenus
}

async function defaultDeptSideMenuConfig({ menuIds, sideMenus }) {
  const menusSnapshot = await db
    .collection(Collections.DEFAULT_DEPARTMENT_TO_MENUS)
    .orderBy('index')
    .get()

  for (const menu of menusSnapshot.docs) {
    let menuData = { id: menu.id, ...menu.data() }
    if (menuData.subMenu) {
      menuData.subMenu = menuData.subMenu.filter(s =>
        menuIds.includes(String(s.index))
      )
    }
    if (menuIds.includes(menuData.id)) {
      sideMenus.push(menuData)
    }
  }
  return sideMenus
}

async function sideMenuConfig({
  isDefaultDepartmentStaff,
  titleId,
  sideMenus,
  menuIds,
  departmentId,
}) {
  if (isDefaultDepartmentStaff) {
    if (titleId) {
      sideMenus = await defaultDeptSideMenuConfig({ menuIds, sideMenus })
    }
  } else {
    // for custom department staff
    sideMenus = customDeptSideMenuConfig({ menuIds, sideMenus, departmentId })
  }

  return sideMenus
}

export const GetCurrentUserTitleAndPermissions = async (userInfo, dispatch) => {
  if (!auth?.currentUser?.uid) return false
  try {
    const { deptData } = userInfo
    const isDefaultDepartmentStaff = !!deptData?.default
    let sideMenus = []
    const titleId = userInfo?.roles[0] || ''

    const sideMenusDoc = await db
      .collection(Collections.TITLE_AND_PERMISSIONS)
      .doc(titleId)
      .get()

    if (!sideMenusDoc.exists) return true
    const sideMenuData = sideMenusDoc.data()
    const menuIds = sideMenuData.menus
    const { departmentId } = sideMenuData

    sideMenus = await sideMenuConfig({
      isDefaultDepartmentStaff,
      titleId,
      sideMenus,
      menuIds,
      departmentId,
    })

    if (
      ['development', 'qa', 'uat', 'prod', 'uat2'].includes(process.env.REACT_APP_ENV)
    ) {
      if (!sideMenus.find(s => s.name === 'Reports')) {
        sideMenus.splice(sideMenus.length, 0, ReportSideMenu)
      }
      if (!sideMenus.find(s => s.name === 'Faq')) {
        sideMenus.splice(sideMenus.length, 0, FaqSideMenu)
      }
    }

    const flatSideMenus = recursiveFlatten('subMenu')(sideMenus)

    if (flatSideMenus.length < 1) return true

    dispatch(
      actions.setUserInfo({
        ...userInfo,
        isDepartmentAdmin: sideMenuData.isAdmin,
        currentUserTitle: sideMenuData.title,
      })
    )

    dispatch(actions.setSideMenus({ sideMenus, flatSideMenus }))
    dispatch(actions.setGettingTitleAndPermission(false))
    return false
  } catch (error) {
    console.error('GetCurrentUserTitleAndPermissions', error)
    return true
  }
}
