import axios from 'axios'
import {
  APIs,
  Collections,
  loadProgress,
  PAGELOADER,
  searchingDomainMessages,
} from '../config/constants'
import { db } from '../config/firebase'
import { actions } from '../Store'

//GETDOMAINBYHOTELID
export const getDomainByHotelId = async ({ dispatch, hotelId }) => {
  if (!hotelId) return
  hotelId = hotelId.replace(' ', '')

  if (hotelId.includes('%20')) {
    hotelId = hotelId.replace('%20', '')
  }

  try {
    let res = await axios.get(APIs.GETDOMAINBYHOTELID, { params: { hotelId } })
    if (res.data.statusCode === 200) {
      dispatch(actions.setSubDomainData(res.data.data))
    }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
  }
}

export const GetDomainDetailByHotelId = async hotelId => {
  try {
    const hotelSnapshot = await db
      .collection(Collections.DOMAIN)
      .doc(hotelId)
      .get()
    return {
      id: hotelSnapshot.id,
      ...hotelSnapshot.data(),
    }
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    return {}
  }
}

export let unSubGetDomain = null
export const GetDomainDetailsByHotelId = async (hotelId, dispatch) => {
  try {
    let searchDomain = {
      searchingDomain: loadProgress.LOADING,
      searchingDomainMessage: searchingDomainMessages.LOADING,
    }

    if (!hotelId || unSubGetDomain) return

    dispatch(actions.setSearchingDomain(searchDomain))
    dispatch(actions.setPageLoading(PAGELOADER.WAITING))

    unSubGetDomain = await db
      .collection(Collections.DOMAIN)
      .doc(hotelId)
      .onSnapshot(domainSnapshot => {
        const domainInfo = { id: domainSnapshot.id, ...domainSnapshot.data() }
        let hotelLogo = null
        let hotelWallpaper = null
        let subDomainNotFound = true
        searchDomain['searchingDomain'] = loadProgress.LOADED

        if (domainInfo) {
          hotelLogo = domainInfo.hotelLogo
          hotelWallpaper = domainInfo.hotelWallpaper
          subDomainNotFound = false
          searchDomain['searchingDomainMessage'] =
            searchingDomainMessages.SUCCESS
        } else {
          searchDomain['searchingDomainMessage'] =
            searchingDomainMessages.NOT_AVAILABLE
        }

        dispatch(actions.setSearchingDomain(searchDomain))
        dispatch(actions.setSubDomain(domainInfo.subDomain))
        dispatch(actions.setHotelInfo({ hotelId }))
        dispatch(actions.setHotelLogo({ hotelLogo, hotelWallpaper }))
        dispatch(actions.setSubDomainNotFound(subDomainNotFound))
      })
  } catch (error) {
    console.log({ error })
    console.log(error?.message)
    dispatch(
      actions.setSearchingDomain({
        searchingDomain: loadProgress.LOADED,
        searchingDomainMessage: searchingDomainMessages.NOT_AVAILABLE,
      })
    )
  }
  dispatch(actions.setPageLoading(PAGELOADER.LOADED))
}

