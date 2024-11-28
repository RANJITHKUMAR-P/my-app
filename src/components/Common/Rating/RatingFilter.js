import React from 'react'
import SelectOption from '../SelectOption/SelectOption'
import { getRatingOptions } from '../../../config/utils'
import { useSelector } from 'react-redux'

function RatingFilter({
  handlePaginationChange,
  setFilteredRating,
  filteredRating,
}) {
  const { ratingConfig } = useSelector(state => state)
  return (
    <div className='col-6 col-md-4 col-lg'>
      <div className='cmnSelect-form'>
        <SelectOption
          change={e =>
            handlePaginationChange(setFilteredRating, e, 'filteredRating')
          }
          value={filteredRating}
          list={getRatingOptions(ratingConfig)}
        ></SelectOption>
      </div>
    </div>
  )
}

export default RatingFilter
