import Axios from 'axios'
import { axiosError } from '../config/utils'
export default class AxiosHelper {
  static async call(options) {
    return new Promise((resolve, reject) => {
      return Axios(options)
        .then(success => {
          return resolve(success.data)
        })
        .catch(error => {
          return reject(axiosError(error))
        })
    })
  }
  static async post(url, data = {}, options = {}) {
    return new Promise((resolve, reject) => {
      return Axios.post(url, data, options)
        .then(success => {
          return resolve(success.data)
        })
        .catch(error => {
          return reject(axiosError(error))
        })
    })
  }
}
