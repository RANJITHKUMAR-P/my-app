import {
  ServiceLabel,
  SPA_WELNESS,
  StatusLabel,
} from '../../../../config/constants'
import DepartmentAndServiceKeys from '../../../../config/departmentAndServicekeys'
import { isFilterValueSelected, sortByCreatedAt } from '../../../../config/utils'

const spanAndWelnessServices = DepartmentAndServiceKeys.spaAndWellness.services
export const spaKey = spanAndWelnessServices.spa.key
export const gymKey = spanAndWelnessServices.gym.key
export const saloonKey = spanAndWelnessServices.saloon.key

export const GetServiceIds = departmentAndServiceKeyToId => {
  const gymId = departmentAndServiceKeyToId[gymKey]
  const salonId = departmentAndServiceKeyToId[saloonKey]
  const spaId = departmentAndServiceKeyToId[spaKey]
  const restaurantReservationId =
    departmentAndServiceKeyToId[
      DepartmentAndServiceKeys.foodAndBeverage.services.restaurant.key
    ]

  return { gymId, salonId, spaId, restaurantReservationId }
}

export const SetServiceIdsAndFilterData = (
  departmentAndServiceKeyToId,
  pathname,
  setServiceOptions,
  departmentAndServiceIdToInfo,
  data,
  isBooking
) => {
  const { gymId, salonId, spaId } = GetServiceIds(departmentAndServiceKeyToId)
  const PATHS = isBooking ? SPA_WELNESS.BOOKING : SPA_WELNESS.RESERVATION

  if (gymId && salonId && spaId) {
    let serviceIds = [gymId, salonId, spaId]
    if (pathname === PATHS.SPA) {
      serviceIds = [spaId]
    } else if (pathname === PATHS.GYM) {
      serviceIds = [gymId]
    } else if (pathname === PATHS.SALON) {
      serviceIds = [salonId]
    } else {
      setServiceOptions(
        serviceIds.map(serviceId => ({
          name: departmentAndServiceIdToInfo[serviceId]?.name,
          value: serviceId,
        }))
      )
    }

    data = data.filter(d => serviceIds.includes(d.serviceId))
  }
  return data
}

export const UpdateServiceIds = (
  setServiceIds,
  departmentAndServiceKeyToId
) => {
  const { gymId, salonId, spaId, restaurantReservationId } = GetServiceIds(
    departmentAndServiceKeyToId
  )

  if (gymId && salonId && spaId && restaurantReservationId) {
    setServiceIds([gymId, salonId, spaId, restaurantReservationId])
  }
}

export const FilterByServiceAndStatus = (
  data,
  selectedService,
  selectedStatus
) => {
  if (isFilterValueSelected(selectedService, ServiceLabel)) {
    data = data.filter(d => d.serviceId === selectedService)
  }

  if (isFilterValueSelected(selectedStatus, StatusLabel)) {
    data = data.filter(d => d.status === selectedStatus)
  }

  return data
}

export const GetData = ({
  reservations,
  guestIdToInfo,
  setReservationList,
}) => {
  let data = [...reservations].map(d => {
    const guest = guestIdToInfo[d.guestId] || {}
    const guestName = guest.name || ''
    const guestSurname = guest.surName || ''
    const roomNumber = guest.roomNumber || ''

    return { ...d, guestName, guestSurname, roomNumber }
  })

  data.sort(sortByCreatedAt)
  setReservationList(data)
}
