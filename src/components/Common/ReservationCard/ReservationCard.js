import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Doughnut } from 'react-chartjs-2'
import { Link } from 'react-router-dom'
import { Skeleton } from 'antd'

import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const GetCalculatedValue = (value, total) => {
  if (value) {
    return value > 0 ? Math.floor((value * 100) / total) + '' : '0'
  } else {
    return '0'
  }
}

const ReservationCard = () => {
  const { hotelAdminDashboardStat } = useSelector(state => state)

  const {
    reservationCompleted,
    reservationInProgress,
    reservationPending,
    reservationRejected,
  } = hotelAdminDashboardStat

  const [completedPer, setCompletedPer] = useState(0)
  const [inprogressPer, setInprogressPer] = useState(0)
  const [pendingPer, setPendingPer] = useState(0)
  const [rejectedPer, setRejectedPer] = useState(0)

  const [loading, setLoading] = useState(true)

  const [translateTextI18N] = useCustomI18NTranslatorHook()

  useEffect(() => {
    const total =
      reservationCompleted +
      reservationInProgress +
      reservationPending +
      reservationRejected

    setPendingPer(GetCalculatedValue(reservationPending, total))
    setInprogressPer(GetCalculatedValue(reservationInProgress, total))
    setCompletedPer(GetCalculatedValue(reservationCompleted, total))
    setRejectedPer(GetCalculatedValue(reservationRejected, total))
    setLoading(false)
  }, [
    reservationCompleted,
    reservationInProgress,
    reservationPending,
    reservationRejected,
  ])

  let state3 = {
    labels: ['', '', '', ''],
    datasets: [
      {
        label: 'Rainfall',
        backgroundColor: ['#05B2DC', '#135A9E', '#043754', '#AEAEAE'],
        hoverBackgroundColor: ['#05B2DC', '#135A9E', '#043754', '#AEAEAE'],
        data: [completedPer, inprogressPer, pendingPer, rejectedPer],
        borderWidth: 0,
      },
    ],
  }

  return (
    <>
      <div className='ReservationsCard-wrp cmnCard-wrp'>
        <div className='cardHead'>
          <h3>{translateTextI18N('Reservations')}</h3>
          <Link to='/Reservations' className='viewall-link'>
            {translateTextI18N('VIEW ALL')}
          </Link>
        </div>

        {loading ? (
          <Skeleton />
        ) : (
          <div className='cardBody'>
            <div className='row align-items-center'>
              <div className='col-12 col-lg-auto'>
                <div className='chart-wrp'>
                  <Doughnut
                    data={state3}
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
                      cutoutPercentage: 50,
                    }}
                  />
                </div>
              </div>
              <div className='col-12 col-lg'>
                <ul className='list-list-unstyled chartlegends'>
                  <li>
                    <span
                      className='indiSpan'
                      style={{ backgroundColor: '#05B2DC' }}
                    ></span>
                    {translateTextI18N('Completed')}
                    <span
                      className='percentageSpan'
                      style={{ color: '#05B2DC' }}
                    >
                      {completedPer}%
                    </span>
                  </li>
                  <li>
                    <span
                      className='indiSpan'
                      style={{ backgroundColor: '#135A9E' }}
                    ></span>
                    {translateTextI18N('In Progress')}
                    <span
                      className='percentageSpan'
                      style={{ color: '#135A9E' }}
                    >
                      {inprogressPer}%
                    </span>
                  </li>
                  <li>
                    <span
                      className='indiSpan'
                      style={{ backgroundColor: '#043754' }}
                    ></span>
                    {translateTextI18N('Pending')}
                    <span
                      className='percentageSpan'
                      style={{ color: '#043754' }}
                    >
                      {pendingPer}%
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ReservationCard
