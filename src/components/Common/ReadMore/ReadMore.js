import React, { useEffect, useState } from 'react'

const ReadMore = ({ text = '', charLength = 500 }) => {
  const [displayFullText, setDisplayFullText] = useState(false)
  const [visibleText, setVisibleText] = useState('')
  const [buttonLabel, setButtonLabel] = useState('')
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    if (displayFullText) {
      setVisibleText(text)
      setButtonLabel('Read Less')
    } else {
      setVisibleText(text.slice(0, charLength))
      setButtonLabel('Read More')
    }
    setShowButton(text.length > charLength)
  }, [text, displayFullText, charLength, setShowButton])

  return (
    <span style={{ whiteSpace: 'break-spaces' }}>
      {visibleText}
      {showButton ? (
        <button className='readmoreBtn' onClick={() => setDisplayFullText(!displayFullText)}>
          {buttonLabel}
        </button>
      ) : null}
    </span>
  )
}

export default ReadMore
