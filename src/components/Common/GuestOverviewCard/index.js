/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Select } from 'antd'
import { Months, Option } from '../../../config/constants'
import { getNumberOfWeeks } from '../../../config/date'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'
import { useDispatch, useSelector } from 'react-redux'
import {
  addOverViewChartDataListener,
  getWeekKey,
} from '../../../services/dashboard'

const GuestOverviewCard = ({ hotelInfo }) => {
  const [selectedYear, setSelectedYear] = useState('')
  const [years, setYears] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedWeek, setSelectedWeek] = useState('')
  const { hotelId, ovewViewChartData } = useSelector(state => state)
  const [calendar, setCalendar] = useState([])

  const dispatch = useDispatch()
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  let DataSet = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: translateTextI18N('Guest Count'),
        fill: false,
        lineTension: 0.8,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: '#1B96DD',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        pointBorderColor: 'rgba(75,192,192,2)',
        borderJoinStyle: 'miter',
        pointBackgroundColor: '#ffff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#1B96DC',
        pointHoverBorderColor: '#1B96DC',
        pointHoverBorderWidth: 2,
        pointRadius: 5,
        pointHitRadius: 5,
        data: [],
      },
    ],
  }
  const [data, setData] = useState({ ...DataSet })

  useEffect(() => {
    if (selectedYear !== '' && selectedMonth !== '') {
      let weeksCount = getNumberOfWeeks(selectedYear, selectedMonth)
      setCalendar(Array.from(Array(weeksCount).keys()))
      setSelectedWeek(0)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    const seconds = hotelInfo?.createdAt?.seconds
    if (seconds) {
      const date = new Date(seconds * 1000)
      let hotelCreateYear = date.getFullYear()
      const todayDate = new Date()
      const currentYear = todayDate.getFullYear()
      const tmpYearsList = []
      tmpYearsList.push(hotelCreateYear)
      while (hotelCreateYear !== currentYear) {
        tmpYearsList.push(++hotelCreateYear)
      }
      if (tmpYearsList.length) {
        tmpYearsList.reverse()
        setSelectedYear(tmpYearsList[0])
      }
      setYears(tmpYearsList)
      setSelectedMonth(todayDate.getMonth())
      setSelectedWeek(0)
    }
  }, [hotelInfo])

  useEffect(() => {
    addOverViewChartDataListener(hotelId, dispatch)
  }, [hotelId, dispatch])

  useEffect(() => {
    const key = getWeekKey(selectedYear, selectedMonth, selectedWeek)
    DataSet.datasets[0].data = ovewViewChartData[key] || Array(7).fill(0)
    setData({ ...DataSet })
  }, [selectedYear, selectedMonth, selectedWeek, ovewViewChartData])

  return (
    <>
      <div
        className='bookingoverviewCard-wrp cmnCard-wrp'
        id='guest-overview-card'
      >
        <div className='cardHead'>
          <h3>{translateTextI18N('Guest Overview')}</h3>
          <div className='graphfilter d-flex'>
            <div className='filterSelect'>
              <Select
                value={selectedYear}
                onChange={y => setSelectedYear(y)}
                id='selectyear'
              >
                {years.map((y, idx) => (
                  <Option key={idx} value={y}>
                    {y}
                  </Option>
                ))}
              </Select>
            </div>
            <div className='filterSelect'>
              <Select
                value={selectedMonth}
                onChange={monthIdx => {
                  setSelectedMonth(monthIdx)
                }}
                id='selectMonth'
                dropdownMatchSelectWidth={55}
              >
                {Months.map((m, idx) => (
                  <Option key={idx} value={m.value}>
                    {translateTextI18N(m.short_name)}
                  </Option>
                ))}
              </Select>
            </div>
            <div className='filterSelect'>
              <Select
                value={selectedWeek}
                onChange={idx => {
                  setSelectedWeek(idx)
                }}
                placeholder={translateTextI18N(`Week With Number`, {
                  number: calendar[0],
                })}
                id='selectNoOfWeek'
              >
                {calendar.map(k => {
                  return (
                    <Option value={k} key={`Week ${k}`}>
                      {translateTextI18N(`Week With Number`, {
                        number: k + 1,
                      })}
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
              id='guest'
              data={{
                ...data,
                labels: data.labels.map(item => translateTextI18N(item)),
              }}
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
                scales: {
                  xAxes: [
                    {
                      display: true,
                      scaleLabel: {
                        display: true,
                        labelString: translateTextI18N('Days'),
                      },
                    },
                  ],
                  yAxes: [
                    {
                      display: true,
                      scaleLabel: {
                        display: true,
                        labelString: translateTextI18N('No. of guests'),
                      },
                      ticks: {
                        min: 0, // it is for ignoring negative step.
                        beginAtZero: true,
                        callback: function (value, _index, _values) {
                          if (Math.floor(value) === value) {
                            return value
                          }
                        },
                      },
                    },
                  ],
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default GuestOverviewCard
