import { useState } from 'react'
import axios from 'axios'
import { IVA_BACKEND_URL } from '../config/constants'

const useIvaChat = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchIvaResponse = async userQuery => {
    setLoading(true)
    setError(null)

    try {
      const data = {
        user_query: userQuery,
        history: '',
        pipeline: 'default_pipeline',
      }

      const config = {
        method: 'post',
        url: IVA_BACKEND_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      }
      const response = await axios(config)

      setLoading(false)
      return response
    } catch (err) {
      setLoading(false)
      setError('An error occurred while fetching the response')
      return null
    }
  }

  return { fetchIvaResponse, loading, error }
}

export default useIvaChat
