import React, { useEffect, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { useCustomI18NTranslatorHook } from '../../../utility/globalization'

const DefaultState = {
  labels: ['', ''],
  datasets: [
    {
      label: 'Rainfall',
      backgroundColor: ['#E7E7E7', '#0BAE36'],
      hoverBackgroundColor: ['#E7E7E7', '#0BAE36'],
      data: [100, 0],
      borderWidth: 0,
    },
  ],
}

const DefaultState2 = {
  labels: ['', ''],
  datasets: [
    {
      label: 'Rainfall',
      backgroundColor: ['#E7E7E7', '#FF1616'],
      hoverBackgroundColor: ['#E7E7E7', '#FF1616'],
      data: [100, 0],
      borderWidth: 0,
    },
  ],
}

const GetData = (total, active) => {
  let activePer = 0
  let inactivePer = 0

  if (total > 0) {
    activePer = Math.round(total ? (active * 100) / total : 0)
    inactivePer = 100 - activePer
  }

  const st = { ...DefaultState }
  if (total > 0) {
    st.datasets[0].data = [inactivePer, activePer]
  }

  const st2 = { ...DefaultState2 }
  if (total > 0) {
    st2.datasets[0].data = [activePer, inactivePer]
  }

  return [st, st2, activePer, inactivePer]
}

const ActivityCard = ({ total = 0, active = 0 }) => {
  const [state, setState] = useState(null)
  const [state2, setState2] = useState(null)
  const [activePercentage, setActivePercentage] = useState(0)
  const [inactivePercentage, setInactivePercentage] = useState(0)
  const [translateTextI18N] = useCustomI18NTranslatorHook()

  useEffect(() => {
    const [st, st2, activePer, inactivePer] = GetData(total, active)
    setState(st)
    setState2(st2)
    setActivePercentage(activePer)
    setInactivePercentage(inactivePer)
  }, [total, active])

  if (!state || !state2) return null

  return (
    <>
      <div className='ActivityCard-wrp cmnCard-wrp'>
        <div className='cardHead'>
          <h3>{translateTextI18N('Staff')}</h3>
        </div>
        <div className='cardBody'>
          <div className='row'>
            <div className='col-12 col-sm-6 col-lg-12 text-center'>
              <div className='d-xl-flex align-items-center mb-2 mb-lg-4'>
                <div className='chart-wrp '>
                  <Doughnut
                    data={state}
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
                      cutoutPercentage: 70,
                    }}
                  />
                  <span>{activePercentage}%</span>
                </div>
                <h6>{translateTextI18N('Active Staff')}</h6>
              </div>
            </div>
            <div className='col-12 col-sm-6 col-lg-12 text-center'>
              <div className='d-xl-flex align-items-center'>
                <div className='chart-wrp'>
                  <Doughnut
                    data={state2}
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
                      cutoutPercentage: 70,
                    }}
                  />
                  <span>{inactivePercentage}%</span>
                </div>
                <h6>{translateTextI18N('Inactive Staff')}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ActivityCard
