import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import Rating from './Rating'

function RatingList({ selecteRating, onlySelectedRating = false }) {
  const { ratingConfig } = useSelector(state => state)

  const renderRatingComp = useMemo(() => {
    if (!Object.keys(ratingConfig).length) return null

    if (onlySelectedRating) {
      return (
        <Rating
          key={ratingConfig[selecteRating]}
          {...{
            selecteRating,
            rate: selecteRating,
            emoji: ratingConfig[selecteRating],
          }}
        />
      )
    }

    return Object.entries(ratingConfig)
      .sort((a, b) => a[0] - b[0])
      .map(([rate, emoji]) => {
        return <Rating key={rate} {...{ selecteRating, rate, emoji }} />
      })
  }, [onlySelectedRating, ratingConfig, selecteRating])

  return <div>{renderRatingComp}</div>
}

export default RatingList
