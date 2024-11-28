import { useSelector } from 'react-redux'
import { formatPrice } from '../../../config/utils'

export const Amount = ({ value }) => {
  const { hotelInfo } = useSelector(state => state)
  return `${hotelInfo?.curencyCode} ${formatPrice(value || 0)}`
}
