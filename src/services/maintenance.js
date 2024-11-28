import { actions } from '../Store'
import { Collections } from '../config/constants'
import { db } from '../config/firebase'

export let unsubMaintenanceListner = null
export const MaintenanceListerner = dispatch => {
  try {
    if (unsubMaintenanceListner) return
    unsubMaintenanceListner = db
      .collection(Collections.RELEASE)
      .onSnapshot(snapshot => {
        let enableStickyBar = false
        let showMaintenancePage = false
        let fromDate = null,
          toDate = null,
          appVersion = '1'
        for (const doc of snapshot.docs) {
          const data = doc.data()
          if (+(data?.appVersion || '1') > +appVersion) {
            appVersion = data?.appVersion
          }
          if (data.enableStickyBar) enableStickyBar = true
          if (data.showMaintenancePage) showMaintenancePage = true
          if (enableStickyBar || showMaintenancePage) {
            fromDate = data.fromDate.toDate()
            toDate = data.toDate.toDate()
            break
          }
        }
        dispatch(
          actions.setProduction({
            enableStickyBar,
            showMaintenancePage,
            fromDate,
            toDate,
            appVersion,
          })
        )
      })
  } catch (error) {
    console.log({ error })
  }
}

export async function setAppVersion(dispatch) {
  try {
    
    const version = await db.collection(Collections.VERSIONS).get() 
    const versionsData = version.docs.map((doc) => doc.data());
    const sortedVersions  = versionsData.sort((a, b) => b.versionDate.seconds - a.versionDate.seconds);
    const latestVersion = sortedVersions[0].versionNumber;
    dispatch(actions.setAppVersion(latestVersion)) 
   
  } catch (error) {
    console.log('setAppVersion', error)
  }
}
