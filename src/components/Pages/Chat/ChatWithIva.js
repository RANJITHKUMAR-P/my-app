import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Layout, Input, message as AntdMessage, Modal, Form } from 'antd'
import moment from 'moment'
import Header from '../../Common/Header/Header'
import PageNamecard from '../../Common/PageNameCard/PageNameCard'
import SideMenu from '../../Common/Sidemenu/Sidemenu'
import {
  GetPostfix,
  GetDateTimeString,
  SetAutoClearProp,
  GetEscalationTime,
  getServerDate,
} from '../../../config/utils'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { saveServiceRequest } from '../../../services/requests'
import { creationData } from '../../../services/common'
import {
  departmentWithOutServiceObj,
  pendingLable,
  defaultEscalationTime,
} from '../../../config/constants'
import DepartmentAndServiceKeys from '../../../config/departmentAndServicekeys'
import { serviceType } from '../../../config/departmentAndServicekeys'
import { fetchHotelLocations } from '../../../services/location'
import { AddRoomTypeListener } from '../../../services/roomType'
import useIvaChat from '../../../hooks/useIvaChat'
import {
  ChatHistory,
  RoomNumberModal,
  RoomTypeModal,
  ConfirmationModal,
  TicketNumberModal,
  DaysToExtendModal,
  NumberOfBedsModal,
  DateTimeModal,
  TimeOnlyModal,
  ReplacementSubservicesModal,
  MaintenanceSubservicesModal,
} from './ChatComponents'

const ChatWithIva = () => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const [translateTextI18N] = useCustomI18NTranslatorHook()
  const [serverDate, setServerDate] = useState(null)
  const [roomNumbers, setRoomNumbers] = useState([])
  const [roomsData, setRoomsData] = useState([])
  const [pendingRequest, setPendingRequest] = useState(null)
  const [comment, setComment] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [replacementSubservice, setReplacementSubservice] = useState('')
  const [maintenanceSubservice, setMaintenanceSubservice] = useState('')
  const [requestStatus, setRequestStatus] = useState('')
  const [roomType, setRoomType] = useState('')
  const [ticketNumber, setTicketNumber] = useState('')
  const [daysToExtend, setDaysToExtend] = useState('')
  const [numberOfBeds, setNumberOfBeds] = useState('')
  const [invalidDate, setInvalidDate] = useState(false)
  const [invalidRoomNumber, setInvalidRoomNumber] = useState(false)
  const [invalidRoomType, setInvalidRoomType] = useState(false)
  const [pastDate, setPastDate] = useState(false)
  const [pastTime, setPastTime] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [activePopup, setActivePopup] = useState(null)

  const MAX_RETRIES = 1

  const [form] = Form.useForm()

  const { fetchIvaResponse, loadingIva, errorIva } = useIvaChat()

  const dispatch = useDispatch()

  const {
    hotelInfo,
    userInfo,
    currentLanguage,
    roomTypes,
    locationIdToInfo,
    departmentsNew,
    servicesNew,
  } = useSelector(state => state)
  const { hotelId } = hotelInfo

  const showPopup = popupName => {
    setActivePopup(popupName)
  }

  const hidePopup = () => {
    setActivePopup(null)
  }

  const initializeChat = () => {
    const initialData = [
      {
        service: 'book taxi',
        reply: 'book taxi for room 102 on 5th september 9am',
      },
      {
        service: 'clean room',
        reply: 'clean room 102 at 12pm',
      },
      {
        service: 'get my car',
        reply: 'get car for room 102 on 5th september 9am, ticket no: XXXXX',
      },
      {
        service: 'upgrade room',
        reply: 'upgrade room 102 to room type: single room',
      },
    ]
    const getRandomTip = data => {
      const randomIndex = Math.floor(Math.random() * data.length)
      return data[randomIndex]
    }
    const { service, reply } = getRandomTip(initialData)
    setMessages([
      {
        userText: 'Hello',
        assistantText: 'Hi there! How can I assist you today?',
      },
      {
        userText: `*TIP: you can send direct request for ${service}`,
        assistantText: reply,
      },
    ])
  }

  useEffect(() => {
    initializeChat()
  }, [])

  useEffect(() => {
    getInitialDateTime()
  }, [])

  // FETCH LOCATIONS
  useEffect(() => {
    const fetchLocations = () => {
      const data = locationIdToInfo
      const roomNums = Array.from(
        new Set(Object.values(data).map(item => item.locationName))
      )

      // console.log('Available locations: ', roomNums);
      setRoomNumbers(roomNums)

      if (roomNums.length === 0 && retryCount < MAX_RETRIES) {
        setRetryCount(prevCount => prevCount + 1)
      }
    }

    fetchLocations()
  }, [locationIdToInfo, retryCount])

  // ROOM TYPES FETCH
  useEffect(() => {
    const fetchRoomTypes = () => {
      const data = roomTypes
      const roomDetails = data.map(item => ({
        id: item.id,
        roomName: item.roomName,
      }))

      // console.log('Room Types available: ', roomDetails)
      setRoomsData(roomDetails)

      if (roomDetails.length === 0 && retryCount < MAX_RETRIES) {
        setRetryCount(prevCount => prevCount + 1)
      }
    }

    fetchRoomTypes()
  }, [roomTypes, retryCount])

  useEffect(() => {
    fetchHotelLocations({ dispatch, hotelId })
    AddRoomTypeListener(hotelId, false, dispatch)
  }, [dispatch, hotelId])

  // Helper Functions and text parsing functions
  function getIdByKey(key) {
    const item = departmentsNew.find(obj => obj.key === key)
    return item ? item.id : null
  }

  const getRoomNumber = text => {
    const pattern = /room_number:\s*(\d+)/
    const match = text.match(pattern)
    return match ? match[1] : null
  }

  const getDepartment = text => {
    const pattern = /department:\s*([^,]+)/
    const match = text.match(pattern)
    if (match) {
      const department = match[1].trim().toLowerCase()
      switch (department) {
        case 'front-desk':
          return {
            department_type: 'Front Desk',
            department: 'Front Desk',
            departmentId: getIdByKey('front-desk'),
            departmentKey: 'front-desk',
          }
        case 'concierge':
          return {
            department_type: 'Concierge',
            department: 'Concierge',
            departmentId: getIdByKey('concierge'),
            departmentKey: 'concierge',
          }
        case 'house-keeping':
        case 'maintenance':
          return {
            department_type: 'Housekeeping',
            department: 'Housekeeping',
            departmentId: getIdByKey('house-keeping'),
            departmentKey: 'house-keeping',
          }
        default:
          return {
            department_type: '',
            department: '',
            departmentId: '',
            departmentKey: '',
          }
      }
    }
    return null
  }

  const createAiCodeToServiceIdMap = () => {
    const allServices = Object.values(servicesNew).flat()
    const aiCodeMap = {
      cr1: DepartmentAndServiceKeys.frontDesk.services.changeUpgradeRoom.key,
      ru1: DepartmentAndServiceKeys.frontDesk.services.changeUpgradeRoom.key,
      eb1: DepartmentAndServiceKeys.frontDesk.services.extraBed.key,
      ad1: DepartmentAndServiceKeys.frontDesk.services.airportDropoff.key,
      cr2: DepartmentAndServiceKeys.frontDesk.services.checkoutAndRequestBill
        .key,
      es1: DepartmentAndServiceKeys.frontDesk.services.extendStay.key,
      wc1: DepartmentAndServiceKeys.frontDesk.services.wakeUpCall.key,
      dc1: DepartmentAndServiceKeys.frontDesk.services.doctorOnACall.key,
      td1: DepartmentAndServiceKeys.concierge.services.travelDesk.key,
      bt1: DepartmentAndServiceKeys.concierge.services.bookTaxi.key,
      cr3: DepartmentAndServiceKeys.concierge.services.carRental.key,
      gc1: DepartmentAndServiceKeys.concierge.services.getMyCar.key,
      tr1: DepartmentAndServiceKeys.houseKeeping.services.replacement.services
        .toiletries.key,
      pr1: DepartmentAndServiceKeys.houseKeeping.services.replacement.services
        .pillow.key,
      mr1: DepartmentAndServiceKeys.houseKeeping.services.replacement.services
        .minibar.key,
      mr2: DepartmentAndServiceKeys.houseKeeping.services.replacement.services
        .minibar.key,
      lr1: DepartmentAndServiceKeys.houseKeeping.services.replacement.services
        .linenBed.key,
      ct1: DepartmentAndServiceKeys.houseKeeping.services.cleanTray.key,
      lp1: DepartmentAndServiceKeys.houseKeeping.services.pickLaundry.key,
      rc1: DepartmentAndServiceKeys.houseKeeping.services.roomCleaning.key,
      am1: DepartmentAndServiceKeys.houseKeeping.services.maintenance.services
        .airconditioner.key,
      em1: DepartmentAndServiceKeys.houseKeeping.services.maintenance.services
        .electric.key,
      lm1: DepartmentAndServiceKeys.houseKeeping.services.maintenance.services
        .light.key,
      rm1: DepartmentAndServiceKeys.houseKeeping.services.maintenance.services
        .refridgerator.key,
      tm1: DepartmentAndServiceKeys.houseKeeping.services.maintenance.services
        .television.key,
      wm1: DepartmentAndServiceKeys.houseKeeping.services.maintenance.services
        .waterLeakage.key,
    }

    const aiCodeToServiceIdMap = {}

    for (const [aiCode, serviceKey] of Object.entries(aiCodeMap)) {
      const service = allServices.find(s => s.key === serviceKey)
      if (service) {
        aiCodeToServiceIdMap[aiCode] = service.id
      }
    }

    return aiCodeToServiceIdMap
  }

  const getServiceFromAicode = text => {
    const pattern = /ai-code:\s*(\w+)/
    const match = text.match(pattern)

    const aiCodeToServiceIdMap = createAiCodeToServiceIdMap()

    if (match) {
      const aiCode = match[1]
      switch (aiCode) {
        case 'cr1':
          return {
            service: 'Change Room',
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.frontDesk.services.changeUpgradeRoom.key,
            frontDeskServiceType:
              DepartmentAndServiceKeys.frontDesk.type.RoomUpgrade,
            aiCode: 'cr1',
          }
        case 'ru1':
          return {
            service: 'Upgrade Room',
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.frontDesk.services.changeUpgradeRoom.key,
            frontDeskServiceType:
              DepartmentAndServiceKeys.frontDesk.type.RoomUpgrade,
            aiCode: 'ru1',
          }
        case 'eb1':
          return {
            service: DepartmentAndServiceKeys.frontDesk.services.extraBed.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.frontDesk.services.extraBed.key,
            frontDeskServiceType:
              DepartmentAndServiceKeys.frontDesk.type.OtherRequest,
            aiCode: 'eb1',
          }
        case 'ad1':
          return {
            service:
              DepartmentAndServiceKeys.frontDesk.services.airportDropoff.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.frontDesk.services.airportDropoff.key,
            frontDeskServiceType:
              DepartmentAndServiceKeys.frontDesk.type.ScheduledTime,
            aiCode: 'ad1',
          }
        case 'cr2':
          return {
            service:
              DepartmentAndServiceKeys.frontDesk.services.checkoutAndRequestBill
                .name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.frontDesk.services.checkoutAndRequestBill
                .key,
            frontDeskServiceType:
              DepartmentAndServiceKeys.frontDesk.type.ScheduledTime,
            aiCode: 'cr2',
          }
        case 'es1':
          return {
            service:
              DepartmentAndServiceKeys.frontDesk.services.extendStay.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.frontDesk.services.extendStay.key,
            frontDeskServiceType:
              DepartmentAndServiceKeys.frontDesk.type.OtherRequest,
            aiCode: 'es1',
          }
        case 'wc1':
          return {
            service:
              DepartmentAndServiceKeys.frontDesk.services.wakeUpCall.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.frontDesk.services.wakeUpCall.key,
            frontDeskServiceType:
              DepartmentAndServiceKeys.frontDesk.type.ScheduledTime,
            aiCode: 'wc1',
          }
        case 'dc1':
          return {
            service:
              DepartmentAndServiceKeys.frontDesk.services.doctorOnACall.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey: '',
            frontDeskServiceType:
              DepartmentAndServiceKeys.frontDesk.type.OtherRequest,
            aiCode: 'dc1',
          }
        case 'td1':
          return {
            service:
              DepartmentAndServiceKeys.concierge.services.travelDesk.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.concierge.services.travelDesk.key,
            frontDeskServiceType: '',
            aiCode: 'td1',
          }
        case 'bt1':
          return {
            service: DepartmentAndServiceKeys.concierge.services.bookTaxi.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.concierge.services.bookTaxi.key,
            frontDeskServiceType: '',
            aiCode: 'bt1',
          }
        case 'cr3':
          return {
            service: DepartmentAndServiceKeys.concierge.services.carRental.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.concierge.services.carRental.key,
            frontDeskServiceType: '',
            aiCode: 'cr3',
          }
        case 'gc1':
          return {
            service: DepartmentAndServiceKeys.concierge.services.getMyCar.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.concierge.services.getMyCar.key,
            frontDeskServiceType: '',
            aiCode: 'gc1',
          }
        case 'tr1':
          return {
            service: 'Replacement',
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.replacement
                .services.toiletries.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.replacement
                .services.toiletries.name,
            frontDeskServiceType: '',
            aiCode: 'tr1',
          }
        case 'pr1':
          return {
            service: 'Replacement',
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.replacement
                .services.pillow.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.replacement
                .services.pillow.name,
            frontDeskServiceType: '',
            aiCode: 'pr1',
          }
        case 'mr1':
        case 'mr2':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.replacement.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.replacement
                .services.minibar.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.replacement
                .services.minibar.name,
            frontDeskServiceType: '',
            aiCode: 'mr1',
          }
        case 'lr1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.replacement.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.replacement
                .services.linenBed.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.replacement
                .services.linenBed.name,
            frontDeskServiceType: '',
            aiCode: 'lr1',
          }
        case 'ct1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.cleanTray.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.cleanTray.key,
            frontDeskServiceType: '',
            aiCode: 'ct1',
          }
        case 'lp1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.pickLaundry.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.pickLaundry.key,
            frontDeskServiceType: '',
            aiCode: 'lp1',
          }
        case 'rc1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.roomCleaning.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.roomCleaning.key,
            frontDeskServiceType: '',
            aiCode: 'rc1',
          }
        case 'am1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.airconditioner.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.airconditioner.name,
            frontDeskServiceType: '',
            aiCode: 'am1',
          }
        case 'em1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.electric.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.electric.name,
            frontDeskServiceType: '',
            aiCode: 'em1',
          }

        case 'lm1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.light.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.light.name,
            frontDeskServiceType: '',
            aiCode: 'lm1',
          }

        case 'rm1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.refridgerator.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.refridgerator.name,
            frontDeskServiceType: '',
            aiCode: 'rm1',
          }

        case 'tm1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.television.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.television.name,
            frontDeskServiceType: '',
            aiCode: 'tm1',
          }

        case 'wm1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance.name,
            serviceId: aiCodeToServiceIdMap[aiCode] || '',
            serviceKey:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.waterLeakage.key,
            serviceType:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance
                .services.waterLeakage.name,
            frontDeskServiceType: '',
            aiCode: 'wm1',
          }
        case 'm1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.maintenance.name,
            serviceId: '',
            serviceKey: '',
            serviceType: '',
            frontDeskServiceType: '',
            aiCode: 'm1',
          }
        case 'r1':
          return {
            service:
              DepartmentAndServiceKeys.houseKeeping.services.replacement.name,
            serviceId: '',
            serviceKey: '',
            serviceType: '',
            frontDeskServiceType: '',
            aiCode: 'r1',
          }
        default:
          return null
      }
    }
    return null
  }

  // Date and time parsing functions
  const getDateMonthAndTime = str => {
    // Match pattern for day, month, and time (including variations)
    const fullMatch = str.match(
      /(?:day:\s*(\d{1,2})(?:st|nd|rd|th)?\s+(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b)|(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b)\s+(\d{1,2})(?:st|nd|rd|th)?)(?:,?\s*time:\s*(\d{1,2})\s*(am|pm))?/i
    )
    if (fullMatch) {
      const day = fullMatch[1] || fullMatch[4]
      const month = fullMatch[2] || fullMatch[3]
      const time =
        fullMatch[5] && fullMatch[6]
          ? `${fullMatch[5]}${fullMatch[6].toLowerCase()}`
          : null
      return {
        day: day ? parseInt(day) : null,
        month: month ? month.toLowerCase() : null,
        time: time,
      }
    }
    // Match pattern for just time
    const timeMatch = str.match(/time:\s*(\d{1,2})\s*(am|pm)/i)
    if (timeMatch) {
      return {
        day: null,
        month: null,
        time: `${timeMatch[1]}${timeMatch[2].toLowerCase()}`,
      }
    }
    // If no matches, return null for all fields
    return { day: null, month: null, time: null }
  }

  const getMonthNumber = monthName => {
    if (!monthName) return null
    const months = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ]
    const index = months.indexOf(monthName.toLowerCase())
    return index !== -1 ? (index + 1).toString().padStart(2, '0') : null
  }

  const convertToISODate = (day, month, time) => {
    if (!time) return null
    const now = new Date()
    const year = now.getFullYear()
    let monthNumber, dayNumber

    if (!day && !month) {
      monthNumber = (now.getMonth() + 1).toString().padStart(2, '0')
      dayNumber = now.getDate().toString().padStart(2, '0')
    } else {
      monthNumber = getMonthNumber(month)
      dayNumber = day ? day.toString().padStart(2, '0') : null
      if (!monthNumber || !dayNumber) return null
    }

    const [hours, period] = time.match(/(\d+)(am|pm)/i).slice(1)
    let formattedHours = parseInt(hours)
    if (period.toLowerCase() === 'pm' && formattedHours !== 12) {
      formattedHours += 12
    } else if (period.toLowerCase() === 'am' && formattedHours === 12) {
      formattedHours = 0
    }
    formattedHours = formattedHours.toString().padStart(2, '0')

    return `${year}-${monthNumber}-${dayNumber}T${formattedHours}:00:00`
  }

  const extractRoomType = text => {
    const pattern = /room_type:\s*([^,]+)/
    const match = text.match(pattern)
    var roomType = match ? match[1].trim().toLowerCase() : null

    if (roomType) {
      if (roomType.includes('?')) {
        roomType = 'null'
      }
      const room = roomsData.find(
        room => room.roomName.toLowerCase() === roomType
      )

      if (!room && roomType !== 'null') {
        setInvalidRoomType(true)
      }
      return room ? room.id : null
    }
    return null
  }

  const extractDay = text => {
    const pattern = /day:\s*(\d+)/
    const match = text.match(pattern)
    return match ? `${match[1]} days` : null
  }

  const extractBeds = text => {
    const pattern = /beds:\s*(\d+)/
    const match = text.match(pattern)
    return match ? `${match[1]} beds` : null
  }

  const extractTicketNumber = response => {
    const match = response.match(/ticket_number:\s*(\d+)/)
    return match ? match[1] : null
  }

  const extractTodayTmmrInDate = inputString => {
    const regex = /\bday:\s*(today|tomorrow)\b/i
    const match = inputString.match(regex)

    return match ? match[1].toLowerCase() : null
  }

  function finalDayMonthTime(final) {
    // Default values using getDateMonthAndTime
    var { day, month, time } = getDateMonthAndTime(final)

    const result1 = extractTodayTmmrInDate(final)

    if (result1) {
      const currentDate = new Date()
      if (result1.toLowerCase() === 'today') {
        day = currentDate.getDate()
        month = currentDate.getMonth()
      } else if (result1.toLowerCase() === 'tomorrow') {
        const tomorrowDate = new Date(
          currentDate.setDate(currentDate.getDate() + 1)
        )
        day = tomorrowDate.getDate()
        month = tomorrowDate.getMonth()
      }
    }

    // Convert month number to month name
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const monthString = monthNames[month]

    return { day, month: monthString ? monthString : month, time }
  }

  // Main function executing user Input
  const handleUserInput = async () => {
    if (!inputValue.trim()) return

    setMessages(prevMessages => [
      ...prevMessages,
      { userText: inputValue, assistantText: 'Processing...' },
    ])

    try {
      const response = await fetchIvaResponse(inputValue)
      const result = response.data
      const final = result.response
      // console.log('Ai Response: ', final)

      let room_no = getRoomNumber(final)
      const dep = getDepartment(final)
      const serviceFromAi = getServiceFromAicode(final)
      let room_type = extractRoomType(final)
      let days = extractDay(final)
      let bed = extractBeds(final)
      let ticket_number = extractTicketNumber(final)

      let formattedDate = {}
      const { day, month, time } = finalDayMonthTime(final)
      // console.log(day, month, time)

      if (time) {
        formattedDate = convertToISODate(day, month, time)

        const isPastDate = moment(formattedDate).isBefore(moment())
        if (isPastDate) {
          formattedDate = {}
          setPastDate(isPastDate)
        }

        if (isPastDate && day === null && month === null) {
          formattedDate = {}
          setPastTime(isPastDate)
        }
      }

      if (
        !(month === null && day === null && time === null) &&
        !(month !== null && day !== null && time !== null) &&
        ['ad1', 'cr2', 'wc1', 'bt1', 'cr3', 'gc1'].includes(
          serviceFromAi.aiCode
        )
      ) {
        formattedDate = {}
        setInvalidDate(true)
      }

      // Show pop-up for unsupported service
      if (serviceFromAi === null) {
        setMessages(prevMessages => {
          const newMessages = [...prevMessages]
          newMessages[newMessages.length - 1].assistantText =
            "Couldn't create Request. Unsupported service."
          return newMessages
        })

        Modal.info({
          title: 'Unsupported Service',
          content:
            'Currently this service is not supported in IVA requests. You can manually create it in Departments requests.',
        })

        setRequestStatus('unsupported')
        return
      } else {
        let nextPopup = null

        if (room_no === null || !roomNumbers.includes(room_no)) {
          if (room_no !== null && !roomNumbers.includes(room_no)) {
            setInvalidRoomNumber(true)
          }
          nextPopup = 'roomNumber'
          room_no = null // Reset room_no if it's not valid
        } else if (room_type === null && serviceFromAi.aiCode === 'ru1') {
          nextPopup = 'roomType'
        } else if (ticket_number === null && serviceFromAi.aiCode === 'gc1') {
          nextPopup = 'ticketNumber'
        } else if (days === null && serviceFromAi.aiCode === 'es1') {
          nextPopup = 'daysToExtend'
        } else if (bed === null && serviceFromAi.aiCode === 'eb1') {
          nextPopup = 'numberOfBeds'
        } else if (
          ['ad1', 'cr2', 'wc1', 'bt1', 'cr3', 'gc1'].includes(
            serviceFromAi.aiCode
          ) &&
          JSON.stringify(formattedDate) === JSON.stringify({})
        ) {
          nextPopup = 'dateTime'
        } else if (
          ['ct1', 'lp1', 'rc1'].includes(serviceFromAi.aiCode) &&
          JSON.stringify(formattedDate) === JSON.stringify({})
        ) {
          nextPopup = 'timeOnly'
        } else if (serviceFromAi.aiCode === 'r1') {
          nextPopup = 'replacementSubservices'
        } else if (serviceFromAi.aiCode === 'm1') {
          nextPopup = 'maintenanceSubservices'
        } else {
          nextPopup = 'confirmation'
        }

        showPopup(nextPopup)

        setPendingRequest({
          room_no,
          dep,
          serviceFromAi,
          formattedDate,
          days,
          bed,
          room_type,
          ticket_number,
        })
        setComment('')

        setRequestStatus('pending')
      }
      // Update message based on request status
      setMessages(prevMessages => {
        const newMessages = [...prevMessages]
        switch (requestStatus) {
          case 'unsupported':
            newMessages[newMessages.length - 1].assistantText =
              "Couldn't create Request. Unsupported service."
            break
          case 'pending':
            newMessages[newMessages.length - 1].assistantText =
              'Request is pending confirmation'
            break
          default:
            newMessages[newMessages.length - 1].assistantText =
              'Processing complete'
        }
        return newMessages
      })
    } catch (error) {
      console.error('Error:', error)
      setMessages(prevMessages => {
        const newMessages = [...prevMessages]
        newMessages[newMessages.length - 1].assistantText =
          "Sorry, I couldn't process your request. Please try again."
        return newMessages
      })
    }

    setInputValue('')
  }

  const handleDateTimeConfirm = selectedDateTime => {
    if (pendingRequest) {
      const formattedDateTime = moment(
        selectedDateTime,
        'YYYY-MM-DD HH:mm'
      ).format('YYYY-MM-DDTHH:mm:00')
      setPendingRequest(prev => ({ ...prev, formattedDate: formattedDateTime }))
      hidePopup()
      showPopup('confirmation')
    }
  }

  const handleTimeConfirm = selectedTime => {
    if (pendingRequest) {
      const currentDate = moment().format('YYYY-MM-DD')
      const formattedDateTime = `${currentDate}T${selectedTime}:00`
      setPendingRequest(prev => ({ ...prev, formattedDate: formattedDateTime }))
      hidePopup()
      showPopup('confirmation')
    }
  }

  const handleDaysToExtendConfirm = () => {
    if (pendingRequest) {
      const updatedRequest = { ...pendingRequest, days: `${daysToExtend} days` }
      setPendingRequest(updatedRequest)

      hidePopup()
      showPopup('confirmation')
    }
    setDaysToExtend('')
  }

  const handleNumberOfBedsConfirm = () => {
    if (pendingRequest) {
      const updatedRequest = { ...pendingRequest, bed: `${numberOfBeds} beds` }
      setPendingRequest(updatedRequest)

      hidePopup()
      showPopup('confirmation')
    }
    setNumberOfBeds('')
  }

  const handleTicketNumberConfirm = () => {
    if (pendingRequest) {
      const updatedRequest = { ...pendingRequest, ticket_number: ticketNumber }
      setPendingRequest(updatedRequest)

      hidePopup()

      if (
        ['ad1', 'cr2', 'wc1', 'bt1', 'cr3', 'gc1'].includes(
          updatedRequest.serviceFromAi.aiCode
        ) &&
        JSON.stringify(updatedRequest.formattedDate) === JSON.stringify({})
      ) {
        showPopup('dateTime')
      } else {
        showPopup('confirmation')
      }
    }
    setTicketNumber('')
  }

  const handleRoomNumberConfirm = () => {
    if (pendingRequest) {
      const updatedRequest = { ...pendingRequest, room_no: roomNumber }
      setPendingRequest(updatedRequest)

      hidePopup()

      if (
        updatedRequest.room_type === null &&
        updatedRequest.serviceFromAi.aiCode === 'ru1'
      ) {
        showPopup('roomType')
      } else if (
        updatedRequest.ticket_number === null &&
        updatedRequest.serviceFromAi.aiCode === 'gc1'
      ) {
        showPopup('ticketNumber')
      } else if (
        updatedRequest.days === null &&
        updatedRequest.serviceFromAi.aiCode === 'es1'
      ) {
        showPopup('daysToExtend')
      } else if (
        updatedRequest.bed === null &&
        updatedRequest.serviceFromAi.aiCode === 'eb1'
      ) {
        showPopup('numberOfBeds')
      } else if (
        ['ad1', 'cr2', 'wc1', 'bt1', 'cr3', 'gc1'].includes(
          updatedRequest.serviceFromAi.aiCode
        ) &&
        JSON.stringify(updatedRequest.formattedDate) === JSON.stringify({})
      ) {
        showPopup('dateTime')
      } else if (
        ['ct1', 'lp1', 'rc1'].includes(updatedRequest.serviceFromAi.aiCode) &&
        JSON.stringify(updatedRequest.formattedDate) === JSON.stringify({})
      ) {
        showPopup('timeOnly')
      } else if (updatedRequest.serviceFromAi.aiCode === 'r1') {
        showPopup('replacementSubservices')
      } else if (updatedRequest.serviceFromAi.aiCode === 'm1') {
        showPopup('maintenanceSubservices')
      } else {
        showPopup('confirmation')
      }
    }
  }

  const handleRoomTypeConfirm = () => {
    if (pendingRequest) {
      const updatedRequest = { ...pendingRequest, room_type: roomType }
      setPendingRequest(updatedRequest)

      hidePopup()
      showPopup('confirmation')
    }
  }

  const handleReplacementSubserviceConfirm = newSubservice => {
    if (pendingRequest) {
      const updatedService = getServiceFromAicode(`ai-code: ${newSubservice}`)
      const updatedRequest = {
        ...pendingRequest,
        serviceFromAi: updatedService,
      }
      setPendingRequest(updatedRequest)

      hidePopup()
      showPopup('confirmation')
    }
  }

  const handleMaintenanceSubserviceConfirm = newSubservice => {
    if (pendingRequest) {
      const updatedService = getServiceFromAicode(`ai-code: ${newSubservice}`)
      const updatedRequest = {
        ...pendingRequest,
        serviceFromAi: updatedService,
      }
      setPendingRequest(updatedRequest)

      hidePopup()
      showPopup('confirmation')
    }
  }

  const handleConfirm = () => {
    hidePopup()
    if (pendingRequest) {
      sendManualRequest(
        pendingRequest.room_no,
        pendingRequest.dep,
        pendingRequest.serviceFromAi,
        pendingRequest.formattedDate,
        pendingRequest.days,
        pendingRequest.bed,
        pendingRequest.room_type,
        pendingRequest.ticket_number,
        comment
      )
    }
    // Update request status
    setRequestStatus('sent')
    // Update message
    setMessages(prevMessages => {
      const newMessages = [...prevMessages]
      newMessages[newMessages.length - 1].assistantText =
        'Request sent successfully'
      return newMessages
    })
    setPendingRequest(null)
    setComment('')
    setInvalidRoomNumber(false)
    setInvalidRoomType(false)
    setNumberOfBeds('')
    setDaysToExtend('')
    setInvalidDate(false)
    setPastTime(false)
    setActivePopup(null)
  }

  const handleCancel = () => {
    hidePopup()
    setPendingRequest(null)
    setComment('')
    setRoomNumber('')
    setRoomType('')
    setTicketNumber('')
    setNumberOfBeds('')
    setDaysToExtend('')
    setRequestStatus('cancelled')
    setMessages(prevMessages => {
      const newMessages = [...prevMessages]
      newMessages[newMessages.length - 1].assistantText = 'Request cancelled.'
      return newMessages
    })
    setInvalidRoomNumber(false)
    setInvalidRoomType(false)
    setInvalidDate(false)
    setPastTime(false)
    setActivePopup(null)
  }

  const resetForm = () => {
    form.resetFields()
  }

  // Helper functions for Request Data
  async function getInitialDateTime() {
    try {
      const currentDate = await getServerDate()
      setServerDate(currentDate)

      // Set up interval after successfully getting the initial date
      setInterval(async () => {
        const updatedDate = await getServerDate()
        setServerDate(updatedDate)
      }, 1000 * 60)
      return currentDate
    } catch (error) {
      console.error('Error fetching server date:', error)
      return new Date() // Fallback to client-side date if server date fetch fails
    }
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

  function getServiceData({
    selectedDepartment,
    selectedService,
    serviceInfo,
  }) {
    let serviceId = selectedService || selectedDepartment

    let { requiredTime, typeOfService } = serviceInfo
    if (!requiredTime) {
      requiredTime = defaultEscalationTime
    }

    if (!typeOfService) {
      typeOfService = serviceType.serviceRequest
    }

    return { requiredTime, serviceId, typeOfService }
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
      case DepartmentAndServiceKeys.frontDesk.services.extraBed.key:
        extraInfo = `${extraBed} ${GetPostfix(extraBed, 'bed')}`
        break
      case DepartmentAndServiceKeys.frontDesk.services.extendStay.key:
        extraInfo = `${extendStayDays} ${GetPostfix(extendStayDays, 'day')}`
        break
      case DepartmentAndServiceKeys.frontDesk.services.airportDropoff.key:
      case DepartmentAndServiceKeys.frontDesk.services.wakeUpCall.key:
        extraInfo = moment(requestedTime).format('D MMM YYYY - hh:mm a')
        break
      case DepartmentAndServiceKeys.concierge.services.bookTaxi.key:
      case DepartmentAndServiceKeys.concierge.services.getMyCar.key:
      case DepartmentAndServiceKeys.foodAndBeverage.services.restaurant.key:
      case DepartmentAndServiceKeys.foodAndBeverage.services.roomService.key:
        noOfRequestsAllowed = 0
        break
      default:
        break
    }

    if (!isGuestRequest) {
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

  // Send manual request
  async function sendManualRequest(
    rNo,
    dep,
    serviceFromAi,
    formattedDate,
    day = '',
    bed = '',
    roomType = '',
    ticket_number = '',
    comment = ''
  ) {
    try {
      setLoading('Sending request...')

      if (loading) return

      const guestInfo = [
        {
          id: 'testGuestId',
          name: 'Test Guest',
          surName: '',
          roomNumber: '101',
          bookingReferance: 'TEST123',
        },
      ]

      const requestedTime = new Date(formattedDate)
      const currentTime = new Date()
      const validRequestedTime = isNaN(requestedTime.getTime())
        ? currentTime
        : requestedTime

      const dateTime = GetDateTimeString(validRequestedTime)

      const {
        createdByName,
        extraInfo,
        fromDepartmentId,
        fromDepartmentName,
        noOfRequestsAllowed,
        service,
      } = getExtraInfoAndNoOfAllowedRequest({
        extendStayDays: '1',
        extraBed: '1',
        isGuestRequest: false,
        requestedTime,
        serviceInfo: { name: serviceFromAi.service },
        serviceKey: serviceFromAi.serviceKey,
        userInfo,
      })

      const { requiredTime, serviceId, typeOfService } = getServiceData({
        selectedDepartment: fromDepartmentId,
        selectedService: serviceFromAi.serviceKey,
        serviceInfo: {
          requiredTime: '00:30',
          typeOfService: serviceType.serviceRequest,
        },
      })

      const guestList = getGuestInfo({
        createdByName,
        fromDepartmentName,
        guestInfo,
        isGuestRequest: false,
      })

      const escalationTime = GetEscalationTime(validRequestedTime, requiredTime)

      const locationData = Object.values(locationIdToInfo).find(
        location => location.locationName === rNo
      )

      let requestData = {
        billAmount: 0,
        cuisines: [],
        dateTime: dateTime || '',
        department_type: dep.department_type || '',
        department: dep.department || '',
        departmentId: dep.departmentId || '',
        departmentKey: dep.departmentKey || '',
        departmentRequestImages: [],
        description:
          serviceFromAi.aiCode === 'dc1'
            ? ''
            : day ||
              bed ||
              moment(formattedDate).format('D MMM YYYY - hh:mm a'),
        escalationTime,
        escalationTime,
        extraInfo: moment(formattedDate).format('D MMM YYYY - hh:mm a'),
        fromDepartmentId,
        fromDepartmentName: 'IVA AI',
        frontDeskServiceType: serviceFromAi.frontDeskServiceType || '',
        hotelId,
        isSubService: false,
        menuDetail: [],
        noOfGuest: '1',
        parentServiceId: '',
        parentServiceKey: '',
        requestDate: moment(formattedDate).toDate() || '',
        requestedDate: moment(formattedDate).toDate() || '',
        requestedTime: moment(formattedDate).toDate() || '',
        requestTime: moment(formattedDate).toDate() || '',
        requestType: 'Normal',
        requiredTime,
        restaurantId: '',
        restaurantName: '',
        roomType: roomType || '',
        service: serviceFromAi.service || '',
        serviceId: serviceFromAi.serviceId,
        serviceKey: serviceFromAi.serviceKey || '',
        serviceType: serviceFromAi.serviceType || '',
        status: pendingLable,
        ticketNumber: ticket_number || '',
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
        isGuestRequest: false,
        isReminderSend: false,
        isWarningSend: false,
        noOfRequestsAllowed,
        isMoreRequest: false,
        locationName: locationData?.locationName || '',
        locationId: locationData?.locationId || '',
        locationTypeId: locationData?.locationTypeId || '',
        locationTypeName: locationData?.locationTypeName || '',
        locationTypeisDefault: false,
        isLocationUsed: locationData?.isLocationUsed || '',
        isRecurring : false,

        ...creationData(serverDate),
      }

      const notificationData = {
        staffName: userInfo.name || '',
        staff_id: userInfo.id || '',
        departmentKey: dep.departmentKey || '',
        departmentId: dep.departmentId || '',
        service: serviceFromAi.service || '',
        currentLanguage,
      }

      const { success, message } = await saveServiceRequest({
        guestList,
        notificationData,
        requestData,
      })

      if (success) {
        AntdMessage.success(translateTextI18N('Request sent successfully'))
        return true
      } else {
        SetAutoClearProp(setError, message)
        return false
      }
    } catch (error) {
      SetAutoClearProp(setError, error?.message)
      return false
    } finally {
      setLoading('')
    }
  }

  return (
    <>
      <Header />
      <SideMenu />
      <section className='mainContent department-wrp'>
        <div className='mainContent-in'>
          <div className='row'>
            <div className='col-12'>
              <PageNamecard title='IVA' breadcrumb={['Chat With IVA']} />
            </div>
          </div>
          <Layout className='chat-container'>
            <ChatHistory messages={messages} />
          </Layout>
          <div className='input-container'>
            <Input
              className='input-search'
              placeholder='How can I help you?'
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onPressEnter={handleUserInput}
            />
            <button className='send-button' onClick={handleUserInput}>
              Send
            </button>
          </div>
        </div>
      </section>

      {/* Popup Modals */}
      <RoomNumberModal
        visible={activePopup === 'roomNumber'}
        onOk={handleRoomNumberConfirm}
        onCancel={handleCancel}
        form={form}
        roomNumber={roomNumber}
        setRoomNumber={setRoomNumber}
        roomNumbers={roomNumbers}
        invalidRoomNumber={invalidRoomNumber}
        setInvalidRoomNumber={setInvalidRoomNumber}
        afterClose={resetForm}
      />

      <RoomTypeModal
        visible={activePopup === 'roomType'}
        onOk={handleRoomTypeConfirm}
        onCancel={handleCancel}
        form={form}
        roomType={roomType}
        setRoomType={setRoomType}
        roomsData={roomsData}
        invalidRoomType={invalidRoomType}
        setInvalidRoomType={setInvalidRoomType}
        afterClose={resetForm}
      />

      <ConfirmationModal
        visible={activePopup === 'confirmation'}
        onOk={handleConfirm}
        onCancel={handleCancel}
        form={form}
        comment={comment}
        setComment={setComment}
        afterClose={resetForm}
      />

      <TicketNumberModal
        visible={activePopup === 'ticketNumber'}
        onOk={handleTicketNumberConfirm}
        onCancel={handleCancel}
        form={form}
        ticketNumber={ticketNumber}
        setTicketNumber={setTicketNumber}
        afterClose={resetForm}
      />

      <DaysToExtendModal
        visible={activePopup === 'daysToExtend'}
        onOk={handleDaysToExtendConfirm}
        onCancel={handleCancel}
        form={form}
        daysToExtend={daysToExtend}
        setDaysToExtend={setDaysToExtend}
        afterClose={resetForm}
      />

      <NumberOfBedsModal
        visible={activePopup === 'numberOfBeds'}
        onOk={handleNumberOfBedsConfirm}
        onCancel={handleCancel}
        form={form}
        numberOfBeds={numberOfBeds}
        setNumberOfBeds={setNumberOfBeds}
        afterClose={resetForm}
      />

      <DateTimeModal
        visible={activePopup === 'dateTime'}
        onOk={handleDateTimeConfirm}
        onCancel={handleCancel}
        form={form}
        invalidDate={invalidDate}
        setInvalidDate={setInvalidDate}
        pastDate={pastDate}
        setPastDate={setPastDate}
        afterClose={resetForm}
      />

      <TimeOnlyModal
        visible={activePopup === 'timeOnly'}
        onOk={handleTimeConfirm}
        onCancel={handleCancel}
        form={form}
        pastTime={pastTime}
        setPastTime={setPastTime}
        afterClose={resetForm}
      />

      <ReplacementSubservicesModal
        visible={activePopup === 'replacementSubservices'}
        onOk={handleReplacementSubserviceConfirm}
        onCancel={handleCancel}
        form={form}
        afterClose={resetForm}
        setReplacementSubservice={setReplacementSubservice}
      />

      <MaintenanceSubservicesModal
        visible={activePopup === 'maintenanceSubservices'}
        onOk={handleMaintenanceSubserviceConfirm}
        onCancel={handleCancel}
        form={form}
        afterClose={resetForm}
        setMaintenanceSubservice={setMaintenanceSubservice}
      />
    </>
  )
}

export default ChatWithIva
