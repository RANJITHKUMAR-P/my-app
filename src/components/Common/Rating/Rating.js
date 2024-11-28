import React, { useMemo } from 'react'
import { Ternary } from '../../../config/utils'

function Rating({ selecteRating = '', rate, emoji, onRatingChange }) {
  const emojiCss = useMemo(() => {
    return `emoji ${Ternary(
      selecteRating.toString() === rate,
      'selectedEmoji',
      ''
    )}`
  }, [rate, selecteRating])

  return useMemo(
    () => (
      <span className={emojiCss} key={rate}>
        {String.fromCodePoint(emoji)}
      </span>
    ),
    [emoji, emojiCss, rate]
  )
}

export default Rating
