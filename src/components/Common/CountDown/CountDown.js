import Countdown from 'react-countdown'
import React, { useEffect, useState } from 'react'

const CountDown = ({ changed, onCompleted }) => {
  const [counter, setCounter] = useState(Date.now() + 6000)
  function pad(num, size) {
    num = num.toString()
    while (num.length < size) num = '0' + num
    return num
  }
  // Random component
  const Completionist = () => <span>0s</span>
  useEffect(() => {
    if (changed) {
      setCounter(Date.now() + 6000)
    }
  }, [changed])
  // Renderer callback with condition
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      // Render a complete state
      onCompleted()
      return <Completionist />
    } else {
      // Render a countdown
      return <span>{pad(seconds, 2)}s</span>
    }
  }

  return <Countdown date={counter} renderer={renderer} />
}

export default CountDown
