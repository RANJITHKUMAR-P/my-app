import Moment from 'moment'
import { extendMoment } from 'moment-range'

const moment = extendMoment(Moment)
let todaysDate = moment(moment.now())
let todayMonth = todaysDate.month()
let todayYear = todaysDate.format('YYYY')

const getWeekByYearAndMonth = (year = todayYear, month = todayMonth) => {
  let no_of_week = 1
  let startDate = moment.utc([year, month])
  const dateFirst = moment(startDate).date(1)
  const dateLast = moment(startDate).date(startDate.daysInMonth())
  const startWeek = dateFirst.isoWeek()
  const endWeek = dateLast.isoWeek()

  if (endWeek < startWeek) {
    // Yearly overlaps, month is either DEC or JAN
    if (dateFirst.month() === 0) {
      // January
      no_of_week = endWeek + 1
    } else {
      // December
      if (dateLast.isoWeekday() === 7) {
        // Sunday is last day of year
        no_of_week = endWeek - startWeek + 1
      } else {
        // Sunday is NOT last day of year
        no_of_week = dateFirst.isoWeeksInYear() - startWeek + 1
      }
    }
  } else {
    no_of_week = endWeek - startWeek + 1
  }

  return {
    no_of_week,
  }
}

const getWeeks = (year, month) => {
  let startDate = moment([year, month])

  let firstDay = moment(startDate).startOf('month')
  let endDay = moment(startDate).endOf('month')

  let monthRange = moment.range(firstDay, endDay)
  //  Get all the weeks during the current month
  let weeks = []
  for (let mday of monthRange.by('days')) {
    if (weeks.indexOf(mday.week()) === -1) {
      weeks.push(mday.week())
    }
  }
  let calendar = []
  for (let index = 0; index < weeks.length; index++) {
    let weeknumber = weeks[index]

    let firstWeekDay = moment(firstDay).week(weeknumber).day(0)
    if (firstWeekDay.isBefore(firstDay)) {
      firstWeekDay = firstDay
    }

    let lastWeekDay = moment(endDay).week(weeknumber).day(6)
    if (lastWeekDay.isAfter(endDay)) {
      lastWeekDay = endDay
    }

    let weekRange = moment.range(firstWeekDay, lastWeekDay)
    calendar.push({
      index,
      weekNumber: weeks[index],
      weekRange,
      firstWeekDay,
      lastWeekDay,
    })
  }

  return calendar
}

function getNumberOfWeeks(year, month) {
  if (year === '' && month === '') return 1
  return getWeeks(year, month).length
}

export { getWeekByYearAndMonth, getWeeks, getNumberOfWeeks }
