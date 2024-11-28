import { changeRoomValue, upgradeRoomValue } from './constants'

export const serviceType = {
  serviceRequest: 'ServiceRequests',
  reservation: 'Reservations',
  roomService: 'RoomService',
}

const DepartmentAndServiceKeys = {
  frontDesk: {
    key: 'front-desk',
    name: 'Front Desk',
    services: {
      changeUpgradeRoom: {
        key: 'change-upgrade-room',
        name: 'Change/Upgrade room',
      },
      extraBed: {
        key: 'extra-bed',
        name: 'Extra bed',
      },
      wakeUpCall: {
        key: 'wake-up-call',
        name: 'Wake up call',
      },
      doctorOnACall: {
        key: 'doctor-on-a-call',
        name: 'Doctor on a call',
      },
      extendStay: {
        key: 'extend-stay',
        name: 'Extend stay',
      },
      viewBill: {
        key: 'view-bill',
        name: 'View Bill',
      },
      checkoutAndRequestBill: {
        key: 'checkout-and-request-bill',
        name: 'Checkout and request bill',
      },
      airportDropoff: {
        key: 'airport-dropoff',
        name: 'Airport dropoff',
      },
    },
    type: {
      RoomUpgrade: 'RoomUpgrade',
      ScheduledTime: 'ScheduledTime',
      OtherRequest: 'OtherRequest',
    },
  },
  houseKeeping: {
    key: 'house-keeping',
    name: 'House Keeping',
    services: {
      roomCleaning: {
        key: 'room-cleaning',
        name: 'Room cleaning',
      },
      pickLaundry: {
        key: 'pick-laundry',
        name: 'Pick laundry',
      },
      cleanTray: {
        key: 'clean-tray',
        name: 'Clean tray',
      },
      maintenance: {
        key: 'maintenance',
        name: 'Maintenance',
        services: {
          airconditioner: {
            key: 'airconditioner',
            name: 'Air Conditioner',
          },
          waterLeakage: {
            key: 'water-leakage',
            name: 'Water leakage',
          },
          refridgerator: {
            key: 'refridgerator',
            name: 'Refrigerator',
          },
          light: {
            key: 'light',
            name: 'Light',
          },
          electric: {
            key: 'electric',
            name: 'Electric',
          },
          television: {
            key: 'television',
            name: 'Television',
          },
          others: {
            key: 'maintenance-others',
            name: 'Others',
          },
        },
      },
      replacement: {
        key: 'replacement',
        name: 'Replacement',
        services: {
          minibar: {
            key: 'minibar',
            name: 'Minibar',
          },
          toiletries: {
            key: 'toiletries',
            name: 'Toiletries',
          },
          linenBed: {
            key: 'linen-bed',
            name: 'Bed linen',
          },
          pillow: {
            key: 'pillow',
            name: 'Pillow',
          },
          others: {
            key: 'replacement-others',
            name: 'Others',
          },
        },
      },
    },
  },
  concierge: {
    key: 'concierge',
    name: 'Concierge',
    services: {
      bookTaxi: {
        key: 'book-taxi',
        name: 'Book taxi',
      },
      carRental: {
        key: 'car-rental',
        name: 'Car rental',
      },
      getMyCar: {
        key: 'get-my-car',
        name: 'Get my car',
      },
      travelDesk: {
        key: 'travel-desk',
        name: 'Travel Desk',
      },
      hotelShuttle: {
        key: 'hotel-shuttle',
        name: 'Hotel Shuttle',
      },
    },
  },
  foodAndBeverage: {
    key: 'food-and-beverage',
    name: 'Food and Beverage',
    services: {
      roomService: {
        key: 'room-service',
        name: 'Room service',
      },
      restaurant: {
        key: 'restaurant',
        name: 'Restaurant',
      },
    },
  },
  spaAndWellness: {
    key: 'spa-and-wellness',
    name: 'Spa and Wellness',
    services: {
      spa: {
        key: 'spa',
        name: 'Spa',
      },
      gym: {
        key: 'gym',
        name: 'Gym',
      },
      saloon: {
        key: 'saloon',
        name: 'Saloon',
      },
    },
  },
  promotions: {
    key: 'promotions',
    name: 'Promotion',
  },
  movieBooking: {
    key: 'movie-booking',
    name: 'Movie Booking',
  },
  eventsAround: {
    key: 'events-around',
    name: 'Events',
  },
  bookTaxi: {
    key: 'book-taxi',
    name: 'Book A Taxi',
  },
  aroundMe: {
    key: 'around-me',
    name: 'Around Me',
  },
  hotelInfo: {
    key: 'hotel-information',
    name: 'Hotel Information',
  },
  callTheHotel: {
    key: 'call-the-hotel',
    name: 'Call The Hotel',
  },
}

export const GetServiceNames = () => {
  const getServices = obj => {
    return Object.values(obj).reduce((acc, curr) => {
      if (curr.services) {
        acc = [...acc, ...getServices(curr.services)]
      } else {
        acc = [...acc, curr.name]
      }
      return acc
    }, [])
  }

  let serviceList = Object.values(DepartmentAndServiceKeys).reduce(
    (acc, curr) => {
      if (curr.services) {
        return [...acc, ...getServices(curr.services)]
      } else {
        acc = [...acc, curr.name]
      }
      return acc
    },
    []
  )

  serviceList = serviceList.filter(s => s !== 'Change / Upgrade Room')

  serviceList.push(changeRoomValue, upgradeRoomValue)

  serviceList = [...new Set(serviceList)]
  serviceList = serviceList.sort()

  return serviceList
}

export default DepartmentAndServiceKeys
