/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Select } from 'antd'
import { Months, Option } from '../../../config/constants'
import { getWeekByYearAndMonth } from '../../../config/date'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const BookingOverviewCard = ({ hotelInfo }) => {
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [NoOfWeek, setNoOfWeek] = useState(1)
  const [currentNoOfWeek, setCurrentNoOfWeek] = useState(1)
  let calcWeek = 1
  const { translateTextI18N } = useCustomI18NTranslatorHook()

  useEffect(() => {
    calcWeek = getWeekByYearAndMonth()
    setNoOfWeek(calcWeek.no_of_week)
    setCurrentNoOfWeek(1)
  }, [])

  useEffect(() => {
    const seconds = hotelInfo?.createdAt?.seconds
    if (seconds) {
      const date = new Date(seconds * 1000)
      let hotelCreateYear = date.getFullYear()
      const today = new Date()
      const currentYear = today.getFullYear()
      const yearsList = []
      yearsList.push(hotelCreateYear)
      while (hotelCreateYear !== currentYear) {
        yearsList.push(++hotelCreateYear)
      }
      if (yearsList.length) {
        yearsList.reverse()
        setSelectedYear(yearsList[0])
      }
      setYears(yearsList)
      setSelectedMonth(today.getMonth())
    }
  }, [hotelInfo])

  useEffect(() => {
    calcWeek = getWeekByYearAndMonth(selectedYear, selectedMonth)
    setNoOfWeek(calcWeek.no_of_week)
    setCurrentNoOfWeek(1)
  }, [selectedYear, selectedMonth])

  let state4 = {
    labels: [
      translateTextI18N('Mon'),
      translateTextI18N('Tue'),
      translateTextI18N('Wed'),
      translateTextI18N('Thu'),
      translateTextI18N('Fri'),
      translateTextI18N('Sat'),
      translateTextI18N('Sun'),
    ],
    datasets: [
      {
        label: translateTextI18N('My First dataset'),
        fill: false,
        lineTension: 0.8,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: '#1B96DC',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#1B96DC',
        pointHoverBorderColor: '#1B96DC',
        pointHoverBorderWidth: 2,
        pointRadius: 5,
        pointHitRadius: 5,
        data: [50, 70, 80, 90, 110, 180, 250],
      },
    ],
  }

  return (
    <>
      <div className='bookingoverviewCard-wrp cmnCard-wrp'>
        <div className='cardHead'>
          <h3>{translateTextI18N('Book Overview')}</h3>
          <div className='graphfilter d-flex'>
            <div className='filterSelect'>
              <Select value={selectedYear} onChange={y => setSelectedYear(y)}>
                {years.map(y => (
                  <Option value={y}>{y}</Option>
                ))}
              </Select>
            </div>
            <div className='filterSelect'>
              <Select
                value={selectedMonth}
                onChange={monthIdx => {
                  setSelectedMonth(monthIdx)
                }}
              >
                {Months.map(m => (
                  <Option value={m.value}>{translateTextI18N(m.short_name)}</Option>
                ))}
              </Select>
            </div>
            <div className='filterSelect'>
              <Select
                onChange={value => {
                  setCurrentNoOfWeek(value)
                }}
                value={`Week ${currentNoOfWeek}`}
              >
                {Array.from({ length: NoOfWeek }, function (_v, k) {
                  return (
                    <Option value={`${k + 1}`} key={`Week ${k + 1}`}>
                      {translateTextI18N(`Week ${k + 1}`)}
                    </Option>
                  )
                })}
              </Select>
            </div>
          </div>
        </div>

        <div className='cardBody'>
          <div className='linechart-wrp'>
            <Line
              data={state4}
              options={{
                title: {
                  display: false,
                  fontSize: 14,
                },
                legend: {
                  display: false,
                },
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                  backgroundColor: '#1B96DC',
                },
                locale: 'iw-FX',
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default BookingOverviewCard
