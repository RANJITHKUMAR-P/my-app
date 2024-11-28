import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  message as AntdMessage,
  Modal,
  Spin,
  TimePicker,
} from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { AddGuestListener } from '../../../services/guest'
import { AddRoomTypeListener } from '../../../services/roomType'
import {
  formatPrice,
  getServerDate,
  GetDateTimeString,
  GetEscalationTime,
  GetPostfix,
  SelectDrops,
  SetAutoClearProp,
  Sort,
  deepCloneObject,
  getImage,
} from '../../../config/utils'
import {
  changeRoomValue,
  changeUpgradeRoomOptions,
  checkInLable,
  dateFormat,
  defaultEscalationTime,
  departmentWithOutServiceObj,
  frontDeskServiceTypes,
  pendingLable,
  requestTypeOptionsValue,
  RequestTypes,
  timeFormat,
  urgentValue,
} from '../../../config/constants'
import UploadImages from '../../Common/UploadImages/UploadImages'
import DepartmentAndServiceKeys from '../../../config/departmentAndServicekeys'
import { creationData } from '../../../services/common'
import CustomAlert from '../../Common/CustomAlert/CustomAlert'
import {
  GetServiceRequests,
  saveServiceRequest,
} from '../../../services/requests'
import ConfirmationDialog from '../../Common/ConfirmationDialog/ConfirmationDialog'
import SectionLoader from '../../Common/Loader/SectionLoader'
import {
  AddGymListener,
  AddSaloonListener,
  AddSpaListener,
} from '../../../services/spaWellness'
import { AddRestaurantListener } from '../../../services/restaurants'
import { AddCuisineListener } from '../../../services/cuisine'
import { AddFoodMenuListener } from '../../../services/foodMenu'
import { fetchHotelLocations } from '../../../services/location'

const { TextArea } = Input

const guestError = 'Please select guest'
const departmentError = 'Please select department'
const locationError = 'Please select location'
const serviceError = 'Please select service'
const subServiceError = 'Please select sub service'
const serviceNotOperational = 'Service is not operational at the selected time'
const skipButtonText = 'Skip Duplicate'
const onlyAllowedBefore10Minute =
  'Reservation only allowed before 10 minutes of closing time'

function getNumericOptions(n) {
  return Array.from({ length: n }, (_, i) => {
    const v = String(i + 1)
    return { name: v, value: v }
  })
}

const extraBedOptions = getNumericOptions(2)
const extendStayDaysOptions = getNumericOptions(5)
const noOfGuestOptions = getNumericOptions(20)

const defaultRequestData = {
  changeUpgradeRoom: changeRoomValue,
  comment: '',
  extendStayDays: extendStayDaysOptions[0].value,
  extraBed: extraBedOptions[0].value,
  images: [],
  noOfGuest: noOfGuestOptions[0].value,
  requestType: requestTypeOptionsValue[0].value,
  restaurant: '',
  roomType: '',
  selectedCuisine: '',
  selectedDate: null,
  selectedDepartment: '',
  selectedGuest: [],
  selectedService: '',
  selectedSubService: '',
  selectedTime: null,
  tokenNumber: '',
  locationId: '',
}

const frontDeskServices = DepartmentAndServiceKeys.frontDesk.services
const houseKeepingServices = DepartmentAndServiceKeys.houseKeeping.services
const conciergeServices = DepartmentAndServiceKeys.concierge.services
const fnbServices = DepartmentAndServiceKeys.foodAndBeverage.services
const snwServices = DepartmentAndServiceKeys.spaAndWellness.services

const restaurantKey = fnbServices.restaurant.key
const roomServiceKey = fnbServices.roomService.key
const bookTaxiKey = conciergeServices.bookTaxi.key
const getMyCarKey = conciergeServices.getMyCar.key

const spaAndWellnessKeys = [
  snwServices.gym.key,
  snwServices.spa.key,
  snwServices.saloon.key,
]

const getConfig = ({ serviceKey, isGuestRequest }) => {
  return {
    showRequestType: [
      frontDeskServices.airportDropoff.key,
      frontDeskServices.changeUpgradeRoom.key,
      frontDeskServices.extraBed.key,
      houseKeepingServices.roomCleaning.key,
      houseKeepingServices.pickLaundry.key,
      houseKeepingServices.cleanTray.key,

      bookTaxiKey,
      conciergeServices.carRental.key,
      getMyCarKey,
      restaurantKey,
      '',
    ].includes(serviceKey),

    showChangeUpgradeRoomSelection:
      serviceKey === frontDeskServices.changeUpgradeRoom.key,

    showTokenNumber: serviceKey === getMyCarKey,

    showExtraBed: serviceKey === frontDeskServices.extraBed.key,

    showDaysSelection: serviceKey === frontDeskServices.extendStay.key,

    showDateSelection: [
      frontDeskServices.airportDropoff.key,
      frontDeskServices.checkoutAndRequestBill.key,
      frontDeskServices.wakeUpCall.key,
      bookTaxiKey,
      conciergeServices.carRental.key,
      restaurantKey,
      '',
      ...spaAndWellnessKeys,
    ].includes(serviceKey),

    showTimeSelection: [
      frontDeskServices.airportDropoff.key,
      frontDeskServices.checkoutAndRequestBill.key,
      frontDeskServices.wakeUpCall.key,
      houseKeepingServices.roomCleaning.key,
      houseKeepingServices.pickLaundry.key,
      houseKeepingServices.cleanTray.key,
      bookTaxiKey,
      conciergeServices.carRental.key,
      getMyCarKey,
      restaurantKey,
      '',
      ...spaAndWellnessKeys,
    ].includes(serviceKey),

    showNoOfGuestSelection: serviceKey === restaurantKey,

    showCuisineSelection: serviceKey === roomServiceKey,

    confirmDuplicateRequest:
      [bookTaxiKey, getMyCarKey, restaurantKey, roomServiceKey].includes(
        serviceKey
      ) && isGuestRequest,
  }
}

function getDefaultValidator(errorMessage) {
  return () => ({
    validator(_, value) {
      if (!value) {
        return Promise.reject(new Error(errorMessage))
      }
      return Promise.resolve()
    },
  })
}

function getDefaultArrayValidator(errorMessage) {
  return () => ({
    validator(_, value) {
      if (!Array.isArray(value) || !value.length) {
        return Promise.reject(new Error(errorMessage))
      }
      return Promise.resolve()
    },
  })
}

const GetMomentObject = (time, momentObj) => {
  if (!time) return momentObj.add(1, 'day')

  let [hours, minutes] = time.split(':')
  hours = +hours
  minutes = +minutes

  const newMomentObj = moment(momentObj)

  return newMomentObj
    .set('hours', +hours)
    .set('minutes', +minutes)
    .set('seconds', 0)
}

function AddTimeToMoment({ date, hours, minutes, serverDate }) {
  let currMoment = date ? moment(date) : moment(serverDate)
  return currMoment
    .set('hours', +hours)
    .set('minutes', +minutes)
    .set('seconds', 0)
}

function ClosingTimeGetMomentObject({
  selectedDate,
  openingTime,
  closingTime,
  serverDate,
}) {
  let nextDayClosing = false
  let closingMoment = null

  if (closingTime === '00:00') {
    nextDayClosing = true
    closingMoment = moment(selectedDate).add(1, 'day').startOf('day')
  } else {
    let [otHours, otMinutes] = openingTime.split(':')
    otHours = +otHours
    otMinutes = +otMinutes

    let [ctHours, ctMinutes] = closingTime.split(':')
    ctHours = +ctHours
    ctMinutes = +ctMinutes

    let totalClosingMinute = ctHours * 60 + ctMinutes
    let totalOpeningMinute = otHours * 60 + otMinutes
    nextDayClosing = totalClosingMinute <= totalOpeningMinute
    closingMoment = AddTimeToMoment({
      date: selectedDate,
      hours: ctHours,
      minutes: ctMinutes,
      serverDate,
    })

    if (nextDayClosing) {
      closingMoment = closingMoment.add(1, 'day')
    }
  }

  return [closingMoment, nextDayClosing]
}

function spaAndWellnessTimingValidation({
  closingTime,
  date,
  openingTime,
  selectedDateTime,
}) {
  const openingMoment = GetMomentObject(openingTime, date)
  const closingMoment = GetMomentObject(closingTime, date)
  if (
    selectedDateTime.isBefore(openingMoment) ||
    selectedDateTime.isAfter(closingMoment)
  ) {
    return 'Service is not operational at the selected time'
  }

  if (selectedDateTime.isSameOrBefore(closingMoment)) {
    const minutesLeftToCloseTheRestaurant = closingMoment.diff(
      selectedDateTime,
      'minutes'
    )
    if (minutesLeftToCloseTheRestaurant < 10) return onlyAllowedBefore10Minute
  }

  return ''
}

function restaurantTimingValidation({
  openingTime,
  closingTime,
  selectedDateTime,
  date,
  serverDate,
}) {
  const openingMoment = GetMomentObject(openingTime, date)
  let [closingMoment, nextDayClosing] = ClosingTimeGetMomentObject({
    selectedDate: date,
    openingTime,
    closingTime,
    serverDate,
  })

  let selectedHour = selectedDateTime.hour()
  let closingHour = closingMoment.hour()

  let tmpSelectedMoment =
    nextDayClosing && selectedHour <= closingHour
      ? moment(selectedDateTime).add(1, 'day')
      : selectedDateTime
  if (nextDayClosing) {
    if (
      tmpSelectedMoment.isBefore(openingMoment) ||
      tmpSelectedMoment.isAfter(closingMoment)
    ) {
      return serviceNotOperational
    }
  } else {
    // same day closing
    if (
      selectedDateTime.isBefore(openingMoment) ||
      selectedDateTime.isAfter(closingMoment)
    ) {
      return serviceNotOperational
    }
  }

  if (tmpSelectedMoment.isSameOrBefore(closingMoment)) {
    const minutesLeftToCloseTheRestaurant = closingMoment.diff(
      tmpSelectedMoment,
      'minutes'
    )
    if (minutesLeftToCloseTheRestaurant <= 10) return onlyAllowedBefore10Minute
  }

  return ''
}

function isPastDateSelected(selectedDate, currentDate) {
  return selectedDate.isBefore(moment(currentDate), 'minute')
}

function getDateTimeValidationError({
  type,
  date,
  time,
  serviceKey,
  openingTime,
  closingTime,
  serverDate,
}) {
  let selectedDateTime = moment(date.startOf('day'))
    .add(moment(time).hour(), 'hours')
    .add(moment(time).minute(), 'minutes')

  const pastDateSelected = isPastDateSelected(selectedDateTime, serverDate)

  if (type === 'time') {
    if (pastDateSelected) {
      selectedDateTime = moment(serverDate)
    }

    if (spaAndWellnessKeys.includes(serviceKey)) {
      return spaAndWellnessTimingValidation({
        closingTime,
        date,
        openingTime,
        selectedDateTime,
      })
    } else if (serviceKey === restaurantKey) {
      if (openingTime === closingTime) {
        // restaurant is open 24x7, so timing validation not needed
        return ''
      }

      return restaurantTimingValidation({
        openingTime,
        closingTime,
        selectedDateTime,
        date,
        serverDate,
      })
    }
  }

  return ''
}

function getDefaultDateTimeValidator({
  type,
  serviceKey,
  otherValue,
  openingTime,
  closingTime,
  serverDate,
}) {
  return () => ({
    validator(_, value) {
      let date, time
      if (type === 'time') {
        time = value
        date = otherValue
      } else {
        time = otherValue
        date = value
      }

      const servicesWithOnlyTimeSelection = [
        houseKeepingServices.roomCleaning.key,
        houseKeepingServices.pickLaundry.key,
        houseKeepingServices.cleanTray.key,
        getMyCarKey,
      ]
      if (servicesWithOnlyTimeSelection.includes(serviceKey)) {
        date = moment(serverDate)
      }

      if (!value) {
        return Promise.reject(new Error(`Please select ${type}`))
      }

      const error = getDateTimeValidationError({
        type,
        date,
        time,
        serviceKey,
        openingTime,
        closingTime,
        serverDate,
      })
      if (error) {
        return Promise.reject(new Error(error))
      }

      return Promise.resolve()
    },
  })
}

function getSortedArray(array, key = 'name') {
  if (Array.isArray(array)) {
    return Sort([...array], key)
  }
  return []
}

function getFrontDeskServiceType(serviceKey) {
  if (serviceKey === frontDeskServices.changeUpgradeRoom.key) {
    return frontDeskServiceTypes.RoomUpgrade
  } else if (
    [
      frontDeskServices.checkoutAndRequestBill.key,
      frontDeskServices.airportDropoff.key,
      frontDeskServices.wakeUpCall.key,
    ].includes(serviceKey)
  ) {
    return frontDeskServiceTypes.ScheduledTime
  }
  return frontDeskServiceTypes.OtherRequest
}

function getExtraInfoAndNoOfAllowedRequest({
  extendStayDays,
  extraBed,
  isGuestRequest,
  requestedTime,
  serviceInfo,
  serviceKey,
  userInfo,
}) {
  let extraInfo = ''
  let noOfRequestsAllowed = 1

  switch (serviceKey) {
    case frontDeskServices.extraBed.key:
      extraInfo = `${extraBed} ${GetPostfix(extraBed, 'bed')}`
      break

    case frontDeskServices.extendStay.key:
      extraInfo = `${extendStayDays} ${GetPostfix(extendStayDays, 'day')}`
      break

    case frontDeskServices.airportDropoff.key:
    case frontDeskServices.wakeUpCall.key:
      extraInfo = moment(requestedTime).format('D MMM YYYY - hh:mm a')
      break

    case bookTaxiKey:
    case getMyCarKey:
    case restaurantKey:
    case roomServiceKey:
      // room service allowed unlimited
      noOfRequestsAllowed = 0
      break

    default:
      break
  }

  if (!isGuestRequest) {
    // department request allowed unlimited
    noOfRequestsAllowed = 0
  }
  const service = serviceInfo?.name || departmentWithOutServiceObj.name
  const fromDepartmentId = userInfo?.departmentId ?? ''
  const fromDepartmentName = userInfo?.department ?? ''
  const createdByName = userInfo?.name || ''

  return {
    createdByName,
    extraInfo,
    fromDepartmentId,
    fromDepartmentName,
    noOfRequestsAllowed,
    service,
  }
}

function getRequestedDateAndTime({
  currentDate,
  selectedDate,
  selectedTime,
  showDateSelection,
  showTimeSelection,
}) {
  let requestDate = currentDate
  let requestTime = currentDate
  let requestedTime = currentDate

  if (showDateSelection) {
    requestDate = moment(selectedDate).local().toDate()
    requestedTime = moment(selectedDate).local().toDate()
  }

  if (showTimeSelection) {
    const pastDateSelected = isPastDateSelected(selectedTime, currentDate)
    const tempSelectedTime = moment(
      pastDateSelected ? currentDate : selectedTime
    )
    const hour = tempSelectedTime.hour()
    const minute = tempSelectedTime.minute()

    let tempRequestedTime = new Date(requestedTime)
    tempRequestedTime.setHours(hour)
    tempRequestedTime.setMinutes(minute)
    requestTime = requestedTime = tempRequestedTime
  }

  const currentDayOfMonth = currentDate.getDate()
  const selectedDayOfMonth = requestDate.getDate()
  if (selectedDayOfMonth < currentDayOfMonth) {
    requestDate.setDate(currentDayOfMonth)
    requestTime.setDate(currentDayOfMonth)
    requestedTime.setDate(currentDayOfMonth)
  }

  return { requestDate, requestTime, requestedTime }
}

function getSpaAndWellnessInfo({ gym, spa, saloon, serviceKey }) {
  const config = {
    [snwServices.gym.key]: gym,
    [snwServices.spa.key]: spa,
    [snwServices.saloon.key]: saloon,
  }

  const {
    closed = false,
    closingTime = '',
    name = '',
    openingTime = '',
  } = config?.[serviceKey]?.[0] || {}

  return {
    closed,
    snpName: name,
    spClosingTime: closingTime,
    spOpeningTime: openingTime,
  }
}

function SpaAndWellnessServiceInfo({
  snpName,
  openingTime,
  closingTime,
  serviceKey,
}) {
  if (spaAndWellnessKeys.includes(serviceKey)) {
    let message = `Name: ${snpName} Opening: ${openingTime} Closing: ${closingTime}`
    let type = 'info'

    if (!snpName) {
      message = 'Will be updated soon'
      type = 'error'
    }

    return (
      <div className='row mb-3'>
        <Alert banner message={message} type={type} showIcon={false} />
      </div>
    )
  }

  return null
}

function isSpaAndWellnessServiceOperational({ serviceKey, snpName, closed }) {
  if (closed) {
    return false
  }

  if (spaAndWellnessKeys.includes(serviceKey)) {
    return !!snpName
  }

  return true
}

function getRestaurantInfo(restaurantInfo) {
  let {
    id: restaurantId = '',
    name: restaurantName = '',
    openingTime = '',
    closingTime,
  } = restaurantInfo ?? {}

  if (!closingTime) {
    closingTime = openingTime
  }

  return {
    restaurantId,
    restaurantName,
    resOpeningTime: openingTime,
    resClosingTime: closingTime,
  }
}

function getOpeningAndClosingTime({
  serviceKey,
  spOpeningTime,
  spClosingTime,
  resOpeningTime,
  resClosingTime,
}) {
  let openingTime = ''
  let closingTime = ''

  if (spaAndWellnessKeys.includes(serviceKey)) {
    openingTime = spOpeningTime
    closingTime = spClosingTime
  } else if (serviceKey === restaurantKey) {
    openingTime = resOpeningTime
    closingTime = resClosingTime
  }

  return { openingTime, closingTime }
}

function getCartTotal(cart) {
  let billAmount = 0
  for (const { qty, price } of Object.values(cart)) {
    if (qty * price) {
      billAmount += qty * +price
    }
  }
  return billAmount
}

function getMenuDetailAndCuisines({ cart, cuisines }) {
  const menuDetail = Object.values(cart).filter(item => item.amount)
  const cuisineIds = menuDetail.map(m => m.cuisineId)
  const cuisineNames = cuisines
    .filter(c => cuisineIds.includes(c.id))
    .map(c => c.name)

  return { menuDetail, cuisineNames }
}

function validateNoOfAllowedRequest({
  serviceRequestList,
  noOfRequestsAllowed,
}) {
  if (noOfRequestsAllowed) {
    const guestWithExtraRequest = serviceRequestList
      .filter(d => d.pendingRequests.length >= noOfRequestsAllowed)
      .map(d => d.guestInfo)
    if (guestWithExtraRequest.length) {
      return {
        message:
          'Previous request is pending for ' +
          guestWithExtraRequest
            .map(g => `${g.guest} (${g.roomNumber})`)
            .join(', '),
      }
    }
  }

  let pendingRequestCount = 0
  for (const { pendingRequests, message, success } of serviceRequestList) {
    pendingRequestCount += pendingRequests.length
    // check for error in data fetching
    if (!success) {
      return { message }
    }
  }

  return { pendingRequestCount }
}

async function validateRequest({
  anotherRequestConfirmed,
  billAmount,
  closed,
  confirmDuplicateRequest,
  guestList,
  hotelId,
  noOfRequestsAllowed,
  requestedTime,
  selectedDepartment,
  selectedService,
  serviceKey,
  setConfirmationMessage,
  setConfirmButtonText,
  setDuplicateRequestGuestList,
  setShowConfirmationDialog,
  snpName,
}) {
  let waitingForConfirmation

  if (anotherRequestConfirmed) {
    return { errorMessage: '', waitingForConfirmation }
  }

  if (!isSpaAndWellnessServiceOperational({ serviceKey, snpName, closed })) {
    return {
      errorMessage: 'Service is not available right now',
      waitingForConfirmation,
    }
  }

  if (serviceKey === roomServiceKey && !billAmount) {
    return { errorMessage: 'Select food items', waitingForConfirmation }
  }

  const fetchExistingRequests =
    noOfRequestsAllowed || (!anotherRequestConfirmed && confirmDuplicateRequest)

  if (fetchExistingRequests) {
    const serviceRequestList = await Promise.all(
      guestList.map(guest =>
        GetServiceRequests(hotelId, guest, selectedDepartment, selectedService)
      )
    )

    const guestWithDuplicateRequest = serviceRequestList
      .filter(d => d.pendingRequests.length)
      .map(({ guestInfo }) => guestInfo)
    setDuplicateRequestGuestList(guestWithDuplicateRequest)

    const { pendingRequestCount, message } = validateNoOfAllowedRequest({
      serviceRequestList,
      noOfRequestsAllowed,
    })

    if (message) {
      setConfirmationMessage(message)
      waitingForConfirmation = true
      setConfirmButtonText(skipButtonText)
      setShowConfirmationDialog(true)
      return { errorMessage: '', waitingForConfirmation }
    }

    if (!anotherRequestConfirmed && confirmDuplicateRequest) {
      if (serviceKey === bookTaxiKey) {
        let errorMessage = serviceRequestList
          .filter(({ pendingRequests }) =>
            pendingRequests.some(pr =>
              moment(pr.requestedTime.toDate()).isSame(moment(requestedTime))
            )
          )
          .map(({ guestInfo: g }) => `${g.guest} (${g.roomNumber})`)
          .join(', ')

        if (errorMessage) {
          setConfirmationMessage(
            `Already request is pending for the selected time for following guests... ${errorMessage}`
          )
          waitingForConfirmation = true
          setConfirmButtonText(skipButtonText)
          setShowConfirmationDialog(true)
        }
      } else if (pendingRequestCount) {
        setConfirmationMessage(
          `We are already proceeding with another request. Do you wish to initiate another ? ` +
            guestWithDuplicateRequest
              .map(g => `${g.guest} (${g.roomNumber})`)
              .join(', ')
        )
        waitingForConfirmation = true
        setConfirmButtonText('Confirm')
        setShowConfirmationDialog(true)
      }
    }
  }

  return { errorMessage: '', waitingForConfirmation }
}

function getGuestInfo({
  createdByName,
  fromDepartmentName,
  guestInfo,
  isGuestRequest,
}) {
  if (!isGuestRequest) {
    return [
      {
        bookingReferance: '',
        guest: createdByName,
        guestId: '',
        roomNumber: fromDepartmentName,
      },
    ]
  }

  const guestList = Array.isArray(guestInfo) ? guestInfo : []
  const guestData = guestList.map(g => {
    let { id, name, surName, roomNumber, bookingReferance } = g

    if (!name) name = ''
    if (!surName) surName = ''
    if (!roomNumber) roomNumber = ''
    if (!bookingReferance) bookingReferance = ''

    return {
      bookingReferance,
      guest: `${name} ${surName}`,
      guestId: id,
      roomNumber,
    }
  })

  return guestData
}

function getServiceData({ selectedDepartment, selectedService, serviceInfo }) {
  let serviceId = selectedService || selectedDepartment

  let { requiredTime, typeOfService } = serviceInfo
  if (!requiredTime) {
    requiredTime = defaultEscalationTime
  }

  if (!typeOfService) {
    typeOfService = 'ServiceRequests'
  }

  return { requiredTime, serviceId, typeOfService }
}

function getModalTitle(isGuestRequest) {
  const typeName = isGuestRequest ? 'Guest' : 'Department'
  return `Add ${typeName} Request`
}

const style = { width: '25px' }

function focusElement(key) {
  setTimeout(() => {
    const element = document.querySelector(`#${key}`)
    element?.focus()
  }, 0)
}

function SelectLocation({
  isGuestRequest,
  translateTextI18N,
  locationIdToInfo,
  onChange,
  locationId,
}) {
  const onChangeLangauge = useCallback(
    value => onChange('locationId', value),
    [onChange]
  )

  return (
    !isGuestRequest && (
      <div className='col-12 col-sm-6'>
        <div className='form-group cmn-input'>
          <Form.Item
            label={translateTextI18N('Location')}
            name='location'
            required
            rules={[getDefaultValidator(locationError)]}
          >
            <SelectDrops
              addAll={false}
              list={Sort(
                Object.values(locationIdToInfo).map(loc => ({
                  name: loc.locationName,
                  value: loc.locationId,
                })),
                'name'
              )}
              onChange={onChangeLangauge}
              value={locationId}
              showSearch={true}
            />
          </Form.Item>
        </div>
      </div>
    )
  )
}

function SelectGuest({
  isGuestRequest,
  loadingGuests,
  onChange,
  selectedGuest,
  sortedGuestList,
  translateTextI18N,
}) {
  if (isGuestRequest) {
    return (
      <div className='col-12 col-sm-12'>
        <div className='form-group cmn-input vertical-scroll-select'>
          <Form.Item
            name='selectedGuest'
            label={translateTextI18N('Guest')}
            required
            rules={[getDefaultArrayValidator(guestError)]}
          >
            <SelectDrops
              addAll={false}
              keepDropDownOpen={true}
              list={sortedGuestList}
              loading={loadingGuests}
              mode='multiple'
              onChange={value => onChange('selectedGuest', value)}
              showSearch={true}
              value={selectedGuest}
            />
          </Form.Item>
        </div>
      </div>
    )
  }

  return null
}

const MAX_ALLOWED_GUEST = 25

function AddRequestModal({ type, visible, hideModal }) {
  const {
    hotelInfo,
    userInfo,
    currentLanguage,
    departmentAndServiceIdToInfo,
    departmentsNew,
    servicesNew,

    loadingGuests,
    guests,

    roomTypes,

    spa,
    saloon,
    gym,

    restaurants,
    loadingRestaurants,

    cuisines,
    foodMenus,

    locationIdToInfo,
  } = useSelector(state => state)

  const { curencyCode, hotelId } = hotelInfo

  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [form] = Form.useForm()

  const [requestData, updateRequestData] = useState(defaultRequestData)
  const [serverDate, setServerDate] = useState()
  const [loading, setLoading] = useState('')
  const [loadingServerDate, setLoadingServerDate] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)
  const [error, setError] = useState('')
  const [cart, setCart] = useState({})
  const [saveLocationConfirmation, setSaveLocationConfirmation] = useState()

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [duplicateRequestGuestList, setDuplicateRequestGuestList] = useState([])
  const [confirmButtonText, setConfirmButtonText] = useState('')

  function hideConfirmationDialog() {
    setDuplicateRequestGuestList([])
    setConfirmButtonText('')

    setShowConfirmationDialog(false)
  }

  function setFormValues(data) {
    form.setFieldsValue(data)
    setRequestData(data)
  }

  async function getInitialDateTime() {
    setLoadingServerDate(true)

    let currentDate = serverDate
    if (!currentDate) {
      currentDate = await getServerDate()
      setServerDate(currentDate)
    }
    const defaultDateTimeSelection = {
      selectedDate: moment(currentDate).startOf('day'),
      selectedTime: moment(currentDate).add(1, 'minute'),
    }

    setInterval(async () => {
      currentDate = await getServerDate()
      setServerDate(currentDate)
    }, 1000 * 60)

    setFormValues(defaultDateTimeSelection)

    setLoadingServerDate(false)
  }

  async function resetModal() {
    form.resetFields()
    setFormValues(deepCloneObject(defaultRequestData))
    setCart({})
    getInitialDateTime()

    focusElement(isGuestRequest ? 'selectedGuest' : 'selectedDepartment')
  }

  useEffect(() => {
    if (visible) {
      resetModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const isGuestRequest = type === RequestTypes.GuestRequest

  useEffect(() => {
    if (isGuestRequest) AddGuestListener(hotelId, dispatch)

    if (visible) {
      AddCuisineListener(hotelId, false, dispatch)
      AddFoodMenuListener(hotelId, dispatch)
      AddGymListener(hotelId, false, dispatch)
      AddRestaurantListener(hotelId, false, dispatch)
      AddRoomTypeListener(hotelId, false, dispatch)
      AddSaloonListener(hotelId, false, dispatch)
      AddSpaListener(hotelId, false, dispatch)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, visible])

  useEffect(() => {
    fetchHotelLocations({ dispatch, hotelId })
  }, [dispatch, hotelId])

  const {
    changeUpgradeRoom,
    comment,
    extendStayDays,
    extraBed,
    images,
    noOfGuest,
    requestType,
    restaurant,
    roomType,
    selectedCuisine,
    selectedDate,
    selectedDepartment,
    selectedGuest,
    selectedService,
    selectedSubService,
    selectedTime,
    tokenNumber,
    locationId,
  } = requestData

  const departments = departmentsNew
    .map(d => ({
      ...d,
      name: d.name,
      value: d.id,
    }))
    .filter(d => d.active)

  const services = servicesNew[selectedDepartment]
    ?.map(s => ({
      ...s,
      name: s.name,
      value: s.id,
    }))
    .filter(s => !['view-bill', 'hotel-shuttle'].includes(s.key) && s.active)

  const subServices = servicesNew[selectedService]?.map(s => ({
    ...s,
    name: s.name,
    value: s.id,
  }))

  const departmentInfo =
    departmentAndServiceIdToInfo?.[selectedDepartment] ?? {}
  const departmentKey = departmentInfo.key ?? ''

  const serviceInfo = departmentAndServiceIdToInfo[selectedService] ?? {}
  let serviceKey = serviceInfo.key || ''

  const subServiceInfo = departmentAndServiceIdToInfo[selectedSubService] ?? {}

  const billAmount = getCartTotal(cart)

  let {
    confirmDuplicateRequest,
    showChangeUpgradeRoomSelection,
    showCuisineSelection,
    showDateSelection,
    showDaysSelection,
    showExtraBed,
    showNoOfGuestSelection,
    showRequestType,
    showTimeSelection,
    showTokenNumber,
  } = getConfig({ serviceKey, isGuestRequest })

  if (requestType === urgentValue) {
    showDateSelection = false
    showTimeSelection = false
  }

  function setRequestData(data) {
    const key = Object.keys(data)[0]
    if (['selectedDate', 'selectedTime'].includes(key)) {
      // set selected date's date in selected time
      let { selectedDate: sDate, selectedTime: sTime } = {
        selectedDate,
        selectedTime,
        ...data,
      }
      if (sDate && sTime) {
        sTime = moment(sTime)
        data.selectedTime = moment(sDate)
          .set('hours', sTime.hours())
          .set('minutes', sTime.minutes())
          .set('seconds', 0)
      }
    }
    updateRequestData(oldData => ({ ...oldData, ...data }))
  }

  function getUpdatedObject(propKey) {
    // for resetting controls on selected department or service change
    const config = {
      selectedDepartment: 1,
      selectedService: 2,
      selectedSubService: 3,
      selectedCuisine: 4,
      requestType: 4,
      selectedDate: 4,
      selectedTime: 4,
      changeUpgradeRoom: 4,
      roomType: 4,
      tokenNumber: 4,
      extraBed: 4,
      extendStayDays: 4,
      restaurant: 4,
      noOfGuest: 4,
    }

    const propValue = config[propKey]

    let keys = Object.keys(config).filter(key => config[key] > propValue)

    if (showDateSelection) {
      // don't reset date if visible
      keys = keys.filter(k => k !== 'selectedDate')
    }

    if (showTimeSelection) {
      // don't reset time if visible
      keys = keys.filter(k => k !== 'selectedTime')
    }

    if (showRequestType) {
      // don't reset time if visible
      keys = keys.filter(k => k !== 'requestType')
    }

    const defaultValues = {}
    for (const key of keys) {
      if (key === 'selectedDate') {
        defaultValues[key] = moment(serverDate).startOf('day')
      } else if (key === 'selectedTime') {
        defaultValues[key] = moment(serverDate)
      } else {
        defaultValues[key] = defaultRequestData[key]
      }
    }

    return defaultValues
  }

  function onChange(key, value) {
    let data = { [key]: value }

    if (key === 'selectedGuest' && value.length > MAX_ALLOWED_GUEST) {
      form.setFieldsValue({ selectedGuest: selectedGuest })
      return
    }

    const resetOtherData = getUpdatedObject(key)
    setRequestData({ ...data, ...resetOtherData })
    form.setFieldsValue({ ...data, ...resetOtherData })

    // because we are updating state on blur event and this focuses same element onBlur
    if (!['tokenNumber', 'comment'].includes(key)) {
      focusElement(key)
    }
  }

  const sortedGuestList = useMemo(() => {
    if (isGuestRequest) {
      let guestList = guests
        .filter(g => g.status === checkInLable)
        .map(guest => {
          const { fullName, roomNumber } = guest
          return { ...guest, name: `${fullName} (${roomNumber})` }
        })
      guestList = getSortedArray(guestList)
      return guestList
    }
    return []
  }, [guests, isGuestRequest])

  const sortedDepartments = useMemo(
    () => getSortedArray(departments),
    [departments]
  )
  function SelectDepartment() {
    return (
      <div className='col-12 col-sm-12'>
        <div className='form-group cmn-input'>
          <Form.Item
            name='selectedDepartment'
            label={translateTextI18N('Department')}
            required
            rules={[getDefaultValidator(departmentError)]}
          >
            <SelectDrops
              addAll={false}
              list={sortedDepartments}
              loading={!departmentsNew?.length}
              onChange={value => onChange('selectedDepartment', value)}
              showSearch={true}
              value={selectedDepartment}
            />
          </Form.Item>
        </div>
      </div>
    )
  }

  function SelectService() {
    if (selectedDepartment && services?.length) {
      return (
        <div className='col-12 col-sm-12'>
          <div className='form-group cmn-input'>
            <Form.Item
              name='selectedService'
              label={translateTextI18N('Service')}
              required
              rules={[getDefaultValidator(serviceError)]}
            >
              <SelectDrops
                addAll={false}
                list={getSortedArray(services)}
                onChange={value => onChange('selectedService', value)}
                showSearch={true}
                value={selectedService}
              />
            </Form.Item>
          </div>
        </div>
      )
    }
    return null
  }

  function SelectSubService() {
    if (subServices?.length) {
      return (
        <div className='col-12 col-sm-12'>
          <div className='form-group cmn-input'>
            <Form.Item
              name='selectedSubService'
              label={translateTextI18N('Sub Service')}
              required
              rules={[getDefaultValidator(subServiceError)]}
            >
              <SelectDrops
                addAll={false}
                list={getSortedArray(subServices)}
                onChange={value => onChange('selectedSubService', value)}
                showSearch={true}
                value={selectedSubService}
              />
            </Form.Item>
          </div>
        </div>
      )
    }

    return null
  }

  function SelectCuisine() {
    if (!showCuisineSelection) {
      return null
    }

    const cuisineList = getSortedArray(
      cuisines.map(c => ({ name: c.name, value: c.id }))
    )

    return (
      <div className='col-12 col-sm-4'>
        <div className='form-group cmn-input'>
          <Form.Item
            name='selectedCuisine'
            label={translateTextI18N('Cuisine')}
            required
            rules={[getDefaultValidator('Please select cuisine')]}
          >
            <SelectDrops
              addAll={false}
              list={cuisineList}
              onChange={value => onChange('selectedCuisine', value)}
              showSearch={true}
              value={selectedCuisine}
            />
          </Form.Item>
        </div>
      </div>
    )
  }

  function SelectRestaurant() {
    if (serviceKey !== restaurantKey) {
      return null
    }

    const restaurantList = getSortedArray(
      restaurants.map(r => ({ ...r, value: r.id }))
    )

    return (
      <div className='col-12 col-sm-4'>
        <div className='form-group cmn-input'>
          <Form.Item
            label={translateTextI18N('Restaurant')}
            name='restaurant'
            required
            rules={[getDefaultValidator('Please select restaurant')]}
          >
            <SelectDrops
              addAll={false}
              list={restaurantList}
              loading={loadingRestaurants}
              onChange={value => onChange('restaurant', value)}
              value={restaurant}
            />
          </Form.Item>
        </div>
      </div>
    )
  }

  const { closed, snpName, spOpeningTime, spClosingTime } =
    getSpaAndWellnessInfo({
      gym,
      spa,
      saloon,
      serviceKey,
    })

  const restaurantInfo = restaurants.find(r => r.id === restaurant)
  const { resOpeningTime, resClosingTime } = getRestaurantInfo(restaurantInfo)

  const { openingTime, closingTime } = getOpeningAndClosingTime({
    serviceKey,
    spOpeningTime,
    spClosingTime,
    resOpeningTime,
    resClosingTime,
  })

  function SelectedRestaurantInfo() {
    if (restaurantInfo) {
      const message = `Name: ${restaurantInfo.name} \t Opening: ${restaurantInfo.openingTime} Closing: ${restaurantInfo.closingTime} Dress Code: ${restaurantInfo.dressCode}`
      return (
        <div className='row mb-3'>
          <Alert banner message={message} type='info' showIcon={false} />
        </div>
      )
    }
    return null
  }

  function SelectRequestType() {
    if (!showRequestType) {
      return null
    }

    return (
      <div className='col-12 col-sm-6'>
        <div className='form-group cmn-input'>
          <Form.Item
            label={translateTextI18N('Request Type')}
            name='requestType'
            required
          >
            <SelectDrops
              addAll={false}
              list={requestTypeOptionsValue}
              onChange={value => onChange('requestType', value)}
              value={requestType}
            />
          </Form.Item>
        </div>
      </div>
    )
  }

  function SelecteDate() {
    if (!showDateSelection) {
      return null
    }

    return (
      <div className='col-12 col-md-4'>
        <div className='form-group cmn-input'>
          <Form.Item
            label={translateTextI18N('Date')}
            name='selectedDate'
            required
            rules={[
              getDefaultDateTimeValidator({
                type: 'date',
                serviceKey,
                otherValue: selectedTime,
                serverDate,
              }),
            ]}
          >
            {loadingServerDate ? (
              <Spin />
            ) : (
              <DatePicker
                allowClear={false}
                format={dateFormat}
                disabledDate={current =>
                  current < moment(serverDate).startOf('day')
                }
                onChange={value =>
                  setRequestData({
                    selectedDate: value ? moment(value).startOf('day') : null,
                  })
                }
                value={selectedDate}
                getPopupContainer={triggerNode => {
                  return triggerNode.parentNode
                }}
              />
            )}
          </Form.Item>
        </div>
      </div>
    )
  }

  function SelectTime() {
    if (!showTimeSelection) {
      return null
    }

    return (
      <div className='col-12 col-md-4'>
        <div className='form-group cmn-input'>
          <Form.Item
            label={translateTextI18N('Time')}
            name='selectedTime'
            required
            rules={[
              getDefaultDateTimeValidator({
                type: 'time',
                serviceKey,
                otherValue: selectedDate,
                openingTime,
                closingTime,
                serverDate,
              }),
            ]}
          >
            {loadingServerDate ? (
              <Spin />
            ) : (
              <TimePicker
                allowClear={false}
                format={timeFormat}
                hideDisabledOptions
                onChange={value => setRequestData({ selectedTime: value })}
                value={selectedTime}
                getPopupContainer={triggerNode => {
                  return triggerNode.parentNode
                }}
              />
            )}
          </Form.Item>
        </div>
      </div>
    )
  }

  function Comment() {
    return (
      <div className='col-12'>
        <div className='form-group cmn-input'>
          <Form.Item
            id='comment'
            name='comment'
            label={translateTextI18N('Write Request')}
          >
            <TextArea
              id='comment'
              rows={4}
              value={comment}
              onBlur={e => onChange('comment', e.target.value)}
            />
          </Form.Item>
        </div>
      </div>
    )
  }

  function handleFoodItemSelection({ description = '', dish, nos, price, id }) {
    const newCart = { ...cart }
    if (newCart[id]) {
      newCart[id].qty += nos
      newCart[id].amount += nos * +newCart[id].price
    } else {
      newCart[id] = {
        amount: nos * +price,
        cuisineId: selectedCuisine,
        description,
        id,
        name: dish,
        price,
        qty: nos,
      }
    }

    if (newCart[id].qty >= 0) {
      setCart(newCart)
    }
  }

  function MenuCard(menuItem) {
    if (!showCuisineSelection || !selectedCuisine) {
      return null
    }

    const { id, dish, price, imageUrl } = menuItem

    const value = cart[id]?.qty ?? 0

    return (
      <div className='menuCard'>
        <figure>
          <img
            className='img-fluid'
            src={imageUrl || getImage('images/dish.png')}
            alt=''
          ></img>
        </figure>
        <div className='menuitemDetails '>
          <h5>{dish}</h5>
          <div className='d-flex align-items-center'>
            <h6>
              {curencyCode} {price}
            </h6>
            <div className='addCount'>
              <Button
                className='minusbtn'
                disabled={value === 0}
                onClick={() =>
                  handleFoodItemSelection({ nos: -1, ...menuItem })
                }
                style={style}
              >
                -
              </Button>
              <input
                min={0}
                readOnly
                style={style}
                type='number'
                value={value}
              ></input>
              <Button
                className='plusbtn'
                onClick={() => handleFoodItemSelection({ nos: 1, ...menuItem })}
                style={style}
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function MenuList() {
    if (!showCuisineSelection || !selectedCuisine) {
      return null
    }

    const menuItems = foodMenus.filter(
      f => f.cuisines.includes(selectedCuisine) && f.available
    )

    return (
      <div className='menu-list' mb-4>
        <p>Menu</p>
        {menuItems.map(menuItem => (
          <MenuCard {...menuItem} />
        ))}
        <div className='continuestrip'>
          <h6>Total Amount</h6>
          {curencyCode} {formatPrice(billAmount)}
        </div>
      </div>
    )
  }

  function SelectChangeUpgradeRoom() {
    if (!showChangeUpgradeRoomSelection) {
      return null
    }

    return (
      <div className='col-12 col-sm-4'>
        <div className='form-group cmn-input'>
          <Form.Item
            name='changeUpgradeRoom'
            label={translateTextI18N('Change / Upgrade Room')}
            required
            rules={[getDefaultValidator('Please select change/upgrade room')]}
          >
            <SelectDrops
              addAll={false}
              list={changeUpgradeRoomOptions}
              onChange={value => onChange('changeUpgradeRoom', value)}
              value={changeUpgradeRoom}
            />
          </Form.Item>
        </div>
      </div>
    )
  }

  function SelectNumericOptions({
    errorMessage,
    label,
    name,
    options,
    show,
    value,
  }) {
    if (!show) {
      return null
    }

    return (
      <div className='col-12 col-sm-4'>
        <div className='form-group cmn-input'>
          <Form.Item
            name={name}
            label={translateTextI18N(label)}
            required
            rules={[getDefaultValidator(errorMessage)]}
          >
            <SelectDrops
              addAll={false}
              list={options}
              onChange={selectedValue => onChange(name, selectedValue)}
              value={value}
            />
          </Form.Item>
        </div>
      </div>
    )
  }

  function SelectRoom() {
    if (
      !showChangeUpgradeRoomSelection ||
      changeUpgradeRoom === changeRoomValue
    ) {
      return null
    }

    const roomTypeList = roomTypes.map(r => ({
      ...r,
      name: r.roomName,
      value: r.id,
    }))

    return (
      <div className='col-12 col-sm-4'>
        <div className='form-group cmn-input'>
          <Form.Item
            name='roomType'
            label={translateTextI18N('Room Type')}
            required
            rules={[getDefaultValidator('Please select room type')]}
          >
            <SelectDrops
              addAll={false}
              list={roomTypeList}
              onChange={value => onChange('roomType', value)}
              value={roomType}
            />
          </Form.Item>
        </div>
      </div>
    )
  }

  const TokenNumber = useCallback(() => {
    if (!showTokenNumber) {
      return null
    }

    return (
      <div className='col-12 col-sm-4'>
        <div className='form-group cmn-input'>
          <Form.Item
            name='tokenNumber'
            label={translateTextI18N('Token Number')}
            required
            rules={[getDefaultValidator('Please enter token number')]}
          >
            <Input
              maxLength={50}
              value={tokenNumber}
              onBlur={e => onChange('tokenNumber', e.target.value)}
            />
          </Form.Item>
        </div>
      </div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTokenNumber])

  async function saveRequest(anotherRequestConfirmed = false) {
    try {
      setLoading('Saving...')

      if (loading) return

      const guestInfo = guests.filter(g => selectedGuest.includes(g.id))

      let frontDeskServiceType = getFrontDeskServiceType(serviceKey)

      const { requestDate, requestTime, requestedTime } =
        getRequestedDateAndTime({
          currentDate: serverDate,
          selectedDate,
          selectedTime,
          showDateSelection,
          showTimeSelection,
        })

      const dateTime = GetDateTimeString(requestedTime)

      const { restaurantId, restaurantName } = getRestaurantInfo(restaurantInfo)

      let {
        createdByName,
        extraInfo,
        fromDepartmentId,
        fromDepartmentName,
        noOfRequestsAllowed,
        service,
      } = getExtraInfoAndNoOfAllowedRequest({
        extendStayDays,
        extraBed,
        isGuestRequest,
        requestedTime,
        serviceInfo,
        serviceKey,
        userInfo,
      })

      if (serviceKey === frontDeskServices.changeUpgradeRoom.key) {
        service = changeUpgradeRoom
      }

      let notificationServiceName = service
      let isSubService = false
      let serviceType = ''
      let parentServiceId = ''
      let parentServiceKey = ''
      let { requiredTime, serviceId, typeOfService } = getServiceData({
        selectedDepartment,
        selectedService,
        serviceInfo,
      })
      if (selectedSubService) {
        parentServiceId = selectedService
        parentServiceKey = serviceInfo?.key

        requiredTime = subServiceInfo.requiredTime
        serviceId = selectedSubService
        serviceKey = subServiceInfo.key
        serviceType = subServiceInfo.name
        typeOfService = subServiceInfo.typeOfService
        isSubService = true

        notificationServiceName = `${service} - ${serviceType}`
      }

      if (!typeOfService) {
        typeOfService = 'ServiceRequests'
      }

      const department_type = departmentInfo.name || ''
      const { menuDetail, cuisineNames } = getMenuDetailAndCuisines({
        cart,
        cuisines,
      })

      // const { bookingReferance, guest, guestId, roomNumber } = getGuestInfo({
      let guestList = getGuestInfo({
        createdByName,
        fromDepartmentName,
        guestInfo,
        isGuestRequest,
      })

      const { errorMessage, waitingForConfirmation } = await validateRequest({
        anotherRequestConfirmed,
        billAmount,
        closed,
        confirmDuplicateRequest,
        guestList,
        hotelId,
        noOfRequestsAllowed,
        requestedTime,
        selectedDepartment,
        selectedService,
        serviceKey,
        setConfirmationMessage,
        setConfirmButtonText,
        setDuplicateRequestGuestList,
        setShowConfirmationDialog,
        snpName,
      })

      if (errorMessage) {
        SetAutoClearProp(setError, translateTextI18N(errorMessage))
        return
      }

      if (waitingForConfirmation) {
        return
      }

      const escalationTime = GetEscalationTime(requestedTime, requiredTime)

      if (confirmButtonText === skipButtonText) {
        const duplicateRequestGuestIds = duplicateRequestGuestList.map(
          g => g.guestId
        )
        guestList = guestList.filter(
          g => !duplicateRequestGuestIds.includes(g.guestId)
        )
      }

      let requestData = {
        billAmount,
        cuisines: cuisineNames,
        dateTime,
        department_type,
        department: department_type,
        departmentId: selectedDepartment,
        departmentKey,
        departmentRequestImages: images,
        description: extraInfo,
        escalationTime,
        extraInfo,
        fromDepartmentId,
        fromDepartmentName,
        frontDeskServiceType,
        hotelId,
        isSubService,
        menuDetail,
        noOfGuest,
        parentServiceId,
        parentServiceKey,
        requestDate,
        requestedDate: moment(requestedTime).startOf('day').local().toDate(), // only date part of requested time
        requestedTime,
        requestTime,
        requestType,
        requiredTime,
        restaurantId,
        restaurantName,
        roomType,
        service,
        serviceId,
        serviceKey,
        serviceType,
        status: pendingLable,
        ticketNumber: tokenNumber,
        typeOfService,
        writeRequest: comment,

        assignedById: '',
        assignedByName: '',
        assignedToId: '',
        createdAtDate: moment(serverDate).startOf('day').toDate(),
        assignedToName: '',
        completedTime: null,
        createdByName,
        from: 'HOP',
        isEscalationNotificationSend: false,
        isGuestRequest,
        isReminderSend: false,
        isWarningSend: false,
        noOfRequestsAllowed,
        isRecurring : false,

        ...creationData(serverDate),
      }

      if (images.length > 0) {
        requestData = {
          ...requestData,
          beforeStartUploadById: userInfo.id || userInfo.userId,
          beforeStartUploadByName: userInfo.name,
          beforeStartUploadImages: images,
        }
      }

      requestData.isMoreRequest = !serviceKey

      const {
        locationName = '',
        locationTypeId = '',
        locationTypeName = '',
        locationTypeisDefault = false,
        isLocationUsed = false,
      } = locationIdToInfo?.[locationId] || {}

      requestData = {
        ...requestData,
        locationId,
        locationName,
        locationTypeId,
        locationTypeName,
        locationTypeisDefault,
        isLocationUsed,
      }

      const notificationData = {
        staffName: createdByName,
        staff_id: userInfo.id,
        departmentKey,
        departmentId: selectedDepartment,
        service: notificationServiceName,
        currentLanguage,
      }

      if (requestedTime < requestData.createdAt) {
        requestData.createdAt = requestedTime
      }

      if (guestList.length > 0) {
        const { success, message } = await saveServiceRequest({
          guestList,
          notificationData,
          requestData,
        })
        if (success) {
          resetModal()
          AntdMessage.success(translateTextI18N('Request saved successfully'))
          return
        }

        SetAutoClearProp(setError, message)
      } else {
        hideConfirmationDialog()
      }
    } catch (error) {
      SetAutoClearProp(setError, error?.message)
    } finally {
      setLoading('')
    }
  }

  return (
    <>
      <Modal
        className='cmnModal requestModal'
        footer={null}
        maskClosable={false}
        onCancel={hideModal}
        title={translateTextI18N(getModalTitle(isGuestRequest))}
        visible={visible}
      >
        <SectionLoader loading={loading} message={loading} />
        <Form
          form={form}
          layout='vertical'
          onFinish={() => {
            if (locationId || isGuestRequest) {
              saveRequest(false)
              return
            }

            if (!isGuestRequest) {
              setSaveLocationConfirmation(true)
            }
          }}
          validateTrigger
        >
          <div className='row'>
            <SelectGuest
              isGuestRequest={isGuestRequest}
              loadingGuests={loadingGuests}
              onChange={onChange}
              selectedGuest={selectedGuest}
              sortedGuestList={sortedGuestList}
              translateTextI18N={translateTextI18N}
            />
          </div>
          <div className='row'>
            <SelectDepartment />
          </div>
          <div className='row'>
            <SelectService />
          </div>
          <div className='row'>
            <SelectSubService />
          </div>
          <div className='row'>
            <SelectCuisine />
          </div>
          <SpaAndWellnessServiceInfo
            snpName={snpName}
            openingTime={openingTime}
            closingTime={closingTime}
            serviceKey={serviceKey}
          />
          <div className='row'>
            <SelectRestaurant />
          </div>
          <SelectedRestaurantInfo />
          <div className='row'>
            <SelectNumericOptions
              errorMessage='Please select no. of guests'
              label='Number of guests'
              name='noOfGuest'
              options={noOfGuestOptions}
              show={showNoOfGuestSelection}
              value={noOfGuest}
            />
          </div>
          <div className='row'>
            <SelectRequestType />
            <SelectLocation
              {...{
                isGuestRequest,
                translateTextI18N,
                locationIdToInfo,
                onChange,
                locationId,
              }}
            />
          </div>
          <div className='row'>
            <SelectChangeUpgradeRoom />
            <SelectRoom />
            <TokenNumber />
            <SelectNumericOptions
              errorMessage='Please select extra bed'
              label='Extra Bed'
              name='extraBed'
              options={extraBedOptions}
              show={showExtraBed}
              value={extraBed}
            />
            <SelectNumericOptions
              errorMessage='Please select days'
              label='Select Days'
              name='extendStayDays'
              options={extendStayDaysOptions}
              show={showDaysSelection}
              value={extendStayDays}
            />
          </div>
          <div className='row'>
            <SelecteDate />
            <SelectTime />
          </div>

          {type === RequestTypes.DepartmentRequest ? (
            <div className='row'>
              <UploadImages
                previews={images}
                setPreviews={imgs => setRequestData({ images: imgs })}
                maxImages={4}
                folderPath={hotelId}
                loading={loadingImage}
                setLoading={setLoadingImage}
              />
            </div>
          ) : null}
          <MenuList />
          <div className='row'>
            <Comment />
          </div>
          <CustomAlert
            visible={error}
            message={error}
            type='error'
            showIcon={true}
            classNames='mb-10 '
          />
          <div className='modalFooter mt-5'>
            <Button
              className='grayBtn'
              onClick={hideModal}
              disabled={loading || loadingImage}
            >
              {translateTextI18N('Cancel')}
            </Button>
            <Button
              className='blueBtn ml-3 ml-lg-4'
              htmlType='submit'
              key='submit'
              disabled={loading || loadingImage}
            >
              {translateTextI18N('Submit')}
            </Button>
          </div>
        </Form>
      </Modal>

      <ConfirmationDialog
        visible={showConfirmationDialog}
        onCancelClick={hideConfirmationDialog}
        onOkClick={() => {
          hideConfirmationDialog()
          saveRequest(true)
        }}
        title={translateTextI18N('Confirmation')}
        message={confirmationMessage}
        okButtonText={translateTextI18N(confirmButtonText)}
      />

      <ConfirmationDialog
        visible={saveLocationConfirmation}
        onCancelClick={() => {
          saveRequest(false)
          setSaveLocationConfirmation(false)
        }}
        onOkClick={() => {
          setSaveLocationConfirmation(false)
        }}
        title={'Save Request Confirmation'}
        message={`Do you want to select a Location ?`}
        okButtonText='Yes'
        cancelButtonText='No'
        isDisable={loading === 'Saving...'}
      />
    </>
  )
}

export default AddRequestModal
