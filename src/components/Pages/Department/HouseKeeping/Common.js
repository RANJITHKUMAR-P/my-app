import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'
import {
  ActionAdminCancel,
  GetAddViewCommentColumn,
  getCommonColumns,
  getJobStartEndImageAndName,
} from '../../../../config/utils'
import { showModal } from '../FoodandBeverages/FoodAndBeveragesUtils'

export const HouseKeepingColumns = ({
  translateTextI18N,
  handleStatusChange,
  dispatch,
  hideAssignButton = false,
  userInfo,
  childIdToParentIds,
  staffHierarchyErrorLogs,
  showImageUploadPopup,
}) => {
  const {
    assignStaffCol,
    guestCol,
    requestFromCol,
    requestedTimeCol,
    requestTypeCol,
    roomNumberCol,
    // billAmountCol,
    billModal,
    serviceCol,
    serviceTypeCol,
    statusCol,
    submittedTimeCol,
    getRatinAndFeedbackCol,
    guestComment,
  } = getCommonColumns({
    dispatch,
    handleStatusChange,
    hideAssignButton,
    translateTextI18N,
    userInfo,
    childIdToParentIds,
    staffHierarchyErrorLogs,
  })

  guestCol.width = 100

  return [
    guestCol,
    requestFromCol,
    roomNumberCol,
    requestTypeCol,
    serviceCol,
    serviceTypeCol,
    // billAmountCol,
    assignStaffCol,
    billModal,
    guestComment,
    GetAddViewCommentColumn({
      dispatch,
      translateTextI18N,
      userInfo,
    }),
    ...getJobStartEndImageAndName({ translateTextI18N, showImageUploadPopup }),
    statusCol,
    ActionAdminCancel({
      dispatch,
      translateTextI18N,
      userInfo,
      childIdToParentIds,
      staffHierarchyErrorLogs,
    }),
    submittedTimeCol,
    requestedTimeCol,
    ...getRatinAndFeedbackCol(),
  ]
}

export const HouseKeepingServiceNames = getServiceNames(
  DepartmentAndServiceKeys.houseKeeping.services
)

export const reservationServiceNames = [
  ...getServiceNames(DepartmentAndServiceKeys.foodAndBeverage.services),
  ...getServiceNames(DepartmentAndServiceKeys.spaAndWellness.services),
].filter(
  item =>
    item.name !==
    DepartmentAndServiceKeys.foodAndBeverage.services.roomService.name
)

export const reservationDepartments = [
  DepartmentAndServiceKeys.foodAndBeverage,
  DepartmentAndServiceKeys.spaAndWellness,
]
  .map(({ name }) => name)
  .sort()
  .map(name => ({ name: name, value: name }))

export const spaAndWellnessDepartments = getServiceNames(
  DepartmentAndServiceKeys.spaAndWellness.services
)

export function getServiceNames(serviceName) {
  return Object.values(serviceName)
    .map(({ key, name }) => ({ key, name }))
    .sort()
    .map(({ key, name }) => ({ name: name, value: key }))
}
