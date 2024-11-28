import { useState } from 'react'
import {
  RequestTypeLabelValue,
  ServiceLabelValue,
  StatusLabelValue,
  ratingFilterLabel,
} from '../../../../config/constants'

const useHouseKeepingFilter = () => {
  const [selectedRequestTypeKey, setSelectedRequestType] = useState(
    RequestTypeLabelValue
  )
  const [selectedServiceKey, setSelectedService] = useState(ServiceLabelValue)
  const [selectedStatusKey, setSelectedStatus] = useState(StatusLabelValue)
  const [selectedRating, setSelectedRating] = useState(ratingFilterLabel)
  const [showLoader, setShowLoader] = useState(false)

  return {
    selectedRequestTypeKey,
    setSelectedRequestType,
    selectedServiceKey,
    setSelectedService,
    selectedStatusKey,
    setSelectedStatus,
    showLoader,
    setShowLoader,
    selectedRating,
    setSelectedRating
  }
}

export default useHouseKeepingFilter
