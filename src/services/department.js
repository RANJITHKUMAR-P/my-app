import {
  Collections,
  defaultEscalationTime,
  escalationTimeKey,
  ManagementDeptObject,
  translationDataKey,
  unsubscribeList,
} from '../config/constants'
import { db } from '../config/firebase'
import { Sort } from '../config/utils'
import { actions } from '../Store'
import { creationData, updatationData } from './common'

const GetServices = async (
  departmentRef,
  serviceSnapshot,
  getSubServices,
  departmentId,
  orderBy
) => {
  const services = []
  try {
    for (const serviceDoc of serviceSnapshot.docs) {
      const serviceId = serviceDoc.id
      const service = { id: serviceId, ...serviceDoc.data() }

      if (getSubServices && service.services) {
        service.services = []

        const subServiceSnapshot = await departmentRef
          .doc(departmentId)
          .collection(Collections.SERVICES)
          .doc(serviceId)
          .collection(Collections.SERVICES)
          .orderBy(orderBy)
          .get()
        for (const subServiceDoc of subServiceSnapshot.docs) {
          const subServiceId = subServiceDoc.id
          const subService = { id: subServiceId, ...subServiceDoc.data() }
          service.services.push(subService)
        }
      }
      services.push(service)
    }
  } catch (error) {
    console.log(error)
  }
  return services
}

export const GetDepartments = async (
  hotelId,
  orderBy = 'index',
  getServices = false,
  getSubServices = false
) => {
  let departments = []
  try {
    const departmentRef = db.collection(Collections.DEPARTMENTS)
    const departmentSnapshot = await departmentRef
      .where('hotelId', '==', hotelId)
      .orderBy(orderBy)
      .get()
    if (departmentSnapshot) {
      for (const departmentDoc of departmentSnapshot.docs) {
        const departmentId = departmentDoc.id
        let department = { id: departmentId, ...departmentDoc.data() }

        if (getServices && department.services) {
          const serviceSnapshot = await departmentRef
            .doc(departmentId)
            .collection(Collections.SERVICES)
            .orderBy(orderBy)
            .get()
          const services = await GetServices(
            departmentRef,
            serviceSnapshot,
            getSubServices,
            departmentId,
            orderBy
          )
          department = { ...department, services }
        }
        departments.push(department)
      }
    }
  } catch (error) {
    console.log({ error })
    console.log(error)
  }
  return departments
}

const UpdateServiceStatusHelper = async (
  departmentId,
  serviceId,
  batch,
  subServices,
  active
) => {
  try {
    const serviceRef = db
      .collection(Collections.DEPARTMENTS)
      .doc(departmentId)
      .collection(Collections.SERVICES)
      .doc(serviceId)
    batch.update(serviceRef, { active, ...updatationData() })
    if (subServices) {
      const subServiceSnapshot = await serviceRef
        .collection(Collections.SERVICES)
        .get()
      for (const subService of subServiceSnapshot.docs) {
        const subServiceRef = serviceRef
          .collection(Collections.SERVICES)
          .doc(subService.id)
        batch.update(subServiceRef, { active, ...updatationData() })
      }
    }
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

export const UpdateDepartmentStatus = async (departmentId, active) => {
  try {
    const batch = db.batch()

    const departmentRef = db
      .collection(Collections.DEPARTMENTS)
      .doc(departmentId)
    const departmentSnapshot = await departmentRef.get()
    const services = departmentSnapshot.data().services
    batch.update(departmentRef, { active, ...updatationData() })
    if (services) {
      const servicesSnapshot = await departmentRef
        .collection(Collections.SERVICES)
        .get()
      for (const service of servicesSnapshot.docs) {
        const subServices = service.data().services
        const updated = await UpdateServiceStatusHelper(
          departmentId,
          service.id,
          batch,
          subServices,
          active
        )
        if (!updated) throw Error('Prolem updating sub services!')
      }
    }

    await batch.commit()
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

export const UpdateServiceStatus = async (departmentId, serviceId, active) => {
  try {
    const batch = db.batch()

    const serviceRef = db
      .collection(Collections.DEPARTMENTS)
      .doc(departmentId)
      .collection(Collections.SERVICES)
      .doc(serviceId)
    const servicesDoc = await serviceRef.get()
    batch.update(serviceRef, { active, ...updatationData() })
    const subServices = servicesDoc.data().services

    await UpdateServiceStatusHelper(
      departmentId,
      servicesDoc.id,
      batch,
      subServices,
      active
    )

    await batch.commit()
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

export const UpdateSubServiceStatus = async (
  departmentId,
  serviceId,
  subServiceId,
  active
) => {
  try {
    await db
      .collection(Collections.DEPARTMENTS)
      .doc(departmentId)
      .collection(Collections.SERVICES)
      .doc(serviceId)
      .collection(Collections.SERVICES)
      .doc(subServiceId)
      .update({ active, ...updatationData() })
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}

export const FetchDepartments = async (hotelId, departments, dispatch) => {
  if (departments?.length) return

  const departmentsList = await GetDepartments(hotelId, 'index', true, true)
  dispatch(actions.setDepartments(departmentsList))
}

export const GetDearptmentId = (departments, departmentKey) => {
  let departmentId = ''

  if (departments?.length) {
    const dept = departments.find(d => d.key === departmentKey)
    if (dept) {
      departmentId = dept.id
    }
  }
  return { departmentId }
}

// Adding multiple listeners for getting departments > services > sub services
// -----------------START---------------------------
const AddServiceListener = ({
  dispatch,
  docId,
  serviceId,
  isSubService = false,
}) => {
  try {
    let collectionRef = db.collection(Collections.DEPARTMENTS)
    if (serviceId) {
      collectionRef = collectionRef
        .doc(serviceId)
        .collection(Collections.SERVICES)
    }

    let collectionKey = docId + `${serviceId ? '-' + serviceId : ''}`

    if (unsubscribeList[collectionKey]) return

    let sub = collectionRef
      .doc(docId)
      .collection(Collections.SERVICES)
      .where('isDelete', '==', false)
      .onSnapshot(serviceSnapshot => {
        let services = []
        for (const service of serviceSnapshot.docs) {
          services.push({ id: service.id, ...service.data(), isSubService })
        }
        services = Sort(services, 'index')

        AddServiceSubServiceListeners(services, dispatch, docId, true)

        dispatch(actions.setServicesNew({ id: docId, data: services }))
      })

    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log({ error })
  }
}

export const AddDepartmentListener = (dispatch, hotelId) => {
  try {
    let collectionKey = `AddDepartmentListener${Collections.DEPARTMENTS}`
    if (!hotelId || unsubscribeList[collectionKey]) return
    let sub = db
      .collection(Collections.DEPARTMENTS)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .onSnapshot(departmentSnapshot => {
        let departments = []
        for (const department of departmentSnapshot.docs) {
          departments.push({ id: department.id, ...department.data() })
        }
        departments = Sort(departments, 'index')

        // Add service listeners
        AddServiceSubServiceListeners(departments, dispatch, null, false)

        dispatch(actions.setDepartmentsNew(departments))
      })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log({ error })
  }
}

export const AddCustomDepartmentListener = (dispatch, hotelId) => {
  try {
    let collectionKey = `AddCustomDepartmentListener${Collections.DEPARTMENTS}`
    if (!hotelId || unsubscribeList[collectionKey]) return
    let sub = db
      .collection(Collections.DEPARTMENTS)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .where('default', '==', false)
      .onSnapshot(departmentSnapshot => {
        let departments = []
        for (const department of departmentSnapshot.docs) {
          departments.push({ id: department.id, ...department.data() })
        }
        departments = Sort(departments, 'index')

        dispatch(actions.setCustomDepartments(departments))
      })
    unsubscribeList[collectionKey] = sub
  } catch (error) {
    console.log(error)
  }
}

const AddServiceSubServiceListeners = (
  data,
  dispatch,
  serviceId,
  isSubService = false
) => {
  data.forEach(i => {
    if (i.services)
      AddServiceListener({
        dispatch,
        docId: i.id,
        serviceId,
        isSubService,
      })
  })
}

export const SaveDepartment = async (
  hotelId,
  newDepartment,
  translationData,
  index
) => {
  try {
    const batch = db.batch()

    batch.set(db.collection(Collections.DEPARTMENTS).doc(), {
      active: true,
      hotelId: hotelId,
      name: newDepartment,
      predefined: false,
      services: false,
      refDefaultId: '',
      default: false,
      [escalationTimeKey]: defaultEscalationTime,
      index,
      [translationDataKey]: translationData,
      ...creationData(),
    })

    await batch.commit()

    return { success: true, message: 'Custom department added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const EditDepartment = async ({
  departmentId,
  departmentName,
  translationData,
}) => {
  try {
    if (departmentId) {
      await db
        .collection(Collections.DEPARTMENTS)
        .doc(departmentId)
        .update({
          name: departmentName,
          [translationDataKey]: translationData,
          ...updatationData(),
        })
    }

    return { success: true, message: 'Custom department updated successfully' }
  } catch (error) {
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

function saveUpdateDashboardServiceCounterDoc(
  hotelId,
  departmentId,
  serviceDocId,
  batch,
  data
) {
  const serviceCountDoc = db
    .collection(Collections.MOBILE_DASHBOARD)
    .doc(hotelId)
    .collection(Collections.DEPARTMENT_REQUEST_STAT)
    .doc(departmentId)
    .collection(Collections.DEPARTMENT_REQUEST)
    .doc(serviceDocId)

  batch.set(serviceCountDoc, data, { merge: true })
}

export const SaveCustomService = async ({
  departmentId,
  translationData,
  serviceName,
  serviceCount,
  dispatch,
  index,
  active,
  hotelId,
  frontDeskServiceType = '',
}) => {
  try {
    if (serviceCount === 0) {
      await db
        .collection(Collections.DEPARTMENTS)
        .doc(departmentId)
        .update({ services: true, ...updatationData() })
    }

    const serviceDoc = db
      .collection(Collections.DEPARTMENTS)
      .doc(departmentId)
      .collection(Collections.SERVICES)
      .doc()

    const batch = db.batch()

    let data = {
      active,
      name: serviceName,
      predefined: false,
      default: false,
      index,
      hotelId,
      key: '',
      [translationDataKey]: translationData,
      [escalationTimeKey]: defaultEscalationTime,
      ...creationData(),
    }

    if (frontDeskServiceType) data = { ...data, frontDeskServiceType }

    batch.set(serviceDoc, data)

    saveUpdateDashboardServiceCounterDoc(
      hotelId,
      departmentId,
      serviceDoc.id,
      batch,
      {
        count: 0,
        id: serviceDoc.id,
        isSubService: false,
        name: serviceName,
        subServiceName: '',
        subServiceid: '',
      }
    )

    await batch.commit()

    if (serviceCount === 0) {
      AddServiceListener({ dispatch, docId: departmentId })
    }

    return { success: true, message: 'Service added successfully' }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

export const EditService = async ({
  departmentId,
  serviceId,
  serviceName,
  translationData,
  hotelId,
}) => {
  try {
    if (departmentId) {
      const batch = db.batch()

      batch.update(
        db
          .collection(Collections.DEPARTMENTS)
          .doc(departmentId)
          .collection(Collections.SERVICES)
          .doc(serviceId),
        {
          name: serviceName,
          [translationDataKey]: translationData,
          ...updatationData(),
        }
      )

      saveUpdateDashboardServiceCounterDoc(
        hotelId,
        departmentId,
        serviceId,
        batch,
        {
          name: serviceName,
        }
      )

      await batch.commit()
    }

    return { success: true, message: 'Service updated successfully' }
  } catch (error) {
    console.log(error?.message)
    return { success: false, message: error?.message }
  }
}

// -----------------END---------------------------

export function saveRequiredTime(
  departmentId,
  serviceId,
  subServiceId,
  requiredTime
) {
  let docRef = db.collection(Collections.DEPARTMENTS).doc(departmentId)
  if (serviceId) {
    docRef = docRef.collection(Collections.SERVICES).doc(serviceId)
  }
  if (subServiceId) {
    docRef = docRef.collection(Collections.SERVICES).doc(subServiceId)
  }
  return docRef.update({ requiredTime, ...updatationData() })
}

export async function getDepartmentById(departmentId) {
  let deptData = {}
  if (departmentId && departmentId !== ManagementDeptObject.id) {
    const deptSnapshot = await db
      .collection(Collections.DEPARTMENTS)
      .doc(departmentId)
      .get()
    deptData = deptSnapshot.data()
  }
  return deptData
}
