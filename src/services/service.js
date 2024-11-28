import { Collections, unsubscribeList } from '../config/constants'
import { db } from '../config/firebase'
import { actions } from '../Store'
import { updatationData } from './common'

export const ServicesListener = (hotelId, dispatch) => {
  try {
    let collectionKey = `ServicesListener_${Collections.SERVICES}`;

    if (unsubscribeList[collectionKey]) return

    let unSub = db.collection(Collections.SERVICES)
      .where('hotelId', '==', hotelId)
      .where('isDelete', '==', false)
      .onSnapshot(servicesSnapshot => {
        const services = []
        for (const service of servicesSnapshot.docs) {
          services.push({ id: service.id, ...service.data() })
        }
        dispatch(actions.setServices(services))
      })

    unsubscribeList[collectionKey] = unSub
  } catch (error) {
    console.log(error)
  }
}

export const ToggleServiceStatus = async (id, active) => {
  try {
    await db
      .collection(Collections.SERVICES)
      .doc(id)
      .update({ active, ...updatationData() })
    return true
  } catch (error) {
    console.log({ error })
    console.log(error)
    return false
  }
}
